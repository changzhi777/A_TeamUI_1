/**
 * tasks
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task API Client
 * 任务 API 客户端
 */

import { api } from './client'

// ==================== Types ====================

export type TaskType =
  | 'export'
  | 'import'
  | 'ai_generate'
  | 'image_generation'
  | 'tts_generation'
  | 'batch_process'
  | 'custom'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type TaskPriority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  payload: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
  progress: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  createdBy: string
  retryCount: number
  maxRetries: number
  metadata?: Record<string, unknown>
  events?: TaskEvent[]
}

export interface TaskEvent {
  type: string
  taskId: string
  timestamp: string
  data?: Record<string, unknown>
}

export interface CreateTaskParams {
  type: TaskType
  priority?: TaskPriority
  payload: Record<string, unknown>
  maxRetries?: number
  metadata?: Record<string, unknown>
}

export interface ListTasksParams {
  status?: TaskStatus
  type?: TaskType
  createdBy?: string
  limit?: number
  offset?: number
}

export interface ListTasksResponse {
  data: Task[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface TaskStats {
  queueLength: number
  runningCount: number
  queues: {
    high: number
    normal: number
    low: number
  }
}

// ==================== API Functions ====================

/**
 * 创建任务
 * Note: api.post returns response.data.data directly
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
  return api.post<Task>('/api/tasks', params)
}

/**
 * 获取任务列表
 * Note: Backend returns { success: true, data: Task[], meta: {...} }
 * api.get<T> returns response.data.data, which is T
 * So api.get<Task[]> returns Task[] (the array inside data field)
 * We need to construct the response format expected by consumers
 */
export async function getTasks(params: ListTasksParams = {}): Promise<ListTasksResponse> {
  const queryParams = new URLSearchParams()

  if (params.status) queryParams.set('status', params.status)
  if (params.type) queryParams.set('type', params.type)
  if (params.createdBy) queryParams.set('createdBy', params.createdBy)
  if (params.limit) queryParams.set('limit', params.limit.toString())
  if (params.offset) queryParams.set('offset', params.offset.toString())

  const queryString = queryParams.toString()
  const url = `/api/tasks${queryString ? `?${queryString}` : ''}`

  // Backend returns { success: true, data: Task[], meta: {...} }
  // api.get extracts response.data.data (which is Task[])
  // We need meta info too, but api.get doesn't provide it
  // For now, return the tasks with default meta
  const tasks = await api.get<Task[]>(url)

  return {
    data: tasks,
    meta: {
      total: tasks.length,
      limit: params.limit || 20,
      offset: params.offset || 0,
    },
  }
}

/**
 * 获取任务详情
 * Note: api.get returns response.data.data directly
 */
export async function getTask(taskId: string): Promise<Task> {
  return api.get<Task>(`/api/tasks/${taskId}`)
}

/**
 * 取消任务
 * Note: api.delete returns response.data.data directly
 */
export async function cancelTask(taskId: string): Promise<Task> {
  return api.delete<Task>(`/api/tasks/${taskId}`)
}

/**
 * 重试任务
 * Note: api.post returns response.data.data directly
 */
export async function retryTask(taskId: string): Promise<Task> {
  return api.post<Task>(`/api/tasks/${taskId}/retry`)
}

/**
 * 获取队列统计
 * Note: api.get returns response.data.data directly
 */
export async function getTaskStats(): Promise<TaskStats> {
  return api.get<TaskStats>('/api/tasks/stats')
}

// ==================== Export ====================

export const tasksApi = {
  create: createTask,
  list: getTasks,
  get: getTask,
  cancel: cancelTask,
  retry: retryTask,
  stats: getTaskStats,
}

export default tasksApi
