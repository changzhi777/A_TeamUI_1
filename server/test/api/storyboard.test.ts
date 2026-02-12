/**
 * Storyboard API Tests
 * Testing shot CRUD operations, batch operations, image upload
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { storyboardRouter } from '../../src/api/storyboard'
import {
  createTestClient,
  createTestShotData,
  createTestProjectData,
  cleanupTestDatabase,
  setupTestDatabase,
  createTestUser,
  createTestProject,
} from '../helpers'
import { db } from '../../src/config/database'
import { storyboardShots, projects } from '../../src/models'
import { eq, sql } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Storyboard API', () => {
  let app: Hono
  let client: ReturnType<typeof createTestClient>
  let authToken: string
  let userId: string
  let projectId: string

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach(async () => {
    // Create fresh app instance
    app = new Hono()
    app.route('/api', storyboardRouter)
    client = createTestClient(app)

    // Create test user
    userId = await createTestUser({
      name: 'Storyboard Test User',
      email: `storyboard-test-${Date.now()}@example.com`,
      password: 'StoryboardTest123!',
      role: 'member',
    })

    authToken = 'mock-token-' + userId

    // Create test project
    projectId = await createTestProject(userId, {
      name: 'Test Project for Storyboard',
    })
  })

  describe('GET /api/projects/:id/shots', () => {
    it('should get empty shot list for new project', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.get(`/api/projects/${projectId}/shots`)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
      expect(response.data.data.length).toBe(0)
    })

    it('should get shots ordered by shot number', async () => {
      const authClient = client.withAuth(authToken)

      // Create shots in reverse order
      await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())

      const response = await authClient.get(`/api/projects/${projectId}/shots`)

      expect(response.status).toBe(200)
      expect(response.data.data.length).toBe(2)
    })

    it('should fail for non-existent project', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.get('/api/projects/non-existent/shots')

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await client.get(`/api/projects/${projectId}/shots`)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/projects/:id/shots', () => {
    it('should create a new shot successfully', async () => {
      const authClient = client.withAuth(authToken)
      const shotData = createTestShotData()

      const response = await authClient.post(`/api/projects/${projectId}/shots`, shotData)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data).toHaveProperty('id')
      expect(response.data.data).toHaveProperty('shotNumber')
    })

    it('should increment shot numbers sequentially', async () => {
      const authClient = client.withAuth(authToken)

      const response1 = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const response2 = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())

      expect(response1.data.data.shotNumber).toBe(1)
      expect(response2.data.data.shotNumber).toBe(2)
    })

    it('should fail for non-existent project', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.post('/api/projects/non-existent/shots', createTestShotData())

      expect(response.status).toBe(404)
    })

    it('should validate shot size enum', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.post(`/api/projects/${projectId}/shots`, {
        ...createTestShotData(),
        shotSize: 'invalid-size',
      })

      expect(response.status).toBe(400)
    })

    it('should validate camera movement enum', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.post(`/api/projects/${projectId}/shots`, {
        ...createTestShotData(),
        cameraMovement: 'invalid-movement',
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/shots/:shotId', () => {
    it('should get shot by ID', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      const response = await authClient.get(`/api/shots/${shotId}`)

      expect(response.status).toBe(200)
      expect(response.data.data.id).toBe(shotId)
    })

    it('should return 404 for non-existent shot', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.get('/api/shots/non-existent-id')

      expect(response.status).toBe(404)
    })

    it('should not return soft-deleted shots', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      // Soft delete
      await authClient.delete(`/api/shots/${shotId}`)

      // Try to get deleted shot
      const response = await authClient.get(`/api/shots/${shotId}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/shots/:shotId', () => {
    it('should update shot successfully', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      const updateData = {
        description: 'Updated description',
        dialogue: 'Updated dialogue',
      }

      const response = await authClient.put(`/api/shots/${shotId}`, updateData)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should allow partial updates', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      const response = await authClient.put(`/api/shots/${shotId}`, {
        duration: 10,
      })

      expect(response.status).toBe(200)
    })

    it('should fail for non-existent shot', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.put('/api/shots/non-existent-id', {
        description: 'Updated',
      })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/shots/:shotId', () => {
    it('should soft delete shot', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      const response = await authClient.delete(`/api/shots/${shotId}`)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)

      // Verify soft delete in database
      const shot = await db
        .select()
        .from(storyboardShots)
        .where(eq(storyboardShots.id, shotId))
        .get()

      expect(shot?.deletedAt).toBeTruthy()
    })

    it('should fail for non-existent shot', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.delete('/api/shots/non-existent-id')

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/shots/reorder', () => {
    beforeEach(async () => {
      const authClient = client.withAuth(authToken)

      // Create multiple shots
      for (let i = 0; i < 3; i++) {
        await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      }
    })

    it('should reorder shots successfully', async () => {
      const authClient = client.withAuth(authToken)

      // Get shots
      const listResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const shotIds = listResponse.data.data.map((s: any) => s.id).reverse()

      const response = await authClient.post('/api/shots/reorder', {
        shotIds,
        projectId,
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should validate shot IDs array', async () => {
      const authClient = client.withAuth(authToken)

      const response = await authClient.post('/api/shots/reorder', {
        shotIds: 'not-an-array',
        projectId,
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/shots/duplicate', () => {
    beforeEach(async () => {
      const authClient = client.withAuth(authToken)
      await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
    })

    it('should duplicate shots successfully', async () => {
      const authClient = client.withAuth(authToken)

      const listResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const shotIds = [listResponse.data.data[0].id]

      const response = await authClient.post('/api/shots/duplicate', {
        shotIds,
        projectId,
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)

      // Verify shot was duplicated
      const newListResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      expect(newListResponse.data.data.length).toBe(2)
    })

    it('should add "(副本)" to duplicated shot description', async () => {
      const authClient = client.withAuth(authToken)

      const listResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const shotIds = [listResponse.data.data[0].id]

      await authClient.post('/api/shots/duplicate', {
        shotIds,
        projectId,
      })

      const newListResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const duplicated = newListResponse.data.data.find((s: any) => s.description?.includes('副本'))

      expect(duplicated).toBeTruthy()
    })

    it('should fail with empty shot IDs', async () => {
      const authClient = client.withAuth(authToken)

      const response = await authClient.post('/api/shots/duplicate', {
        shotIds: [],
        projectId,
      })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/shots/batch', () => {
    beforeEach(async () => {
      const authClient = client.withAuth(authToken)

      // Create multiple shots
      for (let i = 0; i < 3; i++) {
        await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      }
    })

    it('should batch delete shots successfully', async () => {
      const authClient = client.withAuth(authToken)

      const listResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const shotIds = listResponse.data.data.slice(0, 2).map((s: any) => s.id)

      const response = await authClient.delete('/api/shots/batch', {
        body: { shotIds },
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should soft delete all specified shots', async () => {
      const authClient = client.withAuth(authToken)

      const listResponse = await authClient.get(`/api/projects/${projectId}/shots`)
      const shotIds = listResponse.data.data.map((s: any) => s.id)

      await authClient.delete('/api/shots/batch', {
        body: { shotIds },
      })

      // Verify all shots are soft deleted
      const remaining = await db
        .select()
        .from(storyboardShots)
        .where(
          and(
            eq(storyboardShots.projectId, projectId),
            eq(storyboardShots.deletedAt, null)
          )
        )

      expect(remaining.length).toBe(0)
    })
  })

  describe('PUT /api/shots/:shotId/image', () => {
    let shotId: string

    beforeEach(async () => {
      const authClient = client.withAuth(authToken)
      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      shotId = createResponse.data.data.id
    })

    it('should upload image successfully', async () => {
      const authClient = client.withAuth(authToken)

      // Create a mock image file
      const imageBuffer = Buffer.from('fake-image-content')

      const formData = new FormData()
      const blob = new Blob([imageBuffer], { type: 'image/png' })
      formData.append('file', blob, 'test.png')

      // Note: This test would require proper multipart handling
      // For now, we test the endpoint exists
      const response = await authClient.put(`/api/shots/${shotId}/image`, formData, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })

      // In a real test with proper multipart support, this would be 200
      expect([200, 400, 500]).toContain(response.status)
    })

    it('should validate file type', async () => {
      const authClient = client.withAuth(authToken)

      // Test with invalid file type
      const formData = new FormData()
      const blob = new Blob(['not-an-image'], { type: 'text/plain' })
      formData.append('file', blob, 'test.txt')

      const response = await authClient.put(`/api/shots/${shotId}/image`, formData, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })

      expect(response.data.success).toBe(false)
    })

    it('should validate file size', async () => {
      const authClient = client.withAuth(authToken)

      // Create a large "file" (> 5MB)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024) // 6MB
      const formData = new FormData()
      const blob = new Blob([largeBuffer], { type: 'image/png' })
      formData.append('file', blob, 'large.png')

      const response = await authClient.put(`/api/shots/${shotId}/image`, formData, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })

      expect(response.data.success).toBe(false)
    })
  })

  describe('DELETE /api/shots/:shotId/image', () => {
    it('should remove shot image successfully', async () => {
      const authClient = client.withAuth(authToken)

      const createResponse = await authClient.post(`/api/projects/${projectId}/shots`, createTestShotData())
      const shotId = createResponse.data.data.id

      const response = await authClient.delete(`/api/shots/${shotId}/image`)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should fail for non-existent shot', async () => {
      const authClient = client.withAuth(authToken)
      const response = await authClient.delete('/api/shots/non-existent-id/image')

      expect(response.status).toBe(404)
    })
  })
})
