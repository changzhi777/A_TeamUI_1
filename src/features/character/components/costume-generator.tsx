/**
 * costume-generator
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Costume Generator Component
 * 服装变更生成器组件
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Trash2,
  Loader2,
  Shirt,
  Download,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import type { Character, CostumeVariant } from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { aiApi } from '@/lib/api/ai'
import { filesApi } from '@/lib/api/files'
import {
  useCharacterTasks,
  useTaskQueueEnabled,
} from '../hooks/use-character-tasks'
import { TaskStatusBadge } from './task-progress-indicator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CostumeGeneratorProps {
  character: Character
  /** 启用任务队列模式（可选，默认自动检测） */
  useTaskQueue?: boolean
}

export function CostumeGenerator({ character, useTaskQueue: forceTaskQueue }: CostumeGeneratorProps) {
  const [showForm, setShowForm] = useState(false)
  const [costumeName, setCostumeName] = useState('')
  const [costumeDescription, setCostumeDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [deleteCostumeId, setDeleteCostumeId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const addCostume = useCharacterStore((state) => state.addCostume)
  const deleteCostume = useCharacterStore((state) => state.deleteCostume)

  // Task queue mode detection
  const taskQueueEnabled = useTaskQueueEnabled()
  const useTaskQueueMode = forceTaskQueue ?? taskQueueEnabled

  // Task queue integration
  const {
    runningImageTask,
    createImageTask,
    getImageResult,
    isTaskRunning,
    isTaskCompleted,
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
        // Extract costumeId from task metadata or payload
        const costumeId = (runningImageTask.metadata as Record<string, string>)?.costumeId
        const costumeNameFromTask = (runningImageTask.payload as Record<string, unknown>)?.costumeName as string
        const costumeDescFromTask = (runningImageTask.payload as Record<string, unknown>)?.costumeDescription as string

        if (costumeId) {
          const costume: CostumeVariant = {
            id: costumeId,
            name: costumeNameFromTask || '服装变体',
            description: costumeDescFromTask || '',
            imageUrl: result.imageUrl,
            prompt: result.prompt,
            generatedAt: result.generatedAt,
          }
          addCostume(character.id, costume)
          toast.success('服装变体已生成')
          setShowForm(false)
          setCostumeName('')
          setCostumeDescription('')

          // Cache image
          filesApi.storeFile(result.imageUrl, {
            category: 'costume-image',
            entityType: 'character',
            entityId: character.id,
            cacheImmediately: true,
          }).catch(console.warn)
        }
      }
    } else if (runningImageTask.status === 'failed') {
      toast.error(runningImageTask.error || '生成失败')
    }
  }, [useTaskQueueMode, runningImageTask, getImageResult, addCostume, character.id])

  // 生成服装变体 - 任务队列模式
  const handleGenerateCostumeWithTaskQueue = async () => {
    if (!character.basePrompt) {
      toast.error('请先设置角色的基础提示词')
      return
    }

    if (!costumeName.trim()) {
      toast.error('请输入服装名称')
      return
    }

    if (!costumeDescription.trim()) {
      toast.error('请输入服装描述')
      return
    }

    const costumeId = `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const prompt = aiApi.buildCostumePrompt(character.basePrompt, costumeDescription)
    const config = aiApi.getImageAPIConfig()
    const resolution = aiApi.getResolutionString(config)

    try {
      await createImageTask({
        characterId: character.id,
        characterName: character.name,
        prompt,
        resolution,
        viewType: `custom:${costumeId}`,
        costumeId,
        callback: {
          type: 'character_costume',
          characterId: character.id,
          costumeId,
        },
      })

      toast.info('已提交生成任务，请稍候...')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交任务失败')
    }
  }

  // 生成服装变体 - 直接模式
  const handleGenerateCostumeDirect = async () => {
    if (!character.basePrompt) {
      toast.error('请先设置角色的基础提示词')
      return
    }

    if (!costumeName.trim()) {
      toast.error('请输入服装名称')
      return
    }

    if (!costumeDescription.trim()) {
      toast.error('请输入服装描述')
      return
    }

    setIsGenerating(true)

    try {
      const prompt = aiApi.buildCostumePrompt(character.basePrompt, costumeDescription)

      const imageUrl = await aiApi.generateImage(prompt)

      const costume: CostumeVariant = {
        id: `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: costumeName.trim(),
        description: costumeDescription.trim(),
        imageUrl,
        prompt,
        generatedAt: new Date().toISOString(),
      }

      addCostume(character.id, costume)
      toast.success('服装变体已生成')
      setShowForm(false)
      setCostumeName('')
      setCostumeDescription('')

      // 触发后台预下载到缓存
      filesApi.storeFile(imageUrl, {
        category: 'costume-image',
        entityType: 'character',
        entityId: character.id,
        cacheImmediately: true,
      }).catch((error) => {
        console.warn('Failed to cache costume image:', error)
        // 预下载失败不影响主流程
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 根据模式选择生成方法
  const handleGenerateCostume = useTaskQueueMode
    ? handleGenerateCostumeWithTaskQueue
    : handleGenerateCostumeDirect

  // 判断是否正在生成
  const isCurrentlyGenerating = useTaskQueueMode
    ? !!runningImageTask && isTaskRunning(runningImageTask)
    : isGenerating

  // 删除服装
  const handleDeleteCostume = () => {
    if (deleteCostumeId) {
      deleteCostume(character.id, deleteCostumeId)
      toast.success('服装变体已删除')
      setDeleteCostumeId(null)
    }
  }

  // 下载图片
  const handleDownload = async (costume: CostumeVariant) => {
    try {
      const response = await fetch(costume.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${character.name}_${costume.name}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('下载失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">服装变体</h3>
        <div className="flex items-center gap-2">
          {runningImageTask && isTaskRunning(runningImageTask) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>生成中 {runningImageTask.progress}%</span>
              <Progress value={runningImageTask.progress} className="w-20 h-2" />
            </div>
          )}
          <Button
            onClick={() => setShowForm(true)}
            disabled={!character.basePrompt || isCurrentlyGenerating}
          >
            <Plus className="h-4 w-4 mr-2" />
            生成服装
          </Button>
        </div>
      </div>

      {/* 任务队列模式提示 */}
      {useTaskQueueMode && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          任务队列模式已启用，生成任务将在后台处理
        </div>
      )}

      {/* 服装列表 */}
      {character.costumes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Shirt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>暂无服装变体</p>
          <p className="text-sm">点击"生成服装"为角色创建不同服装的形象</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {character.costumes.map((costume) => (
            <Card key={costume.id} className="overflow-hidden group">
              <div
                className="aspect-square relative bg-muted cursor-pointer"
                onClick={() => setPreviewImage(costume.imageUrl)}
              >
                <img
                  src={costume.imageUrl}
                  alt={costume.name}
                  className="w-full h-full object-cover"
                />

                {/* 操作按钮 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(costume)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteCostumeId(costume.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{costume.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {costume.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 生成服装表单 */}
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium">生成新服装</h4>

            <div className="space-y-2">
              <Label htmlFor="costumeName">服装名称</Label>
              <Input
                id="costumeName"
                placeholder="例如：晚礼服、休闲装、古装..."
                value={costumeName}
                onChange={(e) => setCostumeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costumeDescription">服装描述</Label>
              <Textarea
                id="costumeDescription"
                placeholder="详细描述服装的样式、颜色、材质等..."
                rows={3}
                value={costumeDescription}
                onChange={(e) => setCostumeDescription(e.target.value)}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">完整提示词预览：</p>
              <p className="text-sm">
                {character.basePrompt && costumeDescription
                  ? aiApi.buildCostumePrompt(character.basePrompt, costumeDescription)
                  : '请填写服装描述'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setCostumeName('')
                  setCostumeDescription('')
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleGenerateCostume}
                disabled={isCurrentlyGenerating || !costumeName.trim() || !costumeDescription.trim()}
              >
                {isCurrentlyGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {useTaskQueueMode ? '提交中...' : '生成中...'}
                  </>
                ) : (
                  <>
                    {useTaskQueueMode && <Clock className="h-4 w-4 mr-2" />}
                    {useTaskQueueMode ? '提交任务' : '生成'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteCostumeId} onOpenChange={() => setDeleteCostumeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个服装变体吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCostume}
              className="bg-destructive text-destructive-foreground"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 图片预览 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="预览"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
