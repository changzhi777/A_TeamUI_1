// API Response types
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

// Pagination params
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// Sorting params
export type SortOrder = 'asc' | 'desc'
export type SortField = 'createdAt' | 'updatedAt' | 'name' | 'shotNumber'

export interface SortParams {
  sortField?: SortField
  sortOrder?: SortOrder
}

// Filter params for projects
export interface ProjectFilterParams {
  status?: string
  type?: string
  search?: string
  isFavorite?: boolean
}

// Login request
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

// Token response
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string
}

// Project types (matching backend)
export type ProjectStatus = 'planning' | 'filming' | 'postProduction' | 'completed'
export type ProjectType =
  | 'shortDrama'
  | 'realLifeDrama'
  | 'aiPodcast'
  | 'advertisement'
  | 'mv'
  | 'documentary'
  | 'other'

export interface Project {
  id: string
  name: string
  description: string
  type: ProjectType
  status: ProjectStatus
  episodeRange: string
  director: string
  createdBy: string
  totalShots: number
  completedShots: number
  isFavorite: boolean
  isPinned: boolean
  pinnedAt: string | null
  createdAt: string
  updatedAt: string
}

// Shot types
export type ShotSize = 'extremeLong' | 'long' | 'medium' | 'closeUp' | 'extremeCloseUp'
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

export interface StoryboardShot {
  id: string
  projectId: string
  shotNumber: number
  sceneNumber: string
  shotSize: ShotSize
  cameraMovement: CameraMovement
  duration: number
  description: string
  dialogue: string
  sound: string
  imageUrl: string
  imageThumbnailUrl: string
  aiGenerated: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// WebSocket message types
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
  | 'message_queued' // New: offline message queued
  | 'message_delivered' // New: queued message delivered

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType
  data: T
  userId: string
  timestamp: string
  queued?: boolean // New: indicates if message was queued
}

// Upload types
export interface UploadResult {
  url: string
  filename: string
}

export interface UploadCropData {
  x?: number
  y?: number
  width?: number
  height?: number
  size?: number
}

// Member management types
export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  isEmailVerified: boolean
  isOtpEnabled: boolean
  createdAt: string
  updatedAt: string
  projectCount?: number
  projects?: MemberProject[]
}

export interface MemberProject {
  projectId: string
  projectName: string
  projectStatus?: string
  role: string
  joinedAt: string
}

export interface MemberListParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  projectIds?: string
  sortBy?: 'name' | 'email' | 'createdAt' | 'role'
  sortOrder?: 'asc' | 'desc'
}

export interface MemberListResponse {
  members: Member[]
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
}

export interface AddMemberData {
  email: string
  name: string
  role: string
  password: string
  projects?: Array<{
    id: string
    role: string
  }>
}

export interface UpdateMemberData {
  name?: string
  email?: string
  role?: string
  phone?: string
  bio?: string
}
