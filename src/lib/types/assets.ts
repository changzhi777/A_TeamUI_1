/**
 * assets
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Management Types
 * 资产管理相关类型定义
 */

/**
 * 资产类型
 */
export type AssetType = 'image' | 'audio' | 'video' | 'script' | 'aiGenerated' | 'character'

/**
 * 资产来源
 */
export type AssetSource = 'upload' | 'external' | 'ai' | 'storage' | 'link'

/**
 * 资产范围
 */
export type AssetScope = 'global' | 'project'

/**
 * 资产状态
 */
export type AssetStatus = 'uploading' | 'processing' | 'ready' | 'error'

/**
 * 资产类型对应的 MIME 类型
 */
export const ASSET_MIME_TYPES: Record<AssetType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  script: ['text/plain', 'text/markdown', 'application/pdf'],
  aiGenerated: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'text/plain'],
  character: ['application/json'], // 角色资产使用 JSON 存储
}

/**
 * 资产类型对应的文件扩展名
 */
export const ASSET_EXTENSIONS: Record<AssetType, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
  audio: ['.mp3', '.wav', '.aac', '.ogg'],
  video: ['.mp4', '.webm', '.mov'],
  script: ['.txt', '.md', '.pdf'],
  aiGenerated: ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.txt'],
  character: ['.json'], // 角色资产
}

/**
 * 资产类型对应的文件大小限制（字节）
 */
export const ASSET_SIZE_LIMITS: Record<AssetType, number> = {
  image: 50 * 1024 * 1024, // 50MB
  audio: 200 * 1024 * 1024, // 200MB
  video: 2 * 1024 * 1024 * 1024, // 2GB
  script: 10 * 1024 * 1024, // 10MB
  aiGenerated: 50 * 1024 * 1024, // 50MB
  character: 10 * 1024 * 1024, // 10MB (角色数据)
}

/**
 * 角色资产数据（存储在 characterData 字段中）
 */
export interface CharacterAssetData {
  code: string
  description: string
  personality: string
  attributes: Record<string, string | undefined>
  basePrompt: string
  views: {
    front?: { url: string; prompt: string; generatedAt: string }
    side?: { url: string; prompt: string; generatedAt: string }
    back?: { url: string; prompt: string; generatedAt: string }
    threeQuarter?: { url: string; prompt: string; generatedAt: string }
  }
  costumes: Array<{
    id: string
    name: string
    description: string
    imageUrl: string
    prompt: string
    generatedAt: string
  }>
  voice?: {
    style: string
    sampleUrl?: string
    sampleText?: string
  }
  characterId: string // 关联的原角色ID
}

/**
 * 资产接口
 */
export interface Asset {
  id: string
  name: string
  type: AssetType
  source: AssetSource
  scope: AssetScope
  projectId?: string // scope 为 project 时必填

  // 文件信息
  url: string
  thumbnailUrl?: string
  fileSize: number
  mimeType: string
  width?: number
  height?: number
  duration?: number

  // 元数据
  tags: string[]
  description?: string
  externalUrl?: string // source 为 link 时使用

  // AI 生成相关信息
  aiGenerated?: boolean
  aiModel?: string
  aiPrompt?: string

  // 角色资产数据（type 为 character 时使用）
  characterData?: CharacterAssetData

  // 用户信息
  uploadedBy: string
  uploadedByName: string

  // 时间戳
  createdAt: string
  updatedAt: string
}

/**
 * 资产查询参数
 */
export interface AssetQueryParams {
  page?: number
  pageSize?: number
  type?: AssetType
  source?: AssetSource
  scope?: AssetScope
  projectId?: string
  tags?: string[]
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'fileSize'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 资产元数据（上传时使用）
 */
export interface AssetMetadata {
  name?: string
  description?: string
  tags?: string[]
  scope?: AssetScope
  projectId?: string
}

/**
 * 资产上传结果
 */
export interface AssetUploadResult {
  id: string
  url: string
  thumbnailUrl?: string
  name: string
  type: AssetType
  fileSize: number
}

/**
 * 资产上传状态
 */
export interface AssetUploadProgress {
  file: File
  assetId?: string
  progress: number
  status: AssetStatus
  error?: string
}

/**
 * 资产统计信息
 */
export interface AssetStats {
  total: number
  byType: Record<AssetType, number>
  bySource: Record<AssetSource, number>
  totalSize: number
  uploadedThisMonth: number
}

/**
 * 资产引用信息
 */
export interface AssetReference {
  type: 'project' | 'storyboardShot' | 'script'
  id: string
  name: string
  url: string
}

/**
 * 资产使用详情
 */
export interface AssetUsageDetails {
  assetId: string
  referenceCount: number
  references: AssetReference[]
}

/**
 * 资产批量操作结果
 */
export interface AssetBatchResult {
  success: number
  failed: number
  errors: Array<{
    id: string
    error: string
  }>
}

/**
 * 从文件名推断资产类型
 */
export function inferAssetType(filename: string): AssetType | null {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  for (const [type, extensions] of Object.entries(ASSET_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return type as AssetType
    }
  }
  return null
}

/**
 * 验证文件类型是否匹配资产类型
 */
export function validateAssetFileType(file: File, assetType: AssetType): boolean {
  return ASSET_MIME_TYPES[assetType].includes(file.type)
}

/**
 * 验证文件大小是否在限制内
 */
export function validateAssetFileSize(file: File, assetType: AssetType): boolean {
  return file.size <= ASSET_SIZE_LIMITS[assetType]
}

/**
 * 格式化文件大小
 */
export function formatAssetFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * 格式化时长
 */
export function formatAssetDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * 获取资产类型显示名称
 */
export function getAssetTypeName(type: AssetType): string {
  const names: Record<AssetType, string> = {
    image: '图片',
    audio: '音频',
    video: '视频',
    script: '剧本',
    aiGenerated: 'AI生成',
    character: '角色人物',
  }
  return names[type]
}

/**
 * 获取资产来源显示名称
 */
export function getAssetSourceName(source: AssetSource): string {
  const names: Record<AssetSource, string> = {
    upload: '本地上传',
    external: '外部素材库',
    ai: 'AI生成',
    storage: '云存储',
    link: '外部链接',
  }
  return names[source]
}

/**
 * 获取资产范围显示名称
 */
export function getAssetScopeName(scope: AssetScope): string {
  const names: Record<AssetScope, string> = {
    global: '全局资产',
    project: '项目资产',
  }
  return names[scope]
}
