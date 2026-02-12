// User roles
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'director'
  | 'screenwriter'
  | 'editor'
  | 'member'

// Project roles
export type ProjectRole =
  | 'admin'
  | 'member'
  | 'director'
  | 'screenwriter'
  | 'cinematographer'
  | 'editor'
  | 'actor'

// Project status
export type ProjectStatus = 'planning' | 'filming' | 'postProduction' | 'completed'

// Project type
export type ProjectType =
  | 'shortDrama'
  | 'realLifeDrama'
  | 'aiPodcast'
  | 'advertisement'
  | 'mv'
  | 'documentary'
  | 'other'

// Shot size
export type ShotSize = 'extremeLong' | 'long' | 'medium' | 'closeUp' | 'extremeCloseUp'

// Camera movement
export type CameraMovement =
  | 'static'
  | 'pan'
  | 'tilt'
  | 'dolly'
  | 'truck'
  | 'pedestral'
  | 'crane'
  | 'handheld'
  | 'steadicam'
  | 'tracking'
  | 'arc'

// Permission type
export type Permission =
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'project:manage_members'
  | 'script:read'
  | 'script:write'
  | 'storyboard:read'
  | 'storyboard:write'
  | 'storyboard:delete'

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    hasMore?: boolean
  }
}

// JWT Payload
export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// Token Info
export interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// WebSocket Event Types
export type WebSocketEventType =
  | 'project_updated'
  | 'project_deleted'
  | 'shot_created'
  | 'shot_updated'
  | 'shot_deleted'
  | 'shot_reordered'
  | 'member_added'
  | 'member_removed'
  | 'member_updated'
  | 'user_joined'
  | 'user_left'
  | 'lock_acquired'
  | 'lock_released'

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType
  data: T
  userId: string
  timestamp: string
}

export interface WebSocketAuth {
  token: string
  projectId?: string
}
