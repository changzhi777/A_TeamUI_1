/**
 * task-queue-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Queue Page
 * 任务队列管理页面
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ListOrdered,
  RefreshCw,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  AlertCircle,
  Ban,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTaskStore } from '@/stores/task-store'
import { TaskList } from '../components/task-list'
import { TaskDetail } from '../components/task-detail'
import type { Task, TaskStatus, TaskType } from '@/lib/api/tasks'

// Status badges configuration
const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '等待中', color: 'bg-yellow-500', icon: Clock },
  running: { label: '执行中', color: 'bg-blue-500', icon: Play },
  completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle2 },
  failed: { label: '失败', color: 'bg-red-500', icon: XCircle },
  cancelled: { label: '已取消', color: 'bg-gray-500', icon: Ban },
}

export function TaskQueuePage() {
  const {
    tasks,
    loading,
    error,
    stats,
    fetchTasks,
    fetchStats,
    clearError,
  } = useTaskStore()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [fetchTasks, fetchStats])

  // Refresh tasks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks()
      fetchStats()
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [fetchTasks, fetchStats])

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (typeFilter !== 'all' && task.type !== typeFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        task.id.toLowerCase().includes(query) ||
        task.type.toLowerCase().includes(query) ||
        (task.metadata?.characterName as string)?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Count by status
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    {} as Record<TaskStatus, number>
  )

  const handleRefresh = () => {
    fetchTasks()
    fetchStats()
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  return (
    <>
      <Header fixed>
        <SearchBar />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">任务队列</h1>
          <p className="text-muted-foreground">管理系统异步任务</p>
        </div>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">队列中</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.queueLength || 0}</div>
                <p className="text-xs text-muted-foreground">等待处理的任务</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">执行中</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.runningCount || 0}</div>
                <p className="text-xs text-muted-foreground">正在执行的任务</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已完成</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts['completed'] || 0}</div>
                <p className="text-xs text-muted-foreground">最近 24 小时</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">失败</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {statusCounts['failed'] || 0}
                </div>
                <p className="text-xs text-muted-foreground">需要关注的任务</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索任务..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">等待中</SelectItem>
                      <SelectItem value="running">执行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="failed">失败</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Type Filter */}
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as TaskType | 'all')}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="类型筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="export">导出</SelectItem>
                      <SelectItem value="import">导入</SelectItem>
                      <SelectItem value="image_generation">图片生成</SelectItem>
                      <SelectItem value="tts_generation">语音生成</SelectItem>
                      <SelectItem value="batch_process">批量处理</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Refresh Button */}
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    关闭
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                任务列表
                <Badge variant="secondary">{filteredTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={filteredTasks}
                loading={loading}
                onTaskClick={handleTaskClick}
              />
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  )
}

export default TaskQueuePage
