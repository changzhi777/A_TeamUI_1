import { type LinkProps } from '@tanstack/react-router'

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

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url?: string
  requiresProject?: boolean
  items?: never
}

// 侧边栏用户类型（兼容 AuthUser 和 User）
type SidebarUser = User | Omit<{ id: string; role: string; createdAt: string }, 'avatar'>

type SidebarData = {
  user: SidebarUser
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
