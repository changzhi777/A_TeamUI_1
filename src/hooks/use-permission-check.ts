/**
 * use-permission-check
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useAuthStore } from '@/stores/auth-store'
import { type Permission } from '@/stores/auth-store'
import { toast } from 'sonner'

/**
 * 权限检查 Hook
 * 提供便捷的权限检查方法和提示
 */
export function usePermissionCheck() {
  const {
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    canEditProject,
    canDeleteProject,
    canManageMembers: checkManageMembers,
    canManageAsset,
    canDeleteAsset,
  } = useAuthStore()

  /**
   * 检查用户是否已登录
   */
  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      toast.error('请先登录')
      return false
    }
    return true
  }

  /**
   * 检查用户是否为管理员
   */
  const requireAdmin = (): boolean => {
    if (!requireAuth()) return false
    if (!isAdmin()) {
      toast.error('此操作需要管理员权限')
      return false
    }
    return true
  }

  /**
   * 检查是否有特定权限
   */
  const requirePermission = (permission: Permission, resourceId?: string): boolean => {
    if (!requireAuth()) return false
    if (!hasPermission(permission, resourceId)) {
      toast.error('您没有权限执行此操作')
      return false
    }
    return true
  }

  /**
   * 检查是否有任一权限
   */
  const requireAnyPermission = (permissions: Permission[], resourceId?: string): boolean => {
    if (!requireAuth()) return false
    const hasAny = permissions.some((p) => hasPermission(p, resourceId))
    if (!hasAny) {
      toast.error('您没有权限执行此操作')
      return false
    }
    return true
  }

  /**
   * 检查是否可以编辑项目
   */
  const canEdit = (projectOwnerId: string): boolean => {
    if (!requireAuth()) return false
    if (!canEditProject(projectOwnerId)) {
      toast.error('您没有权限编辑此项目')
      return false
    }
    return true
  }

  /**
   * 检查是否可以删除项目
   */
  const canDelete = (projectOwnerId: string): boolean => {
    if (!requireAuth()) return false
    if (!canDeleteProject(projectOwnerId)) {
      toast.error('您没有权限删除此项目')
      return false
    }
    return true
  }

  /**
   * 检查是否可以管理团队成员
   */
  const canManageMembers = (projectOwnerId: string): boolean => {
    if (!requireAuth()) return false
    if (!checkManageMembers(projectOwnerId)) {
      toast.error('您没有权限管理此项目的团队成员')
      return false
    }
    return true
  }

  /**
   * 检查是否可以编辑剧本
   */
  const canEditScript = (projectId: string): boolean => {
    if (!requireAuth()) return false
    if (!hasPermission('script:write', projectId)) {
      toast.error('您没有权限编辑剧本')
      return false
    }
    return true
  }

  /**
   * 检查是否可以编辑分镜头
   */
  const canEditStoryboard = (projectId: string): boolean => {
    if (!requireAuth()) return false
    if (
      !hasPermission('storyboard:write', projectId) &&
      !hasPermission('storyboard:delete', projectId)
    ) {
      toast.error('您没有权限编辑分镜头')
      return false
    }
    return true
  }

  /**
   * 检查是否可以创建或编辑项目
   */
  const canWriteProject = (): boolean => {
    if (!requireAuth()) return false
    if (!hasPermission('project:write')) {
      toast.error('您没有权限创建或编辑项目')
      return false
    }
    return true
  }

  /**
   * 检查是否可以管理资产
   */
  const checkManageAsset = (assetOwnerId: string): boolean => {
    if (!requireAuth()) return false
    if (!canManageAsset(assetOwnerId)) {
      toast.error('您没有权限管理此资产')
      return false
    }
    return true
  }

  /**
   * 检查是否可以删除资产
   */
  const checkDeleteAsset = (assetOwnerId: string): boolean => {
    if (!requireAuth()) return false
    if (!canDeleteAsset(assetOwnerId)) {
      toast.error('您没有权限删除此资产')
      return false
    }
    return true
  }

  return {
    user,
    isAuthenticated,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: isAdmin(),
    isAuditor: hasRole('auditor'),
    isDirector: hasRole('director'),
    isScreenwriter: hasRole('screenwriter'),
    isEditor: hasRole('editor'),
    isMember: hasRole('member'),
    hasPermission,
    hasAllPermissions: (permissions: Permission[], resourceId?: string) =>
      permissions.every((p) => hasPermission(p, resourceId)),
    hasAnyPermission: (permissions: Permission[], resourceId?: string) =>
      permissions.some((p) => hasPermission(p, resourceId)),
    requireAuth,
    requireAdmin,
    requirePermission,
    requireAnyPermission,
    canEdit,
    canDelete,
    canManageMembers,
    canEditScript,
    canEditStoryboard,
    canWriteProject,
    canManageAsset: checkManageAsset,
    canDeleteAsset: checkDeleteAsset,
  }
}

/**
 * 权限装饰器 Hook
 * 用于包装需要权限检查的操作
 */
export function usePermissionGuard() {
  const {
    requireAuth,
    requireAdmin,
    requirePermission,
    canEdit,
    canDelete,
    canManageMembers,
    canEditScript,
    canEditStoryboard,
  } = usePermissionCheck()

  /**
   * 包装需要登录的操作
   */
  const withAuth = <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      if (requireAuth()) {
        return fn(...args)
      }
    }) as T
  }

  /**
   * 包装需要管理员权限的操作
   */
  const withAdmin = <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      if (requireAdmin()) {
        return fn(...args)
      }
    }) as T
  }

  /**
   * 包装需要特定权限的操作
   */
  const withPermission = <T extends (...args: any[]) => any>(
    fn: T,
    permission: Permission,
    resourceId?: string
  ): T => {
    return ((...args: any[]) => {
      if (requirePermission(permission, resourceId)) {
        return fn(...args)
      }
    }) as T
  }

  /**
   * 包装需要编辑权限的操作
   */
  const withEditPermission = <T extends (...args: any[]) => any>(
    fn: T,
    projectOwnerId: string
  ): T => {
    return ((...args: any[]) => {
      if (canEdit(projectOwnerId)) {
        return fn(...args)
      }
    }) as T
  }

  /**
   * 包装需要删除权限的操作
   */
  const withDeletePermission = <T extends (...args: any[]) => any>(
    fn: T,
    projectOwnerId: string
  ): T => {
    return ((...args: any[]) => {
      if (canDelete(projectOwnerId)) {
        return fn(...args)
      }
    }) as T
  }

  return {
    withAuth,
    withAdmin,
    withPermission,
    withEditPermission,
    withDeletePermission,
  }
}
