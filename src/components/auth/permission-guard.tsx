/**
 * permission-guard
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { type UserRole, type Permission } from '@/stores/auth-store'

interface PermissionGuardProps {
  children: React.ReactNode
  roles?: UserRole[]
  permissions?: Permission[]
  requireAdmin?: boolean
  fallback?: React.ReactNode
  projectId?: string
}

/**
 * 权限守卫组件
 * 根据用户权限显示或隐藏内容
 */
export function PermissionGuard({
  children,
  roles,
  permissions,
  requireAdmin = false,
  fallback = null,
  projectId,
}: PermissionGuardProps) {
  const { hasRole, hasPermission, isAdmin } = useAuthStore()

  // 检查是否需要管理员权限
  if (requireAdmin && !isAdmin()) {
    return <>{fallback}</>
  }

  // 检查是否有指定角色
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some((role) => hasRole(role))
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // 检查是否有指定权限
  if (permissions && permissions.length > 0) {
    const hasRequiredPermission = permissions.some((permission) =>
      hasPermission(permission, projectId)
    )
    if (!hasRequiredPermission) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

interface ConditionalRenderProps {
  children: React.ReactNode
  condition: boolean
  fallback?: React.ReactNode
}

/**
 * 条件渲染组件
 * 简化的权限检查组件
 */
export function Show({ children, condition, fallback = null }: ConditionalRenderProps) {
  return <>{condition ? children : fallback}</>
}

/**
 * 仅管理员可见
 */
export function AdminOnly({ children, fallback = null }: Omit<PermissionGuardProps, 'requireAdmin'>) {
  return (
    <PermissionGuard requireAdmin fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 编辑权限
 */
export function CanEdit({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId: string }) {
  return (
    <PermissionGuard
      permissions={['project:write', 'project:delete']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 删除权限
 */
export function CanDelete({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId: string }) {
  return (
    <PermissionGuard
      permissions={['project:delete']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 管理成员权限
 */
export function CanManageMembers({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId: string }) {
  return (
    <PermissionGuard
      permissions={['project:manage_members']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 剧本编辑权限
 */
export function CanEditScript({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId: string }) {
  return (
    <PermissionGuard
      permissions={['script:write']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 分镜头编辑权限
 */
export function CanEditStoryboard({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId: string }) {
  return (
    <PermissionGuard
      permissions={['storyboard:write', 'storyboard:delete']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 资产管理权限
 */
export function CanManageAssets({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId?: string }) {
  return (
    <PermissionGuard
      permissions={['asset:write']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 权限检查组件 - 资产删除权限
 */
export function CanDeleteAssets({
  children,
  projectId,
  fallback = null,
}: Omit<PermissionGuardProps, 'permissions'> & { projectId?: string }) {
  return (
    <PermissionGuard
      permissions={['asset:delete']}
      projectId={projectId}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}
