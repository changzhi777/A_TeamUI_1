import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendInternalError,
} from '../../utils/response'
import { hashPassword, comparePassword, validatePassword } from '../../utils/password'
import { generateUserId, generateSessionId } from '../../utils/id'
import { db } from '../../config/database'
import { users, loginHistory } from '../../models'
import { redisKeys, cacheTTL, createSession, deleteSession, redis } from '../../config/redis'
import type { JWTPayloadContext } from '../../middleware'
import { eq } from 'drizzle-orm'

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
})

const sendOtpSchema = z.object({})

const verifyOtpSchema = z.object({
  code: z.string().length(6),
})

const enableOtpSchema = z.object({
  code: z.string().length(6),
})

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
})

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
})

// Create auth router
export const authRouter = new Hono<JWTPayloadContext>()

// POST /api/auth/register - User registration
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const data = c.req.valid('json')

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get()

    if (existingUser) {
      return sendError(c, 'Email already registered', 409)
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      return sendValidationError(c, {
        password: passwordValidation.errors.join(', '),
      })
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create user
    const userId = generateUserId()
    await db.insert(users).values({
      id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'member',
      isEmailVerified: false,
    })

    // Create JWT tokens
    const accessToken = await createAccessToken({
      userId,
      email: data.email,
      role: 'member',
    })

    const refreshToken = await createRefreshToken({
      userId,
      email: data.email,
      role: 'member',
    })

    const tokenExpiry = getTokenExpirationTime('30d')

    return sendSuccess(
      c,
      {
        accessToken,
        refreshToken,
        expiresAt: tokenExpiry,
        user: {
          id: userId,
          name: data.name,
          email: data.email,
          role: 'member',
        },
      },
      { meta: { message: 'Registration successful' } }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return sendInternalError(c)
  }
})

// POST /api/auth/login - User login
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const data = c.req.valid('json')
    const user = c.get('user')

    // Find user by email
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get()

    if (!foundUser) {
      return sendError(c, 'Invalid email or password', 401)
    }

    // Verify password
    const isValid = await comparePassword(data.password, foundUser.passwordHash)
    if (!isValid) {
      return sendError(c, 'Invalid email or password', 401)
    }

    // Generate tokens
    const accessToken = await createAccessToken({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role as any,
    })

    const refreshToken = await createRefreshToken({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role as any,
    })

    // Calculate expiry based on remember me
    const expiryTime = data.rememberMe ? '30d' : '1d'
    const tokenExpiry = getTokenExpirationTime(expiryTime)

    // Create session
    const sessionId = generateSessionId()
    await createSession(foundUser.id, sessionId, {
      token: refreshToken,
      expiresAt: tokenExpiry,
      device: c.req.header('user-agent') || 'Unknown',
      ip: getClientIp(c),
    })

    // Log login history
    await db.insert(loginHistory).values({
      id: nanoid(),
      userId: foundUser.id,
      device: c.req.header('user-agent') || 'Unknown',
      browser: getBrowserName(c.req.header('user-agent')),
      location: 'Local', // Could use IP geolocation
      ip: getClientIp(c),
      isAnomalous: false,
    })

    return sendSuccess(c, {
      accessToken,
      refreshToken,
      expiresAt: tokenExpiry,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatar: foundUser.avatarUrl,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return sendInternalError(c)
  }
})

// POST /api/auth/refresh - Refresh access token
authRouter.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  try {
    const { refreshToken } = c.req.valid('json')

    // Verify refresh token
    const payload = await verifyToken(refreshToken)
    if (!payload) {
      return sendError(c, 'Invalid refresh token', 401)
    }

    // Generate new tokens
    const newAccessToken = await createAccessToken(payload)
    const newRefreshToken = await createRefreshToken(payload)

    const tokenExpiry = getTokenExpirationTime('30d')

    return sendSuccess(c, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: tokenExpiry,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return sendInternalError(c)
  }
})

// POST /api/auth/logout - Logout user
authRouter.post('/logout', async (c) => {
  try {
    const user = c.get('user')

    if (!user) {
      return sendError(c, 'No user logged in', 401)
    }

    // Delete current session from Redis
    // In a real implementation, we'd track session ID
    // For now, we'll clear all user sessions
    const sessions = await redis.smembers(redisKeys.sessions(user.userId))
    for (const sessionId of sessions) {
      await deleteSession(user.userId, sessionId)
    }

    return sendSuccess(c, { message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return sendInternalError(c)
  }
})

// POST /api/auth/forgot-password - Request password reset
authRouter.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  try {
    const { email } = c.req.valid('json')

    // Check if user exists
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (!foundUser) {
      // Don't reveal if email exists
      return sendSuccess(c, { message: 'If email exists, a reset link has been sent' })
    }

    // Generate reset token
    const resetToken = nanoid()
    const tokenKey = redisKeys.resetToken(resetToken)

    // Store token in Redis with 30 min expiry
    await redis.set(tokenKey, email)
    await redis.expire(tokenKey, cacheTTL.RESET_TOKEN)

    // In production, send email with reset link
    // For now, log to console
    console.log(`Password reset link: /reset-password?token=${resetToken}`)

    return sendSuccess(c, {
      message: 'If email exists, a reset link has been sent',
      // For development only
      _devResetToken: resetToken,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return sendInternalError(c)
  }
})

// POST /api/auth/reset-password - Reset password with token
authRouter.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { token, newPassword } = c.req.valid('json')

    // Verify token
    const tokenKey = redisKeys.resetToken(token)
    const email = await redis.get(tokenKey)

    if (!email) {
      return sendError(c, 'Invalid or expired reset token', 400)
    }

    // Find user
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email as string))
      .get()

    if (!foundUser) {
      return sendNotFound(c, 'User')
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, foundUser.id))

    // Delete reset token
    await redis.del(tokenKey)

    return sendSuccess(c, { message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    return sendInternalError(c)
  }
})

// GET /api/auth/sessions - Get active sessions
authRouter.get('/sessions', async (c) => {
  try {
    const user = c.get('user')

    if (!user) {
      return sendUnauthorized(c)
    }

    const sessionIds = await redis.smembers(redisKeys.sessions(user.userId))
    const sessions = []

    for (const sessionId of sessionIds) {
      const sessionData = await getSessionFromRedis(user.userId, sessionId)
      if (sessionData) {
        sessions.push({
          id: sessionId,
          device: sessionData.device,
          browser: sessionData.browser,
          location: sessionData.location,
          ip: sessionData.ip,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // Approximate
          lastActive: new Date().toISOString(),
          isCurrent: false, // We can't determine which is current without tracking
        })
      }
    }

    return sendSuccess(c, sessions)
  } catch (error) {
    console.error('Get sessions error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/auth/sessions/:id - Revoke session
authRouter.delete('/sessions/:id', async (c) => {
  try {
    const user = c.get('user')
    const sessionId = c.req.param('id')

    if (!user) {
      return sendUnauthorized(c)
    }

    await deleteSession(user.userId, sessionId)

    return sendSuccess(c, { message: 'Session revoked' })
  } catch (error) {
    console.error('Revoke session error:', error)
    return sendInternalError(c)
  }
})

// Helper functions
async function createAccessToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)

  return token
}

async function createRefreshToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  return token
}

async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

function getTokenExpirationTime(expiry: string): number {
  const now = Math.floor(Date.now() / 1000)
  let expirySeconds: number

  const match = expiry.match(/^(\d+)([hdm])$/)
  if (match) {
    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'h':
        expirySeconds = value * 60 * 60
        break
      case 'd':
        expirySeconds = value * 24 * 60 * 60
        break
      case 'm':
        expirySeconds = value * 60
        break
      default:
        expirySeconds = value
    }
  } else {
    expirySeconds = 60 * 60 // Default 1 hour
  }

  return (now + expirySeconds) * 1000
}

function getClientIp(c: any): string {
  return (
    c.req.header('x-forwarded-for') ||
    c.req.header('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

function getBrowserName(userAgent?: string): string {
  if (!userAgent) return 'Unknown'

  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'

  return 'Unknown'
}

async function getSessionFromRedis(userId: string, sessionId: string) {
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
