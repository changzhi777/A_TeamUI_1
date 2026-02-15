/**
 * sidebar-data
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import {
  Video,
  FileText,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users2,
  GalleryVerticalEnd,
  Clapperboard,
  FolderOpen,
  Table as TableIcon,
  Image,
  Users,
  BookOpen,
  Key,
  Shield,
  ListOrdered,
} from 'lucide-react'
import { type SidebarData, type SidebarUser } from '../types'

// 为了兼容 AuthUser，从 SidebarUser 中排除 avatar 字段
const sidebarUser: SidebarUser = {
  name: '创作者',
  email: 'creator@example.com',
  avatar: '/avatars/creator.jpg',
}

export const sidebarData: SidebarData = {
  user: sidebarUser,
  teams: [
    {
      name: '帧服了科技',
      logo: Clapperboard,
      plan: '动漫短剧创作平台',
    },
    {
      name: '示例团队',
      logo: GalleryVerticalEnd,
      plan: '专业版',
    },
  ],
  navGroups: [
    {
      title: '项目管理',
      items: [
        {
          title: '项目列表',
          url: '/projects',
          icon: FolderOpen,
        },
        {
          title: '团队成员',
          url: '/team',
          icon: Users2,
        },
      ],
    },
    {
      title: '创作工具',
      items: [
        {
          title: '分镜头创作',
          url: '/storyboard',
          icon: Video,
          badge: '新',
        },
        {
          title: '分镜头清单',
          url: '/storyboard-list',
          icon: TableIcon,
        },
        {
          title: '剧本编辑',
          url: '/script',
          icon: FileText,
        },
        {
          title: '角色设计',
          url: '/character',
          icon: Users,
          badge: '新',
        },
      ],
    },
    {
      title: '资产管理',
      items: [
        {
          title: '资产库',
          url: '/assets',
          icon: Image,
          badge: '新',
        },
      ],
    },
    {
      title: '系统状态',
      items: [
        {
          title: '任务队列',
          url: '/system/tasks',
          icon: ListOrdered,
          badge: '新',
        },
      ],
    },
    {
      title: '设置',
      items: [
        {
          title: '系统设置',
          icon: Settings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '账户设置',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: '外观设置',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '通知设置',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'API 管理',
              url: '/settings/api',
              icon: Key,
            },
            {
              title: 'API 文档',
              url: '/settings/api-docs',
              icon: BookOpen,
              badge: 'API',
              permission: {
                roles: ['super_admin', 'admin', 'director'],
              },
            },
            {
              title: '用户管理',
              url: '/settings/users',
              icon: Shield,
              badge: '超管',
              permission: {
                roles: ['super_admin'],
              },
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
