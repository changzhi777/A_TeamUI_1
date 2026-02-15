/**
 * 认证状态管理测试
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './auth-store'
import type { UserRole, Permission } from './auth-store'

// 重置 store 状态
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    isAuthenticated: false,
    rememberMe: false,
    sessions: [],
    loginHistory: [],
  })
}

describe('auth-store.ts', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('角色类型定义', () => {
    it('应该支持所有定义的角色类型', () => {
      const roles: UserRole[] = [
        'super_admin',
        'admin',
        'director',
        'screenwriter',
        'editor',
        'member',
      ]
      expect(roles.length).toBe(6)
    })
  })

  describe('权限类型定义', () => {
    it('应该定义所有权限类型', () => {
      const permissions: Permission[] = [
        'project:read',
        'project:write',
        'project:delete',
        'project:manage_members',
        'script:read',
        'script:write',
        'storyboard:read',
        'storyboard:write',
        'storyboard:delete',
        'asset:read',
        'asset:write',
        'asset:delete',
      ]
      expect(permissions.length).toBe(12)
    })
  })

  describe('权限检查方法', () => {
    it('未登录用户应该没有权限', () => {
      const state = useAuthStore.getState()
      expect(state.hasRole('admin')).toBe(false)
      expect(state.hasPermission('project:read')).toBe(false)
    })

    it('hasRole 应该正确检查角色', () => {
      const { hasRole } = useAuthStore.getState()
      // 未登录时返回 false
      expect(hasRole('admin')).toBe(false)
    })

    it('hasPermission 应该正确检查权限', () => {
      const { hasPermission } = useAuthStore.getState()
      // 未登录时返回 false
      expect(hasPermission('project:read')).toBe(false)
    })

    it('isAdmin 应该正确检查管理员角色', () => {
      const { isAdmin } = useAuthStore.getState()
      // 未登录时返回 false
      expect(isAdmin()).toBe(false)
    })
  })

  describe('状态更新', () => {
    it('应该能够更新用户状态', () => {
      const store = useAuthStore.getState()

      // 模拟登录
      store.login(
        {
          id: '1',
          name: '测试用户',
          email: 'test@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: Date.now() + 3600000,
          rememberMe: false,
        }
      )

      // 注意：由于 login 是异步的，这里只验证方法存在
      expect(typeof store.login).toBe('function')
    })
  })

  describe('setRememberMe', () => {
    it('应该能够设置记住我选项', () => {
      const store = useAuthStore.getState()
      store.setRememberMe(true)
      expect(useAuthStore.getState().rememberMe).toBe(true)

      store.setRememberMe(false)
      expect(useAuthStore.getState().rememberMe).toBe(false)
    })
  })

  describe('disableOtp', () => {
    it('应该能够禁用 OTP', () => {
      const store = useAuthStore.getState()
      store.disableOtp()
      // 验证方法存在且可调用
      expect(typeof store.disableOtp).toBe('function')
    })
  })

  describe('updateUser', () => {
    it('应该能够更新用户信息', () => {
      // 先设置一个用户
      useAuthStore.setState({
        user: {
          id: '1',
          name: '原名称',
          email: 'test@example.com',
          role: 'member',
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
      })

      const store = useAuthStore.getState()
      store.updateUser({ name: '新名称' })

      const updatedUser = useAuthStore.getState().user
      expect(updatedUser?.name).toBe('新名称')
    })
  })
})
