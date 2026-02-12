import type { Context, Next } from 'hono'
import { logger } from '../utils/logger'

interface TokenRefreshResult {
  newAccessToken: string
  newRefreshToken: string
  expiresIn: number
}

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

/**
 * Extract expiry time from JWT token
 */
function getTokenExpiry(token: string): number | null {
  try {
    // JWT format: header.payload.exp
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const isBase64 = payload.endsWith('=') || payload.startsWith('-')

    if (isBase64) {
      // Base64 encoded payload
      const decoded = atob(payload)
      const json = JSON.parse(decoded)
      return json.exp * 1000
    } else {
      // URL encoded payload (JSON string)
      const json = JSON.parse(payload)
      return json.exp * 1000
    }
  } catch {
    return null
  }
}

/**
 * Check if token needs refresh
 */
function shouldRefreshToken(token: string): boolean {
  const expiry = getTokenExpiry(token)
  if (!expiry) return false

  const now = Date.now()
  const timeUntilExpiry = expiry - now

  // Refresh if token expires in less than 5 minutes
  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResult> {
  try {
    // Call backend refresh endpoint
    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001/api'}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Token refresh failed')
    }

    const data = await response.json()

    return {
      newAccessToken: data.accessToken,
      newRefreshToken: data.refreshToken,
      expiresIn: data.expiresAt,
    }
  } catch (error) {
    logger.error('Token refresh error:', error)
    throw error
  }
}

/**
 * Auto-refresh middleware
 */
export function autoRefreshMiddleware(options?: {
  refreshEndpoint?: string
  skipPaths?: string[]
} = []) {
  const refreshEndpoint = options?.refreshEndpoint || '/auth/refresh'
  const skipPaths = options?.skipPaths || ['/health', '/ws']

  return async (c: Context, next: Next) => {
    // Skip refresh for certain paths
    if (skipPaths.some(path => c.req.path.startsWith(path))) {
      return next()
    }

    // Get current access token
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return next()
    }

    const token = authHeader.replace('Bearer ', '')
    const refreshToken = c.req.header('X-Refresh-Token') || await c.get('refreshToken')

    // Check if token needs refresh
    if (shouldRefreshToken(token)) {
      try {
        logger.info('Refreshing access token', {
          path: c.req.path,
          method: c.req.method,
        })

        // Refresh token
        const result = await refreshAccessToken(refreshToken)

        // Update tokens in storage
        await c.set('accessToken', result.newAccessToken)
        await c.set('refreshToken', result.newRefreshToken)

        // Update request headers for downstream handlers
        c.req.header('Authorization', `Bearer ${result.newAccessToken}`)

        logger.info('Token refreshed successfully', {
          expiresIn: result.expiresIn,
        })
      } catch (error) {
        logger.error('Auto-refresh failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: c.req.path,
        })

        // Continue with old token on failure
        // Downstream handlers will handle the error
      }
    }

    return next()
  }
}

/**
 * Helper to get token info
 */
export async function getTokenInfo(c: Context): Promise<{
  token: string
  expiresAt: number | null
  needsRefresh: boolean
}> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return { token: '', expiresAt: null, needsRefresh: false }
  }

  const token = authHeader.replace('Bearer ', '')
  const expiry = getTokenExpiry(token)

  return {
    token,
    expiresAt: expiry,
    needsRefresh: shouldRefreshToken(token),
  }
}

/**
 * Attach refresh token to response
 */
export function attachRefreshToken(refreshToken: string) {
  return async (c: Context, next: Next) => {
    await next()

    const newRefreshToken = await c.get('refreshToken')

    if (newRefreshToken) {
      c.res.headers.set('X-Refresh-Token', newRefreshToken)
    }
  }
}
