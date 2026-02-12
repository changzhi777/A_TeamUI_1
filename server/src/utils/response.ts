import type { ApiResponse } from '@/types'
import { type Context } from 'hono'

export function success<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

export function error(message: string, code?: string): ApiResponse {
  return {
    success: false,
    error: message,
  }
}

export function paginated<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<T[]> {
  const hasMore = page * pageSize < total
  return {
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      hasMore,
    },
  }
}

export function sendSuccess<T>(c: Context, data: T, meta?: ApiResponse<T>['meta']) {
  return c.json(success(data, meta))
}

export function sendError(c: Context, message: string, status = 400) {
  return c.json(error(message), status)
}

export function sendNotFound(c: Context, resource = 'Resource') {
  return c.json(error(`${resource} not found`), 404)
}

export function sendUnauthorized(c: Context, message = 'Unauthorized') {
  return c.json(error(message), 401)
}

export function sendForbidden(c: Context, message = 'Forbidden') {
  return c.json(error(message), 403)
}

export function sendValidationError(c: Context, errors: Record<string, string>) {
  return c.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors,
    },
    400
  )
}

export function sendInternalError(c: Context, message = 'Internal server error') {
  return c.json(error(message), 500)
}

export function sendPaginated<T>(
  c: Context,
  data: T[],
  page: number,
  pageSize: number,
  total: number
) {
  return c.json(paginated(data, page, pageSize, total))
}
