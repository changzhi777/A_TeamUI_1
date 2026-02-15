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
import { generateProjectId } from '../../utils/id'
import { db } from '../../config/database'
import { projects, projectMembers, users, scriptVersions } from '../../models'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { JWTPayloadContext } from '../../middleware'
import { authMiddleware } from '../../middleware'
import type { ProjectStatus, ProjectType } from '../../types'
import { broadcastDataChange } from '../../websocket'

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  type: z.enum(['shortDrama', 'realLifeDrama', 'aiPodcast', 'advertisement', 'mv', 'documentary', 'other']),
  status: z.enum(['planning', 'filming', 'postProduction', 'completed']).optional(),
  episodeRange: z.string().optional(),
  director: z.string().optional(),
})

const updateProjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  type: z
    .enum(['shortDrama', 'realLifeDrama', 'aiPodcast', 'advertisement', 'mv', 'documentary', 'other'])
    .optional(),
  status: z
    .enum(['planning', 'filming', 'postProduction', 'completed'])
    .optional(),
  episodeRange: z.string().optional(),
  director: z.string().optional(),
  totalShots: z.number().min(0).optional(),
  completedShots: z.number().min(0).optional(),
})

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor']),
})

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor']),
})

const updateScriptSchema = z.object({
  content: z.string(),
})

const createVersionSchema = z.object({
  content: z.string(),
  description: z.string().optional(),
})

const paginationSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  pageSize: z.string().optional().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const toggleFavoriteSchema = z.object({
  isFavorite: z.boolean().optional(),
})

const togglePinSchema = z.object({
  isPinned: z.boolean().optional(),
})

// Create projects router
export const projectsRouter = new Hono<JWTPayloadContext>()

// GET /api/projects - Get projects list with pagination, filter, sort
projectsRouter.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const params = c.req.valid('query')
    const page = (params.page - 1) * params.pageSize
    const pageSize = params.pageSize

    // Build query
    let query = db.select().from(projects)

    // Add filters
    if (params.status) {
      query = query.where(eq(projects.status, params.status as ProjectStatus))
    }
    if (params.type) {
      query = query.where(eq(projects.type, params.type as ProjectType))
    }
    if (params.search) {
      query = query.where(
        sql`(${projects.name} LIKE ${sql.raw(`'%${params.search}%`)} OR ${projects.description} LIKE ${sql.raw(`'%${params.search}%`)})`
      )
    }

    // Sorting
    if (params.sortBy === 'updatedAt') {
      query = query.orderBy(desc(projects.updatedAt))
    } else {
      query = query.orderBy(desc(projects.createdAt))
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(sql`deleted_at IS NULL`)

    // Get paginated results
    const results = await query.limit(pageSize).offset(page).where(sql`deleted_at IS NULL`)

    return sendPaginated(c, results, params.page, pageSize, count)
  } catch (error) {
    console.error('Get projects error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects - Create new project
projectsRouter.post('/', authMiddleware, zValidator('json', createProjectSchema), async (c) => {
  try {
    const user = c.get('user')
    const data = c.req.valid('json')

    const projectId = generateProjectId()
    const now = new Date().toISOString()

    await db.insert(projects).values({
      id: projectId,
      name: data.name,
      description: data.description || '',
      type: data.type,
      status: data.status || 'planning',
      episodeRange: data.episodeRange || '',
      director: data.director || '',
      totalShots: 0,
      completedShots: 0,
      isFavorite: false,
      isPinned: false,
      createdBy: user.userId,
      createdAt: now,
      updatedAt: now,
    })

    // Broadcast project created
    const wss = (c as any).ws as import('../../websocket').wss
    broadcastDataChange('project_created', projectId, {
      id: projectId,
      name: data.name,
      createdBy: user.userId,
    })

    return sendSuccess(c, { id: projectId, message: 'Project created successfully' })
  } catch (error) {
    console.error('Create project error:', error)
    return sendInternalError(c)
  }
})

// GET /api/projects/:id - Get project by ID
projectsRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project || project.deletedAt) {
      return sendNotFound(c, 'Project')
    }

    return sendSuccess(c, project)
  } catch (error) {
    console.error('Get project error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/projects/:id - Update project
projectsRouter.put('/:id', authMiddleware, zValidator('json', updateProjectSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    // Check if user can edit
    // TODO: Add permission check

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.type !== undefined) updateData.type = data.type
    if (data.status !== undefined) updateData.status = data.status
    if (data.episodeRange !== undefined) updateData.episodeRange = data.episodeRange
    if (data.director !== undefined) updateData.director = data.director
    if (data.totalShots !== undefined) updateData.totalShots = data.totalShots
    if (data.completedShots !== undefined) updateData.completedShots = data.completedShots

    await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))

    const updated = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (updated) {
      // Broadcast project updated
      const wss = (c as any).ws
      broadcastDataChange('project_updated', projectId, updated)
    }

    return sendSuccess(c, { message: 'Project updated successfully' })
  } catch (error) {
    console.error('Update project error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/projects/:id - Delete project (soft delete)
projectsRouter.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')

    // Check permissions
    // TODO: Add permission check

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project || project.deletedAt) {
      return sendNotFound(c, 'Project')
    }

    // Soft delete
    await db
      .update(projects)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))

    // Broadcast project deleted
    const wss = (c as any).ws
    broadcastDataChange('project_deleted', projectId, project)

    return sendSuccess(c, { message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/favorite - Toggle favorite
projectsRouter.post('/:id/favorite', authMiddleware, zValidator('json', toggleFavoriteSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendNotFound(c, 'Project')
    }

    const newFavorite = data.isFavorite ?? !project.isFavorite

    await db
      .update(projects)
      .set({ isFavorite: newFavorite })
      .where(eq(projects.id, projectId))

    return sendSuccess(c, { isFavorite: newFavorite })
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/pin - Toggle pin
projectsRouter.post('/:id/pin', authMiddleware, zValidator('json', togglePinSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendNotFound(c, 'Project')
    }

    const newPinned = data.isPinned ?? !project.isPinned
    const pinnedAt = newPinned ? new Date().toISOString() : null

    await db
      .update(projects)
      .set({ isPinned: newPinned, pinnedAt })
      .where(eq(projects.id, projectId))

    return sendSuccess(c, { isPinned: newPinned })
  } catch (error) {
    console.error('Toggle pin error:', error)
    return sendInternalError(c)
  }
})

// GET /api/projects/:id/members - Get project members
projectsRouter.get('/:id/members', authMiddleware, zValidator('query', paginationSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const params = c.req.valid('query')

    const page = (params.page - 1) * params.pageSize
    const pageSize = params.pageSize

    const query = db
      .select({
        id: projectMembers.id,
        name: sql`CONCAT(u.name, ' - Member')`,
        email: projectMembers.email,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId))
      .limit(pageSize)
      .offset(page)

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId))

    const results = await query

    // Map results to expected format
    const members = results.map((row: any) => ({
      id: row.project_members__id,
      name: row.users_name,
      email: row.project_members_email,
      role: row.project_members_role,
      joinedAt: row.project_members_joined_at,
    }))

    return sendPaginated(c, members, params.page, pageSize, count)
  } catch (error) {
    console.error('Get members error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/members - Add member
projectsRouter.post('/:id/members', authMiddleware, zValidator('json', addMemberSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    // Find user by email
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get()

    if (!targetUser) {
      return sendError(c, 'User not found', 404)
    }

    // Check if already member
    const existingMember = await db
      .select()
      .from(projectMembers)
      .where(
        and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUser.id))
      )
      .get()

    if (existingMember) {
      return sendError(c, 'User is already a member', 409)
    }

    const memberId = generateProjectId()

    await db.insert(projectMembers).values({
      id: memberId,
      projectId: projectId,
      userId: targetUser.id,
      role: data.role,
      joinedAt: new Date().toISOString(),
    })

    // Broadcast member added
    const wss = (c as any).ws
    broadcastDataChange('member_added', projectId, {
      memberId,
      userId: targetUser.id,
      role: data.role,
    })

    return sendSuccess(c, { message: 'Member added successfully' })
  } catch (error) {
    console.error('Add member error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/projects/:id/members/:memberId - Update member role
projectsRouter.put('/:id/members/:memberId', authMiddleware, zValidator('json', updateMemberSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const memberId = c.req.param('memberId')
    const data = c.req.valid('json')

    const member = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, memberId))
      .get()

    if (!member || member.projectId !== projectId) {
      return sendNotFound(c, 'Member')
    }

    await db
      .update(projectMembers)
      .set({ role: data.role })
      .where(eq(projectMembers.id, memberId))

    // Broadcast member updated
    const wss = (c as any).ws
    broadcastDataChange('member_updated', projectId, { memberId, role: data.role })

    return sendSuccess(c, { message: 'Member role updated successfully' })
  } catch (error) {
    console.error('Update member error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/projects/:id/members/:memberId - Remove member
projectsRouter.delete('/:id/members/:memberId', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user')
    const projectId = c.req.param('id')
    const memberId = c.req.param('memberId')

    // Get member to check ownership
    const member = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, memberId))
      .get()

    if (!member || member.projectId !== projectId) {
      return sendNotFound(c, 'Member')
    }

    // Check permissions
    // TODO: Check if user can remove members

    await db.delete(projectMembers).where(eq(projectMembers.id, memberId))

    // Broadcast member removed
    const wss = (c as any).ws
    broadcastDataChange('member_removed', projectId, { memberId })

    return sendSuccess(c, { message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove member error:', error)
    return sendInternalError(c)
  }
})

// GET /api/projects/:id/script - Get script content
projectsRouter.get('/:id/script', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendNotFound(c, 'Project')
    }

    // Script content stored in project.description (simplification)
    // Or you could add a separate content field
    return sendSuccess(c, { content: project.description || '' })
  } catch (error) {
    console.error('Get script error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/projects/:id/script - Update script content
projectsRouter.put('/:id/script', authMiddleware, zValidator('json', updateScriptSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const { content } = c.req.valid('json')

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendNotFound(c, 'Project')
    }

    // Store script content in description field
    await db
      .update(projects)
      .set({ description: content, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))

    return sendSuccess(c, { message: 'Script updated successfully' })
  } catch (error) {
    console.error('Update script error:', error)
    return sendInternalError(c)
  }
})

// GET /api/projects/:id/versions - Get script versions
projectsRouter.get('/:id/versions', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')

    const versions = await db
      .select()
      .from(scriptVersions)
      .where(eq(scriptVersions.projectId, projectId))
      .orderBy(desc(scriptVersions.createdAt))

    return sendSuccess(c, versions)
  } catch (error) {
    console.error('Get script versions error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/versions - Create script version
projectsRouter.post('/:id/versions', authMiddleware, zValidator('json', createVersionSchema), async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    await db.insert(scriptVersions).values({
      id: generateProjectId(),
      projectId: projectId,
      content: data.content,
      description: data.description || '',
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
    })

    return sendSuccess(c, { message: 'Script version created' })
  } catch (error) {
    console.error('Create script version error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/versions/:versionId/restore - Restore script version
projectsRouter.post('/:id/versions/:versionId/restore', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const versionId = c.req.param('versionId')

    // Get version to restore
    const version = await db
      .select()
      .from(scriptVersions)
      .where(eq(scriptVersions.id, versionId))
      .get()

    if (!version) {
      return sendNotFound(c, 'Version')
    }

    // Update project description with version content
    await db
      .update(projects)
      .set({ description: version.content, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))

    return sendSuccess(c, { message: 'Script restored successfully' })
  } catch (error) {
    console.error('Restore script version error:', error)
    return sendInternalError(c)
  }
})
