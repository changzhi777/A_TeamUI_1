/**
 * indexed-db
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * IndexedDB Manager for File Storage
 * 文件存储 IndexedDB 管理器
 */

import {
  FILE_STORAGE_DB_NAME,
  FILE_STORAGE_DB_VERSION,
  STORE_NAMES,
  CACHE_EXPIRY_MS,
  type FileRecord,
} from '@/lib/types/file-storage'

/**
 * Blob 缓存记录
 */
interface BlobCacheRecord {
  id: string
  blob: Blob
  createdAt: string
  lastAccessedAt: string
}

/**
 * IndexedDB 管理类
 */
class IndexedDBManager {
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null

  /**
   * 初始化数据库
   */
  async init(): Promise<IDBDatabase> {
    // 如果已经在初始化中，返回同一个 Promise
    if (this.initPromise) {
      return this.initPromise
    }

    // 如果已经初始化完成，直接返回
    if (this.db) {
      return this.db
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(FILE_STORAGE_DB_NAME, FILE_STORAGE_DB_VERSION)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`))
        this.initPromise = null
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
        this.initPromise = null
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建文件记录存储
        if (!db.objectStoreNames.contains(STORE_NAMES.FILES)) {
          const filesStore = db.createObjectStore(STORE_NAMES.FILES, { keyPath: 'id' })
          filesStore.createIndex('originalUrl', 'originalUrl', { unique: true })
          filesStore.createIndex('entityId', 'entityId', { unique: false })
          filesStore.createIndex('status', 'status', { unique: false })
        }

        // 创建 Blob 缓存存储
        if (!db.objectStoreNames.contains(STORE_NAMES.BLOBS)) {
          db.createObjectStore(STORE_NAMES.BLOBS, { keyPath: 'id' })
        }
      }
    })

    return this.initPromise
  }

  /**
   * 获取数据库实例
   */
  private async getDb(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }
    return this.init()
  }

  /**
   * 添加文件记录
   */
  async addFileRecord(record: FileRecord): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const request = store.add(record)

      request.onerror = () => {
        reject(new Error(`Failed to add file record: ${request.error}`))
      }

      transaction.oncomplete = () => {
        resolve()
      }
    })
  }

  /**
   * 更新文件记录
   */
  async updateFileRecord(record: FileRecord): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const request = store.put(record)

      request.onerror = () => {
        reject(new Error(`Failed to update file record: ${request.error}`))
      }

      transaction.oncomplete = () => {
        resolve()
      }
    })
  }

  /**
   * 获取文件记录
   */
  async getFileRecord(id: string): Promise<FileRecord | undefined> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readonly')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const request = store.get(id)

      request.onerror = () => {
        reject(new Error(`Failed to get file record: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  /**
   * 通过原始 URL 获取文件记录
   */
  async getFileRecordByOriginalUrl(originalUrl: string): Promise<FileRecord | undefined> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readonly')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const index = store.index('originalUrl')
      const request = index.get(originalUrl)

      request.onerror = () => {
        reject(new Error(`Failed to get file record by URL: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  /**
   * 通过实体 ID 获取文件记录列表
   */
  async getFileRecordsByEntityId(entityId: string): Promise<FileRecord[]> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readonly')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const index = store.index('entityId')
      const request = index.getAll(entityId)

      request.onerror = () => {
        reject(new Error(`Failed to get file records by entity: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  /**
   * 获取所有文件记录
   */
  async getAllFileRecords(): Promise<FileRecord[]> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readonly')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const request = store.getAll()

      request.onerror = () => {
        reject(new Error(`Failed to get all file records: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  /**
   * 删除文件记录
   */
  async deleteFileRecord(id: string): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.FILES, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.FILES)
      const request = store.delete(id)

      request.onerror = () => {
        reject(new Error(`Failed to delete file record: ${request.error}`))
      }

      transaction.oncomplete = () => {
        resolve()
      }
    })
  }

  /**
   * 存储 Blob 到缓存
   */
  async storeBlob(id: string, blob: Blob): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.BLOBS, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.BLOBS)
      const now = new Date().toISOString()
      const record: BlobCacheRecord = {
        id,
        blob,
        createdAt: now,
        lastAccessedAt: now,
      }
      const request = store.put(record)

      request.onerror = () => {
        reject(new Error(`Failed to store blob: ${request.error}`))
      }

      transaction.oncomplete = () => {
        resolve()
      }
    })
  }

  /**
   * 获取缓存的 Blob
   */
  async getBlob(id: string): Promise<Blob | undefined> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.BLOBS, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.BLOBS)
      const request = store.get(id)

      request.onerror = () => {
        reject(new Error(`Failed to get blob: ${request.error}`))
      }

      request.onsuccess = () => {
        const record = request.result as BlobCacheRecord | undefined
        if (record) {
          // 更新最后访问时间
          record.lastAccessedAt = new Date().toISOString()
          store.put(record)
          resolve(record.blob)
        } else {
          resolve(undefined)
        }
      }
    })
  }

  /**
   * 删除缓存的 Blob
   */
  async deleteBlob(id: string): Promise<void> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.BLOBS, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.BLOBS)
      const request = store.delete(id)

      request.onerror = () => {
        reject(new Error(`Failed to delete blob: ${request.error}`))
      }

      transaction.oncomplete = () => {
        resolve()
      }
    })
  }

  /**
   * 清理过期缓存
   */
  async clearExpiredCache(): Promise<number> {
    const db = await this.getDb()
    const cutoffTime = new Date(Date.now() - CACHE_EXPIRY_MS).toISOString()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.BLOBS, 'readwrite')
      const store = transaction.objectStore(STORE_NAMES.BLOBS)
      const request = store.openCursor()
      let deletedCount = 0

      request.onerror = () => {
        reject(new Error(`Failed to clear expired cache: ${request.error}`))
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const record = cursor.value as BlobCacheRecord
          if (record.lastAccessedAt < cutoffTime) {
            cursor.delete()
            deletedCount++
          }
          cursor.continue()
        } else {
          resolve(deletedCount)
        }
      }
    })
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    const db = await this.getDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES.BLOBS, 'readonly')
      const store = transaction.objectStore(STORE_NAMES.BLOBS)
      const request = store.openCursor()

      let count = 0
      let totalSize = 0

      request.onerror = () => {
        reject(new Error(`Failed to get cache stats: ${request.error}`))
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const record = cursor.value as BlobCacheRecord
          count++
          totalSize += record.blob.size
          cursor.continue()
        } else {
          resolve({ count, totalSize })
        }
      }
    })
  }
}

// 导出单例
export const indexedDBManager = new IndexedDBManager()
