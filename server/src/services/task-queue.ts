/**
 * task-queue
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Queue Service
 * 任务队列服务 - 基于 Redis 的任务队列实现
 */

import { redis } from '../config/redis'
import { generateId } from '../utils/id'

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
  progress: number // 0-100
  createdAt: string
  startedAt?: string
  completedAt?: string
  createdBy: string
  retryCount: number
  maxRetries: number
  metadata?: Record<string, unknown>
}

export interface CreateTaskParams {
  type: TaskType
  priority?: TaskPriority
  payload: Record<string, unknown>
  createdBy: string
  maxRetries?: number
  metadata?: Record<string, unknown>
}

export interface TaskListParams {
  status?: TaskStatus
  type?: TaskType
  createdBy?: string
  limit?: number
  offset?: number
}

// ==================== Redis Keys ====================

const TASK_QUEUE_KEYS = {
  queue: (priority: TaskPriority) => `task:queue:${priority}`,
  task: (taskId: string) => `task:${taskId}`,
  running: () => 'task:running',
  userTasks: (userId: string) => `tasks:user:${userId}`,
  taskEvents: (taskId: string) => `task:events:${taskId}`,
}

const TASK_TTL = 60 * 60 * 24 * 7 // 7 days

// ==================== Task Creation ====================

/**
 * 创建并入队一个新任务
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
  const taskId = generateId('task')
  const now = new Date().toISOString()

  const task: Task = {
    id: taskId,
    type: params.type,
    status: 'pending',
    priority: params.priority || 'normal',
    payload: params.payload,
    progress: 0,
    createdAt: now,
    createdBy: params.createdBy,
    retryCount: 0,
    maxRetries: params.maxRetries ?? 3,
    metadata: params.metadata,
  }

  // Store task data
  const taskKey = TASK_QUEUE_KEYS.task(taskId)
  await redis.hset(taskKey, taskToHash(task))
  await redis.expire(taskKey, TASK_TTL)

  // Add to priority queue
  const queueKey = TASK_QUEUE_KEYS.queue(task.priority)
  await redis.rpush(queueKey, taskId)

  // Add to user's task list
  const userTasksKey = TASK_QUEUE_KEYS.userTasks(params.createdBy)
  await redis.lpush(userTasksKey, taskId)
  await redis.ltrim(userTasksKey, 0, 999) // Keep last 1000 tasks

  // Add creation event
  await addTaskEvent(taskId, 'created', { task })

  return task
}

// ==================== Task Retrieval ====================

/**
 * 获取任务详情
 */
export async function getTask(taskId: string): Promise<Task | null> {
  const taskKey = TASK_QUEUE_KEYS.task(taskId)
  const data = await redis.hgetall(taskKey)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return hashToTask(data)
}

/**
 * 获取任务列表
 */
export async function getTasks(params: TaskListParams = {}): Promise<{
  tasks: Task[]
  total: number
}> {
  const { status, type, createdBy, limit = 20, offset = 0 } = params

  // Get task IDs based on filters
  let taskIds: string[]

  if (createdBy) {
    // Get user's tasks
    const userTasksKey = TASK_QUEUE_KEYS.userTasks(createdBy)
    taskIds = await redis.lrange(userTasksKey, 0, -1)
  } else {
    // Get all tasks from all queues
    const allQueues = [
      TASK_QUEUE_KEYS.queue('high'),
      TASK_QUEUE_KEYS.queue('normal'),
      TASK_QUEUE_KEYS.queue('low'),
    ]

    taskIds = []
    for (const queue of allQueues) {
      const ids = await redis.lrange(queue, 0, -1)
      taskIds.push(...ids)
    }

    // Also include running tasks
    const runningIds = await redis.smembers(TASK_QUEUE_KEYS.running())
    taskIds.push(...runningIds)
  }

  // Fetch tasks
  const tasks: Task[] = []
  for (const id of taskIds) {
    const task = await getTask(id)
    if (task) {
      // Apply filters
      if (status && task.status !== status) continue
      if (type && task.type !== type) continue
      tasks.push(task)
    }
  }

  // Sort by createdAt descending
  tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = tasks.length
  const paginatedTasks = tasks.slice(offset, offset + limit)

  return { tasks: paginatedTasks, total }
}

// ==================== Task Operations ====================

/**
 * 更新任务状态
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  updates?: Partial<Pick<Task, 'progress' | 'result' | 'error' | 'startedAt' | 'completedAt'>>
): Promise<Task | null> {
  const task = await getTask(taskId)
  if (!task) return null

  const updatedTask: Task = {
    ...task,
    status,
    ...updates,
  }

  // Update task data
  const taskKey = TASK_QUEUE_KEYS.task(taskId)
  await redis.hset(taskKey, taskToHash(updatedTask))

  // Update running set
  if (status === 'running') {
    await redis.sadd(TASK_QUEUE_KEYS.running(), taskId)
  } else {
    await redis.srem(TASK_QUEUE_KEYS.running(), taskId)
  }

  // Add event
  await addTaskEvent(taskId, status, updates || {})

  return updatedTask
}

/**
 * 更新任务进度
 */
export async function updateTaskProgress(taskId: string, progress: number): Promise<void> {
  const taskKey = TASK_QUEUE_KEYS.task(taskId)
  await redis.hset(taskKey, 'progress', Math.min(100, Math.max(0, progress)))
  await addTaskEvent(taskId, 'progress', { progress })
}

/**
 * 取消任务
 */
export async function cancelTask(taskId: string): Promise<Task | null> {
  const task = await getTask(taskId)
  if (!task) return null

  // Can only cancel pending tasks
  if (task.status !== 'pending') {
    return null
  }

  // Remove from queue
  const queueKey = TASK_QUEUE_KEYS.queue(task.priority)
  await redis.lrem(queueKey, 1, taskId)

  // Update status
  return updateTaskStatus(taskId, 'cancelled', {
    completedAt: new Date().toISOString(),
  })
}

/**
 * 重试任务
 */
export async function retryTask(taskId: string): Promise<Task | null> {
  const task = await getTask(taskId)
  if (!task) return null

  // Can only retry failed tasks
  if (task.status !== 'failed') {
    return null
  }

  // Reset task state - first update the task data directly, then call updateTaskStatus
  const taskKey = TASK_QUEUE_KEYS.task(taskId)
  const newRetryCount = task.retryCount + 1
  await redis.hset(taskKey, {
    status: 'pending',
    progress: '0',
    error: '',
    retryCount: newRetryCount.toString(),
  })

  // Add event
  await addTaskEvent(taskId, 'pending', { retryCount: newRetryCount })

  // Get updated task
  const updatedTask = await getTask(taskId)

  if (!updatedTask) return null

  // Re-add to queue
  const queueKey = TASK_QUEUE_KEYS.queue(updatedTask.priority)
  await redis.rpush(queueKey, taskId)

  return updatedTask
}

// ==================== Queue Operations ====================

/**
 * 从队列获取下一个任务（按优先级）
 */
export async function dequeueTask(): Promise<Task | null> {
  // Try queues in priority order
  const priorities: TaskPriority[] = ['high', 'normal', 'low']

  for (const priority of priorities) {
    const queueKey = TASK_QUEUE_KEYS.queue(priority)
    const taskId = await redis.lpop(queueKey)

    if (taskId) {
      const task = await getTask(taskId)
      if (task && task.status === 'pending') {
        return task
      }
    }
  }

  return null
}

/**
 * 获取队列长度
 */
export async function getQueueLength(priority?: TaskPriority): Promise<number> {
  if (priority) {
    const queueKey = TASK_QUEUE_KEYS.queue(priority)
    return redis.llen(queueKey)
  }

  const lengths = await Promise.all([
    redis.llen(TASK_QUEUE_KEYS.queue('high')),
    redis.llen(TASK_QUEUE_KEYS.queue('normal')),
    redis.llen(TASK_QUEUE_KEYS.queue('low')),
  ])

  return lengths.reduce((sum, len) => sum + len, 0)
}

/**
 * 获取正在运行的任务数量
 */
export async function getRunningCount(): Promise<number> {
  return redis.scard(TASK_QUEUE_KEYS.running())
}

// ==================== Events ====================

export interface TaskEvent {
  type: string
  taskId: string
  timestamp: string
  data?: Record<string, unknown>
}

async function addTaskEvent(
  taskId: string,
  type: string,
  data?: Record<string, unknown>
): Promise<void> {
  const eventsKey = TASK_QUEUE_KEYS.taskEvents(taskId)
  const event: TaskEvent = {
    type,
    taskId,
    timestamp: new Date().toISOString(),
    data,
  }

  await redis.rpush(eventsKey, JSON.stringify(event))
  await redis.expire(eventsKey, TASK_TTL)
}

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  const eventsKey = TASK_QUEUE_KEYS.taskEvents(taskId)
  const rawEvents = await redis.lrange(eventsKey, 0, -1)

  return rawEvents.map((e) => JSON.parse(e) as TaskEvent)
}

// ==================== Helpers ====================

function taskToHash(task: Task): Record<string, string> {
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    priority: task.priority,
    payload: JSON.stringify(task.payload),
    result: task.result ? JSON.stringify(task.result) : '',
    error: task.error || '',
    progress: task.progress.toString(),
    createdAt: task.createdAt,
    startedAt: task.startedAt || '',
    completedAt: task.completedAt || '',
    createdBy: task.createdBy,
    retryCount: task.retryCount.toString(),
    maxRetries: task.maxRetries.toString(),
    metadata: task.metadata ? JSON.stringify(task.metadata) : '',
  }
}

function hashToTask(data: Record<string, string>): Task {
  return {
    id: data.id,
    type: data.type as TaskType,
    status: data.status as TaskStatus,
    priority: data.priority as TaskPriority,
    payload: JSON.parse(data.payload || '{}'),
    result: data.result ? JSON.parse(data.result) : undefined,
    error: data.error || undefined,
    progress: parseInt(data.progress || '0', 10),
    createdAt: data.createdAt,
    startedAt: data.startedAt || undefined,
    completedAt: data.completedAt || undefined,
    createdBy: data.createdBy,
    retryCount: parseInt(data.retryCount || '0', 10),
    maxRetries: parseInt(data.maxRetries || '3', 10),
    metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
  }
}

// ==================== Export ====================

export const taskQueue = {
  createTask,
  getTask,
  getTasks,
  updateTaskStatus,
  updateTaskProgress,
  cancelTask,
  retryTask,
  dequeueTask,
  getQueueLength,
  getRunningCount,
  getTaskEvents,
}

export default taskQueue
