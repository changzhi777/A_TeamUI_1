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
} from '../../utils/response'
import { generateShotId, generateProjectId } from '../../utils/id'
import { db } from '../../config/database'
import { storyboardShots, projects } from '../../models'
import { eq, and, sql, desc, inArray } from 'drizzle-orm'
import type { JWTPayloadContext } from '../../middleware'
import { authMiddleware } from '../../middleware'
import { broadcastDataChange } from '../../websocket'
import type { ShotSize, CameraMovement } from '../../types'
import { imageService } from '../../services/image'
import { uploadFile } from '../../utils/file-upload'

// Validation schemas
const createShotSchema = z.object({
  sceneNumber: z.string().optional(),
  shotSize: z.enum(['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp']),
  cameraMovement: z.enum([
    'static',
    'pan',
    'tilt',
    'dolly',
    'truck',
    'pedestral',
    'crane',
    'handheld',
    'steadicam',
    'tracking',
    'arc',
  ]),
  duration: z.number().min(0).optional(),
  description: z.string().optional(),
  dialogue: z.string().optional(),
  sound: z.string().optional(),
})

const updateShotSchema = z.object({
  sceneNumber: z.string().optional(),
  shotSize: z
    .enum(['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp'])
    .optional(),
  cameraMovement: z
    .enum([
      'static',
      'pan',
      'tilt',
      'dolly',
      'truck',
      'pedestral',
      'crane',
      'handheld',
      'steadicam',
      'tracking',
      'arc',
    ])
    .optional(),
  duration: z.number().min(0).optional(),
  description: z.string().optional(),
  dialogue: z.string().optional(),
  sound: z.string().optional(),
})

const reorderShotsSchema = z.object({
  shotIds: z.array(z.string()),
  projectId: z.string(),
})

const duplicateShotsSchema = z.object({
  shotIds: z.array(z.string()),
  projectId: z.string(),
})

const batchDeleteSchema = z.object({
  shotIds: z.array(z.string()),
})

// Create storyboard router
export const storyboardRouter = new Hono<JWTPayloadContext>()

// GET /api/projects/:id/shots - Get storyboard shots
storyboardRouter.get('/projects/:id/shots', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const projectId = c.req.param('id')

    // Check project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendError(c, 'Project not found', 404)
    }

    const shots = await db
      .select()
      .from(storyboardShots)
      .where(and(eq(storyboardShots.projectId, projectId), eq(storyboardShots.deletedAt, null)))
      .orderBy(storyboardShots.shotNumber)

    return sendSuccess(c, shots)
  } catch (error) {
    console.error('Get shots error:', error)
    return sendInternalError(c)
  }
})

// POST /api/projects/:id/shots - Create new shot
storyboardRouter.post('/projects/:id/shots', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const projectId = c.req.param('id')
    const data = c.req.valid('json')

    // Check project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return sendError(c, 'Project not found', 404)
    }

    // Get max shot number
    const maxShotResult = await db
      .select({ max: sql<number>`MAX(${sql.raw('COALESCE(MAX(shot_number), 0) + 1')})` })
      .from(storyboardShots)
      .where(eq(storyboardShots.projectId, projectId))

    const maxShotNumber = maxShotResult[0]?.max || 0

    const shotId = generateShotId()
    const now = new Date().toISOString()

    await db.insert(storyboardShots).values({
      id: shotId,
      projectId,
      shotNumber: maxShotNumber + 1,
      sceneNumber: data.sceneNumber || '',
      shotSize: data.shotSize || 'medium',
      cameraMovement: data.cameraMovement || 'static',
      duration: data.duration || 0,
      description: data.description || '',
      dialogue: data.dialogue || '',
      sound: data.sound || '',
      createdBy: user.userId,
      createdAt: now,
      updatedAt: now,
    })

    // Update project shot count
    await db
      .update(projects)
      .set({
        totalShots: project.totalShots + 1,
      })
      .where(eq(projects.id, projectId))

    // Broadcast shot created
    broadcastDataChange('shot_created', projectId, {
      id: shotId,
      projectId,
    })

    return sendSuccess(c, {
      id: shotId,
      shotNumber: maxShotNumber + 1,
    })
  } catch (error) {
    console.error('Create shot error:', error)
    return sendInternalError(c)
  }
})

// GET /api/shots/:shotId - Get single shot
storyboardRouter.get('/shots/:shotId', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const shotId = c.req.param('shotId')

    const shot = await db
      .select()
      .from(storyboardShots)
      .where(eq(storyboardShots.id, shotId))
      .get()

    if (!shot || shot.deletedAt) {
      return sendNotFound(c, 'Shot')
    }

    return sendSuccess(c, shot)
  } catch (error) {
    console.error('Get shot error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/shots/:shotId - Update shot
storyboardRouter.put('/shots/:shotId', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const shotId = c.req.param('shotId')
    const data = c.req.valid('json')

    const shot = await db
      .select()
      .from(storyboardShots)
      .where(eq(storyboardShots.id, shotId))
      .get()

    if (!shot || shot.deletedAt) {
      return sendNotFound(c, 'Shot')
    }

    // Check if shot belongs to project
    // TODO: Add permission check

    const updatedData: any = {}

    if (data.sceneNumber !== undefined) updatedData.sceneNumber = data.sceneNumber
    if (data.shotSize !== undefined) updatedData.shotSize = data.shotSize
    if (data.cameraMovement !== undefined)
      updatedData.cameraMovement = data.cameraMovement
    if (data.duration !== undefined) updatedData.duration = data.duration
    if (data.description !== undefined)
      updatedData.description = data.description
    if (data.dialogue !== undefined) updatedData.dialogue = data.dialogue
    if (data.sound !== undefined) updatedData.sound = data.sound

    updatedData.updatedAt = new Date().toISOString()

    await db
      .update(storyboardShots)
      .set(updatedData)
      .where(eq(storyboardShots.id, shotId))

    // Broadcast shot updated
    broadcastDataChange('shot_updated', shot.projectId, {
      id: shotId,
      ...data,
    })

    return sendSuccess(c, { message: 'Shot updated successfully' })
  } catch (error) {
    console.error('Update shot error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/shots/:shotId - Delete shot
storyboardRouter.delete('/shots/:shotId', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const shotId = c.req.param('shotId')

    const shot = await db
      .select()
      .from(storyboardShots)
      .where(eq(storyboardShots.id, shotId))
      .get()

    if (!shot || shot.deletedAt) {
      return sendNotFound(c, 'Shot')
    }

    // Soft delete
    await db
      .update(storyboardShots)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(storyboardShots.id, shotId))

    // Reorder remaining shots (TODO: optimize this operation)
    // TODO: Add renumbering logic

    // Broadcast shot deleted
    broadcastDataChange('shot_deleted', shot.projectId, { id: shotId })

    return sendSuccess(c, { message: 'Shot deleted successfully' })
  } catch (error) {
    console.error('Delete shot error:', error)
    return sendInternalError(c)
  }
})

// POST /api/shots/reorder - Batch reorder shots
storyboardRouter.post('/reorder', authMiddleware, zValidator('json', reorderShotsSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { shotIds, projectId } = c.req.valid('json')

    // Update shot numbers
    for (let i = 0; i < shotIds.length; i++) {
      await db
        .update(storyboardShots)
        .set({ shotNumber: i + 1 })
        .where(eq(storyboardShots.id, shotIds[i]))
    }

    // Broadcast reorder
    broadcastDataChange('shot_reordered', projectId, { shotIds })

    return sendSuccess(c, { message: 'Shots reordered successfully' })
  } catch (error) {
    console.error('Reorder shots error:', error)
    return sendInternalError(c)
  }
})

// POST /api/shots/duplicate - Batch duplicate shots
storyboardRouter.post('/duplicate', authMiddleware, zValidator('json', duplicateShotsSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { shotIds, projectId } = c.req.valid('json')

    // Get shots to duplicate
    const shotsToDuplicate = await db
      .select()
      .from(storyboardShots)
      .where(and(inArray(storyboardShots.id, shotIds), eq(storyboardShots.deletedAt, null)))
      .orderBy(storyboardShots.shotNumber)

    if (!shotsToDuplicate.length) {
      return sendError(c, 'No shots found', 404)
    }

    // Get max shot number in project
    const maxShotResult = await db
      .select({ max: sql<number>`MAX(${sql.raw('COALESCE(MAX(shot_number), 0) + 1')})` })
      .from(storyboardShots)
      .where(
        and(eq(storyboardShots.projectId, projectId), eq(storyboardShots.deletedAt, null))
      )

    const maxShotNumber = (maxShotResult[0]?.max || 0) as number

    const now = new Date().toISOString()

    // Duplicate shots
    for (const shot of shotsToDuplicate) {
      const newShotId = generateShotId()
      await db.insert(storyboardShots).values({
        id: newShotId,
        projectId,
        shotNumber: maxShotNumber + 1,
        sceneNumber: shot.sceneNumber || '',
        shotSize: shot.shotSize,
        cameraMovement: shot.cameraMovement,
        duration: shot.duration || 0,
        description: shot.description + ' (副本)',
        dialogue: shot.dialogue,
        sound: shot.sound,
        createdBy: user.userId,
        createdAt: now,
        updatedAt: now,
      })
    }

    // Broadcast shots created
    broadcastDataChange('shot_created', projectId, { shots: shotsToDuplicate.map((s) => s.id) })

    return sendSuccess(c, { message: 'Shots duplicated successfully' })
  } catch (error) {
    console.error('Duplicate shots error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/shots/batch - Batch delete shots
storyboardRouter.delete('/batch', authMiddleware, zValidator('json', batchDeleteSchema), async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const { shotIds } = c.req.valid('json')

    // Get affected shots first
    const shotsToDelete = await db
      .select()
      .from(storyboardShots)
      .where(and(inArray(storyboardShots.id, shotIds), eq(storyboardShots.deletedAt, null)))

    // Soft delete all shots
    await db
      .update(storyboardShots)
      .set({ deletedAt: new Date().toISOString() })
      .where(inArray(storyboardShots.id, shotIds))

    // Broadcast batch delete
    const affectedProjects = new Set<string>()
    for (const shot of shotsToDelete) {
      affectedProjects.add(shot.projectId)
    }

    for (const projectId of affectedProjects) {
      broadcastDataChange('shot_deleted', projectId, { shotIds })
    }

    return sendSuccess(c, { message: 'Shots deleted successfully' })
  } catch (error) {
    console.error('Batch delete shots error:', error)
    return sendInternalError(c)
  }
})

// PUT /api/shots/:shotId/image - Upload/update shot image
storyboardRouter.put('/shots/:shotId/image', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const shotId = c.req.param('shotId')

    // Get shot
    const shot = await db
      .select()
      .from(storyboardShots)
      .where(eq(storyboardShots.id, shotId))
      .get()

    if (!shot || shot.deletedAt) {
      return sendNotFound(c, 'Shot')
    }

    // Check for file (using multipart)
    const contentType = c.req.header('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return sendError(c, 'Content-Type must be multipart/form-data', 400)
    }

    const formData = await c.req.parseBody()

    const file = formData.file

    if (!file || !(file instanceof File)) {
      return sendError(c, 'No file uploaded', 400)
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return sendError(c, 'Only image files are allowed (JPEG, PNG, GIF, WebP)', 400)
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return sendError(c, 'File size exceeds 5MB limit', 400)
    }

    // Simple implementation: save to local filesystem
    // In production, you would upload to OSS/S3 instead
    const uploadsDir = process.env.UPLOAD_DIR || './uploads'
    const fs = require('fs')
    const path = require('path')

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `shot_${shotId}_${timestamp}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    // Save file
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(filepath, new Uint8Array(buffer))

    // Generate URL (in production, this would be OSS/S3 URL)
    const protocol = c.req.header('x-forwarded-proto') || 'http'
    const host = c.req.header('x-forwarded-host') || 'localhost'
    const port = c.req.header('x-forwarded-port') || '5173'
    const baseUrl = `${protocol}://${host}:${port}`
    const imageUrl = `${baseUrl}/uploads/${filename}`

    // For now, don't generate thumbnail (would need sharp or similar library)
    // Store URLs in database
    await db
      .update(storyboardShots)
      .set({
        imageUrl: imageUrl,
        imageThumbnailUrl: imageUrl, // Using same URL as thumbnail for now
      })
      .where(eq(storyboardShots.id, shotId))

    return sendSuccess(c, {
      imageUrl,
      thumbnailUrl: imageUrl,
    })
  } catch (error) {
    console.error('Upload image error:', error)
    return sendInternalError(c)
  }
})

// DELETE /api/shots/:shotId/image - Delete shot image
storyboardRouter.delete('/shots/:shotId/image', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    const shotId = c.req.param('shotId')

    // Check if shot exists
    const shot = await db
      .select()
      .from(storyboardShots)
      .where(eq(storyboardShots.id, shotId))
      .get()

    if (!shot || shot.deletedAt) {
      return sendNotFound(c, 'Shot')
    }

    await db
      .update(storyboardShots)
      .set({ imageUrl: null, imageThumbnailUrl: null })
      .where(eq(storyboardShots.id, shotId))

    return sendSuccess(c, { message: 'Image removed successfully' })
  } catch (error) {
    console.error('Delete image error:', error)
    return sendInternalError(c)
  }
})
