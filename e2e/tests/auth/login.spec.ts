import { test, expect } from '@playwright/test'
import { login, testUsers, generateTestId, waitForNetworkIdle } from '../../global-setup.js'

/**
 * Authentication E2E Tests
 * Tests user login flow with valid and invalid credentials
 */

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test - correct path is /sign-in
    await page.goto('/sign-in')
    await waitForNetworkIdle(page)
  })

  test('应该成功登录管理员账户', async ({ page }) => {
    const testId = generateTestId()

    await login(page, testUsers.admin)

    // Should be redirected to projects page
    await expect(page).toHaveURL(/\/projects/)

    // Check if we're on a page (not error page)
    const h1Text = await page.locator('h1').first().textContent()
    expect(h1Text).not.toBe('500')
    expect(h1Text).not.toBe('404')

    console.log(`[${testId}] ✅ Admin login successful`)
  })

  test('应该成功登录普通成员账户', async ({ page }) => {
    const testId = generateTestId()

    await login(page, testUsers.member)

    // Should be redirected to projects page
    await expect(page).toHaveURL(/\/projects/)

    // Check if we're on a page (not error page)
    const h1Text = await page.locator('h1').first().textContent()
    expect(h1Text).not.toBe('500')
    expect(h1Text).not.toBe('404')

    console.log(`[${testId}] ✅ Member login successful`)
  })

  test('应该显示登录失败错误 - 错误密码', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/sign-in')
    await waitForNetworkIdle(page)

    // Fill with correct email but wrong password
    await page.fill('input[placeholder="name@example.com"]', testUsers.admin.email)
    await page.fill('input[placeholder="********"]', 'wrongpassword')

    // Submit form - use text content selector
    await page.click('button:has-text("登录")')

    // Wait for error message
    await expect(page.locator('text=邮箱或密码错误')).toBeVisible()

    console.log(`[${testId}] ✅ Login error shown correctly`)
  })

  test('应该显示登录失败错误 - 空密码', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/sign-in')
    await waitForNetworkIdle(page)

    // Submit with empty password
    await page.fill('input[placeholder="name@example.com"]', testUsers.admin.email)
    await page.fill('input[placeholder="********"]', '')
    await page.click('button:has-text("登录")')

    // Check for validation error - check if error message is displayed
    const errorMessage = page.locator('text=请输入您的密码')
    await expect(errorMessage).toBeVisible()

    console.log(`[${testId}] ✅ Password validation works`)
  })

  test('应该记住登录状态', async ({ page }) => {
    const testId = generateTestId()

    // Login as admin
    await page.goto('/sign-in')
    await waitForNetworkIdle(page)
    await login(page, testUsers.admin)

    // After login, we should be on projects page
    await expect(page).toHaveURL(/\/projects/)

    // Refresh the page to verify session persists
    await page.reload()
    await waitForNetworkIdle(page)

    // Should still be on projects page (not redirected to login)
    await expect(page).toHaveURL(/\/projects/)

    console.log(`[${testId}] ✅ Auth state persisted correctly`)
  })

  test('应该支持表单验证', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/sign-in')
    await waitForNetworkIdle(page)

    // Test email validation - check if error message is displayed
    await page.click('button:has-text("登录")')

    const emailError = page.locator('text=请输入您的邮箱')
    await expect(emailError).toBeVisible()

    // Test password validation
    await page.fill('input[placeholder="name@example.com"]', testUsers.admin.email)
    await page.click('button:has-text("登录")')

    const passwordError = page.locator('text=请输入您的密码')
    await expect(passwordError).toBeVisible()

    console.log(`[${testId}] ✅ Form validation works correctly`)
  })

  test('应该支持回车键提交表单', async ({ page }) => {
    const testId = generateTestId()

    await page.goto('/sign-in')
    await waitForNetworkIdle(page)

    // Fill form and press Enter
    await page.fill('input[placeholder="name@example.com"]', testUsers.admin.email)
    await page.fill('input[placeholder="********"]', testUsers.admin.password)

    // Press Enter in password field to submit
    await page.press('input[placeholder="********"]', 'Enter')

    // Should navigate to projects
    await expect(page).toHaveURL(/\/projects/)

    console.log(`[${testId}] ✅ Enter key submission works`)
  })
})
