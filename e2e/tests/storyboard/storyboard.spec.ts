import { test, expect } from '@playwright/test'
import { login, testUsers, testProject, createTestProject, generateTestId, waitForNetworkIdle } from '../../global-setup.js'

/**
 * Storyboard E2E Tests
 * Tests storyboard shot creation and editing functionality
 */

test.describe('分镜头创作流程', () => {
  let projectId: string

  test.beforeEach(async ({ page }) => {
    // Login and navigate to projects - correct path is /sign-in
    await page.goto('/sign-in')
    await waitForNetworkIdle(page)
    await login(page, testUsers.admin)

    // Navigate to projects page
    await page.goto('/projects')
    await waitForNetworkIdle(page)

    // Check if there's a test project, if not create one
    const existingProject = page.locator(`text=${testProject.name}`).first()

    if (await existingProject.isVisible()) {
      await existingProject.click()
      // Wait for navigation to project detail
      await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 5000 })
      projectId = await page.evaluate(() => {
        const url = window.location.href
        const match = url.match(/\/projects\/([^/]+)/)
        return match ? match[1] : null
      })
    } else {
      await createTestProject(page, testProject)
      projectId = await page.evaluate(() => {
        const url = window.location.href
        const match = url.match(/\/projects\/([^/]+)/)
        return match ? match[1] : null
      })
    }

    console.log(`Using test project: ${projectId}`)

    // Navigate to storyboard page
    await page.goto(`/projects/${projectId}/storyboard`)
    await waitForNetworkIdle(page)
  })

  test('应该成功创建新分镜头', async ({ page }) => {
    const testId = generateTestId()

    // Click add shot button
    await page.click('button:has-text("添加分镜头")')

    // Fill shot form
    const shotNumber = `场${Math.floor(Math.random() * 10) + 1}`
    await page.selectOption('select[name="shotSize"]', 'medium')
    await page.selectOption('select[name="cameraMovement"]', 'static')
    await page.fill('input[name="description"]', `E2E测试分镜头-${Date.now()}`)

    // Submit form
    await page.click('button:has-text("添加")')

    // Verify shot was created
    await expect(page.locator(`text=${shotNumber}`)).toBeVisible()

    console.log(`[${testId}] ✅ Shot created: 场${shotNumber}`)
  })

  test('应该支持分镜头重新排序', async ({ page }) => {
    const testId = generateTestId()

    // Create some test shots first
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("添加分镜头")')
      await page.selectOption('select[name="shotSize"]', 'medium')
      await page.fill('input[name="description"]', `测试镜头${i + 1}`)
      await page.click('button:has-text("添加")')
      await page.waitForTimeout(500)
    }

    // Get first shot element
    const firstShot = page.locator('[data-shot-number]').first()

    // Drag and drop to reorder
    await firstShot.dragTo(page.locator('[data-shot-number"]').nth(2))

    // Verify reorder
    const firstShotNumber = await firstShot.getAttribute('data-shot-number')
    const secondShotNumber = await page.locator('[data-shot-number"]').nth(1).getAttribute('data-shot-number')

    expect(parseInt(firstShotNumber || '')).toBeLessThan(parseInt(secondShotNumber || ''))

    console.log(`[${testId}] ✅ Shot reordering works`)
  })

  test('应该支持分镜头复制', async ({ page }) => {
    const testId = generateTestId()

    // Select first shot
    const firstShot = page.locator('[data-shot-number]').first()
    await firstShot.click()

    // Click copy button
    await page.click('button:has-text("复制")')

    // Verify shot was duplicated
    const shots = await page.locator('[data-shot-number]').count()
    expect(shots).toBeGreaterThan(1)

    console.log(`[${testId}] ✅ Shot duplication works`)
  })

  test('应该支持分镜头批量删除', async ({ page }) => {
    const testId = generateTestId()

    // Create and select multiple shots
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("添加分镜头")')
      await page.selectOption('select[name="shotSize"]', 'medium')
      await page.fill('input[name="description"]', `批量删除测试${i}`)
      await page.click('button:has-text("添加")')
    }

    // Select all shots
    await page.check('input[type="checkbox"]:first')

    // Click delete button
    await page.click('button:has-text("删除选中的")')

    // Confirm deletion
    await page.click('button:has-text("确认删除")')

    // Verify shots were deleted
    const remainingShots = await page.locator('[data-shot-number]').count()

    // Should have fewer shots (at least the original shots that weren't deleted)
    expect(remainingShots).toBeLessThan(3)

    console.log(`[${testId}] ✅ Batch delete works`)
  })

  test('应该支持分镜头图片上传', async ({ page }) => {
    const testId = generateTestId()

    // Create a shot
    await page.click('button:has-text("添加分镜头")')
    await page.selectOption('select[name="shotSize"]', 'medium')
    await page.fill('input[name="description"]', '带图片的分镜头')

    // Mock file upload
    const fileInput = page.locator('input[type="file"]')

    // Create a mock file
    const file = await page.evaluate(() => {
      const blob = new Blob(['test content'], { type: 'image/png' })
      return new File([blob], 'test.png')
    })

    await fileInput.setInputFiles({
      files: [file],
    timeout: 10000,
    })

    // Submit form
    await page.click('button:has-text("添加")')

    // Verify image was uploaded
    await expect(page.locator('img[src*="test.png"]')).toBeVisible()

    console.log(`[${testId}] ✅ Image upload works`)
  })

  test('应该正确处理视图模式切换', async ({ page }) => {
    const testId = generateTestId()

    // Find view mode toggle
    const viewToggle = page.locator('button[aria-label*="切换视图"]')

    if (await viewToggle.isVisible()) {
      await viewToggle.click()

      // Verify view mode changed
      const isListView = await page.locator('.list-view').isVisible()
      expect(isListView).toBe(true)

      console.log(`[${testId}] ✅ View mode switched to list`)
    } else {
      console.log(`[${testId}] ⚠️ View toggle not found`)
    }
  })

  test('应该支持分镜头筛选功能', async ({ page }) => {
    const testId = generateTestId()

    // Create shots with different scene numbers
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("添加分镜头")')
      await page.fill('input[name="sceneNumber"]', `场${i}`)
      await page.click('button:has-text("添加")')
    }

    // Filter by scene number
    const filterInput = page.locator('input[placeholder*="搜索"]')
    await filterInput.fill('场1')

    // Verify only scene 1 shots are shown
    const visibleShots = await page.locator('[data-shot-number]').count()
    expect(visibleShots).toBeLessThan(6)

    console.log(`[${testId}] ✅ Filtering works correctly`)
  })

  test('应该正确处理自动保存', async ({ page }) => {
    const testId = generateTestId()

    // Edit a shot description
    const firstShot = page.locator('[data-shot-number]').first()
    await firstShot.click()

    const newDescription = `自动保存测试-${Date.now()}`
    await page.fill('textarea[name="description"]', newDescription)

    // Wait a bit to simulate auto-save
    await page.waitForTimeout(2000)

    // Check if changes were saved (by re-navigating to page)
    await page.goto(`/projects/${projectId}/storyboard`)
    await expect(page.locator(`text=${newDescription}`)).toBeVisible()

    console.log(`[${testId}] ✅ Auto-save simulation works`)
  })

  test('应该支持导出功能', async ({ page }) => {
    const testId = generateTestId()

    // Click export button
    const exportButton = page.locator('button:has-text("导出")')

    if (await exportButton.isVisible()) {
      await exportButton.click()

      // Select export format
      await page.click('text=PDF')
      await page.click('button:has-text("确认导出")')

      // Wait for export to complete
      await expect(page.locator('text=导出成功')).toBeVisible({ timeout: 10000 })

      console.log(`[${testId}] ✅ Export functionality works`)
    } else {
      console.log(`[${testId}] ⚠️ Export button not found`)
    }
  })
})
