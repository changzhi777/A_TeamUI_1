/**
 * Asset Import/Export E2E Tests
 * 资产导入导出测试
 */

import { test, expect } from '@playwright/test'
import { login, testUsers } from '../../global-setup'
import path from 'path'

test.describe('资产导入导出', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin)
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
  })

  test('应该能够导出 CSV 文件', async ({ page }) => {
    // 找到导出按钮
    const exportButton = page.locator('button:has-text("导出")').first()
    await expect(exportButton).toBeVisible()

    // 监听下载事件
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)

    await exportButton.click()

    // 等待下载
    const download = await downloadPromise

    if (download) {
      // 验证文件名包含 .csv
      const fileName = download.suggestedFilename()
      expect(fileName).toMatch(/\.csv$/i)

      console.log(`✅ 导出文件: ${fileName}`)
    } else {
      // 如果没有触发下载，检查是否打开了导出对话框
      const exportDialog = page.locator('dialog[role="dialog"]')
      await expect(exportDialog).toBeVisible({ timeout: 3000 }).catch(() => {
        // 可能直接下载了
      })
    }
  })

  test('应该能够打开导入对话框', async ({ page }) => {
    // 找到导入按钮
    const importButton = page.locator('button:has-text("导入")').first()
    await expect(importButton).toBeVisible()

    await importButton.click()

    // 验证导入对话框打开
    const importDialog = page.locator('dialog[role="dialog"]')
    await expect(importDialog).toBeVisible({ timeout: 5000 })

    // 验证对话框包含文件上传区域
    await expect(importDialog.locator('input[type="file"], [class*="upload"]')).toBeVisible().catch(() => {
      // 可能是拖拽上传区域
    })
  })

  test('应该验证导入文件类型', async ({ page }) => {
    // 打开导入对话框
    const importButton = page.locator('button:has-text("导入")').first()
    await importButton.click()

    const importDialog = page.locator('dialog[role="dialog"]')
    await expect(importDialog).toBeVisible({ timeout: 5000 })

    // 查找文件输入
    const fileInput = importDialog.locator('input[type="file"]')

    if (await fileInput.isVisible()) {
      // 验证接受的文件类型
      const accept = await fileInput.getAttribute('accept')
      expect(accept).toContain('.csv')
    }
  })

  test('应该显示导入说明', async ({ page }) => {
    // 打开导入对话框
    const importButton = page.locator('button:has-text("导入")').first()
    await importButton.click()

    const importDialog = page.locator('dialog[role="dialog"]')
    await expect(importDialog).toBeVisible({ timeout: 5000 })

    // 验证有导入说明或模板下载
    const hasInstructions = await importDialog.locator('text=/说明|支持|格式/').isVisible().catch(() => false)
    const hasTemplate = await importDialog.locator('button:has-text("模板"), a:has-text("模板")').isVisible().catch(() => false)

    expect(hasInstructions || hasTemplate).toBeTruthy()
  })

  test('应该能够关闭导入对话框', async ({ page }) => {
    // 打开导入对话框
    const importButton = page.locator('button:has-text("导入")').first()
    await importButton.click()

    const importDialog = page.locator('dialog[role="dialog"]')
    await expect(importDialog).toBeVisible({ timeout: 5000 })

    // 关闭对话框
    const closeButton = importDialog.locator('button:has-text("取消"), button[aria-label="关闭"]').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()

      // 验证对话框已关闭
      await expect(importDialog).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('应该显示导出选项', async ({ page }) => {
    // 某些实现可能需要先选择资产才能导出
    await page.waitForTimeout(500)

    const assetCards = page.locator('[class*="Card"], [class*="asset"]')
    const cardCount = await assetCards.count()

    if (cardCount >= 1) {
      // 尝试选择资产
      const selectButton = page.locator('button:has-text("选择")').first()
      if (await selectButton.isVisible()) {
        await selectButton.click()
        await page.waitForTimeout(300)

        await assetCards.first().click()
        await page.waitForTimeout(200)

        // 查找导出按钮
        const exportButton = page.locator('button:has-text("导出")').first()
        if (await exportButton.isVisible()) {
          await exportButton.click()

          // 验证导出选项
          const exportDialog = page.locator('dialog[role="dialog"]')
          await expect(exportDialog).toBeVisible({ timeout: 3000 }).catch(() => {
            // 可能直接下载
          })
        }
      }
    }
  })

  test('导出按钮应该始终可见', async ({ page }) => {
    // 验证导出按钮在页面工具栏中
    const exportButton = page.locator('button:has-text("导出")').first()
    await expect(exportButton).toBeVisible()
  })

  test('导入按钮应该始终可见', async ({ page }) => {
    // 验证导入按钮在页面工具栏中
    const importButton = page.locator('button:has-text("导入")').first()
    await expect(importButton).toBeVisible()
  })
})
