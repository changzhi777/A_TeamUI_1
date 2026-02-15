/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

// 导出所有 stores
export { useAuthStore } from './auth-store'
export { useProjectStore } from './project-store'
export { useStoryboardStore } from './storyboard-store'
export { useTaskStore, useTasksByStatus, useTasksByType } from './task-store'
export {
  useCustomFieldStore,
  validateFieldValue,
  getDefaultValueForType,
  formatFieldValue,
} from './custom-field-store'
export {
  useDisplayStore,
  sidebarDisplayItems,
  getGroupedDisplayItems,
} from './display-store'
export type { SidebarDisplayItem } from './display-store'

// 导出所有类型
export type { AuthUser, UserRole } from './auth-store'

// 修正：ProjectMemberRole 不存在，应该用 MemberRole
export type {
  Project,
  ProjectMember,
  MemberRole,  // 改为正确的名称
  ProjectStatus,
  ScriptVersion,  // 改为正确的名称（Script 不存在）
} from './project-store'
export type {
  StoryboardShot,
  ShotSize,
  CameraMovement,
  ViewMode,
  CustomFieldValue,
} from './storyboard-store'
// 从 api.ts 导出 CustomFieldConfig 和 CustomFieldType
export type { CustomFieldConfig, CustomFieldType } from '@/lib/types/api'
