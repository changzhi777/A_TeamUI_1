import React from 'react'
import { type ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProjectStore } from '@/stores/project-store'
import { useI18n } from '@/i18n'
import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const href = useLocation({ select: (location) => location.href })
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />

          if (state === 'collapsed' && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            )

          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}

function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const [showProjectRequiredDialog, setShowProjectRequiredDialog] = useState(false)

  // 需要项目上下文的导航项处理
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.requiresProject) {
      if (!currentProjectId) {
        e.preventDefault()
        setShowProjectRequiredDialog(true)
        return
      }

      // 构建正确的项目路由
      e.preventDefault()
      const projectRoute = currentProjectId ? `/projects/${currentProjectId}${getProjectPath(item.url || '')}` : getProjectPath(item.url || '')
      navigate({ to: projectRoute as any })
      setOpenMobile(false)
    } else {
      setOpenMobile(false)
    }
  }

  // 将路由映射到项目特定路径
  const getProjectPath = (url: string): string => {
    const pathMap: Record<string, string> = {
      '/team': '/team',
      '/storyboard': '/storyboard',
      '/script': '/script',
    }
    return pathMap[url as string] || url as string
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={checkIsActive(href, item)}
          tooltip={item.title}
        >
          <Link to={item.url} onClick={handleClick}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* 无项目时的提示对话框 */}
      <ProjectRequiredDialog
        open={showProjectRequiredDialog}
        onOpenChange={setShowProjectRequiredDialog}
      />
    </>
  )
}

function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const [showProjectRequiredDialog, setShowProjectRequiredDialog] = useState(false)

  // 需要项目上下文的导航项处理
  const handleSubItemClick = (e: React.MouseEvent<HTMLAnchorElement>, subItem: any) => {
    if (subItem.requiresProject) {
      if (!currentProjectId) {
        e.preventDefault()
        setShowProjectRequiredDialog(true)
        return
      }

      // 构建正确的项目路由
      e.preventDefault()
      const projectRoute = `/projects/${currentProjectId}${getProjectPath(subItem.url)}`
      navigate({ to: projectRoute })
      setOpenMobile(false)
    } else {
      setOpenMobile(false)
    }
  }

  // 将路由映射到项目特定路径
  const getProjectPath = (url: string): string => {
    const pathMap: Record<string, string> = {
      '/team': '/team',
      '/storyboard': '/storyboard',
      '/script': '/script',
    }
    return pathMap[url as string] || url as string
  }

  return (
    <>
      <Collapsible
        asChild
        defaultOpen={checkIsActive(href, item, true)}
        className='group/collapsible'
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
              <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className='CollapsibleContent'>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={checkIsActive(href, subItem)}
                  >
                    <Link to={subItem.url} onClick={(e) => handleSubItemClick(e, subItem)}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>

      {/* 无项目时的提示对话框 */}
      <ProjectRequiredDialog
        open={showProjectRequiredDialog}
        onOpenChange={setShowProjectRequiredDialog}
      />
    </>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='right' align='start' sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={`${checkIsActive(href, sub) ? 'bg-secondary' : ''}`}
              >
                {sub.icon && <sub.icon />}
                <span className='max-w-52 text-wrap'>{sub.title}</span>
                {sub.badge && (
                  <span className='ms-auto text-xs'>{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}

// 无项目时的提示对话框组件
function ProjectRequiredDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleGoToProjects = () => {
    onOpenChange(false)
    navigate({ to: '/projects' })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{(t as any).nav?.needProjectTitle || '需要选择项目'}</AlertDialogTitle>
          <AlertDialogDescription>
            {(t as any).nav?.needProjectDescription || '请先选择一个项目，或创建一个新项目来使用此功能。'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button>{t.common?.cancel || '取消'}</button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={handleGoToProjects}>
            <button>
              {(t as any).nav?.goToProjects || '前往项目列表'}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
