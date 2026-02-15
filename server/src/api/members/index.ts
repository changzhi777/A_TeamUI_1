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
  sendPaginated,
} from '../../utils/response'
import { db } from '../../config/database'
import { users, projectMembers, projects } from '../../models'
import { eq, and, desc, sql, or, like, inArray } from 'drizzle-orm'
import type { JWTPayloadContext } from '../../middleware'
import { authMiddleware } from '../../middleware'
import { broadcastDataChange } from '../../websocket'

// Validation schemas
const globalPaginationSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  pageSize: z.string().optional().transform(Number).default('20'),
  search: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member']).optional(),
  projectIds: z.string().optional(), // Comma-separated project IDs
  sortBy: z.enum(['name', 'email', 'createdAt', 'role']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

const addGlobalMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member']),
  password: z.string().min(8),
  projects: z.array(z.object({
    id: z.string(),
    role: z.enum(['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor']),
  })).optional(),
})

const updateGlobalMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member']).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
})

// Create members router
export const membersRouter = new Hono<JWTPayloadContext>()

// GET /api/members - Get all members across all projects (global member list)
membersRouter.get('/', zValidator('query', globalPaginationSchema), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    const params = c.req.valid('query')
    const page = (params.page - 1) * params.pageSize
    const pageSize = params.pageSize

    // Check if user is admin
    const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin'

    // Build base query - only get non-deleted users
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        isOtpEnabled: users.isOtpEnabled,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        projectCount: sql<number>`(SELECT COUNT(*) FROM project_members WHERE project_members.user_id = users.id)`,
      })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`)

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

    // Filter by projects if specified
    if (params.projectIds) {
      const projectIdList = params.projectIds.split(',').map(id => id.trim())
      conditions.push(
        sql`${users.id} IN (SELECT DISTINCT user_id FROM project_members WHERE project_id IN ${sql.raw(`(${projectIdList.map(() => '?').join(',')})`)}`
      )
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Get total count
    const baseCountQuery = db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.deletedAt} IS NULL`)
    if (conditions.length > 0) {
      baseCountQuery.where(and(...conditions))
    }
    const [{ count }] = await baseCountQuery

    // Sorting
    const orderByColumn = params.sortBy === 'name' ? users.name
                        : params.sortBy === 'email' ? users.email
                        : params.sortBy === 'role' ? users.role
                        : users.createdAt

    const orderByDirection = params.sortOrder === 'asc' ? orderByColumn : desc(orderByColumn)

    const results = await query
      .orderBy(orderByDirection)
      .limit(pageSize)
      .offset(page)

    // For each user, get their project memberships
    const membersWithProjects = await Promise.all(
      results.map(async (user: any) => {
        const memberships = await db
          .select({
            projectId: projectMembers.projectId,
            projectName: projects.name,
            role: projectMembers.role,
            joinedAt: projectMembers.joinedAt,
          })
          .from(projectMembers)
          .innerJoin(projects, eq(projectMembers.projectId, projects.id))
          .where(eq(projectMembers.userId, user.id))

        return {
          ...user,
          projects: memberships,
        }
      })
    )

    return sendPaginated(c, membersWithProjects, params.page, pageSize, count)
  } catch (error) {
    console.error('Get members error:', error)
    return sendInternalError(c)
  }
})

// GET /api/members/:id - Get member by ID
membersRouter.get('/:id', async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    const memberId = c.req.param('id')

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
      .where(eq(users.id, memberId))
      .get()

    if (!userData) {
      return sendNotFound(c, 'Member')
    }

    // Get project memberships
    const memberships = await db
      .select({
        projectId: projectMembers.projectId,
        projectName: projects.name,
        projectStatus: projects.status,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(eq(projectMembers.userId, memberId))

    return sendSuccess(c, {
      ...userData,
      projects: memberships,
    })
  } catch (error) {
    console.error('Get member error:', error)
    return sendInternalError(c)
  }
})

// POST /api/members - Add new global member (admin only)
membersRouter.post('/', authMiddleware, zValidator('json', addGlobalMemberSchema), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendError(c, 'Admin access required', 403)
    }

    const data = c.req.valid('json')

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get()

    if (existingUser) {
      return sendError(c, 'User with this email already exists', 409)
    }

    // Import password utility
    const { hashPassword } = await import('../../utils/password')
    const { nanoid } = await import('nanoid')

    // Create user
    const userId = nanoid()
    const now = new Date().toISOString()

    await db.insert(users).values({
      id: userId,
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role: data.role,
      isEmailVerified: false,
      isOtpEnabled: false,
      createdAt: now,
      updatedAt: now,
    })

    // Add to projects if specified
    if (data.projects && data.projects.length > 0) {
      const { generateProjectId } = await import('../../utils/id')

      for (const project of data.projects) {
        // Check if user is already a member
        const existingMembership = await db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, project.id),
              eq(projectMembers.userId, userId)
            )
          )
          .get()

        if (!existingMembership) {
          await db.insert(projectMembers).values({
            id: generateProjectId(),
            projectId: project.id,
            userId: userId,
            role: project.role,
            joinedAt: now,
          })
        }
      }
    }

    return sendSuccess(c, {
      id: userId,
      message: 'Member created successfully',
    })
  } catch (error) {
    console.error('Add member error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/members/:id - Update global member (admin only)
membersRouter.put('/:id', authMiddleware, zValidator('json', updateGlobalMemberSchema), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendError(c, 'Admin access required', 403)
    }

    const memberId = c.req.param('id')
    const data = c.req.valid('json')

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, memberId))
      .get()

    if (!existingUser) {
      return sendNotFound(c, 'Member')
    }

    // Prevent modifying super_admin unless current user is super_admin
    if (existingUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return sendError(c, 'Cannot modify super admin', 403)
    }

    // Prevent email conflict
    if (data.email && data.email !== existingUser.email) {
      const emailConflict = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .get()

      if (emailConflict) {
        return sendError(c, 'Email already in use', 409)
      }
    }

    // Update user
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.role !== undefined) updateData.role = data.role
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.bio !== undefined) updateData.bio = data.bio

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, memberId))

    return sendSuccess(c, { message: 'Member updated successfully' })
  } catch (error) {
    console.error('Update member error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/members/:id - Delete global member (admin only)
membersRouter.delete('/:id', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    // Check if admin
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return sendError(c, 'Admin access required', 403)
    }

    const memberId = c.req.param('id')

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, memberId))
      .get()

    if (!existingUser) {
      return sendNotFound(c, 'Member')
    }

    // Prevent deleting self
    if (memberId === currentUser.userId) {
      return sendError(c, 'Cannot delete your own account', 400)
    }

    // Prevent deleting super_admin unless current user is super_admin
    if (existingUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return sendError(c, 'Cannot delete super admin', 403)
    }

    // Remove from all projects first
    await db
      .delete(projectMembers)
      .where(eq(projectMembers.userId, memberId))

    // Soft delete user
    await db
      .update(users)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, memberId))

    return sendSuccess(c, { message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Delete member error:', error)
    return sendInternalError(c)
  }
})

// POST /api/members/:id/projects - Add member to project
membersRouter.post('/:id/projects', authMiddleware, zValidator('json', z.object({
  projectId: z.string(),
  role: z.enum(['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor']),
})), async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    const memberId = c.req.param('id')
    const { projectId, role } = c.req.valid('json')

    // Check if user is admin or project admin
    const isProjectAdmin = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, currentUser.userId),
          eq(projectMembers.role, 'admin')
        )
      )
      .get()

    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin' && !isProjectAdmin) {
      return sendError(c, 'Admin access required', 403)
    }

    // Check if already a member
    const existingMembership = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberId)
        )
      )
      .get()

    if (existingMembership) {
      return sendError(c, 'User is already a member of this project', 409)
    }

    // Add to project
    const { generateProjectId } = await import('../../utils/id')

    await db.insert(projectMembers).values({
      id: generateProjectId(),
      projectId: projectId,
      userId: memberId,
      role: role,
      joinedAt: new Date().toISOString(),
    })

    // Broadcast member added
    broadcastDataChange('member_added', projectId, {
      userId: memberId,
      role: role,
    })

    return sendSuccess(c, { message: 'Member added to project successfully' })
  } catch (error) {
    console.error('Add member to project error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/members/:id/projects/:projectId - Remove member from project
membersRouter.delete('/:id/projects/:projectId', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user')
    if (!currentUser) {
      return sendError(c, 'Unauthorized', 401)
    }

    const memberId = c.req.param('id')
    const projectId = c.req.param('projectId')

    // Check if user is admin or project admin
    const isProjectAdmin = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, currentUser.userId),
          eq(projectMembers.role, 'admin')
        )
      )
      .get()

    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin' && !isProjectAdmin) {
      return sendError(c, 'Admin access required', 403)
    }

    // Remove from project
    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberId)
        )
      )

    // Broadcast member removed
    broadcastDataChange('member_removed', projectId, {
      userId: memberId,
    })

    return sendSuccess(c, { message: 'Member removed from project successfully' })
  } catch (error) {
    console.error('Remove member from project error:', error)
    return sendInternalError(c)
  }
})
