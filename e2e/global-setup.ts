import { type FullConfig } from '@playwright/test'

/**
 * Global E2E Test Setup
 * Configure test data, mocks, and utilities
 */

// Test users
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'password',
    name: '管理员用户',
  },
  member: {
    email: 'member@example.com',
    password: 'password',
    name: '普通成员用户',
  },
}

// Test project data
export const testProject = {
  name: 'E2E测试项目',
  description: '这是一个用于端到端测试的项目',
  type: 'shortDrama' as const,
  status: 'planning' as const,
}

// Test credentials storage
const usedAuthTokens = new Set<string>()

/**
 * Setup function to configure test environment
 */
export default async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...')

  // Set default timeout for all actions
  config.defaultTimeout = 10000

  console.log('✅ E2E global setup completed')
}

/**
 * Teardown function to clean up after tests
 */
export async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...')

  // Clear stored auth tokens
  usedAuthTokens.clear()

  console.log('✅ E2E global teardown completed')
}

/**
 * Helper to store auth token for cleanup
 */
export function storeAuthToken(token: string): void {
  usedAuthTokens.add(token)
}

/**
 * Helper to check if token was used
 */
export function wasAuthTokenUsed(token: string): boolean {
  return usedAuthTokens.has(token)
}

/**
 * Generate test data helper
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(): Promise<void> {
  // Wait for any pending network requests to complete
  await new Promise(resolve => setTimeout(resolve, 500))
}

/**
 * Retry helper
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000 } = options

  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      console.warn(`Retry ${i + 1}/${retries} for failed operation`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Operation failed after ${retries} retries`)
}

/**
 * Login helper
 */
export async function login(
  page: import('@playwright/test').Page,
  user: typeof testUsers.admin | typeof testUsers.member
): Promise<void> {
  const { email, password } = user

  // Navigate to login page - correct path is /sign-in
  await page.goto('/sign-in')
  await page.waitForLoadState('networkidle')

  // Fill login form - use placeholder selectors since react-hook-form doesn't use name attribute
  await page.fill('input[placeholder="name@example.com"]', email)
  await page.fill('input[placeholder="********"]', password)

  // Submit form - click the login button (contains text "登录")
  await page.click('button:has-text("登录")')

  // Wait for navigation to projects page
  await page.waitForURL(/\/projects/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  console.log(`✅ Logged in as ${email}`)
}

/**
 * Create test project helper
 */
export async function createTestProject(
  page: import('@playwright/test').Page,
  projectName?: string
): Promise<void> {
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')

  // Click new project button
  await page.click('button:has-text("创建新项目")')
  await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

  // Fill project form
  const name = projectName || testProject.name
  await page.fill('input[name="name"]', name)
  await page.fill('textarea[name="description"]', testProject.description)

  // Select type
  await page.click('button:has-text("选择类型")')
  await page.click(`button[data-value="${testProject.type}"]`)

  // Submit form
  await page.click('button:has-text("创建")')
  await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  console.log(`✅ Created project: ${name}`)
}

/**
 * Helper to take screenshot on failure
 */
export async function takeScreenshot(page: import('@playwright/test').Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const screenshotPath = `test-screenshots/failure-${testName}-${timestamp}.png`
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`📸 Screenshot saved: ${screenshotPath}`)
}
