/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendInternalError,
  sendUnauthorized,
  sendForbidden,
} from '../../utils/response'
import { db } from '../../config/database'
import { users, loginHistory } from '../../models'
import { eq, and, desc, sql, or, like } from 'drizzle-orm'
import type { JWTPayloadContext } from '../../middleware'
import { hashPassword, comparePassword } from '../../utils/password'
import { generateOtpSecret } from '../../utils/otp'

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
})

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(8).max(100),
})

const updateRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member']),
})

const paginationSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  pageSize: z.string().optional().transform(Number).default('20'),
  search: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member']).optional(),
})

// Create users router
export const usersRouter = new Hono<JWTPayloadContext>()

// GET /api/users/me - Get current user profile
usersRouter.get('/me', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const userData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        bio: users.bio,
        avatar: users.avatar,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        isOtpEnabled: users.isOtpEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'User')
    }

    return sendSuccess(c, userData)
  } catch (error) {
    console.error('Get user error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/users/me - Update user profile
usersRouter.put('/me', zValidator('json', updateProfileSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const data = c.req.valid('json')

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!existingUser) {
      return sendNotFound(c, 'User')
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.avatar !== undefined) updateData.avatar = data.avatar

    await db.update(users).set(updateData).where(eq(users.id, user.userId))

    return sendSuccess(c, { message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Update profile error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/users/me/password - Change password
usersRouter.put('/me/password', zValidator('json', changePasswordSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { oldPassword, newPassword } = c.req.valid('json')

    // Get user with password
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'User')
    }

    // Verify old password
    const isValid = await comparePassword(oldPassword, userData.password)
    if (!isValid) {
      return sendError(c, 'Current password is incorrect', 400)
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword)
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))

    return sendSuccess(c, { message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return sendInternalError(c)
  }
})

// POST /api/users/me/otp/send - Send OTP verification code
usersRouter.post('/me/otp/send', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    // Check if user has OTP enabled
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'User')
    }

    if (!userData.isOtpEnabled || !userData.otpSecret) {
      return sendError(c, 'OTP is not enabled for this account', 400)
    }

    // TODO: Implement actual OTP sending via email/SMS
    // For now, return success
    return sendSuccess(c, { message: 'OTP code sent successfully' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return sendInternalError(c)
  }
})

// POST /api/users/me/otp/verify - Verify OTP code
usersRouter.post('/me/otp/verify', zValidator('json', z.object({
  code: z.string().length(6),
})), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { code } = c.req.valid('json')

    // Get user OTP secret
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!userData || !userData.otpSecret) {
      return sendError(c, 'OTP is not enabled for this account', 400)
    }

    // TODO: Implement actual OTP verification
    // For now, accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return sendValidationError(c, { code: ['Invalid OTP format'] })
    }

    return sendSuccess(c, { message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return sendInternalError(c)
  }
})

// POST /api/users/me/otp/enable - Enable two-factor authentication
usersRouter.post('/me/otp/enable', zValidator('json', z.object({
  code: z.string().length(6),
})), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { code } = c.req.valid('json')

    // Get user
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'User')
    }

    // Check if already enabled
    if (userData.isOtpEnabled) {
      return sendError(c, 'OTP is already enabled', 400)
    }

    // TODO: Implement actual OTP setup and verification
    // Generate OTP secret and recovery codes
    const otpSecret = generateOtpSecret()
    const recoveryCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 12).toUpperCase()
    )

    await db
      .update(users)
      .set({
        otpSecret,
        isOtpEnabled: true,
        recoveryCodes: JSON.stringify(recoveryCodes),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))

    return sendSuccess(c, {
      message: 'OTP enabled successfully',
      recoveryCodes,
    })
  } catch (error) {
    console.error('Enable OTP error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/users/me/otp/disable - Disable two-factor authentication
usersRouter.delete('/me/otp/disable', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    await db
      .update(users)
      .set({
        otpSecret: null,
        isOtpEnabled: false,
        recoveryCodes: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))

    return sendSuccess(c, { message: 'OTP disabled successfully' })
  } catch (error) {
    console.error('Disable OTP error:', error)
    return sendInternalError(c)
  }
})

// GET /api/users/me/history - Get login history
usersRouter.get('/me/history', zValidator('query', paginationSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const params = c.req.valid('query')
    const page = (params.page - 1) * params.pageSize
    const pageSize = params.pageSize

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(loginHistory)
      .where(eq(loginHistory.userId, user.userId))

    const results = await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, user.userId))
      .orderBy(desc(loginHistory.timestamp))
      .limit(pageSize)
      .offset(page)

    return sendSuccess(c, {
      history: results,
      pagination: {
        page: params.page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    })
  } catch (error) {
    console.error('Get login history error:', error)
    return sendInternalError(c)
  }
})

// GET /api/users/:id - Get user by ID (admin only)
usersRouter.get('/:id', async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendUnauthorized(c)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendForbidden(c, 'Admin access required')
    }

    const userId = c.req.param('id')

    const userData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        bio: users.bio,
        avatar: users.avatar,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        isOtpEnabled: users.isOtpEnabled,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'User')
    }

    return sendSuccess(c, userData)
  } catch (error) {
    console.error('Get user by ID error:', error)
    return sendInternalError(c)
  }
})

// GET /api/users - List all users (admin only)
usersRouter.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendUnauthorized(c)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendForbidden(c, 'Admin access required')
    }

    const params = c.req.valid('query')
    const page = (params.page - 1) * params.pageSize
    const pageSize = params.pageSize

    // Build query
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        createdAt: users.createdAt,
      })
      .from(users)

    // Add filters
    const conditions = []
    if (params.search) {
      conditions.push(
        or(
          like(users.name, `%${params.search}%`),
          like(users.email, `%${params.search}%`)
        )
      )
    }
    if (params.role) {
      conditions.push(eq(users.role, params.role))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Get total count
    const baseQuery = db.select({ count: sql<number>`count(*)` }).from(users)
    if (conditions.length > 0) {
      baseQuery.where(and(...conditions))
    }
    const [{ count }] = await baseQuery

    const results = await query
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(page)

    return sendSuccess(c, {
      users: results,
      pagination: {
        page: params.page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    })
  } catch (error) {
    console.error('List users error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/users/:id - Update user (admin only)
usersRouter.put('/:id', zValidator('json', updateRoleSchema), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendUnauthorized(c)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendForbidden(c, 'Admin access required')
    }

    const userId = c.req.param('id')
    const data = c.req.valid('json')

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get()

    if (!existingUser) {
      return sendNotFound(c, 'User')
    }

    // Prevent modifying super_admin unless current user is super_admin
    if (existingUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return sendForbidden(c, 'Cannot modify super admin')
    }

    await db
      .update(users)
      .set({
        role: data.role,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))

    return sendSuccess(c, { message: 'User updated successfully' })
  } catch (error) {
    console.error('Update user error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/users/:id - Delete user (soft delete, admin only)
usersRouter.delete('/:id', async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendUnauthorized(c)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendForbidden(c, 'Admin access required')
    }

    const userId = c.req.param('id')

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get()

    if (!existingUser) {
      return sendNotFound(c, 'User')
    }

    // Prevent deleting self
    if (userId === currentUser.userId) {
      return sendError(c, 'Cannot delete your own account', 400)
    }

    // Prevent deleting super_admin unless current user is super_admin
    if (existingUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return sendForbidden(c, 'Cannot delete super admin')
    }

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))

    return sendSuccess(c, { message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return sendInternalError(c)
  }
})
