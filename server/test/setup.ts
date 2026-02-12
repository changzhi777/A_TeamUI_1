/**
 * Test Setup File
 * Global test configuration and fixtures
 */

import { beforeEach, afterEach } from 'vitest'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}

beforeEach(async () => {
  // Setup before each test
  // Reset mocks, clear databases, etc.
})

afterEach(async () => {
  // Cleanup after each test
  // Clear test data, reset connections, etc.
})
