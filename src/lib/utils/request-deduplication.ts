/**
 * request-deduplication
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Frontend request deduplication utility
 *
 * Prevents duplicate in-flight requests and implements local data caching
 */

interface PendingRequest {
  promise: Promise<unknown>
  timestamp: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class RequestDeduplicator {
  private pending = new Map<string, PendingRequest>()
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly pendingTTL = 10000 // 10 seconds for pending requests
  private readonly cacheTTL = 30000 // 30 seconds for cache

  /**
   * Execute a request with deduplication and optional caching
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    options?: {
      cache?: boolean // Whether to cache the result
      cacheTTL?: number // Custom cache TTL in ms
    }
  ): Promise<T> {
    const { cache: useCache = true, cacheTTL = this.cacheTTL } = options ?? {}

    // Check cache first
    if (useCache) {
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        console.log(`[RequestDedup] Using cached data for: ${key}`)
        return cached.data as T
      }
    }

    // Check if there's a pending request for this key
    const existing = this.pending.get(key)
    if (existing && Date.now() - existing.timestamp < this.pendingTTL) {
      console.log(`[RequestDedup] Reusing pending request for: ${key}`)
      return existing.promise as Promise<T>
    }

    // Create new request
    const promise = fn()
      .then(async (data) => {
        // Cache the result
        if (useCache) {
          this.cache.set(key, {
            data,
            timestamp: Date.now(),
          })
        }
        return data
      })
      .finally(() => {
        // Remove from pending map after completion
        this.pending.delete(key)
      })

    // Store in pending map
    this.pending.set(key, {
      promise,
      timestamp: Date.now(),
    })

    return promise
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all pending requests and cache
   */
  clear(): void {
    this.pending.clear()
    this.cache.clear()
  }

  /**
   * Clear expired cache entries
   */
  cleanup(): void {
    const now = Date.now()

    // Clean up pending requests
    for (const [key, value] of this.pending.entries()) {
      if (now - value.timestamp > this.pendingTTL) {
        this.pending.delete(key)
      }
    }

    // Clean up cache
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      pending: this.pending.size,
      cached: this.cache.size,
    }
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator()

// Auto cleanup every minute
setInterval(() => {
  requestDeduplicator.cleanup()
}, 60000)

/**
 * Create a deduplicated fetch function
 */
export function createDeduplicatedFetch<T>(
  getKey: (...args: unknown[]) => string,
  fetchFn: (...args: unknown[]) => Promise<T>,
  options?: {
    cache?: boolean
    cacheTTL?: number
  }
): (...args: unknown[]) => Promise<T> {
  return (...args: unknown[]) => {
    const key = getKey(...args)
    return requestDeduplicator.execute(key, () => fetchFn(...args), options)
  }
}
