import type { Context, Next } from 'hono'
import type { JWTPayloadContext } from './auth'

interface ErrorOptions {
  logError?: boolean
  userMessage?: string
}

/**
 * Error handling middleware
 */
export async function errorHandlerMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    console.error('Unhandled error:', error)

    // Handle different error types
    if (error instanceof Error) {
      const status = (error as any).status || 500
      const message =
        (error as any).userMessage || error.message || 'Internal server error'

      return c.json(
        {
          success: false,
          error: message,
        },
        status
      )
    }

    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context) {
  return c.json({ success: false, error: 'Resource not found' }, 404)
}
