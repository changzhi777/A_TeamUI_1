/**
 * app-sidebar
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React, { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'
import { useDisplayStore } from '@/stores/display-store'
import { filterSidebarByPermission } from '@/lib/sidebar-filter'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.user)
  const visibleSidebarItems = useDisplayStore(
    (state) => state.visibleSidebarItems
  )

  // 默认用户（兼容 AuthUser 类型）
  const defaultUser: AuthUser = {
    id: 'default',
    name: '创作者',
    email: 'creator@example.com',
    avatar: '/avatars/creator.jpg',
    role: 'member',
    createdAt: new Date().toISOString(),
  }

  const currentUser: AuthUser = user || defaultUser

  // 根据用户权限和显示设置过滤侧边栏菜单
  const filteredNavGroups = useMemo(() => {
    return filterSidebarByPermission(
      sidebarData.navGroups,
      currentUser.role,
      currentUser.permissions,
      visibleSidebarItems // 传入显示设置
    )
  }, [currentUser.role, currentUser.permissions, visibleSidebarItems])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
