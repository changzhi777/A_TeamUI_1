/**
 * redis
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import Redis from 'ioredis'
import { env } from './index'

// Create Redis client
export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password || undefined,
  db: env.redis.db,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
})

// Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (error) => {
  console.error('❌ Redis error:', error)
})

redis.on('close', () => {
  console.log('Redis connection closed')
})

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...')
})

// Test connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    console.log('✅ Redis connection established')
    return true
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    return false
  }
}

// Close connection
export async function closeRedisConnection(): Promise<void> {
  await redis.quit()
  console.log('Redis connection closed')
}

// Redis key helpers
export const redisKeys = {
  // Session: session:{user_id}:{session_id}
  session: (userId: string, sessionId: string) => `session:${userId}:${sessionId}`,

  // Sessions set: sessions:{user_id}
  sessions: (userId: string) => `sessions:${userId}`,

  // User cache: user:{user_id}
  user: (userId: string) => `user:${userId}`,

  // Project cache: project:{project_id}
  project: (projectId: string) => `project:${projectId}`,

  // Project shots cache: project_shots:{project_id}
  projectShots: (projectId: string) => `project_shots:${projectId}`,

  // Events queue: events:{project_id}
  events: (projectId: string) => `events:${projectId}`,

  // Online users: online_users:{project_id}
  onlineUsers: (projectId: string) => `online_users:${projectId}`,

  // Project lock: lock:project:{project_id}
  projectLock: (projectId: string) => `lock:project:${projectId}`,

  // Shot lock: lock:shot:{shot_id}
  shotLock: (shotId: string) => `lock:shot:${shotId}`,

  // Password reset token: reset_token:{token}
  resetToken: (token: string) => `reset_token:${token}`,

  // OTP storage: otp:{user_id}
  otp: (userId: string) => `otp:${userId}`,

  // Offline message queue: offline_queue:{user_id}
  offlineQueue: (userId: string) => `offline_queue:${userId}`,

  // Project-specific offline queue: offline_queue:{project_id}:{user_id}
  projectOfflineQueue: (projectId: string, userId: string) => `offline_queue:${projectId}:${userId}`,
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  SESSION: 60 * 60 * 24 * 30, // 30 days
  USER: 60 * 60, // 1 hour
  PROJECT: 60 * 30, // 30 minutes
  PROJECT_SHOTS: 60 * 15, // 15 minutes
  RESET_TOKEN: 60 * 30, // 30 minutes
  OTP: 60 * 5, // 5 minutes
  LOCK: 60 * 30, // 30 minutes
  EVENTS: 60 * 60, // 1 hour
  OFFLINE_QUEUE: 60 * 60 * 24 * 7, // 7 days
}

// Session helpers
export async function createSession(
  userId: string,
  sessionId: string,
  data: {
    token: string
    expiresAt: number
    device: string
    ip: string
  }
): Promise<void> {
  const key = redisKeys.session(userId, sessionId)
  const ttl = Math.floor((data.expiresAt - Date.now()) / 1000)

  await redis.hset(key, {
    token: data.token,
    expires_at: data.expiresAt.toString(),
    device: data.device,
    ip: data.ip,
  })
  await redis.expire(key, ttl > 0 ? ttl : 1)

  // Add to sessions set
  await redis.sadd(redisKeys.sessions(userId), sessionId)
}

export async function getSession(
  userId: string,
  sessionId: string
): Promise<{ token: string; expiresAt: number; device: string; ip: string } | null> {
  const key = redisKeys.session(userId, sessionId)
  const data = await redis.hgetall(key)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return {
    token: data.token as string,
    expiresAt: parseInt(data.expires_at as string),
    device: data.device as string,
    ip: data.ip as string,
  }
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  const key = redisKeys.session(userId, sessionId)
  await redis.del(key)
  await redis.srem(redisKeys.sessions(userId), sessionId)
}

export async function getUserSessions(userId: string): Promise<string[]> {
  return redis.smembers(redisKeys.sessions(userId))
}

// ==================== Task Queue Keys ====================

// Task queue keys (separate object for task queue functionality)
export const taskQueueKeys = {
  // Task queues by priority: task:queue:{priority} (List)
  queue: (priority: 'high' | 'normal' | 'low') => `task:queue:${priority}`,

  // Task detail: task:{taskId} (Hash)
  task: (taskId: string) => `task:${taskId}`,

  // Running tasks: task:running (Set)
  running: () => 'task:running',

  // User tasks: tasks:user:{userId} (List)
  userTasks: (userId: string) => `tasks:user:${userId}`,

  // Task events: task:events:{taskId} (List)
  taskEvents: (taskId: string) => `task:events:${taskId}`,
}

// Task queue TTL (in seconds)
export const TASK_TTL = 60 * 60 * 24 * 7 // 7 days

// Lock helpers
export async function acquireLock(
  resourceId: string,
  userId: string,
  ttl = cacheTTL.LOCK
): Promise<boolean> {
  const key = `lock:${resourceId}`
  const result = await redis.set(key, userId, 'EX', ttl, 'NX')
  return result === 'OK'
}

export async function releaseLock(resourceId: string, userId: string): Promise<boolean> {
  const key = `lock:${resourceId}`
  const currentOwner = await redis.get(key)

  if (currentOwner !== userId) {
    return false
  }

  await redis.del(key)
  return true
}

export async function getLockOwner(resourceId: string): Promise<string | null> {
  const key = `lock:${resourceId}`
  return redis.get(key)
}
