import { test, expect } from '@playwright/test'
import { login, testUsers, testProject, generateTestId, waitForNetworkIdle, createTestProject } from '../../global-setup.js'

/**
 * Project Creation E2E Tests
 * Tests creating a new project from the projects page
 */

test.describe('项目创建流程', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test - correct path is /sign-in
    await page.goto('/sign-in')
    await waitForNetworkIdle(page)
    await login(page, testUsers.admin)
  })

  test('应该成功创建新项目', async ({ page }) => {
    const testId = generateTestId()

    // Navigate to projects page
    await page.goto('/projects')
    await waitForNetworkIdle(page)

    // Click new project button - find button containing Plus icon
    const createButton = page.locator('button:has(svg.lucide-plus)').first()
    await createButton.click()
    await page.waitForTimeout(1000) // Wait for dialog animation

    // Fill project form - use id attribute
    const projectName = `E2E测试项目-${Date.now()}`
    await page.fill('#name', projectName)
    // Skip type selection - default value is fine

    // Submit form - use submit button type
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })

    // Verify project was created
    await expect(page.locator(`text=${projectName}`)).toBeVisible()

    console.log(`[${testId}] ✅ Project created successfully: ${projectName}`)
  })

  test('应该显示项目表单验证错误', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/projects')
    await waitForNetworkIdle(page)

    // Click new project without filling name
    await page.click('button:has-text("创建新项目")')
    await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

    // Try to submit without name
    await page.click('button:has-text("创建")')

    // Should show validation error
    await expect(page.locator('text=项目名称不能为空')).toBeVisible()

    console.log(`[${testId}] ✅ Validation error shown correctly`)
  })

  test('应该支持取消项目创建', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/projects')
    await waitForNetworkIdle(page)

    // Open and cancel dialog
    await page.click('button:has-text("创建新项目")')
    await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

    // Press Escape or click cancel button
    await page.keyboard.press('Escape')

    // Dialog should close
    await expect(page.locator('dialog[role="dialog"]')).not.toBeVisible()

    console.log(`[${testId}] ✅ Dialog cancellation works`)
  })

  test('应该成功创建不同类型的项目', async ({ page, context }) => {
    const testId = generateTestId()

    await page.goto('/projects')
    await waitForNetworkIdle(page)

    // Test different project types
    const projectTypes = ['realLifeDrama', 'aiPodcast', 'advertisement']

    for (const type of projectTypes) {
      await page.click('button:has-text("创建新项目")')
      await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

      const typeName = type === 'realLifeDrama' ? '真人剧' :
                      type === 'aiPodcast' ? 'AI播客' : '广告'

      await page.selectOption(`select[name="type"]`, type)
      await page.fill('input[name="name"]', `E2E测试-${typeName}-${Date.now()}`)
      await page.click('button:has-text("创建")')

      // Wait for success and dialog to close
      await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Verify project appears in list
      await expect(page.locator(`text=E2E测试-${typeName}`)).toBeVisible()
    }

    console.log(`[${testId}] ✅ Created ${projectTypes.length} projects with different types`)
  })

  test('应该支持项目收藏功能', async ({ page }) => {
    const testId = generateTestId()

    // Create a project first
    await page.goto('/projects')
    await page.click('button:has-text("创建新项目")')
    await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

    const projectName = `收藏测试-${Date.now()}`
    await page.fill('input[name="name"]', projectName)
    await page.click('button:has-text("创建")')
    await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })

    // Find and click favorite button
    const projectCard = page.locator(`text=${projectName}`).locator('..').locator('button[aria-label*="收藏"]')
    await projectCard.click()

    // Verify favorite state changed
    await expect(projectCard).toHaveAttribute('data-favorite', 'true')

    console.log(`[${testId}] ✅ Project favorite toggle works`)
  })

  test('应该支持项目置顶功能', async ({ page }) => {
    const testId = generateTestId()

    // Create a project first
    await page.goto('/projects')
    await page.click('button:has-text("创建新项目")')
    await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })

    const projectName = `置顶测试-${Date.now()}`
    await page.fill('input[name="name"]', projectName)
    await page.click('button:has-text("创建")')
    await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })

    // Find and click pin button
    const projectCard = page.locator(`text=${projectName}`).locator('..').locator('button[aria-label*="置顶"]')
    await projectCard.click()

    // Verify pin state changed
    await expect(projectCard).toHaveAttribute('data-pinned', 'true')

    console.log(`[${testId}] ✅ Project pin toggle works`)
  })

  test('应该正确处理项目删除', async ({ page }) => {
    const testId = generateTestId()

    // Create a project to delete
    const projectName = `待删除项目-${Date.now()}`
    await page.goto('/projects')
    await page.click('button:has-text("创建新项目")')
    await page.waitForSelector('dialog[role="dialog"]', { timeout: 5000 })
    await page.fill('input[name="name"]', projectName)
    await page.click('button:has-text("创建")')
    await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })

    // Open project menu and click delete
    const projectCard = page.locator(`text=${projectName}`)
    await projectCard.click()
    await page.click('button:has-text("删除")')

    // Confirm deletion in dialog
    await page.click('button:has-text("确认")')

    // Verify project is removed
    await expect(page.locator(`text=${projectName}`)).not.toBeVisible()

    console.log(`[${testId}] ✅ Project deletion works`)
  })
})
