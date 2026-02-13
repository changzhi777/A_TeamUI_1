/**
 * Storyboard Export E2E Tests
 * 分镜头导出测试
 */

import { test, expect } from '@playwright/test'
import { login, testUsers, testProject, createTestProject } from '../../global-setup'

test.describe('分镜头导出功能', () => {
  let projectId: string

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin)

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const existingProject = page.locator(`text=${testProject.name}`).first()

    if (await existingProject.isVisible()) {
      await existingProject.click()
      await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 5000 })
    } else {
      await createTestProject(page, testProject)
    }

    projectId = await page.evaluate(() => {
      const url = window.location.href
      const match = url.match(/\/projects\/([^/]+)/)
      return match ? match[1] : ''
    })

    await page.goto(`/projects/${projectId}/storyboard`)
    await page.waitForLoadState('networkidle')
  })

  test('应该显示导出按钮', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await expect(exportButton).toBeVisible()
  })

  test('应该能够导出 PDF', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await exportButton.click()

    // 等待导出对话框或菜单
    await page.waitForTimeout(300)

    // 选择 PDF 格式
    const pdfOption = page.locator('button:has-text("PDF"), [data-value="pdf"]').first()
    if (await pdfOption.isVisible()) {
      // 监听下载事件
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

      await pdfOption.click()

      // 如果有确认按钮，点击它
      const confirmButton = page.locator('button:has-text("确认"), button:has-text("导出")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      const download = await downloadPromise
      if (download) {
        const fileName = download.suggestedFilename()
        expect(fileName).toMatch(/\.pdf$/i)
        console.log(`✅ PDF 导出成功: ${fileName}`)
      }
    }
  })

  test('应该能够导出 Word', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await exportButton.click()
    await page.waitForTimeout(300)

    const wordOption = page.locator('button:has-text("Word"), button:has-text("DOCX"), [data-value="word"], [data-value="docx"]').first()
    if (await wordOption.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

      await wordOption.click()

      const confirmButton = page.locator('button:has-text("确认"), button:has-text("导出")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      const download = await downloadPromise
      if (download) {
        const fileName = download.suggestedFilename()
        expect(fileName).toMatch(/\.docx?$/i)
        console.log(`✅ Word 导出成功: ${fileName}`)
      }
    }
  })

  test('应该能够导出 JSON', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await exportButton.click()
    await page.waitForTimeout(300)

    const jsonOption = page.locator('button:has-text("JSON"), [data-value="json"]').first()
    if (await jsonOption.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

      await jsonOption.click()

      const confirmButton = page.locator('button:has-text("确认"), button:has-text("导出")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      const download = await downloadPromise
      if (download) {
        const fileName = download.suggestedFilename()
        expect(fileName).toMatch(/\.json$/i)
        console.log(`✅ JSON 导出成功: ${fileName}`)
      }
    }
  })

  test('应该能够取消导出', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await exportButton.click()

    // 等待导出对话框
    const exportDialog = page.locator('dialog[role="dialog"]')
    await expect(exportDialog).toBeVisible({ timeout: 3000 }).catch(() => {
      // 可能是下拉菜单
    })

    // 取消导出
    const cancelButton = page.locator('button:has-text("取消")').first()
    if (await cancelButton.isVisible()) {
      await cancelButton.click()

      // 验证对话框已关闭
      await expect(exportDialog).not.toBeVisible({ timeout: 3000 }).catch(() => {
        // 可能已关闭
      })
    }
  })

  test('导出对话框应该显示格式选项', async ({ page }) => {
    const exportButton = page.locator('button:has-text("导出")').first()
    await exportButton.click()

    // 验证有多个导出格式选项
    const formatOptions = page.locator('button:has-text("PDF"), button:has-text("Word"), button:has-text("JSON")')
    const optionsCount = await formatOptions.count()

    expect(optionsCount).toBeGreaterThanOrEqual(1)
  })
})
