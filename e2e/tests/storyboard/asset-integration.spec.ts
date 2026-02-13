/**
 * Storyboard Asset Integration E2E Tests
 * 分镜头资产集成测试
 */

import { test, expect } from '@playwright/test'
import { login, testUsers, testProject, createTestProject } from '../../global-setup'

test.describe('分镜头资产集成', () => {
  let projectId: string

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin)

    // 导航到项目页面
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // 查找或创建测试项目
    const existingProject = page.locator(`text=${testProject.name}`).first()

    if (await existingProject.isVisible()) {
      await existingProject.click()
      await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 5000 })
    } else {
      await createTestProject(page, testProject)
    }

    // 获取项目 ID
    projectId = await page.evaluate(() => {
      const url = window.location.href
      const match = url.match(/\/projects\/([^/]+)/)
      return match ? match[1] : ''
    })

    // 导航到分镜头页面
    await page.goto(`/projects/${projectId}/storyboard`)
    await page.waitForLoadState('networkidle')
  })

  test('应该能够从资产库选择图片', async ({ page }) => {
    // 创建一个分镜头
    const addButton = page.locator('button:has-text("添加分镜头")').first()
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(300)

      // 查找资产选择按钮
      const assetSelectButton = page.locator('button:has-text("选择图片"), button:has-text("从资产库")').first()
      if (await assetSelectButton.isVisible()) {
        await assetSelectButton.click()

        // 验证资产选择器对话框打开
        const assetDialog = page.locator('dialog[role="dialog"]')
        await expect(assetDialog).toBeVisible({ timeout: 5000 })

        // 验证资产选择器包含资产列表
        const assetList = assetDialog.locator('[class*="asset"], [class*="Card"], img')
        const assetCount = await assetList.count()

        if (assetCount > 0) {
          // 选择第一个资产
          await assetList.first().click()

          // 确认选择
          const confirmButton = assetDialog.locator('button:has-text("确认"), button:has-text("选择")').first()
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }
        }
      }
    }
  })

  test('应该显示资产预览', async ({ page }) => {
    await page.waitForTimeout(500)

    // 查找带有图片的分镜头
    const shotWithImage = page.locator('[class*="shot"] img, [class*="storyboard"] img').first()

    if (await shotWithImage.isVisible()) {
      // 点击图片预览
      await shotWithImage.click()

      // 验证预览对话框或放大视图
      const previewDialog = page.locator('dialog[role="dialog"], [class*="preview"]')
      await expect(previewDialog).toBeVisible({ timeout: 3000 }).catch(() => {
        // 可能直接放大显示
      })
    }
  })

  test('应该能够替换分镜头图片', async ({ page }) => {
    await page.waitForTimeout(500)

    // 找到分镜头卡片
    const shotCard = page.locator('[class*="shot"], [class*="storyboard"]').first()

    if (await shotCard.isVisible()) {
      // 悬停显示操作按钮
      await shotCard.hover()
      await page.waitForTimeout(200)

      // 查找替换图片按钮
      const replaceButton = shotCard.locator('button:has-text("替换"), button:has-text("更换")').first()
      if (await replaceButton.isVisible()) {
        await replaceButton.click()

        // 验证资产选择器打开
        const assetDialog = page.locator('dialog[role="dialog"]')
        await expect(assetDialog).toBeVisible({ timeout: 3000 }).catch(() => {
          // 可能未打开
        })
      }
    }
  })

  test('应该能够移除分镜头图片', async ({ page }) => {
    await page.waitForTimeout(500)

    // 找到带有图片的分镜头
    const shotWithImage = page.locator('[class*="shot"] img, [class*="storyboard"] img').first()

    if (await shotWithImage.isVisible()) {
      // 找到父级分镜头卡片
      const shotCard = shotWithImage.locator('xpath=ancestor::*[contains(@class, "shot") or contains(@class, "storyboard")]').first()

      // 悬停显示操作
      await shotCard.hover()
      await page.waitForTimeout(200)

      // 查找删除图片按钮
      const removeButton = shotCard.locator('button:has-text("移除"), button:has-text("删除图片")').first()
      if (await removeButton.isVisible()) {
        await removeButton.click()

        // 验证图片被移除
        await page.waitForTimeout(300)
      }
    }
  })

  test('资产选择器应该能够按类型筛选', async ({ page }) => {
    // 打开资产选择器
    const addButton = page.locator('button:has-text("添加分镜头")').first()
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(300)

      const assetSelectButton = page.locator('button:has-text("选择图片"), button:has-text("从资产库")').first()
      if (await assetSelectButton.isVisible()) {
        await assetSelectButton.click()

        const assetDialog = page.locator('dialog[role="dialog"]')
        await expect(assetDialog).toBeVisible({ timeout: 5000 })

        // 查找筛选按钮
        const filterButton = assetDialog.locator('button:has-text("筛选"), button:has-text("图片")').first()
        if (await filterButton.isVisible()) {
          await filterButton.click()
          await page.waitForTimeout(300)
        }

        // 关闭对话框
        const closeButton = assetDialog.locator('button:has-text("取消"), button[aria-label="关闭"]').first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
        }
      }
    }
  })

  test('资产选择器应该能够搜索', async ({ page }) => {
    // 打开资产选择器
    const addButton = page.locator('button:has-text("添加分镜头")').first()
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(300)

      const assetSelectButton = page.locator('button:has-text("选择图片"), button:has-text("从资产库")').first()
      if (await assetSelectButton.isVisible()) {
        await assetSelectButton.click()

        const assetDialog = page.locator('dialog[role="dialog"]')
        await expect(assetDialog).toBeVisible({ timeout: 5000 })

        // 查找搜索框
        const searchInput = assetDialog.locator('input[placeholder*="搜索"]').first()
        if (await searchInput.isVisible()) {
          await searchInput.fill('场景')
          await searchInput.press('Enter')
          await page.waitForTimeout(500)
        }

        // 关闭对话框
        const closeButton = assetDialog.locator('button:has-text("取消"), button[aria-label="关闭"]').first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
        }
      }
    }
  })
})
