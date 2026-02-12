import type { Context, Next } from 'hono'
import { extractTokenFromHeader, verifyToken } from '../services/jwt'
import type { JwtPayload } from '../types'

// Extend Hono context with user data
export interface JWTPayloadContext {
  user?: JwtPayload
  token?: string
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(c: Context<JWTPayloadContext>, next: Next) {
  // Get token from Authorization header
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return c.json(
      {
        success: false,
        error: 'No authorization token provided',
      },
      401
    )
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json(
      {
        success: false,
        error: 'Invalid or expired token',
      },
      401
    )
  }

  // Attach user data to context
  c.set('user', payload)
  c.set('token', token)

  return next()
}

/**
 * Optional auth middleware - doesn't require token but attaches it if present
 */
export async function optionalAuthMiddleware(
  c: Context<JWTPayloadContext>,
  next: Next
) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      c.set('user', payload)
      c.set('token', token)
    }
  }

  return next()
}
