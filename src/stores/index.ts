// 导出所有 stores
export { useAuthStore } from './auth-store'
export { useProjectStore } from './project-store'
export { useStoryboardStore } from './storyboard-store'

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
} from './storyboard-store'
