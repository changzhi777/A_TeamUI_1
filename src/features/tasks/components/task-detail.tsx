/**
 * task-detail
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Detail Component
 * 任务详情组件
 */

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Ban,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/api/tasks'
import { useTaskStore } from '@/stores/task-store'
import { toast } from 'sonner'

// Status configuration
const statusConfig: Record<
  TaskStatus,
  { label: string; icon: typeof Clock; color: string; bgColor: string }
> = {
  pending: {
    label: '等待中',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  running: {
    label: '执行中',
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  failed: {
    label: '失败',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  cancelled: {
    label: '已取消',
    icon: Ban,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
}

// Type labels
const typeLabels: Record<string, string> = {
  export: '导出',
  import: '导入',
  ai_generate: 'AI 生成',
  image_generation: '图片生成',
  tts_generation: '语音生成',
  batch_process: '批量处理',
  custom: '自定义',
}

interface TaskDetailProps {
  task: Task
  open: boolean
  onClose: () => void
}

export function TaskDetail({ task, open, onClose }: TaskDetailProps) {
  const { cancelTask, retryTask, fetchTask } = useTaskStore()

  // Refresh task periodically if running
  useEffect(() => {
    if (open && task.status === 'running') {
      const interval = setInterval(() => {
        fetchTask(task.id)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [open, task.id, task.status, fetchTask])

  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  const handleCancel = async () => {
    try {
      await cancelTask(task.id)
      toast.success('任务已取消')
    } catch (error) {
      toast.error('取消失败')
    }
  }

  const handleRetry = async () => {
    try {
      await retryTask(task.id)
      toast.success('任务已重试')
    } catch (error) {
      toast.error('重试失败')
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id)
    toast.success('已复制任务 ID')
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const formatDuration = () => {
    if (!task.startedAt) return '-'
    const start = new Date(task.startedAt).getTime()
    const end = task.completedAt
      ? new Date(task.completedAt).getTime()
      : Date.now()
    const seconds = Math.floor((end - start) / 1000)

    if (seconds < 60) return `${seconds} 秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`
    return `${Math.floor(seconds / 3600)} 时 ${Math.floor((seconds % 3600) / 60)} 分`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            任务详情
            <Badge className={`${status.bgColor} ${status.color} border-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">基本信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">任务 ID：</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-1 rounded">{task.id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyId}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">任务类型：</span>
                  <span>{typeLabels[task.type] || task.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">优先级：</span>
                  <span className="capitalize">{task.priority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">创建时间：</span>
                  <span>{formatDate(task.createdAt)}</span>
                </div>
                {task.startedAt && (
                  <div>
                    <span className="text-muted-foreground">开始时间：</span>
                    <span>{formatDate(task.startedAt)}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <span className="text-muted-foreground">完成时间：</span>
                    <span>{formatDate(task.completedAt)}</span>
                  </div>
                )}
                {task.startedAt && (
                  <div>
                    <span className="text-muted-foreground">执行时长：</span>
                    <span>{formatDuration()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {task.status === 'running' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">执行进度</h4>
                <div className="flex items-center gap-4">
                  <Progress value={task.progress} className="flex-1" />
                  <span className="text-sm font-medium">{task.progress}%</span>
                </div>
              </div>
            )}

            {/* Error */}
            {task.status === 'failed' && task.error && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">错误信息</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                  {task.error}
                </div>
                <div className="text-xs text-muted-foreground">
                  重试次数：{task.retryCount} / {task.maxRetries}
                </div>
              </div>
            )}

            {/* Result */}
            {task.status === 'completed' && task.result && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">执行结果</h4>
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(task.result, null, 2)}
                  </pre>
                </div>
                {/* Image preview */}
                {task.result.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={task.result.imageUrl as string}
                      alt="Generated"
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                )}
                {/* Audio preview */}
                {task.result.audioUrl && (
                  <div className="mt-2">
                    <audio
                      src={task.result.audioUrl as string}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            {task.metadata && Object.keys(task.metadata).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">元数据</h4>
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(task.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Events */}
            {task.events && task.events.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">事件日志</h4>
                <div className="space-y-2">
                  {task.events.slice(-10).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="font-mono">
                        {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                      <span className="font-medium">{event.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          {task.status === 'pending' && (
            <Button variant="destructive" onClick={handleCancel}>
              <Trash2 className="h-4 w-4 mr-2" />
              取消任务
            </Button>
          )}
          {task.status === 'failed' && task.retryCount < task.maxRetries && (
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重试任务
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetail
