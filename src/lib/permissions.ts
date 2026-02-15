/**
 * 权限管理模块
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { UserRole, Permission } from '@/stores/auth-store'

/**
 * 操作类型定义
 */
export type ActionType = 'read' | 'write' | 'delete' | 'manage'

/**
 * 侧边栏菜单项权限配置
 */
export interface MenuItemPermission {
  /** 允许访问的角色列表（空数组表示所有角色可见） */
  roles?: UserRole[]
  /** 需要的权限列表（满足任一即可） */
  permissions?: Permission[]
}

/**
 * 功能模块权限配置
 */
export const modulePermissions: Record<string, Record<ActionType, Permission>> = {
  project: {
    read: 'project:read',
    write: 'project:write',
    delete: 'project:delete',
    manage: 'project:manage_members',
  },
  script: {
    read: 'script:read',
    write: 'script:write',
    delete: 'script:write',
    manage: 'script:write',
  },
  storyboard: {
    read: 'storyboard:read',
    write: 'storyboard:write',
    delete: 'storyboard:delete',
    manage: 'storyboard:write',
  },
  asset: {
    read: 'asset:read',
    write: 'asset:write',
    delete: 'asset:delete',
    manage: 'asset:write',
  },
  character: {
    read: 'asset:read',
    write: 'asset:write',
    delete: 'asset:delete',
    manage: 'asset:write',
  },
}

/**
 * 侧边栏菜单权限映射
 * key: 菜单标题或URL
 * value: 权限配置
 */
export const sidebarPermissionMap: Record<string, MenuItemPermission> = {
  // 项目管理
  '项目列表': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '团队成员': { roles: ['super_admin', 'admin'] },

  // 创作工具
  '分镜头创作': { roles: ['super_admin', 'admin', 'director', 'editor'] },
  '分镜头清单': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '剧本编辑': { roles: ['super_admin', 'admin', 'director', 'screenwriter'] },
  '角色设计': { roles: ['super_admin', 'admin', 'director', 'editor'] },

  // 资产管理
  '资产库': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },

  // 设置
  '系统设置': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '个人资料': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '账户设置': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '外观设置': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '通知设置': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  'API 管理': { roles: ['super_admin', 'admin', 'director'] },
  'API 文档': { roles: ['super_admin', 'admin', 'director'] },
  '帮助中心': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },

  // URL 映射
  '/projects': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/team': { roles: ['super_admin', 'admin'] },
  '/storyboard': { roles: ['super_admin', 'admin', 'director', 'editor'] },
  '/storyboard-list': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/script': { roles: ['super_admin', 'admin', 'director', 'screenwriter'] },
  '/character': { roles: ['super_admin', 'admin', 'director', 'editor'] },
  '/assets': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/settings': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/settings/account': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/settings/appearance': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/settings/notifications': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
  '/settings/api': { roles: ['super_admin', 'admin', 'director'] },
  '/settings/api-docs': { roles: ['super_admin', 'admin', 'director'] },
  '/help-center': { roles: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'] },
}

/**
 * 检查用户是否有访问菜单项的权限
 */
export function hasMenuPermission(
  userRole: UserRole | undefined,
  _userPermissions: Permission[] | undefined,
  menuTitle: string,
  menuUrl?: string
): boolean {
  if (!userRole) return false

  // 先尝试按标题查找
  const titleConfig = sidebarPermissionMap[menuTitle]
  if (titleConfig) {
    if (!titleConfig.roles || titleConfig.roles.length === 0) return true
    return titleConfig.roles.includes(userRole)
  }

  // 再尝试按 URL 查找
  if (menuUrl) {
    const urlConfig = sidebarPermissionMap[menuUrl]
    if (urlConfig) {
      if (!urlConfig.roles || urlConfig.roles.length === 0) return true
      return urlConfig.roles.includes(userRole)
    }
  }

  // 未配置权限的菜单默认对所有角色可见
  return true
}

/**
 * 角色显示名称映射
 */
export const roleDisplayNames: Record<UserRole, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  director: '导演',
  screenwriter: '编剧',
  editor: '剪辑师',
  member: '普通成员',
}

/**
 * 获取角色显示名称
 */
export function getRoleDisplayName(role: UserRole): string {
  return roleDisplayNames[role] || role
}

/**
 * 获取所有角色列表（用于下拉选择）
 */
export function getAllRoles(): { value: UserRole; label: string }[] {
  return Object.entries(roleDisplayNames).map(([value, label]) => ({
    value: value as UserRole,
    label,
  }))
}

/**
 * 检查是否可以分配目标角色
 * @param operatorRole 操作者角色
 * @param targetRole 要分配的目标角色
 */
export function canAssignRole(operatorRole: UserRole, targetRole: UserRole): boolean {
  // 超级管理员可以分配任何角色
  if (operatorRole === 'super_admin') return true

  // 管理员可以分配除 super_admin 和 admin 以外的角色
  if (operatorRole === 'admin') {
    return targetRole !== 'super_admin' && targetRole !== 'admin'
  }

  // 其他角色不能分配角色
  return false
}

/**
 * 角色优先级定义（数值越大优先级越高）
 */
export const rolePriority: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  director: 60,
  screenwriter: 40,
  editor: 40,
  member: 20,
}

/**
 * 获取角色优先级
 * @param role 用户角色
 * @returns 角色优先级数值
 */
export function getRolePriority(role: UserRole): number {
  return rolePriority[role] ?? 0
}

/**
 * 检查是否可以管理目标角色的成员
 * @param actorRole 操作者角色
 * @param targetRole 目标成员角色
 * @returns 是否有权限管理
 */
export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actorPriority = getRolePriority(actorRole)
  const targetPriority = getRolePriority(targetRole)

  // 只有操作者优先级大于目标优先级时才能管理
  return actorPriority > targetPriority
}

/**
 * 检查是否可以编辑目标角色的成员（允许编辑同级或更低级别）
 * @param actorRole 操作者角色
 * @param targetRole 目标成员角色
 * @returns 是否有权限编辑
 */
export function canEditMemberRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actorPriority = getRolePriority(actorRole)
  const targetPriority = getRolePriority(targetRole)

  // 操作者优先级必须大于等于目标优先级
  // 但不能编辑自己（需要额外检查用户ID）
  return actorPriority >= targetPriority
}
