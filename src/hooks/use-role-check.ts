/**
 * 角色检查 Hook
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useAuthStore } from '@/stores/auth-store'
import type { UserRole, Permission } from '@/stores/auth-store'
import { hasMenuPermission, canAssignRole, getRoleDisplayName, getAllRoles } from '@/lib/permissions'

/**
 * 角色检查 Hook 返回值
 */
interface UseRoleCheckReturn {
  /** 当前用户角色 */
  role: UserRole | undefined
  /** 当前用户权限列表 */
  permissions: Permission[] | undefined
  /** 是否是超级管理员 */
  isSuperAdmin: boolean
  /** 是否是管理员（包括超级管理员） */
  isAdmin: boolean
  /** 检查是否有指定角色 */
  hasRole: (role: UserRole) => boolean
  /** 检查是否有任一指定角色 */
  hasAnyRole: (roles: UserRole[]) => boolean
  /** 检查是否有指定权限 */
  hasPermission: (permission: Permission) => boolean
  /** 检查是否有所有指定权限 */
  hasAllPermissions: (permissions: Permission[]) => boolean
  /** 检查是否有任一指定权限 */
  hasAnyPermission: (permissions: Permission[]) => boolean
  /** 检查是否可以访问菜单项 */
  canAccessMenu: (menuTitle: string, menuUrl?: string) => boolean
  /** 检查是否可以分配指定角色 */
  canAssignRole: (targetRole: UserRole) => boolean
  /** 获取角色显示名称 */
  getRoleDisplayName: (role: UserRole) => string
  /** 获取所有角色列表 */
  getAllRoles: () => { value: UserRole; label: string }[]
}

/**
 * 角色检查 Hook
 * 提供便捷的角色和权限检查方法
 */
export function useRoleCheck(): UseRoleCheckReturn {
  const user = useAuthStore((state) => state.user)
  const role = user?.role
  const permissions = user?.permissions

  const isSuperAdmin = role === 'super_admin'
  const isAdmin = role === 'super_admin' || role === 'admin'

  const hasRoleCheck = (checkRole: UserRole): boolean => {
    return role === checkRole
  }

  const hasAnyRoleCheck = (checkRoles: UserRole[]): boolean => {
    if (!role) return false
    return checkRoles.includes(role)
  }

  const hasPermissionCheck = (checkPermission: Permission): boolean => {
    if (!permissions) return false
    return permissions.includes(checkPermission)
  }

  const hasAllPermissionsCheck = (checkPermissions: Permission[]): boolean => {
    if (!permissions) return false
    return checkPermissions.every((p) => permissions.includes(p))
  }

  const hasAnyPermissionCheck = (checkPermissions: Permission[]): boolean => {
    if (!permissions) return false
    return checkPermissions.some((p) => permissions.includes(p))
  }

  const canAccessMenu = (menuTitle: string, menuUrl?: string): boolean => {
    return hasMenuPermission(role, permissions, menuTitle, menuUrl)
  }

  const canAssignRoleCheck = (targetRole: UserRole): boolean => {
    if (!role) return false
    return canAssignRole(role, targetRole)
  }

  return {
    role,
    permissions,
    isSuperAdmin,
    isAdmin,
    hasRole: hasRoleCheck,
    hasAnyRole: hasAnyRoleCheck,
    hasPermission: hasPermissionCheck,
    hasAllPermissions: hasAllPermissionsCheck,
    hasAnyPermission: hasAnyPermissionCheck,
    canAccessMenu,
    canAssignRole: canAssignRoleCheck,
    getRoleDisplayName,
    getAllRoles,
  }
}
