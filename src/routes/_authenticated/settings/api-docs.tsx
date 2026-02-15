/**
 * api-docs
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * API Docs Route
 * API 文档路由 - 仅管理员可访问
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ApiDocsPage } from '@/features/settings/api/api-docs-page'

// 搜索参数类型
type ApiDocsSearch = {
  tab?: string
}

export const Route = createFileRoute('/_authenticated/settings/api-docs')({
  validateSearch: (search: Record<string, unknown>): ApiDocsSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : undefined,
    }
  },
  beforeLoad: () => {
    // 权限检查 - 仅管理员可访问
    const { user, isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated || !user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/settings/api-docs',
        },
      })
    }

    // 检查是否是管理员角色
    const adminRoles = ['super_admin', 'admin', 'director']
    if (!adminRoles.includes(user.role)) {
      throw redirect({
        to: '/settings',
        search: {
          error: 'permission_denied',
        },
      })
    }
  },
  component: ApiDocsPage,
})
