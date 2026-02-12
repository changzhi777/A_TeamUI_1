import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authApi } from '@/lib/api/auth'
import type { TokenResponse } from '@/lib/types/api'

// 用户角色定义（扩展）
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'auditor'
  | 'director'
  | 'screenwriter'
  | 'editor'
  | 'member'

// 资源权限类型
export type Permission =
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'project:manage_members'
  | 'script:read'
  | 'script:write'
  | 'storyboard:read'
  | 'storyboard:write'
  | 'storyboard:delete'

// 会话信息
export interface Session {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  createdAt: string
  lastActive: string
  isCurrent: boolean
}

// 登录历史记录
export interface LoginHistory {
  id: string
  timestamp: string
  device: string
  browser: string
  location: string
  ip: string
  isAnomalous: boolean
}

// 用户定义
export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: string
  // 新增字段
  phone?: string
  bio?: string
  isEmailVerified?: boolean
  isOtpEnabled?: boolean
  otpSecret?: string
  recoveryCodes?: string[]
  // 特殊权限（覆盖角色权限）
  specialPermissions?: Record<string, Permission[]>
}

// Token 信息
export interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresAt: number
  rememberMe: boolean
}

// 认证状态（更新为 API 调用模式）
interface AuthState {
  // 当前用户
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  tokenExpiresAt: number | null
  isAuthenticated: boolean
  rememberMe: boolean

  // 会话和安全
  sessions: Session[]
  loginHistory: LoginHistory[]

  // 登录/登出
  login: (user: AuthUser, tokenInfo: TokenInfo) => Promise<void>
  logout: () => Promise<void>

  // 注册
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>

  // Token 管理
  setRememberMe: (remember: boolean) => void

  // 密码重置
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  newPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>

  // OTP
  sendOtp: () => Promise<{ success: boolean; error?: string }>
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>
  enableOtp: (code: string) => Promise<{ success: boolean; recoveryCodes?: string[]; error?: string }>
  disableOtp: () => void

  // 用户信息更新
  updateUser: (updates: Partial<AuthUser>) => void
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>

  // 会话管理
  addSession: (session: Session) => void
  removeSession: (sessionId: string) => void
  removeAllOtherSessions: () => void
  addLoginHistory: (history: LoginHistory) => void

  // 权限检查（扩展）
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  hasPermission: (permission: Permission, resourceId?: string) => boolean
  hasAllPermissions: (permissions: Permission[], resourceId?: string) => boolean
  hasAnyPermission: (permissions: Permission[], resourceId?: string) => boolean
  isAdmin: () => boolean
  canEditProject: (projectOwnerId: string) => boolean
  canDeleteProject: (projectOwnerId: string) => boolean
  canManageMembers: (projectOwnerId: string) => boolean
}

// 角色权限映射
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'project:read',
    'project:write',
    'project:delete',
    'project:manage_members',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  admin: [
    'project:read',
    'project:write',
    'project:delete',
    'project:manage_members',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  auditor: [
    'project:read',
    'project:write',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
  ],
  director: [
    'project:read',
    'project:write',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  screenwriter: ['project:read', 'script:read', 'script:write'],
  editor: ['project:read', 'storyboard:read', 'storyboard:write', 'storyboard:delete'],
  member: ['project:read', 'script:read', 'storyboard:read'],
}

// 角色层级（用于权限继承）
const roleHierarchy: Record<UserRole, number> = {
  super_admin: 7,
  admin: 6,
  auditor: 5,
  director: 4,
  screenwriter: 3,
  editor: 2,
  member: 1,
} as const;

// 使用 API 的 auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      rememberMe: false,
      sessions: [],
      loginHistory: [],

      // 登录
      login: async (user, tokenInfo) => {
        const maxAge = tokenInfo.rememberMe ? 90 * 24 * 60 * 60 : 30 * 24 * 60 * 60

        // 设置 Cookie（同时设置 access_token 和 refresh_token）
        setCookie('access_token', JSON.stringify(tokenInfo.accessToken), maxAge)
        setCookie('refresh_token', JSON.stringify(tokenInfo.refreshToken), maxAge)

        // 添加当前会话
        const currentSession: Session = {
          id: `session-${Date.now()}`,
          device: 'Current Device',
          browser: 'Current Browser',
          location: 'Local',
          ip: '127.0.0.1',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isCurrent: true,
        }

        set({
          user,
          accessToken: tokenInfo.accessToken,
          refreshToken: tokenInfo.refreshToken,
          tokenExpiresAt: tokenInfo.expiresAt,
          isAuthenticated: true,
          rememberMe: tokenInfo.rememberMe,
          sessions: [currentSession],
        })
      },

      // 登出
      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }

        // 清除 Cookie
        removeCookie('access_token')
        removeCookie('refresh_token')

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          isAuthenticated: false,
          sessions: [],
        })
      },

      // 注册
      register: async (email, password, name) => {
        try {
          const response = await authApi.register({ name, email, password })
          return { success: true, user: response.user }
        } catch (error) {
          console.error('Registration error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          }
        }
      },

      // Token 刷新
      refreshToken: async () => {
        const { refreshToken: currentRefreshToken } = get()

        if (!currentRefreshToken || !user) {
          return false
        }

        try {
          const response = await authApi.refreshToken(currentRefreshToken)

          const maxAge = get().rememberMe ? 90 * 24 * 60 * 60 : 30 * 24 * 60 * 60

          setCookie('access_token', JSON.stringify(response.accessToken), maxAge)
          setCookie('refresh_token', JSON.stringify(response.refreshToken), maxAge)

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            tokenExpiresAt: response.expiresAt,
          })

          return true
        } catch (error) {
          console.error('Token refresh error:', error)

          // 刷新失败，登出用户
          get().logout()
          return false
        }
      },

      setRememberMe: (remember) => {
        set({ rememberMe: remember })
      },

      // 密码重置
      resetPassword: async (email) => {
        try {
          await authApi.forgotPassword(email)
          return { success: true }
        } catch (error) {
          console.error('Reset password error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Reset failed',
          }
        }
      },

      newPassword: async (token, newPassword) => {
        try {
          await authApi.resetPassword(token, newPassword)
          return { success: true }
        } catch (error) {
          console.error('New password error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Password reset failed',
          }
        }
      },

      // OTP
      sendOtp: async () => {
        try {
          await authApi.sendOtp()
          return { success: true }
        } catch (error) {
          console.error('Send OTP error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send OTP',
          }
        }
      },

      verifyOtp: async (code) => {
        try {
          await authApi.verifyOtp(code)
          return { success: true }
        } catch (error) {
          console.error('Verify OTP error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'OTP verification failed',
          }
        }
      },

      enableOtp: async (code) => {
        try {
          const result = await authApi.enableOtp(code)
          return { success: true, recoveryCodes: result.recoveryCodes || [] }
        } catch (error) {
          console.error('Enable OTP error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to enable OTP',
          }
        }
      },

      disableOtp: () => {
        try {
          // TODO: API 调用
          set({
            user: get().user
              ? {
                  ...get().user,
                  isOtpEnabled: false,
                  otpSecret: undefined,
                  recoveryCodes: undefined,
                }
              : undefined,
          })
        } catch (error) {
          console.error('Disable OTP error:', error)
        }
      },

      // 用户信息更新
      updateUser: async (updates) => {
        try {
          const { user } = get()
          if (user) {
            set({ user: { ...user, ...updates } })
          }
          return { success: true }
        } catch (error) {
          console.error('Update user error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Update failed',
          }
        }
      },

      updateProfile: async (updates) => {
        try {
          await authApi.updateProfile(updates)
          return { success: true }
        } catch (error) {
          console.error('Update profile error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Update failed',
          }
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          await authApi.changePassword({ oldPassword, newPassword })
          return { success: true }
        } catch (error) {
          console.error('Change password error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Password change failed',
          }
        }
      },

      // 会话管理
      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session],
        }))
      },

      removeSession: async (sessionId) => {
        try {
          await authApi.revokeSession(sessionId)

          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== sessionId),
          }))
        } catch (error) {
          console.error('Remove session error:', error)
        }
      },

      removeAllOtherSessions: async () => {
        const { sessions } = get()
        const otherSessions = sessions.filter((s) => !s.isCurrent)

        for (const session of otherSessions) {
          try {
            await authApi.revokeSession(session.id)
          } catch (error) {
            console.error('Remove session error:', error)
          }
        }

        // 只保留当前会话
        set({
          sessions: sessions.filter((s) => s.isCurrent),
        })
      },

      addLoginHistory: (history) => {
        set((state) => ({
          loginHistory: [history, ...state.loginHistory].slice(0, 30), // 只保留最近 30 条
        }))
      },

      // 权限检查方法
      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      hasAnyRole: (roles) => {
        const { user } = get()
        return user ? roles.includes(user.role) : false
      },

      hasPermission: (permission, resourceId) => {
        const { user } = get()

        if (!user) return false

        // 检查特殊权限
        if (resourceId && user.specialPermissions?.[resourceId]?.includes(permission)) {
          return true
        }

        // 检查角色权限
        const permissions = rolePermissions[user.role] || []
        return permissions.includes(permission)
      },

      hasAllPermissions: (permissions, resourceId) => {
        return permissions.every((p) => get().hasPermission(p, resourceId))
      },

      hasAnyPermission: (permissions, resourceId) => {
        return permissions.some((p) => get().hasPermission(p, resourceId))
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin' || user?.role === 'super_admin'
      },

      canEditProject: (projectOwnerId) => {
        const { user } = get()
        if (!user) return false

        // super_admin 和 admin 可以编辑所有项目
        if (user.role === 'super_admin' || user.role === 'admin') return true

        // director 可以编辑项目信息
        if (user.role === 'director') return true

        // 项目创建者可以编辑
        return user.id === projectOwnerId
      },

      canDeleteProject: (projectOwnerId) => {
        const { user } = get()
        if (!user) return false

        // 只有 super_admin 和 admin 可以删除项目
        return user.role === 'super_admin' || user.role === 'admin'
      },

      canManageMembers: (projectOwnerId) => {
        const { user } = get()
        if (!user) return false

        // super_admin 和 admin 可以管理成员
        if (user.role === 'super_admin' || user.role === 'admin') return true

        // 项目创建者可以管理成员
        return user.id === projectOwnerId
      },
    }),
    {
      name: 'auth-storage',
      // 只持久化必要的状态
      partialize: (state) =>
        Object.keys(state).filter((key) =>
          key !== 'sessions' && key !== 'loginHistory'
        ) as Array<keyof typeof state>,
    }
  )
)

// 辅助函数：模拟登录（保留用于测试）
export function mockLogin(
  email: string,
  password: string,
  rememberMe = false
): {
  success: boolean
  user?: AuthUser
  tokenInfo?: TokenInfo
  error?: string
} {
  // 演示账号列表（用于测试和演示）
  const demoUsers: Record<string, { password: string; user: AuthUser }> = {
    'root@aizfl.cn': {
      password: 'Q1w2e3r4+',
      user: {
        id: '1',
        name: '超级管理员',
        email: 'root@aizfl.cn',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      },
    },
    'admin@aizfl.cn': {
      password: '12345678',
      user: {
        id: '2',
        name: '管理员用户',
        email: 'admin@aizfl.cn',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    },
    'admin@example.com': {
      password: 'password',
      user: {
        id: '2',
        name: '管理员用户',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    },
    'auditor@aizfl.cn': {
      password: 'password',
      user: {
        id: '3',
        name: '审核员',
        email: 'auditor@aizfl.cn',
        role: 'auditor',
        createdAt: new Date().toISOString(),
      },
    },
    'dy@aizfl.cn': {
      password: 'password',
      user: {
        id: '4',
        name: 'A导演',
        email: 'dy@aizfl.cn',
        role: 'director',
        createdAt: new Date().toISOString(),
      },
    },
    'bj@aizfl.cn': {
      password: 'password',
      user: {
        id: '5',
        name: 'B编剧',
        email: 'bj@aizfl.cn',
        role: 'screenwriter',
        createdAt: new Date().toISOString(),
      },
    },
    'jj@aizfl.cn': {
      password: 'password',
      user: {
        id: '6',
        name: 'C剪辑师',
        email: 'jj@aizfl.cn',
        role: 'editor',
        createdAt: new Date().toISOString(),
      },
    },
    'user@aizfl.cn': {
      password: 'password',
      user: {
        id: '7',
        name: '普通成员',
        email: 'user@aizfl.cn',
        role: 'member',
        createdAt: new Date().toISOString(),
      },
    },
    'member@example.com': {
      password: 'password',
      user: {
        id: '7',
        name: '普通成员用户',
        email: 'member@example.com',
        role: 'member',
        createdAt: new Date().toISOString(),
      },
    },
  }

  const demoUser = demoUsers[email]

  if (!demoUser) {
    return {
      success: false,
      error: '邮箱或密码错误',
    }
  }

  if (demoUser.password !== password) {
    return {
      success: false,
      error: '邮箱或密码错误',
    }
  }

  // 生成模拟 token
  const tokenInfo: TokenInfo = {
    accessToken: `mock_access_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 小时
    rememberMe,
  }

  return {
    success: true,
    user: demoUser.user,
    tokenInfo,
  }
}

// 辅助函数：获取模拟用户列表（保留用于兼容性）
export function getMockUsers(): AuthUser[] {
  console.warn(
    'getMockUsers() is deprecated. Users are now managed by the backend.'
  )

  return []
}

// 权限 Hook
export function usePermissions() {
  const { user, hasRole, hasPermission, isAdmin, canEditProject, canDeleteProject, canManageMembers } =
    useAuthStore()

  return {
    user,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: isAdmin(),
    isAuditor: hasRole('auditor'),
    isDirector: hasRole('director'),
    isScreenwriter: hasRole('screenwriter'),
    isEditor: hasRole('editor'),
    isMember: hasRole('member'),
    hasPermission,
    canEditProject,
    canDeleteProject,
    canManageMembers,
  }
}
