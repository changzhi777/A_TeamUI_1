/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Outlet } from '@tanstack/react-router'
import { Monitor, Bell, Palette, Wrench, UserCog, Key } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'
import { VersionInfo } from './components/version-info'
import { useI18n } from '@/i18n'

export function Settings() {
  const { t } = useI18n()

  const sidebarNavItems = [
    {
      title: t.settings.nav.profile,
      href: '/settings',
      icon: <UserCog size={18} />,
    },
    {
      title: t.settings.nav.account,
      href: '/settings/account',
      icon: <Wrench size={18} />,
    },
    {
      title: t.settings.nav.appearance,
      href: '/settings/appearance',
      icon: <Palette size={18} />,
    },
    {
      title: t.settings.nav.notifications,
      href: '/settings/notifications',
      icon: <Bell size={18} />,
    },
    {
      title: t.settings.nav.display,
      href: '/settings/display',
      icon: <Monitor size={18} />,
    },
    {
      title: t.settings.nav.api,
      href: '/settings/api',
      icon: <Key size={18} />,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t.settings.title}
          </h1>
          <p className='text-muted-foreground'>
            {t.settings.description}
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full flex-1 flex-col overflow-y-auto p-1'>
            <Outlet />
            <VersionInfo />
          </div>
        </div>
      </Main>
    </>
  )
}
