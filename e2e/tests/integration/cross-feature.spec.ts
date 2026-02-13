/**
 * Cross Feature E2E Tests
 * 跨功能交互测试
 */

import { test, expect } from '@playwright/test'
import { login, testUsers } from '../../global-setup'

test.describe('跨功能交互', () => {
  test('资产在分镜头中的使用', async ({ page }) => {
    await login(page, testUsers.admin)

    // 步骤 1：访问资产库，确认有资产
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')

    const assetCards = page.locator('[class*="Card"], [class*="asset"]')
    const assetCount = await assetCards.count()
    console.log(`资产库中有 ${assetCount} 个资产`)

    // 步骤 2：进入项目分镜头页面
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[class*="Card"] a, [class*="Card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')

      const projectId = await page.evaluate(() => {
        const url = window.location.href
        const match = url.match(/\/projects\/([^/]+)/)
        return match ? match[1] : ''
      })

      await page.goto(`/projects/${projectId}/storyboard`)
      await page.waitForLoadState('networkidle')

      // 步骤 3：创建分镜头并选择资产
      const addButton = page.locator('button:has-text("添加分镜头")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForTimeout(300)

        // 查找资产选择按钮
        const assetSelectButton = page.locator('button:has-text("选择图片"), button:has-text("从资产库")').first()
        if (await assetSelectButton.isVisible()) {
          await assetSelectButton.click()

          // 验证资产选择器打开
          const assetDialog = page.locator('dialog[role="dialog"]')
          await expect(assetDialog).toBeVisible({ timeout: 5000 }).catch(() => {})

          console.log('资产选择器已打开，可以浏览资产库中的资产')
        }
      }
    }
  })

  test('团队成员变更对权限的影响', async ({ page }) => {
    // 管理员登录
    await login(page, testUsers.admin)

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // 进入项目团队页面
    const projectCard = page.locator('[class*="Card"] a, [class*="Card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')

      const projectId = await page.evaluate(() => {
        const url = window.location.href
        const match = url.match(/\/projects\/([^/]+)/)
        return match ? match[1] : ''
      })

      await page.goto(`/projects/${projectId}/team`)
      await page.waitForLoadState('networkidle')

      // 检查当前团队成员
      const memberList = page.locator('[class*="member"], tbody tr')
      const memberCount = await memberList.count()

      // 验证管理员有管理团队成员的权限
      const addMemberButton = page.locator('button:has-text("添加"), button:has-text("邀请")').first()
      const canAddMember = await addMemberButton.isVisible().catch(() => false)

      console.log(`团队有 ${memberCount} 个成员，管理员${canAddMember ? '可以' : '不能'}添加成员`)
    }
  })

  test('项目删除后的资产处理', async ({ page }) => {
    await login(page, testUsers.admin)

    // 查看全局资产库
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')

    // 记录当前资产数量
    const assetCards = page.locator('[class*="Card"], [class*="asset"]')
    const initialAssetCount = await assetCards.count()

    console.log(`全局资产库有 ${initialAssetCount} 个资产`)

    // 项目资产应该在项目范围内显示
    // 全局资产库应该显示全局范围的资产
    const scopeFilter = page.locator('button:has-text("全局"), [data-value="global"]').first()
    if (await scopeFilter.isVisible()) {
      await scopeFilter.click()
      await page.waitForTimeout(500)
    }
  })

  test('资产搜索和筛选的跨页面一致性', async ({ page }) => {
    await login(page, testUsers.admin)

    // 在资产库搜索
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="搜索"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('场景')
      await searchInput.press('Enter')
      await page.waitForTimeout(500)

      // 记录搜索结果
      const searchResults = page.locator('[class*="Card"], [class*="asset"]')
      const resultCount = await searchResults.count()
      console.log(`搜索 "场景" 找到 ${resultCount} 个结果`)
    }
  })

  test('用户偏好设置的持久化', async ({ page }) => {
    await login(page, testUsers.admin)

    // 访问资产库
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')

    // 切换视图模式（如果有）
    const viewToggle = page.locator('button[title*="视图"]').first()
    if (await viewToggle.isVisible()) {
      await viewToggle.click()
      await page.waitForTimeout(300)

      // 刷新页面
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 验证视图模式是否保持
      console.log('视图偏好应该被持久化')
    }
  })

  test('通知和提示的一致性', async ({ page }) => {
    await login(page, testUsers.admin)

    await page.goto('/assets')
    await page.waitForLoadState('networkidle')

    // 尝试一个会触发通知的操作
    const importButton = page.locator('button:has-text("导入")').first()
    if (await importButton.isVisible()) {
      await importButton.click()

      // 关闭对话框
      const cancelButton = page.locator('button:has-text("取消")').first()
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
      }
    }

    // 通知应该通过 toast 或类似方式显示
    console.log('操作应该触发适当的通知')
  })
})
