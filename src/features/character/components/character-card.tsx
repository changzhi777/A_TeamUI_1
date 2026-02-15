/**
 * character-card
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Card Component
 * 角色卡片组件
 */

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  User,
  Volume2,
  VolumeX,
  Copy,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import type { Character } from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { useProjectStore } from '@/stores/project-store'
import { toast } from 'sonner'
import { getCharacterSyncStatus } from '@/lib/services/character-asset-sync'

interface CharacterCardProps {
  character: Character
  /** 项目名称（可选，不传时自动从 store 获取） */
  projectName?: string
  /** 项目编号（可选，不传时自动从 store 获取） */
  projectCode?: string
  onClick?: () => void
  onEdit?: () => void
}

export function CharacterCard({ character, projectName, projectCode, onClick, onEdit }: CharacterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter)
  const getProjectById = useProjectStore((state) => state.getProjectById)

  // 获取项目信息：优先使用传入的属性，否则从 store 查找
  const project = character.projectId ? getProjectById(character.projectId) : null
  const resolvedProjectName = projectName ?? project?.name
  const resolvedProjectCode = projectCode ?? (project ? project.id.slice(0, 8).toUpperCase() : undefined)

  // 获取同步状态
  const syncStatus = getCharacterSyncStatus(character)

  // 获取主图片（正面或第一个可用的视角）
  const mainImage =
    character.views.front?.url ||
    character.views.threeQuarter?.url ||
    character.views.side?.url ||
    character.views.back?.url

  // 计算已生成视角数量
  const viewCount = Object.values(character.views).filter(Boolean).length

  // 计算服装数量
  const costumeCount = character.costumes.length

  // 播放/暂停语音
  const handlePlayVoice = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!character.voice?.sampleUrl) return

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(character.voice.sampleUrl)
        audioRef.current.onended = () => {
          setIsPlaying(false)
        }
        audioRef.current.onerror = () => {
          toast.error('音频加载失败')
          setIsPlaying(false)
          setIsLoading(false)
        }
        audioRef.current.oncanplaythrough = () => {
          setIsLoading(false)
        }
      }

      if (isPlaying) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await audioRef.current.play()
        setIsPlaying(true)
        setIsLoading(false)
      }
    } catch (error) {
      toast.error('音频播放失败')
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  // 复制角色编号
  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(character.code)
    setCodeCopied(true)
    toast.success('角色编号已复制')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleDelete = async () => {
    deleteCharacter(character.id)
    toast.success('角色已删除')
    setShowDeleteDialog(false)
  }

  const handleExport = () => {
    const data = JSON.stringify(character, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${character.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('角色数据已导出')
  }

  return (
    <>
      <Card
        className="group relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
        onClick={onClick}
      >
        {/* 更多操作菜单 */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleExport()
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                导出
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
                className="text-amber-600 dark:text-amber-500 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 图片区域 */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={character.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User className="h-12 w-12" />
            </div>
          )}

          {/* 视角和服装统计 */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {viewCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {viewCount} 视角
              </Badge>
            )}
            {costumeCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {costumeCount} 服装
              </Badge>
            )}
          </div>

          {/* 语音播放按钮 */}
          {character.voice?.sampleUrl ? (
            <button
              className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={handlePlayVoice}
              title={isPlaying ? '暂停语音' : '播放语音'}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
              {isPlaying ? '暂停' : '语音'}
            </button>
          ) : character.voice ? (
            <div className="absolute bottom-2 right-2">
              <Badge variant="default" className="text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                语音
              </Badge>
            </div>
          ) : null}
        </div>

        {/* 信息区域 */}
        <CardContent className="p-3">
          <div className="space-y-1">
            {/* 角色编号和同步状态 */}
            <div className="flex items-center justify-between gap-1">
              <div
                className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={handleCopyCode}
                title="点击复制编号"
              >
                <span className="font-mono">{character.code}</span>
                {codeCopied ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </div>
              {syncStatus.synced && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  已同步
                </Badge>
              )}
            </div>
            {/* 角色名称和项目信息 */}
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate flex-1" title={character.name}>
                {character.name}
              </h3>
            </div>
            {/* 项目名称和编号 */}
            {resolvedProjectName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                  {resolvedProjectName}
                </Badge>
                {resolvedProjectCode && (
                  <span className="font-mono text-[10px] opacity-70">
                    #{resolvedProjectCode}
                  </span>
                )}
              </div>
            )}
            {character.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {character.description}
              </p>
            )}
            {/* 标签 */}
            {character.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {character.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {character.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{character.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <Trash2 className="h-5 w-5" />
              确认删除角色
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  您确定要删除角色 <strong>"{character.name}"</strong> 吗？
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ 警告：此操作不可撤销！
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                    <li>所有关联的图片将被删除</li>
                    <li>所有服装变体将被删除</li>
                    <li>语音样本将被删除</li>
                    <li>角色数据无法恢复</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  角色编号：<span className="font-mono">{character.code}</span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
