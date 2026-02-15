/**
 * task-store
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Store
 * 任务状态管理 (Zustand)
 */

import { create } from 'zustand'
import type { Task, TaskStatus, TaskType, TaskEvent } from '@/lib/api/tasks'
import { tasksApi } from '@/lib/api/tasks'

// ==================== Types ====================

interface TaskStore {
  // State
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  error: string | null
  stats: {
    queueLength: number
    runningCount: number
  } | null

  // Actions
  fetchTasks: (params?: {
    status?: TaskStatus
    type?: TaskType
    createdBy?: string
    limit?: number
    offset?: number
  }) => Promise<void>

  fetchTask: (taskId: string) => Promise<void>

  createTask: (params: {
    type: TaskType
    priority?: 'low' | 'normal' | 'high'
    payload: Record<string, unknown>
    maxRetries?: number
    metadata?: Record<string, unknown>
  }) => Promise<Task>

  cancelTask: (taskId: string) => Promise<void>

  retryTask: (taskId: string) => Promise<void>

  fetchStats: () => Promise<void>

  clearError: () => void

  // WebSocket handlers
  onTaskCreated: (task: Task) => void

  onTaskUpdated: (task: Partial<Task> & { id: string }) => void

  onTaskEvent: (event: TaskEvent) => void
}

// ==================== Store ====================

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  stats: null,

  // Actions
  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null })

    try {
      const response = await tasksApi.list(params)
      set({
        tasks: response.data,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: false,
      })
    }
  },

  fetchTask: async (taskId: string) => {
    set({ loading: true, error: null })

    try {
      const task = await tasksApi.get(taskId)
      set({
        currentTask: task,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch task',
        loading: false,
      })
    }
  },

  createTask: async (params) => {
    set({ loading: true, error: null })

    try {
      const task = await tasksApi.create(params)

      // Add to local state
      set((state) => ({
        tasks: [task, ...state.tasks],
        loading: false,
      }))

      return task
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        loading: false,
      })
      throw error
    }
  },

  cancelTask: async (taskId: string) => {
    set({ loading: true, error: null })

    try {
      const task = await tasksApi.cancel(taskId)

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
        currentTask: state.currentTask?.id === taskId ? task : state.currentTask,
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel task',
        loading: false,
      })
    }
  },

  retryTask: async (taskId: string) => {
    set({ loading: true, error: null })

    try {
      const task = await tasksApi.retry(taskId)

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
        currentTask: state.currentTask?.id === taskId ? task : state.currentTask,
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to retry task',
        loading: false,
      })
    }
  },

  fetchStats: async () => {
    try {
      const stats = await tasksApi.stats()
      set({
        stats: {
          queueLength: stats.queueLength,
          runningCount: stats.runningCount,
        },
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  },

  clearError: () => set({ error: null }),

  // WebSocket handlers
  onTaskCreated: (task) => {
    set((state) => ({
      tasks: [task, ...state.tasks],
    }))
  },

  onTaskUpdated: (update) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === update.id ? { ...t, ...update } : t
      ),
      currentTask:
        state.currentTask?.id === update.id
          ? { ...state.currentTask, ...update }
          : state.currentTask,
    }))
  },

  onTaskEvent: (event) => {
    // Handle different event types
    const { tasks } = get()
    const taskIndex = tasks.findIndex((t) => t.id === event.taskId)

    if (taskIndex === -1) return

    switch (event.type) {
      case 'task:started':
        get().onTaskUpdated({
          id: event.taskId,
          status: 'running',
          startedAt: event.timestamp,
        })
        break

      case 'task:progress':
        get().onTaskUpdated({
          id: event.taskId,
          progress: event.data?.progress as number,
        })
        break

      case 'task:completed':
        get().onTaskUpdated({
          id: event.taskId,
          status: 'completed',
          result: event.data?.result as Record<string, unknown>,
          completedAt: event.timestamp,
          progress: 100,
        })
        break

      case 'task:failed':
        get().onTaskUpdated({
          id: event.taskId,
          status: 'failed',
          error: event.data?.error as string,
          completedAt: event.timestamp,
        })
        break

      case 'task:cancelled':
        get().onTaskUpdated({
          id: event.taskId,
          status: 'cancelled',
          completedAt: event.timestamp,
        })
        break
    }
  },
}))

// ==================== Hooks ====================

/**
 * 获取按状态分组的任务
 */
export function useTasksByStatus() {
  const tasks = useTaskStore((state) => state.tasks)

  return {
    pending: tasks.filter((t) => t.status === 'pending'),
    running: tasks.filter((t) => t.status === 'running'),
    completed: tasks.filter((t) => t.status === 'completed'),
    failed: tasks.filter((t) => t.status === 'failed'),
    cancelled: tasks.filter((t) => t.status === 'cancelled'),
  }
}

/**
 * 获取特定类型的任务
 */
export function useTasksByType(type: TaskType) {
  const tasks = useTaskStore((state) => state.tasks)

  return tasks.filter((t) => t.type === type)
}

// ==================== Export ====================

export default useTaskStore
