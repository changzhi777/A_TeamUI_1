/**
 * task-progress-indicator
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/api/tasks'

interface TaskProgressIndicatorProps {
  task: Task
  className?: string
  showLabel?: boolean
}

/**
 * 任务进度指示器组件
 * 显示任务的当前状态和进度
 */
export function TaskProgressIndicator({
  task,
  className,
  showLabel = true,
}: TaskProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getStatusLabel = () => {
    switch (task.status) {
      case 'pending':
        return '等待中'
      case 'running':
        return `处理中 ${task.progress}%`
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      case 'cancelled':
        return '已取消'
      default:
        return '未知'
    }
  }

  const getProgressColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-destructive'
      default:
        return ''
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {getStatusIcon()}
      {showLabel && (
        <span className="text-sm text-muted-foreground">{getStatusLabel()}</span>
      )}
      {task.status === 'running' && (
        <Progress
          value={task.progress}
          className={cn('h-2 w-24', getProgressColor())}
        />
      )}
    </div>
  )
}

interface TaskProgressBarProps {
  task: Task
  className?: string
}

/**
 * 任务进度条组件
 * 仅显示进度条，不带图标
 */
export function TaskProgressBar({ task, className }: TaskProgressBarProps) {
  if (task.status !== 'running' && task.status !== 'pending') {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      <Progress
        value={task.progress}
        className={cn('h-2', task.status === 'completed' && 'bg-green-500')}
      />
      <p className="mt-1 text-xs text-muted-foreground text-center">
        {task.status === 'pending' ? '等待处理...' : `${task.progress}%`}
      </p>
    </div>
  )
}

interface TaskStatusBadgeProps {
  task: Task
  className?: string
}

/**
 * 任务状态徽章组件
 */
export function TaskStatusBadge({ task, className }: TaskStatusBadgeProps) {
  const getBadgeStyles = () => {
    switch (task.status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'running':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getBadgeLabel = () => {
    switch (task.status) {
      case 'pending':
        return '等待中'
      case 'running':
        return '处理中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      case 'cancelled':
        return '已取消'
      default:
        return '未知'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        getBadgeStyles(),
        className
      )}
    >
      {task.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
      {getBadgeLabel()}
    </span>
  )
}
