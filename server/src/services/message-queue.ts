import { redis } from '../config/redis'
import { redisKeys, cacheTTL } from '../config/redis'

/**
 * Offline message queue service
 *
 * Stores WebSocket messages for offline users and delivers them when they come online
 */

interface QueuedMessage {
  id: string
  type: string
  data: unknown
  timestamp: string
  projectId?: string
}

/**
 * Add message to user's offline queue
 */
export async function queueMessageForUser(
  userId: string,
  message: QueuedMessage
): Promise<void> {
  const key = redisKeys.offlineQueue(userId)
  const queueData = JSON.stringify({
    ...message,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  })

  // Add to Redis list (push to left)
  await redis.lpush(key, queueData)

  // Set expiry to prevent stale messages (7 days)
  await redis.expire(key, cacheTTL.OFFLINE_QUEUE || 604800)
}

/**
 * Get all queued messages for a user
 */
export async function getQueuedMessages(userId: string): Promise<QueuedMessage[]> {
  const key = redisKeys.offlineQueue(userId)

  // Get all messages from the list
  const messages = await redis.lrange(key, 0, -1)

  if (messages.length === 0) {
    return []
  }

  // Parse and return messages
  return messages.map((msg) => {
    try {
      return JSON.parse(msg) as QueuedMessage
    } catch {
      return null
    }
  }).filter((msg): msg is QueuedMessage => msg !== null)
}

/**
 * Clear and return all queued messages for a user
 */
export async function drainQueuedMessages(userId: string): Promise<QueuedMessage[]> {
  const key = redisKeys.offlineQueue(userId)

  // Get all messages
  const messages = await getQueuedMessages(userId)

  // Clear the queue
  await redis.del(key)

  return messages
}

/**
 * Clear all queued messages for a user
 */
export async function clearQueuedMessages(userId: string): Promise<void> {
  const key = redisKeys.offlineQueue(userId)
  await redis.del(key)
}

/**
 * Get queue size for a user
 */
export async function getQueueSize(userId: string): Promise<number> {
  const key = redisKeys.offlineQueue(userId)
  return await redis.llen(key)
}

/**
 * Add message to project-specific offline queue
 */
export async function queueMessageForProject(
  projectId: string,
  userId: string,
  message: Omit<QueuedMessage, 'id' | 'timestamp'>
): Promise<void> {
  const key = redisKeys.projectOfflineQueue(projectId, userId)

  const queueData = JSON.stringify({
    ...message,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  })

  // Add to Redis list
  await redis.lpush(key, queueData)

  // Set expiry (7 days)
  await redis.expire(key, cacheTTL.OFFLINE_QUEUE || 604800)
}

/**
 * Get project-specific queued messages
 */
export async function getProjectQueuedMessages(
  projectId: string,
  userId: string
): Promise<QueuedMessage[]> {
  const key = redisKeys.projectOfflineQueue(projectId, userId)
  const messages = await redis.lrange(key, 0, -1)

  if (messages.length === 0) {
    return []
  }

  return messages.map((msg) => {
    try {
      return JSON.parse(msg) as QueuedMessage
    } catch {
      return null
    }
  }).filter((msg): msg is QueuedMessage => msg !== null)
}

/**
 * Drain project-specific queued messages
 */
export async function drainProjectQueuedMessages(
  projectId: string,
  userId: string
): Promise<QueuedMessage[]> {
  const key = redisKeys.projectOfflineQueue(projectId, userId)

  // Get all messages
  const messages = await getProjectQueuedMessages(projectId, userId)

  // Clear the queue
  await redis.del(key)

  return messages
}

/**
 * Clean up old queued messages across all users
 */
export async function cleanupOldMessages(): Promise<void> {
  // Redis automatically handles expiry, but we can implement
  // additional cleanup logic here if needed
  // For now, this is a placeholder for future enhancements
}
