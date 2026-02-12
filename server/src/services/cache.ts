import { redis } from '../config/redis'

/**
 * Cache TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

/**
 * Cache key prefixes
 */
export const CacheKey = {
  USER: (id: string) => `user:${id}`,
  USER_BY_EMAIL: (email: string) => `user:email:${email}`,
  PROJECT: (id: string) => `project:${id}`,
  PROJECT_LIST: (userId: string) => `projects:${userId}`,
  PROJECT_MEMBERS: (projectId: string) => `project_members:${projectId}`,
  SHOT_LIST: (projectId: string) => `shots:${projectId}`,
  SESSION: (userId: string) => `session:${userId}`,
  LOCK: (resource: string) => `lock:${resource}`,
} as const

/**
 * Cache service for Redis-based caching
 */
export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (!value) return null

      return JSON.parse(value) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)

      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Set value only if key doesn't exist
   */
  async setNX(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      const result = await redis.set(key, serialized, 'NX', ttl ? ['EX', ttl.toString()] : [])

      return result === 'OK'
    } catch (error) {
      console.error('Cache setNX error:', error)
      return false
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key)
    } catch (error) {
      console.error('Cache incr error:', error)
      return 0
    }
  }

  /**
   * Expire key after specified seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl)
    } catch (error) {
      console.error('Cache expire error:', error)
    }
  }

  /**
   * Get TTL of key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error('Cache ttl error:', error)
      return -1
    }
  }

  /**
   * Get or set pattern - get from cache or compute and store
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttl)
    return value
  }

  /**
   * Cache multiple values at once
   */
  async mset(keyValues: Record<string, unknown>): Promise<void> {
    try {
      const pipeline = redis.pipeline()
      for (const [key, value] of Object.entries(keyValues)) {
        pipeline.set(key, JSON.stringify(value))
      }
      await pipeline.exec()
    } catch (error) {
      console.error('Cache mset error:', error)
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys)
      return values.map((v) => (v ? JSON.parse(v) : null))
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }
}

// Export singleton instance
export const cache = new CacheService()

/**
 * Invalidate all caches for a specific project
 */
export async function invalidateProjectCache(projectId: string): Promise<void> {
  await cache.del(CacheKey.PROJECT(projectId))
  await cache.del(CacheKey.PROJECT_MEMBERS(projectId))
  await cache.del(CacheKey.SHOT_LIST(projectId))
  await cache.delPattern(`shots:${projectId}:*`)
}

/**
 * Invalidate all caches for a specific user
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await cache.del(CacheKey.USER(userId))
  await cache.delPattern(`projects:${userId}*`)
  await cache.delPattern(`project_members:*`)
}
