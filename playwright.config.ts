import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * E2E Test Configuration
 * Tests the complete user flow from login to project management
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'], // Show test results in terminal
    ['json', { outputFile: 'test-results.json' }], // Save test results as JSON
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
    },
  ],

  webServer: {
    command: `pnpm run dev --port 5174`,
    port: 5174,
    timeout: 120 * 1000, // 2 minutes
    reuseExistingServer: !process.env.CI,
  },

  // Global setup and timeout
  globalSetup: resolve(__dirname, './e2e/global-setup.ts'),
  globalTimeout: 60 * 1000, // 60 seconds per test
})
