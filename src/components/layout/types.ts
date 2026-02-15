/**
 * types
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { type LinkProps } from '@tanstack/react-router'
import type { UserRole, Permission } from '@/stores/auth-store'

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

/** 菜单项权限配置 */
type MenuItemPermission = {
  /** 允许访问的角色列表 */
  roles?: UserRole[]
  /** 需要的权限列表 */
  permissions?: Permission[]
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  /** 权限配置 */
  permission?: MenuItemPermission
}

type NavLink = BaseNavItem & {
  url?: string
  requiresProject?: boolean
  items?: never
}

type NavItem = NavLink

type NavCollapsible = BaseNavItem & {
  items?: NavItem[]
  icon?: React.ElementType
}

type NavGroup = {
  title: string
  items?: (NavLink | NavCollapsible)[]
}

// 侧边栏用户类型（兼容 AuthUser 和 User）
type SidebarUser = User | Omit<{ id: string; role: string; createdAt: string }, 'avatar'>

type SidebarData = {
  user: SidebarUser
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, SidebarUser, NavGroup, NavItem, NavCollapsible, NavLink, MenuItemPermission }
