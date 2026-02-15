/**
 * request-deduplication
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Request deduplication utility
 *
 * Prevents duplicate in-flight requests for the same resource
 */

interface PendingRequest {
  promise: Promise<unknown>
  timestamp: number
}

class RequestDeduplicator {
  private pending = new Map<string, PendingRequest>()
  private readonly ttl: number // Time to live for pending requests in ms

  constructor(ttl: number = 5000) {
    this.ttl = ttl
    // Clean up expired pending requests periodically
    setInterval(() => this.cleanup(), this.ttl)
  }

  /**
   * Execute a request with deduplication
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check if there's a pending request for this key
    const existing = this.pending.get(key)
    if (existing) {
      console.log(`[RequestDedup] Reusing pending request for: ${key}`)
      return existing.promise as Promise<T>
    }

    // Create new request
    const promise = fn().finally(() => {
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
   * Clean up expired pending requests
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.pending.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.pending.delete(key)
      }
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pending.clear()
  }

  /**
   * Get count of pending requests
   */
  getPendingCount(): number {
    return this.pending.size
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator()

/**
 * Create a deduplicated fetch function
 */
export function createDeduplicatedFetch<T>(
  getKey: (...args: unknown[]) => string,
  fetchFn: (...args: unknown[]) => Promise<T>
): (...args: unknown[]) => Promise<T> {
  return (...args: unknown[]) => {
    const key = getKey(...args)
    return requestDeduplicator.execute(key, () => fetchFn(...args))
  }
}
