/**
 * users
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserManagementPage } from '@/features/settings/components/user-management-page'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/settings/users')({
  beforeLoad: () => {
    const { user, isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated || !user) {
      throw redirect({ to: '/sign-in', search: { redirect: '/settings/users' } })
    }

    // 仅超级管理员可访问
    if (user.role !== 'super_admin') {
      throw redirect({ to: '/403' })
    }
  },
  component: UserManagementPage,
})
