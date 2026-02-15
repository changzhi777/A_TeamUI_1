/**
 * file-storage-service
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * File Storage Service
 * 文件存储服务 - 统一管理文件存储、缓存和获取
 */

import { indexedDBManager } from './indexed-db'
import {
  type FileRecord,
  type FileResult,
  type StoreOptions,
  type FileCategory,
  DEFAULT_MAX_RETRIES,
} from '@/lib/types/file-storage'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  // 使用 crypto.randomUUID() 或回退到自定义实现
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 回退方案：时间戳 + 随机字符串
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * 文件存储服务类
 */
class FileStorageService {
  /**
   * 存储文件
   * @param originalUrl 原始 URL
   * @param options 存储选项
   * @returns 文件记录
   */
  async storeFile(originalUrl: string, options: StoreOptions): Promise<FileRecord> {
    const now = new Date().toISOString()
    const id = generateId()

    // 检查是否已存在相同 URL 的记录
    const existingRecord = await indexedDBManager.getFileRecordByOriginalUrl(originalUrl)
    if (existingRecord) {
      // 更新关联信息
      const updatedRecord: FileRecord = {
        ...existingRecord,
        entityType: options.entityType,
        entityId: options.entityId,
        updatedAt: now,
      }
      await indexedDBManager.updateFileRecord(updatedRecord)
      return updatedRecord
    }

    // 创建新的文件记录
    const record: FileRecord = {
      id,
      originalUrl,
      category: options.category,
      entityType: options.entityType,
      entityId: options.entityId,
      mimeType: this.guessMimeType(originalUrl, options.category),
      status: 'pending',
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await indexedDBManager.addFileRecord(record)

    // 触发后台下载
    this.downloadInBackground(record, options)

    return record
  }

  /**
   * 获取文件
   * @param id 文件 ID
   * @returns 文件结果
   */
  async getFile(id: string): Promise<FileResult | null> {
    const record = await indexedDBManager.getFileRecord(id)
    if (!record) {
      return null
    }

    // 优先使用 IndexedDB 缓存
    if (record.blobId) {
      const blob = await indexedDBManager.getBlob(record.blobId)
      if (blob) {
        return {
          record,
          blob,
          url: URL.createObjectURL(blob),
          source: 'cache',
        }
      }
    }

    // 其次使用本地服务器 URL
    if (record.localUrl) {
      return {
        record,
        url: record.localUrl,
        source: 'server',
      }
    }

    // 最后使用原始 URL
    return {
      record,
      url: record.originalUrl,
      source: 'original',
    }
  }

  /**
   * 通过原始 URL 获取文件
   * @param originalUrl 原始 URL
   * @returns 文件结果
   */
  async getFileByUrl(originalUrl: string): Promise<FileResult | null> {
    const record = await indexedDBManager.getFileRecordByOriginalUrl(originalUrl)
    if (!record) {
      return null
    }
    return this.getFile(record.id)
  }

  /**
   * 获取实体关联的所有文件
   * @param entityId 实体 ID
   * @returns 文件结果列表
   */
  async getFilesByEntity(entityId: string): Promise<FileResult[]> {
    const records = await indexedDBManager.getFileRecordsByEntityId(entityId)
    const results: FileResult[] = []

    for (const record of records) {
      const result = await this.getFile(record.id)
      if (result) {
        results.push(result)
      }
    }

    return results
  }

  /**
   * 清理缓存
   * @param olderThanDays 清理多少天前的缓存
   * @returns 清理的文件数量
   */
  async clearCache(olderThanDays: number = 7): Promise<number> {
    return indexedDBManager.clearExpiredCache()
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    return indexedDBManager.getCacheStats()
  }

  /**
   * 删除文件
   * @param id 文件 ID
   */
  async deleteFile(id: string): Promise<void> {
    const record = await indexedDBManager.getFileRecord(id)
    if (record) {
      // 删除 Blob 缓存
      if (record.blobId) {
        await indexedDBManager.deleteBlob(record.blobId)
      }
      // 删除文件记录
      await indexedDBManager.deleteFileRecord(id)
    }
  }

  /**
   * 后台下载文件
   */
  private async downloadInBackground(record: FileRecord, options: StoreOptions): Promise<void> {
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES

    try {
      // 更新状态为下载中
      await this.updateFileStatus(record.id, 'downloading')

      // 下载文件
      const response = await fetch(record.originalUrl)
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`)
      }

      const blob = await response.blob()

      // 存储到 IndexedDB
      await indexedDBManager.storeBlob(record.id, blob)

      // 更新文件记录
      const updatedRecord: FileRecord = {
        ...(await indexedDBManager.getFileRecord(record.id))!,
        blobId: record.id,
        size: blob.size,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      }
      await indexedDBManager.updateFileRecord(updatedRecord)
    } catch (error) {
      console.error(`Failed to download file ${record.id}:`, error)

      // 重试逻辑
      const currentRecord = await indexedDBManager.getFileRecord(record.id)
      if (currentRecord) {
        const retryCount = (currentRecord.retryCount ?? 0) + 1

        if (retryCount < maxRetries) {
          // 延迟重试
          setTimeout(() => {
            this.downloadInBackground(currentRecord, options)
          }, 1000 * retryCount) // 指数退避

          await this.updateFileStatus(record.id, 'pending', retryCount)
        } else {
          // 超过重试次数，标记为失败
          await this.updateFileStatus(
            record.id,
            'failed',
            retryCount,
            error instanceof Error ? error.message : 'Unknown error'
          )
        }
      }
    }
  }

  /**
   * 更新文件状态
   */
  private async updateFileStatus(
    id: string,
    status: FileRecord['status'],
    retryCount?: number,
    error?: string
  ): Promise<void> {
    const record = await indexedDBManager.getFileRecord(id)
    if (record) {
      const updatedRecord: FileRecord = {
        ...record,
        status,
        retryCount: retryCount ?? record.retryCount,
        error,
        updatedAt: new Date().toISOString(),
      }
      await indexedDBManager.updateFileRecord(updatedRecord)
    }
  }

  /**
   * 推测 MIME 类型
   */
  private guessMimeType(url: string, category: FileCategory): string {
    // 从 URL 扩展名推测
    const extension = url.split('.').pop()?.toLowerCase()?.split('?')[0]

    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
    }

    if (extension && mimeMap[extension]) {
      return mimeMap[extension]
    }

    // 根据类别推测
    if (category === 'voice-audio') {
      return 'audio/mpeg'
    }
    return 'image/png'
  }
}

// 导出单例
export const fileStorageService = new FileStorageService()
