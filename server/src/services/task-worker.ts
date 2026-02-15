/**
 * task-worker
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Worker Service
 * 任务执行器 - 从队列消费任务并执行
 */

import { taskQueue, type Task, type TaskType } from './task-queue'
import { broadcastTaskNotification } from '../websocket/task-notifications'
import { handleImageGeneration } from './task-handlers/image-generation'
import { handleTTSGeneration } from './task-handlers/tts-generation'

// ==================== Types ====================

export type TaskHandler<T = Record<string, unknown>> = (
  task: Task,
  context: TaskHandlerContext
) => Promise<T>

export interface TaskHandlerContext {
  updateProgress: (progress: number) => Promise<void>
}

// ==================== Registry ====================

const taskHandlers = new Map<TaskType, TaskHandler>()

/**
 * 注册任务处理器
 */
export function registerTaskHandler<T = Record<string, unknown>>(
  type: TaskType,
  handler: TaskHandler<T>
): void {
  taskHandlers.set(type, handler as TaskHandler)
  console.log(`📝 Registered task handler: ${type}`)
}

/**
 * 获取任务处理器
 */
export function getTaskHandler(type: TaskType): TaskHandler | undefined {
  return taskHandlers.get(type)
}

// ==================== Worker ====================

interface WorkerConfig {
  concurrency?: number
  pollInterval?: number
  taskTimeout?: number
}

let workerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const defaultConfig: Required<WorkerConfig> = {
  concurrency: 3,
  pollInterval: 1000,
  taskTimeout: 5 * 60 * 1000, // 5 minutes
}

/**
 * 启动任务 Worker
 */
export function startTaskWorker(config: WorkerConfig = {}): void {
  if (workerRunning) {
    console.log('⚠️ Task worker is already running')
    return
  }

  const { concurrency, pollInterval, taskTimeout } = { ...defaultConfig, ...config }
  workerRunning = true

  console.log(`🚀 Task worker started (concurrency: ${concurrency})`)

  // Track active tasks
  let activeTasks = 0

  const processTask = async () => {
    if (!workerRunning) return
    if (activeTasks >= concurrency) return

    try {
      // Dequeue a task
      const task = await taskQueue.dequeueTask()

      if (task) {
        activeTasks++
        executeTask(task, taskTimeout)
          .finally(() => {
            activeTasks--
          })
      }
    } catch (error) {
      console.error('Task worker error:', error)
    }
  }

  // Start polling
  workerInterval = setInterval(processTask, pollInterval)

  // Initial processing
  processTask()
}

/**
 * 停止任务 Worker
 */
export function stopTaskWorker(): void {
  workerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  console.log('🛑 Task worker stopped')
}

/**
 * 执行单个任务
 */
async function executeTask(task: Task, timeout: number): Promise<void> {
  const handler = getTaskHandler(task.type)

  if (!handler) {
    console.warn(`⚠️ No handler for task type: ${task.type}`)

    // Mark task as failed
    await taskQueue.updateTaskStatus(task.id, 'failed', {
      error: `No handler registered for task type: ${task.type}`,
      completedAt: new Date().toISOString(),
    })

    await broadcastTaskNotification(task.createdBy, {
      type: 'task:failed',
      taskId: task.id,
      error: `No handler registered for task type: ${task.type}`,
    })

    return
  }

  console.log(`⏳ Processing task ${task.id} (type: ${task.type})`)

  // Update status to running
  await taskQueue.updateTaskStatus(task.id, 'running', {
    startedAt: new Date().toISOString(),
  })

  await broadcastTaskNotification(task.createdBy, {
    type: 'task:started',
    taskId: task.id,
  })

  try {
    // Create context with progress callback
    const context: TaskHandlerContext = {
      updateProgress: async (progress: number) => {
        await taskQueue.updateTaskProgress(task.id, progress)
        await broadcastTaskNotification(task.createdBy, {
          type: 'task:progress',
          taskId: task.id,
          progress,
        })
      },
    }

    // Execute with timeout
    const result = await executeWithTimeout(
      () => handler(task, context),
      timeout
    )

    // Mark as completed
    await taskQueue.updateTaskStatus(task.id, 'completed', {
      result,
      progress: 100,
      completedAt: new Date().toISOString(),
    })

    console.log(`✅ Task ${task.id} completed`)

    await broadcastTaskNotification(task.createdBy, {
      type: 'task:completed',
      taskId: task.id,
      result,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Task ${task.id} failed:`, errorMessage)

    // Check if should retry
    const currentTask = await taskQueue.getTask(task.id)
    if (currentTask && currentTask.retryCount < currentTask.maxRetries) {
      console.log(`🔄 Retrying task ${task.id} (attempt ${currentTask.retryCount + 1}/${currentTask.maxRetries})`)

      // Re-add to queue
      await taskQueue.retryTask(task.id)

      await broadcastTaskNotification(task.createdBy, {
        type: 'task:retrying',
        taskId: task.id,
        retryCount: currentTask.retryCount + 1,
        maxRetries: currentTask.maxRetries,
      })
    } else {
      // Mark as failed
      await taskQueue.updateTaskStatus(task.id, 'failed', {
        error: errorMessage,
        completedAt: new Date().toISOString(),
      })

      await broadcastTaskNotification(task.createdBy, {
        type: 'task:failed',
        taskId: task.id,
        error: errorMessage,
      })
    }
  }
}

/**
 * 带超时执行函数
 */
function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Task execution timeout'))
    }, timeout)

    fn()
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

// ==================== Default Handlers ====================

/**
 * 默认的导出任务处理器（示例）
 */
registerTaskHandler('export', async (task, context) => {
  // Simulate export process
  await context.updateProgress(10)
  await new Promise((r) => setTimeout(r, 500))

  await context.updateProgress(30)
  await new Promise((r) => setTimeout(r, 500))

  await context.updateProgress(60)
  await new Promise((r) => setTimeout(r, 500))

  await context.updateProgress(90)
  await new Promise((r) => setTimeout(r, 500))

  return {
    message: 'Export completed',
    format: task.payload.format || 'json',
    itemCount: (task.payload.items as any[])?.length || 0,
  }
})

/**
 * 默认的批量处理任务处理器（示例）
 */
registerTaskHandler('batch_process', async (task, context) => {
  const items = (task.payload.items as any[]) || []
  const results: any[] = []

  for (let i = 0; i < items.length; i++) {
    await context.updateProgress(Math.round(((i + 1) / items.length) * 100))
    // Simulate processing
    await new Promise((r) => setTimeout(r, 100))
    results.push({ item: items[i], processed: true })
  }

  return {
    message: 'Batch processing completed',
    totalItems: items.length,
    results,
  }
})

// ==================== AI Task Handlers ====================

/**
 * 注册图片生成任务处理器
 */
registerTaskHandler('image_generation', handleImageGeneration)

/**
 * 注册 TTS 生成任务处理器
 */
registerTaskHandler('tts_generation', handleTTSGeneration)

// ==================== Export ====================

export const taskWorker = {
  start: startTaskWorker,
  stop: stopTaskWorker,
  registerHandler: registerTaskHandler,
  getHandler: getTaskHandler,
}

export default taskWorker
