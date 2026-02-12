/**
 * Auth API Tests
 * Testing authentication endpoints: register, login, refresh, logout, etc.
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { authRouter } from '../../src/api/auth'
import { authMiddleware } from '../../src/middleware'
import { db } from '../../src/config/database'
import { users } from '../../src/models'
import { eq } from 'drizzle-orm'
import {
  createTestClient,
  createTestUserData,
  cleanupTestDatabase,
  setupTestDatabase,
} from '../helpers'

describe('Auth API', () => {
  let app: Hono
  let client: ReturnType<typeof createTestClient>

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach(() => {
    // Create fresh app instance for each test
    app = new Hono()
    app.route('/api/auth', authRouter)
    client = createTestClient(app)
  })

  afterEach(async () => {
    // Clean test users created during tests
    const testUsers = await db
      .select()
      .from(users)
      .where(sql`email LIKE '%test%@example.com'`)

    for (const user of testUsers) {
      await db.delete(users).where(eq(users.id, user.id))
    }
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = createTestUserData()

      const response = await client.post('/api/auth/register', userData)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data).toHaveProperty('accessToken')
      expect(response.data.data).toHaveProperty('refreshToken')
      expect(response.data.data).toHaveProperty('user')
      expect(response.data.data.user.email).toBe(userData.email)
    })

    it('should fail with existing email', async () => {
      const userData = createTestUserData()

      // First registration
      await client.post('/api/auth/register', userData)

      // Second registration with same email
      const response = await client.post('/api/auth/register', userData)

      expect(response.status).toBe(409)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('already registered')
    })

    it('should fail with invalid email format', async () => {
      const userData = createTestUserData({ email: 'invalid-email' })

      const response = await client.post('/api/auth/register', userData)

      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
    })

    it('should fail with weak password', async () => {
      const userData = createTestUserData({ password: 'weak' })

      const response = await client.post('/api/auth/register', userData)

      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
    })

    it('should fail with missing required fields', async () => {
      const response = await client.post('/api/auth/register', {
        name: 'Test User',
        // Missing email and password
      })

      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = createTestUserData({
        email: 'login-test@example.com',
        password: 'LoginTest123!',
      })

      await client.post('/api/auth/register', userData)
    })

    it('should login successfully with valid credentials', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'login-test@example.com',
        password: 'LoginTest123!',
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data).toHaveProperty('accessToken')
      expect(response.data.data).toHaveProperty('refreshToken')
      expect(response.data.data).toHaveProperty('user')
    })

    it('should fail with invalid email', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password',
      })

      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
    })

    it('should fail with invalid password', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'login-test@example.com',
        password: 'wrongpassword',
      })

      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
    })

    it('should support remember me option', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'login-test@example.com',
        password: 'LoginTest123!',
        rememberMe: true,
      })

      expect(response.status).toBe(200)
      expect(response.data.data).toHaveProperty('expiresAt')
    })
  })

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string

    beforeEach(async () => {
      // Create user and get tokens
      const userData = createTestUserData({
        email: 'refresh-test@example.com',
        password: 'RefreshTest123!',
      })

      const registerResponse = await client.post('/api/auth/register', userData)
      refreshToken = registerResponse.data.data.refreshToken
    })

    it('should refresh access token with valid refresh token', async () => {
      const response = await client.post('/api/auth/refresh', {
        refreshToken,
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data).toHaveProperty('accessToken')
      expect(response.data.data).toHaveProperty('refreshToken')
    })

    it('should fail with invalid refresh token', async () => {
      const response = await client.post('/api/auth/refresh', {
        refreshToken: 'invalid-token',
      })

      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout authenticated user', async () => {
      // Create user
      const userData = createTestUserData({
        email: 'logout-test@example.com',
        password: 'LogoutTest123!',
      })

      const registerResponse = await client.post('/api/auth/register', userData)
      const token = registerResponse.data.data.accessToken

      // Logout with token
      const authClient = client.withAuth(token)
      const response = await authClient.post('/api/auth/logout')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await client.post('/api/auth/logout')

      expect(response.status).toBe(401)
      expect(response.data.success).toBe(false)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should not reveal if email exists', async () => {
      const response = await client.post('/api/auth/forgot-password', {
        email: 'nonexistent@example.com',
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.message).toContain('If email exists')
    })

    it('should return success for existing email', async () => {
      // Create user first
      const userData = createTestUserData({
        email: 'forgot-test@example.com',
        password: 'ForgotTest123!',
      })
      await client.post('/api/auth/register', userData)

      const response = await client.post('/api/auth/forgot-password', {
        email: 'forgot-test@example.com',
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      // In development, should return reset token
      expect(response.data.data).toHaveProperty('_devResetToken')
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should fail with invalid token', async () => {
      const response = await client.post('/api/auth/reset-password', {
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      })

      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('Invalid or expired')
    })

    it('should validate new password strength', async () => {
      // This test requires a valid token from forgot-password
      // For now, we test the validation schema
      const response = await client.post('/api/auth/reset-password', {
        token: 'some-token',
        newPassword: 'weak',
      })

      // Should fail validation before checking token
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/auth/sessions', () => {
    it('should get user sessions when authenticated', async () => {
      // Create user and login
      const userData = createTestUserData({
        email: 'sessions-test@example.com',
        password: 'SessionsTest123!',
      })

      const loginResponse = await client.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
        rememberMe: true,
      })

      const token = loginResponse.data.data.accessToken
      const authClient = client.withAuth(token)

      const response = await authClient.get('/api/auth/sessions')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await client.get('/api/auth/sessions')

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/auth/sessions/:id', () => {
    it('should revoke a session when authenticated', async () => {
      // Create user and login
      const userData = createTestUserData({
        email: 'revoke-test@example.com',
        password: 'RevokeTest123!',
      })

      const loginResponse = await client.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
      })

      const token = loginResponse.data.data.accessToken
      const authClient = client.withAuth(token)

      // Get sessions first
      const sessionsResponse = await authClient.get('/api/auth/sessions')
      const sessionId = sessionsResponse.data.data[0]?.id

      if (sessionId) {
        const response = await authClient.delete(`/api/auth/sessions/${sessionId}`)

        expect(response.status).toBe(200)
        expect(response.data.success).toBe(true)
      }
    })

    it('should fail without authentication', async () => {
      const response = await client.delete('/api/auth/sessions/some-id')

      expect(response.status).toBe(401)
    })
  })
})
