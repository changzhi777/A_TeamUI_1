/**
 * performance
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { Context, Next } from 'hono'
import { logger } from '../utils/logger'

/**
 * Performance monitoring middleware
 * Tracks API request duration and response times
 */

interface PerformanceMetrics {
  path: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
}

// In-memory metrics store (consider Redis for production)
const metrics = new Map<string, PerformanceMetrics[]>()

// Metrics window size (keep last 1000 requests per path)
const METRICS_WINDOW_SIZE = 1000

/**
 * Add performance metric
 */
function addMetric(path: string, method: string, statusCode: number, duration: number): void {
  const key = `${path}:${method}`
  const existingMetrics = metrics.get(key) || []

  existingMetrics.push({
    path,
    method,
    statusCode,
    duration,
    timestamp: Date.now(),
  })

  // Keep only recent metrics
  if (existingMetrics.length > METRICS_WINDOW_SIZE) {
    existingMetrics.splice(0, existingMetrics.length - METRICS_WINDOW_SIZE)
  }

  metrics.set(key, existingMetrics)
}

/**
 * Calculate performance statistics
 */
function calculateStats(metrics: PerformanceMetrics[]): {
  avg: number
  p50: number
  p95: number
  p99: number
  min: number
  max: number
  count: number
} {
  if (metrics.length === 0) {
    return { avg: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0, count: 0 }
  }

  const durations = metrics.map(m => m.duration).sort((a, b) => a - b)
  const count = durations.length

  const min = durations[0]
  const max = durations[count - 1]
  const sum = durations.reduce((a, b) => a + b, 0)
  const avg = sum / count

  const p50 = durations[Math.floor(count * 0.5)] || 0
  const p95 = durations[Math.floor(count * 0.95)] || 0
  const p99 = durations[Math.floor(count * 0.99)] || 0

  return { avg, p50, p95, p99, min, max, count }
}

/**
 * Performance monitoring middleware factory
 */
export function performanceMiddleware(options?: {
  slowThreshold?: number // Request duration (ms) considered slow
  logSlowRequests?: boolean
} = []) {
  const threshold = options?.slowThreshold || 3000 // Default 3 seconds
  const logSlow = options?.logSlowRequests !== false

  return async (c: Context, next: Next) => {
    const startTime = Date.now()

    // Process request
    await next()

    // Calculate duration
    const duration = Date.now() - startTime
    const statusCode = c.res.status as number

    // Add metric
    addMetric(c.req.path, c.req.method, statusCode, duration)

    // Log slow requests
    if (logSlow && duration > threshold) {
      logger.warn('Slow request detected', {
        path: c.req.path,
        method: c.req.method,
        status: statusCode,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`,
      })
    }

    // Add performance headers
    c.res.headers.set('X-Response-Time', duration.toString())
    c.res.headers.set('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
  }
}

/**
 * Get performance metrics for a specific endpoint
 */
export async function getMetrics(path: string, method: string): Promise<{
  stats: ReturnType<typeof calculateStats>
  requests: number
}> {
  const key = `${path}:${method}`
  const endpointMetrics = metrics.get(key) || []

  if (endpointMetrics.length === 0) {
    return {
      stats: calculateStats([]),
      requests: 0,
    }
  }

  return {
    stats: calculateStats(endpointMetrics),
    requests: endpointMetrics.length,
  }
}

/**
 * Get all metrics
 */
export function getAllMetrics(): Record<string, PerformanceMetrics[]> {
  const allMetrics: Record<string, PerformanceMetrics[]> = {}

  for (const [key, value] of metrics.entries()) {
    allMetrics[key] = value
  }

  return allMetrics
}

/**
 * Clear old metrics
 */
export function clearOldMetrics(age: number = 3600000): void {
  const cutoff = Date.now() - age

  for (const [key, value] of metrics.entries()) {
    const filtered = value.filter(m => m.timestamp > cutoff)
    metrics.set(key, filtered)
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  summary: Record<string, ReturnType<typeof calculateStats> & { endpoint: string; totalRequests: number; slowRequests: number }>
  totalRequests: number
  totalSlowRequests: number
  slowThreshold: number
  timestamp: string
} {
  const allMetrics = getAllMetrics()
  const summary: Record<string, ReturnType<typeof calculateStats>> = {}

  let totalRequests = 0
  let totalSlowRequests = 0
  const slowThreshold = 3000 // 3 seconds

  for (const [path, metrics] of Object.entries(allMetrics)) {
    const stats = calculateStats(metrics)
    totalRequests += metrics.length
    totalSlowRequests += metrics.filter(m => m.duration > slowThreshold).length

    summary[path] = {
      ...stats,
      endpoint: path,
      totalRequests: metrics.length,
      slowRequests: metrics.filter(m => m.duration > slowThreshold).length,
    }
  }

  return {
    summary,
    totalRequests,
    totalSlowRequests,
    slowThreshold,
    timestamp: new Date().toISOString(),
  }
}
