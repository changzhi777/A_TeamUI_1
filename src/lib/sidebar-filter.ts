/**
 * 侧边栏权限过滤工具
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { NavGroup, NavItem, NavCollapsible, NavLink } from '@/components/layout/types'
import type { UserRole, Permission } from '@/stores/auth-store'
import { hasMenuPermission } from '@/lib/permissions'

// 路由 ID 到 URL 的映射
const routeIdToUrl: Record<string, string> = {
  'projects': '/projects',
  'team': '/team',
  'storyboard': '/storyboard',
  'storyboard-list': '/storyboard-list',
  'script': '/script',
  'character': '/character',
  'assets': '/assets',
  'settings': '/settings',
  'help-center': '/help-center',
}

// URL 到路由 ID 的映射
const urlToRouteId: Record<string, string> = Object.fromEntries(
  Object.entries(routeIdToUrl).map(([id, url]) => [url, id])
)

/**
 * 从 URL 获取路由 ID
 */
function getRouteIdFromUrl(url: string): string | undefined {
  // 直接匹配
  if (urlToRouteId[url]) {
    return urlToRouteId[url]
  }
  // 处理带参数的路由，如 /projects/123/storyboard
  const firstSegment = '/' + url.split('/')[1]
  return urlToRouteId[firstSegment]
}

/**
 * 过滤单个菜单项（权限过滤）
 */
function filterNavItemByPermission(
  item: NavLink | NavCollapsible,
  role: UserRole | undefined,
  permissions: Permission[] | undefined
): (NavLink | NavCollapsible) | null {
  // 检查是否是折叠菜单
  const collapsible = item as NavCollapsible
  if (collapsible.items && collapsible.items.length > 0) {
    // 过滤子菜单
    const filteredSubItems = collapsible.items
      .map((subItem) => filterNavItemByPermission(subItem, role, permissions))
      .filter((item): item is NavItem => item !== null)

    // 如果子菜单全部被过滤掉，则隐藏整个折叠菜单
    if (filteredSubItems.length === 0) {
      return null
    }

    // 检查折叠菜单本身的权限
    if (!hasMenuPermission(role, permissions, item.title)) {
      return null
    }

    return {
      ...collapsible,
      items: filteredSubItems,
    }
  }

  // 普通菜单项
  const linkItem = item as NavLink
  if (!hasMenuPermission(role, permissions, item.title, linkItem.url)) {
    return null
  }

  return item
}

/**
 * 过滤单个菜单项（显示设置过滤）
 */
function filterNavItemByDisplay(
  item: NavLink | NavCollapsible,
  visibleItems: string[]
): (NavLink | NavCollapsible) | null {
  // 检查是否是折叠菜单
  const collapsible = item as NavCollapsible
  if (collapsible.items && collapsible.items.length > 0) {
    // 过滤子菜单
    const filteredSubItems = collapsible.items
      .map((subItem) => filterNavItemByDisplay(subItem, visibleItems))
      .filter((item): item is NavItem => item !== null)

    // 如果子菜单全部被过滤掉，则隐藏整个折叠菜单
    if (filteredSubItems.length === 0) {
      return null
    }

    return {
      ...collapsible,
      items: filteredSubItems,
    }
  }

  // 普通菜单项 - 检查是否在可见列表中
  const linkItem = item as NavLink
  if (linkItem.url) {
    const routeId = getRouteIdFromUrl(linkItem.url)
    if (routeId && !visibleItems.includes(routeId)) {
      return null
    }
  }

  return item
}

/**
 * 根据用户权限过滤侧边栏菜单
 * @param navGroups 原始导航组
 * @param role 用户角色
 * @param permissions 用户权限列表
 * @param visibleItems 可见路由 ID 列表（可选，用于显示设置过滤）
 * @returns 过滤后的导航组
 */
export function filterSidebarByPermission(
  navGroups: NavGroup[],
  role: UserRole | undefined,
  permissions: Permission[] | undefined,
  visibleItems?: string[]
): NavGroup[] {
  return navGroups
    .map((group) => {
      // 先按权限过滤
      let filteredItems = group.items
        ?.map((item) => filterNavItemByPermission(item, role, permissions))
        .filter((item): item is NavLink | NavCollapsible => item !== null)

      // 如果提供了可见项列表，再按显示设置过滤
      if (visibleItems && filteredItems) {
        filteredItems = filteredItems
          .map((item) => filterNavItemByDisplay(item, visibleItems))
          .filter((item): item is NavLink | NavCollapsible => item !== null)
      }

      // 如果组内菜单全部被过滤掉，则隐藏整个组
      if (!filteredItems || filteredItems.length === 0) {
        return null
      }

      return {
        ...group,
        items: filteredItems,
      }
    })
    .filter((group): group is NavGroup => group !== null)
}

/**
 * 仅根据显示设置过滤侧边栏菜单
 * @param navGroups 原始导航组
 * @param visibleItems 可见路由 ID 列表
 * @returns 过滤后的导航组
 */
export function filterSidebarByDisplaySettings(
  navGroups: NavGroup[],
  visibleItems: string[]
): NavGroup[] {
  return navGroups
    .map((group) => {
      const filteredItems = group.items
        ?.map((item) => filterNavItemByDisplay(item, visibleItems))
        .filter((item): item is NavLink | NavCollapsible => item !== null)

      // 如果组内菜单全部被过滤掉，则隐藏整个组
      if (!filteredItems || filteredItems.length === 0) {
        return null
      }

      return {
        ...group,
        items: filteredItems,
      }
    })
    .filter((group): group is NavGroup => group !== null)
}
