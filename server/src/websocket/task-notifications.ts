/**
 * task-notifications
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Task Notifications
 * 任务状态变更的 WebSocket 通知
 */

import { broadcastToAll } from './server'
import type { Task } from '../services/task-queue'

// ==================== Types ====================

export type TaskEventType =
  | 'task:created'
  | 'task:started'
  | 'task:progress'
  | 'task:completed'
  | 'task:failed'
  | 'task:cancelled'
  | 'task:retrying'

export interface TaskNotificationEvent {
  type: TaskEventType
  taskId: string
  timestamp: string
  progress?: number
  result?: Record<string, unknown>
  error?: string
  retryCount?: number
  maxRetries?: number
  task?: Task
}

// ==================== User Subscriptions ====================

// Store WebSocket connections by userId for task notifications
const userConnections = new Map<string, Set<WebSocket>>()

/**
 * 注册用户连接（用于任务通知）
 */
export function registerUserConnection(userId: string, ws: WebSocket): void {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set())
  }
  userConnections.get(userId)!.add(ws)

  ws.addEventListener('close', () => {
    unregisterUserConnection(userId, ws)
  })
}

/**
 * 注销用户连接
 */
export function unregisterUserConnection(userId: string, ws: WebSocket): void {
  const connections = userConnections.get(userId)
  if (connections) {
    connections.delete(ws)
    if (connections.size === 0) {
      userConnections.delete(userId)
    }
  }
}

// ==================== Broadcasting ====================

/**
 * 向特定用户广播任务通知
 */
export async function broadcastTaskNotification(
  userId: string,
  event: Omit<TaskNotificationEvent, 'timestamp'>
): Promise<void> {
  const fullEvent: TaskNotificationEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  const message = JSON.stringify({
    type: 'task_notification',
    data: fullEvent,
    userId,
    timestamp: fullEvent.timestamp,
  })

  // Send to user's connections
  const connections = userConnections.get(userId)
  if (connections) {
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  // Also broadcast to all (for simplicity in development)
  // In production, you might want to only send to specific user
  broadcastToAll({
    type: 'task_notification',
    data: fullEvent,
    userId: 'system',
    timestamp: fullEvent.timestamp,
  })
}

/**
 * 广播任务创建通知
 */
export async function notifyTaskCreated(task: Task): Promise<void> {
  await broadcastTaskNotification(task.createdBy, {
    type: 'task:created',
    taskId: task.id,
    task,
  })
}

/**
 * 广播任务完成通知
 */
export async function notifyTaskCompleted(
  userId: string,
  taskId: string,
  result: Record<string, unknown>
): Promise<void> {
  await broadcastTaskNotification(userId, {
    type: 'task:completed',
    taskId,
    result,
  })
}

/**
 * 广播任务失败通知
 */
export async function notifyTaskFailed(
  userId: string,
  taskId: string,
  error: string
): Promise<void> {
  await broadcastTaskNotification(userId, {
    type: 'task:failed',
    taskId,
    error,
  })
}

// ==================== Export ====================

export const taskNotifications = {
  registerUserConnection,
  unregisterUserConnection,
  broadcast: broadcastTaskNotification,
  notifyCreated: notifyTaskCreated,
  notifyCompleted: notifyTaskCompleted,
  notifyFailed: notifyTaskFailed,
}

export default taskNotifications
