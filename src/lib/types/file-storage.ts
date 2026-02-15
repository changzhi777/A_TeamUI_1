/**
 * file-storage
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * File Storage Types
 * 文件存储服务相关类型定义
 */

/**
 * 文件类别
 */
export type FileCategory = 'character-image' | 'costume-image' | 'voice-audio' | 'other'

/**
 * 文件存储状态
 */
export type FileStatus = 'pending' | 'downloading' | 'completed' | 'failed'

/**
 * 文件记录
 */
export interface FileRecord {
  /** 唯一文件 ID */
  id: string
  /** 原始 URL（AI 服务返回的 URL） */
  originalUrl: string
  /** 本地服务器 URL */
  localUrl?: string
  /** IndexedDB 缓存 Blob ID */
  blobId?: string
  /** 文件类别 */
  category: FileCategory
  /** MIME 类型 */
  mimeType: string
  /** 文件大小（字节） */
  size?: number
  /** MD5 哈希值 */
  md5?: string
  /** 存储状态 */
  status: FileStatus
  /** 关联实体类型 */
  entityType?: 'character' | 'asset'
  /** 关联实体 ID */
  entityId?: string
  /** 错误信息 */
  error?: string
  /** 重试次数 */
  retryCount?: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 文件存储选项
 */
export interface StoreOptions {
  /** 文件类别 */
  category: FileCategory
  /** 关联实体类型 */
  entityType?: 'character' | 'asset'
  /** 关联实体 ID */
  entityId?: string
  /** 是否立即缓存到 IndexedDB */
  cacheImmediately?: boolean
  /** 最大重试次数 */
  maxRetries?: number
}

/**
 * 文件获取结果
 */
export interface FileResult {
  /** 文件记录 */
  record: FileRecord
  /** Blob 数据（如果已缓存） */
  blob?: Blob
  /** 可用的 URL（优先级：blob URL > 本地 URL > 原始 URL） */
  url: string
  /** 来源类型 */
  source: 'cache' | 'server' | 'original'
}

/**
 * 批量下载进度
 */
export interface DownloadProgress {
  /** 总文件数 */
  total: number
  /** 已完成数 */
  completed: number
  /** 失败数 */
  failed: number
  /** 当前下载的文件 ID */
  currentFileId?: string
  /** 当前文件进度 (0-100) */
  currentFileProgress?: number
}

/**
 * IndexedDB 数据库配置
 */
export const FILE_STORAGE_DB_NAME = 'file-storage'
export const FILE_STORAGE_DB_VERSION = 1

/**
 * 存储表名称
 */
export const STORE_NAMES = {
  FILES: 'files',
  BLOBS: 'blobs',
} as const

/**
 * 默认重试次数
 */
export const DEFAULT_MAX_RETRIES = 3

/**
 * 缓存过期时间（毫秒）- 7 天
 */
export const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000
