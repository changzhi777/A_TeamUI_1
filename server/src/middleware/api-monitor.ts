/**
 * api-monitor
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { Context, Next } from 'hono'
import { logger } from '../utils/logger'

/**
 * API Performance Monitoring Middleware
 *
 * Tracks request duration, response times, and error rates for all API endpoints
 */

interface ApiMetric {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  timestamp: number
}

interface EndpointStats {
  endpoint: string
  requests: number
  totalDuration: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  p95: number
  p99: number
  errorCount: number
  errorRate: number
}

// In-memory metrics store
const metrics = new Map<string, ApiMetric[]>()

// Slow request threshold (5 seconds)
const SLOW_REQUEST_THRESHOLD = 5000

/**
 * Add API metric
 */
function addMetric(metric: ApiMetric): void {
  const key = `${metric.endpoint}:${metric.method}`
  const existingMetrics = metrics.get(key) || []

  existingMetrics.push(metric)

  // Keep only last 100 metrics per endpoint
  if (existingMetrics.length > 100) {
    existingMetrics.splice(0, existingMetrics.length - 100)
  }

  metrics.set(key, existingMetrics)
}

/**
 * Calculate endpoint statistics
 */
function calculateStats(endpoint: string, method: string): EndpointStats {
  const key = `${endpoint}:${method}`
  const endpointMetrics = metrics.get(key) || []

  if (endpointMetrics.length === 0) {
    return {
      endpoint,
      requests: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      p95: 0,
      p99: 0,
      errorCount: 0,
      errorRate: 0,
    }
  }

  const durations = endpointMetrics.map(m => m.duration)
  const count = endpointMetrics.length
  const errorCount = endpointMetrics.filter(m => m.statusCode >= 500).length

  const totalDuration = durations.reduce((sum, d) => sum + d, 0)
  const avgDuration = totalDuration / count
  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)

  // Calculate percentiles
  const sortedDurations = [...durations].sort((a, b) => a - b)
  const p95Index = Math.floor(count * 0.95) - 1
  const p99Index = Math.floor(count * 0.99) - 1
  const p95 = sortedDurations[p95Index] || 0
  const p99 = sortedDurations[p99Index] || 0

  return {
    endpoint,
    requests: count,
    totalDuration,
    avgDuration,
    minDuration,
    maxDuration,
    p95,
    p99,
    errorCount,
    errorRate: errorCount / count,
  }
}

/**
 * Get all endpoint statistics
 */
export function getAllEndpointStats(): Record<string, EndpointStats> {
  const allStats: Record<string, EndpointStats> = {}

  for (const [key] of metrics.keys()) {
    const [endpoint, method] = key.split(':')
    if (!allStats[key]) {
      allStats[key] = calculateStats(endpoint, method)
    }
  }

  return allStats
}

/**
 * Clear old metrics
 */
export function clearOldMetrics(maxAge: number = 3600000): void {
  const cutoff = Date.now() - maxAge
  let cleared = 0

  for (const [key, endpointMetrics] of metrics.entries()) {
    const filtered = endpointMetrics.filter(m => m.timestamp > cutoff)

    if (filtered.length > 0) {
      metrics.set(key, filtered)
      cleared += filtered.length
    }
  }

  if (cleared > 0) {
    logger.info(`Cleared ${cleared} old metrics`)
  }
}

/**
 * API performance monitoring middleware
 */
export function apiMonitoringMiddleware(options?: {
  slowThreshold?: number
  enableLogging?: boolean
}) {
  const threshold = options?.slowThreshold || SLOW_REQUEST_THRESHOLD
  const enableLogging = options?.enableLogging !== false

  return async (c: Context, next: Next) => {
    const startTime = Date.now()
    const path = c.req.path
    const method = c.req.method

    // Process request
    await next()

    // Calculate duration
    const duration = Date.now() - startTime
    const statusCode = c.res.status as number

    // Add metric
    addMetric({
      endpoint: path,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
    })

    // Log slow requests
    if (enableLogging && duration > threshold) {
      logger.warn('Slow API request detected', {
        path,
        method,
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
 * Metrics endpoint for monitoring dashboard
 */
export function setupMetricsEndpoint(app: any) {
  // GET /api/metrics - Get performance metrics
  app.get('/api/metrics', (c) => {
    const stats = getAllEndpointStats()

    return c.json({
      success: true,
      data: {
        endpoints: stats,
        summary: {
          totalEndpoints: Object.keys(stats).length,
          totalRequests: Object.values(stats).reduce((sum, s) => sum + s.requests, 0),
        },
      },
    })
  })

  // DELETE /api/metrics - Clear metrics
  app.delete('/api/metrics', (c) => {
    clearOldMetrics()

    return c.json({
      success: true,
      message: 'Metrics cleared',
    })
  })

  // GET /api/metrics/health - Metrics service health
  app.get('/api/metrics/health', (c) => {
    return c.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    })
  })
}
