/**
 * tasks
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Management API
 * 任务管理 API 路由
 */

import { Hono } from 'hono'
import { taskQueue, type TaskType, type TaskStatus, type TaskPriority } from '../../services/task-queue'
import { notifyTaskCreated } from '../../websocket/task-notifications'

const tasksRouter = new Hono()

// ==================== Types ====================

interface CreateTaskBody {
  type: TaskType
  priority?: TaskPriority
  payload: Record<string, unknown>
  maxRetries?: number
  metadata?: Record<string, unknown>
}

interface ListTasksQuery {
  status?: TaskStatus
  type?: TaskType
  createdBy?: string
  limit?: string
  offset?: string
}

// ==================== Routes ====================

/**
 * POST /api/tasks - 创建任务
 */
tasksRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateTaskBody>()

    // Validate required fields
    if (!body.type) {
      return c.json({ success: false, error: 'Task type is required' }, 400)
    }

    if (!body.payload) {
      return c.json({ success: false, error: 'Task payload is required' }, 400)
    }

    // Get user from context (set by auth middleware)
    const user = c.get('user')
    const createdBy = user?.userId || 'anonymous'

    // Create task
    const task = await taskQueue.createTask({
      type: body.type,
      priority: body.priority,
      payload: body.payload,
      createdBy,
      maxRetries: body.maxRetries,
      metadata: body.metadata,
    })

    // Notify via WebSocket
    await notifyTaskCreated(task)

    return c.json({
      success: true,
      data: task,
    }, 201)
  } catch (error) {
    console.error('Failed to create task:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    }, 500)
  }
})

/**
 * GET /api/tasks - 获取任务列表
 */
tasksRouter.get('/', async (c) => {
  try {
    const query = c.req.query() as ListTasksQuery

    const result = await taskQueue.getTasks({
      status: query.status,
      type: query.type,
      createdBy: query.createdBy,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    })

    return c.json({
      success: true,
      data: result.tasks,
      meta: {
        total: result.total,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      },
    })
  } catch (error) {
    console.error('Failed to list tasks:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tasks',
    }, 500)
  }
})

/**
 * GET /api/tasks/stats - 获取队列统计
 */
tasksRouter.get('/stats', async (c) => {
  try {
    const [queueLength, runningCount] = await Promise.all([
      taskQueue.getQueueLength(),
      taskQueue.getRunningCount(),
    ])

    const highQueue = await taskQueue.getQueueLength('high')
    const normalQueue = await taskQueue.getQueueLength('normal')
    const lowQueue = await taskQueue.getQueueLength('low')

    return c.json({
      success: true,
      data: {
        queueLength,
        runningCount,
        queues: {
          high: highQueue,
          normal: normalQueue,
          low: lowQueue,
        },
      },
    })
  } catch (error) {
    console.error('Failed to get stats:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats',
    }, 500)
  }
})

/**
 * GET /api/tasks/:id - 获取任务详情
 */
tasksRouter.get('/:id', async (c) => {
  try {
    const taskId = c.req.param('id')
    const task = await taskQueue.getTask(taskId)

    if (!task) {
      return c.json({
        success: false,
        error: 'Task not found',
      }, 404)
    }

    // Also get events
    const events = await taskQueue.getTaskEvents(taskId)

    return c.json({
      success: true,
      data: {
        ...task,
        events,
      },
    })
  } catch (error) {
    console.error('Failed to get task:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get task',
    }, 500)
  }
})

/**
 * DELETE /api/tasks/:id - 取消任务
 */
tasksRouter.delete('/:id', async (c) => {
  try {
    const taskId = c.req.param('id')
    const task = await taskQueue.cancelTask(taskId)

    if (!task) {
      return c.json({
        success: false,
        error: 'Task not found or cannot be cancelled',
      }, 404)
    }

    return c.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error('Failed to cancel task:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel task',
    }, 500)
  }
})

/**
 * POST /api/tasks/:id/retry - 重试任务
 */
tasksRouter.post('/:id/retry', async (c) => {
  try {
    const taskId = c.req.param('id')
    const task = await taskQueue.retryTask(taskId)

    if (!task) {
      return c.json({
        success: false,
        error: 'Task not found or cannot be retried',
      }, 404)
    }

    return c.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error('Failed to retry task:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry task',
    }, 500)
  }
})

export { tasksRouter }
export default tasksRouter
