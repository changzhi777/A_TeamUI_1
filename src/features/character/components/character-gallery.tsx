/**
 * character-gallery
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Gallery Component
 * 角色多视角图片展示组件
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  RefreshCw,
  ZoomIn,
  Download,
  Loader2,
  Image as ImageIcon,
  Settings2,
  Upload,
  Trash2,
  Plus,
  Pencil,
  Clock,
} from 'lucide-react'
import type { Character, ViewType, CharacterImage, CustomView, FixedViewType } from '@/lib/types/character'
import {
  IMAGE_RESOLUTIONS,
  FIXED_VIEW_TYPE_LABELS,
  getViewTypeLabel,
  createCustomViewType,
  isCustomViewType,
  getCustomViewId,
  MAX_CUSTOM_VIEWS,
} from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { aiApi } from '@/lib/api/ai'
import { filesApi } from '@/lib/api/files'
import {
  useCharacterTasks,
  useTaskQueueEnabled,
} from '../hooks/use-character-tasks'
import { TaskStatusBadge } from './task-progress-indicator'
import type { Task } from '@/lib/api/tasks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// 兼容旧代码的别名
const VIEW_TYPE_LABELS = FIXED_VIEW_TYPE_LABELS

/**
 * 移除提示词中的角色名称
 * 用于背面视角，避免在提示词中出现角色名称
 */
function removeCharacterName(prompt: string, characterName: string): string {
  if (!characterName) return prompt
  // 移除角色名称（支持中英文，处理特殊字符）
  const escapedName = characterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return prompt
    .replace(new RegExp(escapedName, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim()
}

interface CharacterGalleryProps {
  character: Character
  /** 启用任务队列模式（可选，默认自动检测） */
  useTaskQueue?: boolean
}

export function CharacterGallery({ character, useTaskQueue: forceTaskQueue }: CharacterGalleryProps) {
  const [generatingView, setGeneratingView] = useState<ViewType | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [regenerateDialog, setRegenerateDialog] = useState<ViewType | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedResolution, setSelectedResolution] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingView, setUploadingView] = useState<ViewType | null>(null)

  // 自定义视角对话框状态
  const [showAddCustomDialog, setShowAddCustomDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [editingCustomView, setEditingCustomView] = useState<CustomView | null>(null)
  const [customViewName, setCustomViewName] = useState('')

  // 任务队列相关状态
  const [pendingViewTask, setPendingViewTask] = useState<{ viewType: ViewType; task: Task } | null>(null)

  const updateCharacterView = useCharacterStore((state) => state.updateCharacterView)
  const addCustomView = useCharacterStore((state) => state.addCustomView)
  const renameCustomView = useCharacterStore((state) => state.renameCustomView)
  const removeCustomView = useCharacterStore((state) => state.removeCustomView)

  // Task queue mode detection
  const taskQueueEnabled = useTaskQueueEnabled()
  const useTaskQueueMode = forceTaskQueue ?? taskQueueEnabled

  // Task queue integration
  const {
    imageTasks,
    runningImageTask,
    createImageTask,
    getImageResult,
    isTaskRunning,
    isTaskCompleted,
    refreshTasks,
  } = useCharacterTasks({
    characterId: character.id,
    autoRefresh: useTaskQueueMode,
  })

  // Monitor running task completion
  useEffect(() => {
    if (!useTaskQueueMode || !runningImageTask) return

    // Check if task completed
    if (runningImageTask.status === 'completed') {
      const result = getImageResult(runningImageTask)
      if (result?.imageUrl) {
        const viewType = (runningImageTask.payload as Record<string, unknown>)?.viewType as ViewType | undefined
        if (viewType) {
          const image: CharacterImage = {
            url: result.imageUrl,
            prompt: result.prompt,
            generatedAt: result.generatedAt,
          }
          updateCharacterView(character.id, viewType, image)
          toast.success(`${getViewTypeLabel(viewType, character.customViews)}图片已生成 (${result.resolution})`)

          // Cache image
          filesApi.storeFile(result.imageUrl, {
            category: 'character-image',
            entityType: 'character',
            entityId: character.id,
            cacheImmediately: true,
          }).catch(console.warn)

          setPendingViewTask(null)
        }
      }
    } else if (runningImageTask.status === 'failed') {
      toast.error(runningImageTask.error || '生成失败')
      setPendingViewTask(null)
    }
  }, [useTaskQueueMode, runningImageTask, getImageResult, updateCharacterView, character.id, character.customViews])

  // 获取当前 API 配置中的默认分辨率
  const getDefaultResolution = () => {
    const config = aiApi.getImageAPIConfig()
    return aiApi.getResolutionString(config)
  }

  // 固定视角类型
  const fixedViewTypes: FixedViewType[] = ['front', 'threeQuarter', 'side', 'back']

  // 自定义视角类型列表
  const customViewTypes: ViewType[] = (character.customViews || []).map(
    (cv) => createCustomViewType(cv.id)
  )

  // 所有视角类型
  const allViewTypes: ViewType[] = [...fixedViewTypes, ...customViewTypes]

  // 检查是否可以添加更多自定义视角
  const canAddCustomView = (character.customViews?.length || 0) < MAX_CUSTOM_VIEWS

  // 生成图片 - 任务队列模式
  const handleGenerateImageWithTaskQueue = async (viewType: ViewType) => {
    if (!character.basePrompt) {
      toast.error('请先设置角色的基础提示词')
      return
    }

    setRegenerateDialog(null)

    let prompt = aiApi.buildCharacterPrompt(
      character.basePrompt,
      viewType,
      customPrompt || undefined
    )

    // 对于背面视角，移除提示词中的角色名称
    if (viewType === 'back') {
      prompt = removeCharacterName(prompt, character.name)
    }

    const resolution = selectedResolution || getDefaultResolution()

    try {
      const task = await createImageTask({
        characterId: character.id,
        characterName: character.name,
        prompt,
        resolution,
        viewType,
        callback: {
          type: 'character_view',
          characterId: character.id,
          viewType,
        },
      })

      if (task) {
        setPendingViewTask({ viewType, task })
        toast.info('已提交生成任务，请稍候...')
        setCustomPrompt('')
        setSelectedResolution('')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交任务失败')
    }
  }

  // 生成图片 - 直接模式
  const handleGenerateImageDirect = async (viewType: ViewType) => {
    if (!character.basePrompt) {
      toast.error('请先设置角色的基础提示词')
      return
    }

    setGeneratingView(viewType)
    setRegenerateDialog(null)

    try {
      let prompt = aiApi.buildCharacterPrompt(
        character.basePrompt,
        viewType,
        customPrompt || undefined
      )

      // 对于背面视角，移除提示词中的角色名称
      if (viewType === 'back') {
        prompt = removeCharacterName(prompt, character.name)
      }

      // 使用选中的分辨率或默认分辨率
      const resolution = selectedResolution || getDefaultResolution()

      const imageUrl = await aiApi.generateImage(prompt, resolution, (progress) => {
        // 可以在这里更新进度
      })

      const image: CharacterImage = {
        url: imageUrl,
        prompt,
        generatedAt: new Date().toISOString(),
      }

      updateCharacterView(character.id, viewType, image)
      toast.success(`${getViewTypeLabel(viewType, character.customViews)}图片已生成 (${resolution})`)
      setCustomPrompt('')
      setSelectedResolution('')

      // 触发后台预下载到缓存
      filesApi.storeFile(imageUrl, {
        category: 'character-image',
        entityType: 'character',
        entityId: character.id,
        cacheImmediately: true,
      }).catch((error) => {
        console.warn('Failed to cache image:', error)
        // 预下载失败不影响主流程
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setGeneratingView(null)
    }
  }

  // 根据模式选择生成方法
  const handleGenerateImage = useTaskQueueMode
    ? handleGenerateImageWithTaskQueue
    : handleGenerateImageDirect

  // 判断指定视角是否正在生成
  const isViewGenerating = (viewType: ViewType): boolean => {
    if (useTaskQueueMode) {
      return runningImageTask?.status === 'running' &&
        (runningImageTask.payload as Record<string, unknown>)?.viewType === viewType
    }
    return generatingView === viewType
  }

  // 获取正在生成视角的进度
  const getViewProgress = (viewType: ViewType): number | null => {
    if (!useTaskQueueMode || !runningImageTask) return null
    if ((runningImageTask.payload as Record<string, unknown>)?.viewType === viewType) {
      return runningImageTask.progress
    }
    return null
  }

  // 下载图片
  const handleDownload = async (imageUrl: string, viewType: ViewType) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${character.name}_${VIEW_TYPE_LABELS[viewType]}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('下载失败')
    }
  }

  // 处理本地图片上传
  const handleUploadClick = (viewType: ViewType) => {
    setUploadingView(viewType)
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingView) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB')
      return
    }

    try {
      // 读取文件为 Data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          const image: CharacterImage = {
            url: dataUrl,
            prompt: '本地上传',
            generatedAt: new Date().toISOString(),
          }
          updateCharacterView(character.id, uploadingView!, image)
          toast.success(`${getViewTypeLabel(uploadingView!, character.customViews)}图片已上传`)
        }
      }
      reader.onerror = () => {
        toast.error('读取文件失败')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('上传失败，请重试')
    } finally {
      // 重置文件输入
      e.target.value = ''
      setUploadingView(null)
    }
  }

  // 删除图片
  const handleDelete = (viewType: ViewType) => {
    updateCharacterView(character.id, viewType, undefined)
    toast.success(`${getViewTypeLabel(viewType, character.customViews)}图片已删除`)
  }

  // 添加自定义视角
  const handleAddCustomView = () => {
    if (!customViewName.trim()) {
      toast.error('请输入视角名称')
      return
    }

    const result = addCustomView(character.id, customViewName.trim())
    if (result) {
      toast.success(`自定义视角 "${customViewName}" 已添加`)
      setCustomViewName('')
      setShowAddCustomDialog(false)
    } else {
      toast.error('添加失败，可能已达到上限或名称重复')
    }
  }

  // 重命名自定义视角
  const handleRenameCustomView = () => {
    if (!editingCustomView || !customViewName.trim()) {
      toast.error('请输入视角名称')
      return
    }

    const success = renameCustomView(character.id, editingCustomView.id, customViewName.trim())
    if (success) {
      toast.success('视角已重命名')
      setCustomViewName('')
      setEditingCustomView(null)
      setShowRenameDialog(false)
    } else {
      toast.error('重命名失败，名称可能重复')
    }
  }

  // 删除自定义视角
  const handleDeleteCustomView = (customView: CustomView) => {
    const success = removeCustomView(character.id, customView.id)
    if (success) {
      toast.success(`自定义视角 "${customView.name}" 已删除`)
    } else {
      toast.error('删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">多视角图片</h3>
          <p className="text-sm text-muted-foreground">
            已生成 {Object.values(character.views).filter(Boolean).length} 个视角
            {character.customViews && character.customViews.length > 0 && (
              <span>（含 {character.customViews.length} 个自定义）</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 任务队列模式提示 */}
          {useTaskQueueMode && runningImageTask && isTaskRunning(runningImageTask) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>生成中 {runningImageTask.progress}%</span>
              <Progress value={runningImageTask.progress} className="w-20 h-2" />
            </div>
          )}
          {useTaskQueueMode && !runningImageTask && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              任务队列模式
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 固定视角卡片 */}
        {fixedViewTypes.map((viewType) => {
          const image = character.views[viewType]
          const isGenerating = isViewGenerating(viewType)
          const progress = getViewProgress(viewType)

          return (
            <ViewCard
              key={viewType}
              viewType={viewType}
              label={getViewTypeLabel(viewType, character.customViews)}
              image={image}
              isGenerating={isGenerating}
              progress={progress}
              character={character}
              onPreview={() => image && setPreviewImage(image.url)}
              onDownload={() => image && handleDownload(image.url, viewType)}
              onDelete={() => handleDelete(viewType)}
              onUpload={() => handleUploadClick(viewType)}
              onGenerate={() => {
                if (!character.basePrompt) {
                  toast.error('请先设置角色的基础提示词')
                  return
                }
                setRegenerateDialog(viewType)
                setCustomPrompt('')
                setSelectedResolution('')
              }}
            />
          )
        })}

        {/* 自定义视角卡片 */}
        {(character.customViews || []).map((customView) => {
          const viewType = createCustomViewType(customView.id)
          const image = character.views[viewType]
          const isGenerating = isViewGenerating(viewType)
          const progress = getViewProgress(viewType)

          return (
            <ViewCard
              key={viewType}
              viewType={viewType}
              label={customView.name}
              image={image}
              isGenerating={isGenerating}
              progress={progress}
              character={character}
              isCustomView
              customView={customView}
              onPreview={() => image && setPreviewImage(image.url)}
              onDownload={() => image && handleDownload(image.url, viewType)}
              onDelete={() => handleDelete(viewType)}
              onUpload={() => handleUploadClick(viewType)}
              onGenerate={() => {
                if (!character.basePrompt) {
                  toast.error('请先设置角色的基础提示词')
                  return
                }
                setRegenerateDialog(viewType)
                setCustomPrompt('')
                setSelectedResolution('')
              }}
              onRename={() => {
                setEditingCustomView(customView)
                setCustomViewName(customView.name)
                setShowRenameDialog(true)
              }}
              onDeleteCustomView={() => handleDeleteCustomView(customView)}
            />
          )
        })}

        {/* 添加自定义视角卡片 */}
        {canAddCustomView && (
          <Card
            className="overflow-hidden cursor-pointer border-dashed hover:border-primary/50 transition-colors"
            onClick={() => {
              setCustomViewName('')
              setShowAddCustomDialog(true)
            }}
          >
            <div className="aspect-square flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Plus className="h-8 w-8" />
              <span className="text-xs mt-2">添加自定义视角</span>
            </div>
            <CardContent className="p-3">
              <span className="text-sm text-muted-foreground">点击添加</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 预览对话框 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>图片预览</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative">
              <img
                src={previewImage}
                alt="预览"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 重新生成对话框 */}
      <Dialog
        open={!!regenerateDialog}
        onOpenChange={() => setRegenerateDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {regenerateDialog && character.views[regenerateDialog]
                ? '重新生成'
                : '生成图片'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>视角</Label>
              <p className="text-sm text-muted-foreground">
                {regenerateDialog && getViewTypeLabel(regenerateDialog, character.customViews)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customPrompt">附加提示词（可选）</Label>
              <Textarea
                id="customPrompt"
                placeholder="添加额外的描述来调整生成效果..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">完整提示词预览：</p>
              <p className="text-sm">
                {regenerateDialog && (() => {
                  let previewPrompt = aiApi.buildCharacterPrompt(
                    character.basePrompt || '',
                    regenerateDialog,
                    customPrompt || undefined
                  )
                  // 对于背面视角，移除提示词中的角色名称
                  if (regenerateDialog === 'back') {
                    previewPrompt = removeCharacterName(previewPrompt, character.name)
                  }
                  return previewPrompt
                })()}
              </p>
            </div>

            {/* 分辨率选择 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                分辨率
              </Label>
              <Select
                value={selectedResolution}
                onValueChange={setSelectedResolution}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`使用默认 (${getDefaultResolution()})`} />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_RESOLUTIONS.map((res) => (
                    <SelectItem key={res.id} value={res.id}>
                      <div className="flex items-center gap-2">
                        <span>{res.label}</span>
                        <span className="text-xs text-muted-foreground">({res.aspectRatio})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                不选择则使用 API 管理中配置的默认分辨率
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRegenerateDialog(null)}>
              取消
            </Button>
            <Button
              onClick={() => regenerateDialog && handleGenerateImage(regenerateDialog)}
              disabled={!character.basePrompt || (runningImageTask?.status === 'running')}
            >
              {useTaskQueueMode && <Clock className="h-4 w-4 mr-2" />}
              {regenerateDialog && character.views[regenerateDialog]
                ? (useTaskQueueMode ? '提交重新生成' : '重新生成')
                : (useTaskQueueMode ? '提交任务' : '生成')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 添加自定义视角对话框 */}
      <Dialog open={showAddCustomDialog} onOpenChange={setShowAddCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加自定义视角</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customViewName">视角名称</Label>
              <Input
                id="customViewName"
                placeholder="如：俯视、仰视、特写..."
                value={customViewName}
                onChange={(e) => setCustomViewName(e.target.value)}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                最多 20 个字符，不能与已有视角重复
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddCustomView}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名自定义视角对话框 */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名视角</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="renameViewName">视角名称</Label>
              <Input
                id="renameViewName"
                placeholder="输入新的视角名称"
                value={customViewName}
                onChange={(e) => setCustomViewName(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRenameCustomView}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * 视角卡片子组件
 */
interface ViewCardProps {
  viewType: ViewType
  label: string
  image?: CharacterImage
  isGenerating: boolean
  progress?: number | null
  character: Character
  isCustomView?: boolean
  customView?: CustomView
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
  onUpload: () => void
  onGenerate: () => void
  onRename?: () => void
  onDeleteCustomView?: () => void
}

function ViewCard({
  label,
  image,
  isGenerating,
  progress,
  isCustomView = false,
  onPreview,
  onDownload,
  onDelete,
  onUpload,
  onGenerate,
  onRename,
  onDeleteCustomView,
}: ViewCardProps) {
  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          'aspect-square relative bg-muted',
          image && 'cursor-pointer'
        )}
        onClick={onPreview}
      >
        {image ? (
          <img
            src={image.url}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            {isGenerating ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
            <span className="text-xs mt-2">
              {isGenerating ? (progress ? `生成中 ${progress}%` : '生成中...') : '未生成'}
            </span>
          </div>
        )}

        {/* 生成进度遮罩 */}
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span className="text-sm mb-2">
              {progress ? `正在生成 ${progress}%` : '正在生成...'}
            </span>
            {progress !== null && progress !== undefined && (
              <Progress value={progress} className="w-3/4 h-2" />
            )}
          </div>
        )}

        {/* 自定义视角标识 */}
        {isCustomView && (
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
              自定义
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate" title={label}>
            {label}
          </span>
          <div className="flex gap-1">
            {image && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreview()
                  }}
                  title="预览"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload()
                  }}
                  title="下载"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  title="删除图片"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onUpload()
              }}
              title="本地上传"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onGenerate()
              }}
              disabled={isGenerating}
              title={image ? '重新生成' : '生成'}
            >
              <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
            </Button>
            {/* 自定义视角额外操作 */}
            {isCustomView && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRename?.()
                  }}
                  title="重命名"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteCustomView?.()
                  }}
                  title="删除视角"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
