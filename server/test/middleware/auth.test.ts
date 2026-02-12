/**
 * Auth Middleware Tests
 * Testing JWT authentication middleware
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { authMiddleware } from '../../src/middleware'
import { SignJWT } from 'jose'
import { createTestClient } from '../helpers'

describe('Auth Middleware', () => {
  let app: Hono
  let client: ReturnType<typeof createTestClient>

  beforeEach(() => {
    app = new Hono()

    // Setup protected route
    app.get('/protected', authMiddleware, (c) => {
      const user = c.get('user')
      return c.json({ success: true, user })
    })

    client = createTestClient(app)
  })

  describe('Valid Authentication', () => {
    it('should allow access with valid token', async () => {
      // Create a valid JWT token
      const secret = new TextEncoder().encode('test-secret')
      const token = await new SignJWT({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'member',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)

      const response = await client.get('/protected', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.user).toHaveProperty('userId')
    })

    it('should extract user information from token', async () => {
      const secret = new TextEncoder().encode('test-secret')
      const userId = 'user-123'
      const email = 'user@example.com'
      const role = 'admin'

      const token = await new SignJWT({ userId, email, role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)

      const response = await client.get('/protected', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.data.user.userId).toBe(userId)
      expect(response.data.user.email).toBe(email)
      expect(response.data.user.role).toBe(role)
    })
  })

  describe('Invalid Authentication', () => {
    it('should reject requests without authorization header', async () => {
      const response = await client.get('/protected')

      expect(response.status).toBe(401)
    })

    it('should reject requests with malformed token', async () => {
      const response = await client.get('/protected', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should reject requests with expired token', async () => {
      const secret = new TextEncoder().encode('test-secret')
      const token = await new SignJWT({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'member',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('0s') // Already expired
        .sign(secret)

      // Wait a moment to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100))

      const response = await client.get('/protected', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.status).toBe(401)
    })

    it('should reject requests with wrong bearer format', async () => {
      const response = await client.get('/protected', {
        headers: {
          authorization: 'InvalidFormat token',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should reject requests with empty authorization header', async () => {
      const response = await client.get('/protected', {
        headers: {
          authorization: '',
        },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Token Structure', () => {
    it('should require userId in token payload', async () => {
      const secret = new TextEncoder().encode('test-secret')
      const token = await new SignJWT({
        email: 'test@example.com',
        // Missing userId
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)

      const response = await client.get('/protected', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.status).toBe(401)
    })

    it('should require email in token payload', async () => {
      const secret = new TextEncoder().encode('test-secret')
      const token = await new SignJWT({
        userId: 'test-user-id',
        // Missing email
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)

      const response = await client.get('/protected', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.status).toBe(401)
    })
  })
})
