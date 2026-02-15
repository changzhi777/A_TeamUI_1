/**
 * task-list
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task List Component
 * 任务列表组件
 */

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Ban,
  RefreshCw,
  Trash2,
  ChevronRight,
  Image,
  Mic,
  FileOutput,
  FileInput,
  Layers,
  Settings,
} from 'lucide-react'
import type { Task, TaskStatus, TaskType } from '@/lib/api/tasks'
import { useTaskStore } from '@/stores/task-store'
import { toast } from 'sonner'

// Type icons
const typeIcons: Record<TaskType, typeof FileOutput> = {
  export: FileOutput,
  import: FileInput,
  ai_generate: Settings,
  image_generation: Image,
  tts_generation: Mic,
  batch_process: Layers,
  custom: Settings,
}

// Type labels
const typeLabels: Record<TaskType, string> = {
  export: '导出',
  import: '导入',
  ai_generate: 'AI 生成',
  image_generation: '图片生成',
  tts_generation: '语音生成',
  batch_process: '批量处理',
  custom: '自定义',
}

// Status icons and colors
const statusConfig: Record<
  TaskStatus,
  { icon: typeof Clock; color: string; bgColor: string }
> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  running: { icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  cancelled: { icon: Ban, color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

const statusLabels: Record<TaskStatus, string> = {
  pending: '等待中',
  running: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
}

interface TaskListProps {
  tasks: Task[]
  loading?: boolean
  onTaskClick: (task: Task) => void
}

export function TaskList({ tasks, loading, onTaskClick }: TaskListProps) {
  const { cancelTask, retryTask } = useTaskStore()

  const handleCancel = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    try {
      await cancelTask(taskId)
      toast.success('任务已取消')
    } catch (error) {
      toast.error('取消失败')
    }
  }

  const handleRetry = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    try {
      await retryTask(taskId)
      toast.success('任务已重试')
    } catch (error) {
      toast.error('重试失败')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
        <p>暂无任务</p>
        <p className="text-sm">创建新任务后将在这里显示</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">类型</TableHead>
          <TableHead className="w-[100px]">状态</TableHead>
          <TableHead>描述</TableHead>
          <TableHead className="w-[120px]">进度</TableHead>
          <TableHead className="w-[140px]">创建时间</TableHead>
          <TableHead className="w-[100px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const TypeIcon = typeIcons[task.type] || Settings
          const status = statusConfig[task.status]
          const StatusIcon = status.icon

          return (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onTaskClick(task)}
            >
              {/* Type */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{typeLabels[task.type]}</span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${status.bgColor} ${status.color} border-0`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[task.status]}
                </Badge>
              </TableCell>

              {/* Description */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {task.metadata?.characterName as string ||
                      task.metadata?.description as string ||
                      task.type}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {task.id}
                  </span>
                </div>
              </TableCell>

              {/* Progress */}
              <TableCell>
                {task.status === 'running' ? (
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-8">
                      {task.progress}%
                    </span>
                  </div>
                ) : task.status === 'completed' ? (
                  <span className="text-xs text-green-600">100%</span>
                ) : task.status === 'failed' ? (
                  <span className="text-xs text-red-600">
                    重试 {task.retryCount}/{task.maxRetries}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Created At */}
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(task.createdAt)}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center gap-1">
                  {task.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleCancel(e, task.id)}
                      title="取消"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  {task.status === 'failed' && task.retryCount < task.maxRetries && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleRetry(e, task.id)}
                      title="重试"
                    >
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="详情"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default TaskList
