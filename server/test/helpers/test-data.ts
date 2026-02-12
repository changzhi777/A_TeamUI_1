/**
 * Test Data Fixtures
 * Common test data and generators
 */

import { generateUserId, generateProjectId, generateShotId } from '../../src/utils/id'

/**
 * Generate test user data
 */
export function createTestUserData(overrides: Partial<any> = {}) {
  const timestamp = Date.now()
  return {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    ...overrides,
  }
}

/**
 * Generate test project data
 */
export function createTestProjectData(overrides: Partial<any> = {}) {
  const timestamp = Date.now()
  return {
    name: `Test Project ${timestamp}`,
    description: 'Test project description',
    type: 'shortDrama',
    status: 'planning',
    episodeRange: '1-10',
    director: 'Test Director',
    ...overrides,
  }
}

/**
 * Generate test shot data
 */
export function createTestShotData(overrides: Partial<any> = {}) {
  return {
    sceneNumber: '1',
    shotSize: 'medium',
    cameraMovement: 'static',
    duration: 5,
    description: 'Test shot description',
    dialogue: 'Test dialogue',
    sound: 'Test sound',
    ...overrides,
  }
}

/**
 * Test user credentials
 */
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@example.com',
    password: 'password',
  },
  member: {
    email: 'member@example.com',
    password: 'password',
  },
}

/**
 * Sample JWT tokens (for testing without auth)
 * In real tests, these would be generated
 */
export const TEST_TOKENS = {
  validAdmin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX9.test',
  validMember: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJtZW1iZXIiLCJlbWFpbCI6Im1lbWJlckBleGFtcGxlLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX9.test',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.expired',
}
