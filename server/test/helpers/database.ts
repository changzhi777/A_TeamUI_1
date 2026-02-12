/**
 * Database Test Helpers
 * Setup and cleanup for database tests
 */

import { db, closeDatabaseConnection } from '../../src/config/database'
import { redis, closeRedisConnection } from '../../src/config/redis'
import {
  users,
  projects,
  projectMembers,
  storyboardShots,
  scriptVersions,
  loginHistory,
} from '../../src/models'
import { eq, sql } from 'drizzle-orm'

/**
 * Setup test database with clean state
 */
export async function setupTestDatabase() {
  // Clean all tables
  await cleanupTestDatabase()

  // Insert test admin user
  const bcrypt = await import('bcrypt')
  const passwordHash = await bcrypt.hash('password', 10)

  await db.insert(users).values({
    id: 'admin-test-id',
    name: 'Test Admin',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Insert test member user
  await db.insert(users).values({
    id: 'member-test-id',
    name: 'Test Member',
    email: 'member@example.com',
    passwordHash,
    role: 'member',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Clean all test data from database
 */
export async function cleanupTestDatabase() {
  // Delete in correct order due to foreign key constraints
  await db.delete(loginHistory)
  await db.delete(scriptVersions)
  await db.delete(storyboardShots)
  await db.delete(projectMembers)
  await db.delete(projects)
  await db.delete(users)

  // Clear all Redis keys
  const keys = await redis.keys('*')
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

/**
 * Close database and Redis connections
 */
export async function closeTestConnections() {
  await closeDatabaseConnection()
  await closeRedisConnection()
}

/**
 * Create a test user and return their ID
 */
export async function createTestUser(
  data: {
    name: string
    email: string
    password: string
    role?: 'admin' | 'member'
  } = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password',
    role: 'member',
  }
): Promise<string> {
  const bcrypt = await import('bcrypt')
  const passwordHash = await bcrypt.hash(data.password, 10)

  const userId = `user-${Date.now()}`

  await db.insert(users).values({
    id: userId,
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role || 'member',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return userId
}

/**
 * Create a test project and return its ID
 */
export async function createTestProject(
  userId: string,
  data: {
    name?: string
    description?: string
    type?: string
    status?: string
  } = {}
): Promise<string> {
  const projectId = `proj-${Date.now()}`

  await db.insert(projects).values({
    id: projectId,
    name: data.name || 'Test Project',
    description: data.description || '',
    type: (data.type as any) || 'shortDrama',
    status: (data.status as any) || 'planning',
    episodeRange: '',
    director: '',
    totalShots: 0,
    completedShots: 0,
    isFavorite: false,
    isPinned: false,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return projectId
}

/**
 * Create a test shot and return its ID
 */
export async function createTestShot(
  projectId: string,
  data: {
    shotNumber?: number
    sceneNumber?: string
    shotSize?: string
    cameraMovement?: string
  } = {}
): Promise<string> {
  const shotId = `shot-${Date.now()}`

  await db.insert(storyboardShots).values({
    id: shotId,
    projectId,
    shotNumber: data.shotNumber || 1,
    sceneNumber: data.sceneNumber || '1',
    shotSize: (data.shotSize as any) || 'medium',
    cameraMovement: (data.cameraMovement as any) || 'static',
    duration: 5,
    description: '',
    dialogue: '',
    sound: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return shotId
}
