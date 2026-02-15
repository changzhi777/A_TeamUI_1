/**
 * display-store
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 侧边栏可显示项目定义
 * 对应前端的一级和二级页面
 */
export interface SidebarDisplayItem {
  id: string
  label: string
  group: string // 所属分组
  isDefault?: boolean // 是否默认显示
  isRequired?: boolean // 是否必需（不可隐藏）
}

// 侧边栏显示项目列表（与 sidebar-data.ts 对应）
export const sidebarDisplayItems: SidebarDisplayItem[] = [
  // 项目管理
  {
    id: 'projects',
    label: '项目列表',
    group: '项目管理',
    isDefault: true,
    isRequired: true, // 核心功能，不可隐藏
  },
  {
    id: 'team',
    label: '团队成员',
    group: '项目管理',
    isDefault: true,
  },
  // 创作工具
  {
    id: 'storyboard',
    label: '分镜头创作',
    group: '创作工具',
    isDefault: true,
  },
  {
    id: 'storyboard-list',
    label: '分镜头清单',
    group: '创作工具',
    isDefault: true,
  },
  {
    id: 'script',
    label: '剧本编辑',
    group: '创作工具',
    isDefault: true,
  },
  {
    id: 'character',
    label: '角色设计',
    group: '创作工具',
    isDefault: false,
  },
  // 资产管理
  {
    id: 'assets',
    label: '资产库',
    group: '资产管理',
    isDefault: true,
  },
  // 设置
  {
    id: 'settings',
    label: '系统设置',
    group: '设置',
    isDefault: true,
    isRequired: true, // 设置入口，不可隐藏
  },
  {
    id: 'help-center',
    label: '帮助中心',
    group: '设置',
    isDefault: true,
  },
]

// 获取默认显示的项目 ID
const getDefaultVisibleItems = (): string[] => {
  return sidebarDisplayItems
    .filter((item) => item.isDefault || item.isRequired)
    .map((item) => item.id)
}

// 显示设置状态
interface DisplayState {
  // 侧边栏可见项目
  visibleSidebarItems: string[]

  // 操作方法
  setVisibleSidebarItems: (items: string[]) => void
  toggleSidebarItem: (itemId: string) => void
  isSidebarItemVisible: (itemId: string) => boolean
  resetToDefaults: () => void
}

export const useDisplayStore = create<DisplayState>()(
  persist(
    (set, get) => ({
      visibleSidebarItems: getDefaultVisibleItems(),

      setVisibleSidebarItems: (items) => {
        // 确保必需项始终包含
        const requiredItems = sidebarDisplayItems
          .filter((item) => item.isRequired)
          .map((item) => item.id)
        const finalItems = [...new Set([...items, ...requiredItems])]
        set({ visibleSidebarItems: finalItems })
      },

      toggleSidebarItem: (itemId) => {
        const { visibleSidebarItems } = get()
        const item = sidebarDisplayItems.find((i) => i.id === itemId)

        // 必需项不能切换
        if (item?.isRequired) return

        if (visibleSidebarItems.includes(itemId)) {
          // 至少保留一个可选项目
          const optionalItems = sidebarDisplayItems.filter((i) => !i.isRequired)
          const visibleOptional = optionalItems.filter(
            (i) => visibleSidebarItems.includes(i.id)
          )
          if (visibleOptional.length <= 1) return

          set({
            visibleSidebarItems: visibleSidebarItems.filter(
              (id) => id !== itemId
            ),
          })
        } else {
          set({
            visibleSidebarItems: [...visibleSidebarItems, itemId],
          })
        }
      },

      isSidebarItemVisible: (itemId) => {
        return get().visibleSidebarItems.includes(itemId)
      },

      resetToDefaults: () => {
        set({ visibleSidebarItems: getDefaultVisibleItems() })
      },
    }),
    {
      name: 'display-settings',
    }
  )
)

// 辅助函数：获取按分组组织的显示项目
export function getGroupedDisplayItems() {
  const groups: Record<string, SidebarDisplayItem[]> = {}

  for (const item of sidebarDisplayItems) {
    if (!groups[item.group]) {
      groups[item.group] = []
    }
    groups[item.group].push(item)
  }

  return groups
}
