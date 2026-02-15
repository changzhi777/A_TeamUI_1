/**
 * files
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Files API Client
 * 文件管理 API 客户端
 */

import { fileStorageService } from '@/lib/services/file-storage'
import type { FileRecord, FileResult, StoreOptions, DownloadProgress } from '@/lib/types/file-storage'

/**
 * 文件 API
 */
export const filesApi = {
  /**
   * 存储文件
   * @param originalUrl 原始 URL
   * @param options 存储选项
   * @returns 文件记录
   */
  async storeFile(originalUrl: string, options: StoreOptions): Promise<FileRecord> {
    return fileStorageService.storeFile(originalUrl, options)
  },

  /**
   * 获取文件
   * @param id 文件 ID
   * @returns 文件结果
   */
  async getFile(id: string): Promise<FileResult | null> {
    return fileStorageService.getFile(id)
  },

  /**
   * 通过原始 URL 获取文件
   * @param originalUrl 原始 URL
   * @returns 文件结果
   */
  async getFileByUrl(originalUrl: string): Promise<FileResult | null> {
    return fileStorageService.getFileByUrl(originalUrl)
  },

  /**
   * 获取实体关联的所有文件
   * @param entityId 实体 ID
   * @returns 文件结果列表
   */
  async getFilesByEntity(entityId: string): Promise<FileResult[]> {
    return fileStorageService.getFilesByEntity(entityId)
  },

  /**
   * 删除文件
   * @param id 文件 ID
   */
  async deleteFile(id: string): Promise<void> {
    return fileStorageService.deleteFile(id)
  },

  /**
   * 清理缓存
   * @param olderThanDays 清理多少天前的缓存
   * @returns 清理的文件数量
   */
  async clearCache(olderThanDays?: number): Promise<number> {
    return fileStorageService.clearCache(olderThanDays)
  },

  /**
   * 获取缓存统计
   */
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    return fileStorageService.getCacheStats()
  },

  /**
   * 批量预下载文件
   * @param urls 文件 URL 列表
   * @param options 存储选项
   * @param onProgress 进度回调
   * @returns 文件记录列表
   */
  async batchDownload(
    urls: string[],
    options: StoreOptions,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<FileRecord[]> {
    const records: FileRecord[] = []
    const progress: DownloadProgress = {
      total: urls.length,
      completed: 0,
      failed: 0,
    }

    for (const url of urls) {
      try {
        progress.currentFileId = url
        progress.currentFileProgress = 0
        onProgress?.(progress)

        const record = await fileStorageService.storeFile(url, options)
        records.push(record)

        progress.completed++
        progress.currentFileProgress = 100
        onProgress?.(progress)
      } catch (error) {
        console.error(`Failed to download file: ${url}`, error)
        progress.failed++
        onProgress?.(progress)
      }
    }

    progress.currentFileId = undefined
    progress.currentFileProgress = undefined
    onProgress?.(progress)

    return records
  },

  /**
   * 获取可用的文件 URL（优先使用缓存）
   * @param originalUrl 原始 URL
   * @returns 可用的 URL
   */
  async getAvailableUrl(originalUrl: string): Promise<string> {
    const result = await fileStorageService.getFileByUrl(originalUrl)
    if (result) {
      return result.url
    }
    return originalUrl
  },

  /**
   * 检查文件是否已缓存
   * @param originalUrl 原始 URL
   * @returns 是否已缓存
   */
  async isCached(originalUrl: string): Promise<boolean> {
    const result = await fileStorageService.getFileByUrl(originalUrl)
    return result?.source === 'cache'
  },
}
