/**
 * storyboard-store
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storyboardApi } from '@/lib/api/storyboard'
import { getWebSocketClient } from '@/lib/websocket/client'
import { handleServerError } from '@/lib/handle-server-error'
import { toast } from 'sonner'
import { useProjectStore } from './project-store'

// 分镜头类型定义
export type ShotSize = 'extremeLong' | 'long' | 'medium' | 'closeUp' | 'extremeCloseUp'
export type CameraMovement = 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'pedestral' | 'crane' | 'handheld' | 'steadicam' | 'tracking' | 'arc'
export type ViewMode = 'list' | 'timeline' | 'grid'

// 自定义字段值类型
export type CustomFieldValue = string | number | boolean | string[] | null

export interface StoryboardShot {
  id: string
  projectId: string
  // 基本信息
  shotNumber: number
  seasonNumber?: number // 新增：季数
  episodeNumber?: number // 新增：集数
  sceneNumber: string
  // 镜头参数
  shotSize: ShotSize
  cameraMovement: CameraMovement
  duration: number // 秒
  // 内容描述
  description: string
  dialogue: string
  sound: string
  // 配图
  image?: string // Base64 或图片 URL
  imageThumbnail?: string // 缩略图
  // 自定义字段值
  customFields?: Record<string, CustomFieldValue>
  // 元数据
  createdAt: string
  updatedAt: string
  createdBy: string
  // AI 生成标记
  aiGenerated?: boolean
}

// 同步状态类型
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

// 编辑锁状态
export interface EditLock {
  shotId: string
  userId: string
  userName: string
  acquiredAt: string
}

interface StoryboardState {
  // 数据
  shots: StoryboardShot[]
  currentProjectId: string | null
  viewMode: ViewMode
  selectedShotIds: string[]

  // 同步状态
  syncStatus: SyncStatus
  lastSyncAt: string | null
  isOnline: boolean

  // 编辑锁
  editLocks: Map<string, EditLock>

  // 加载状态
  isLoading: boolean
  error: string | null

  // 分镜头操作
  loadShots: (projectId: string, forceRefresh?: boolean) => Promise<void>
  createShot: (projectId: string, data: Omit<StoryboardShot, 'id' | 'shotNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateShot: (shotId: string, updates: Partial<StoryboardShot>) => Promise<void>
  deleteShot: (shotId: string) => Promise<void>
  deleteShots: (ids: string[]) => Promise<void>

  // 获取操作
  getShotsByProject: (projectId: string) => StoryboardShot[]
  getShotById: (id: string) => StoryboardShot | undefined

  // 排序操作
  reorderShots: (shotIds: string[]) => Promise<void>
  moveShot: (shotId: string, newIndex: number) => void

  // 图片操作
  uploadShotImage: (shotId: string, file: File) => Promise<{ imageUrl: string; thumbnailUrl: string }>
  removeShotImage: (shotId: string) => Promise<void>

  // 批量操作
  duplicateShots: (shotIds: string[]) => Promise<void>

  // 本地添加方法（用于导入等场景）
  addShot: (shot: Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>) => string
  addShots: (shots: Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>[]) => void

  // 视图模式
  setViewMode: (mode: ViewMode) => void

  // 选择操作
  selectShot: (shotId: string) => void
  deselectShot: (shotId: string) => void
  selectAllShots: () => void
  deselectAllShots: () => void
  toggleShotSelection: (shotId: string) => void
  deleteSelectedShots: () => Promise<void>

  // 项目操作
  setCurrentProject: (projectId: string | null) => void

  // 编辑锁操作
  acquireLock: (shotId: string) => Promise<boolean>
  releaseLock: (shotId: string) => void
  isLocked: (shotId: string) => boolean
  getLock: (shotId: string) => EditLock | undefined

  // 同步控制
  syncWithServer: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void

  // WebSocket 事件处理
  handleWebSocketMessage: (message: any) => void
}

export const useStoryboardStore = create<StoryboardState>()(
  persist(
    (set, get) => ({
      // 初始状态
      shots: [],
      currentProjectId: null,
      viewMode: 'list',
      selectedShotIds: [],
      syncStatus: 'idle',
      lastSyncAt: null,
      isOnline: navigator.onLine,
      editLocks: new Map(),
      isLoading: false,
      error: null,

      // 加载分镜头列表
      loadShots: async (projectId, forceRefresh = false) => {
        const state = get()

        // 如果有缓存且不强制刷新，直接使用缓存
        if (!forceRefresh && state.currentProjectId === projectId && state.shots.length > 0 && state.syncStatus === 'synced') {
          return
        }

        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          const { shots } = await storyboardApi.getShots(projectId, {
            page: 1,
            pageSize: 500,
          })

          set({
            shots,
            currentProjectId: projectId,
            syncStatus: 'synced',
            lastSyncAt: new Date().toISOString(),
            isLoading: false,
          })

          // 更新项目统计
          const total = shots.length
          const completed = shots.filter((s) => s.description && s.description.trim()).length
          useProjectStore.getState().updateShotProgress(projectId, total, completed)
        } catch (error) {
          console.error('Load shots error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load shots',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 创建分镜头
      createShot: async (projectId, data) => {
        try {
          set({ isLoading: true, error: null })

          // 获取锁
          const locked = await get().acquireLock('new-shot')
          if (!locked) {
            toast.error('无法获取编辑锁，请稍后重试')
            return ''
          }

          const shot = await storyboardApi.createShot(projectId, {
            sceneNumber: data.sceneNumber,
            shotSize: data.shotSize,
            cameraMovement: data.cameraMovement,
            duration: data.duration || 0,
            description: data.description || '',
            dialogue: data.dialogue || '',
            sound: data.sound || '',
          })

          // 乐观更新：先添加到本地状态
          set((state) => ({
            shots: [...state.shots, shot],
            isLoading: false,
            syncStatus: 'synced',
          }))

          // 更新项目统计
          const total = get().shots.length
          const completed = get().shots.filter((s) => s.description && s.description.trim()).length
          useProjectStore.getState().updateShotProgress(projectId, total + 1, completed)

          toast.success('分镜头创建成功')

          // 释放锁
          get().releaseLock(shot.id)

          return shot.id
        } catch (error) {
          console.error('Create shot error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to create shot',
            isLoading: false,
            syncStatus: 'error',
          })
          throw error
        }
      },

      // 更新分镜头
      updateShot: async (shotId, updates) => {
        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          // 获取锁
          const locked = await get().acquireLock(shotId)
          if (!locked) {
            const lock = get().getLock(shotId)
            toast.error(`该分镜头正由 ${lock?.userName} 编辑中`)
            return
          }

          // 乐观更新：先更新本地状态
          const timestamp = new Date().toISOString()
          set((state) => ({
            shots: state.shots.map((s) =>
              s.id === shotId
                ? { ...s, ...updates, updatedAt: timestamp }
                : s
            ),
          }))

          // 调用 API 更新
          await storyboardApi.updateShot(shotId, updates)

          set({
            syncStatus: 'synced',
            lastSyncAt: timestamp,
            isLoading: false,
          })

          toast.success('分镜头更新成功')

          // 释放锁
          get().releaseLock(shotId)
        } catch (error) {
          console.error('Update shot error:', error)
          handleServerError(error)

          // 回滚：重新加载分镜头数据
          await get().loadShots(get().currentProjectId!, true)

          set({
            error: error instanceof Error ? error.message : 'Failed to update shot',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 删除分镜头
      deleteShot: async (shotId) => {
        try {
          set({ isLoading: true, error: null })

          await storyboardApi.deleteShot(shotId)

          // 从本地状态移除并重新编号
          const projectId = get().currentProjectId!
          set((state) => {
            const filtered = state.shots.filter((s) => s.id !== shotId)
            const projectShots = filtered
              .filter((s) => s.projectId === projectId)
              .sort((a, b) => a.shotNumber - b.shotNumber)

            const renumberedShots = projectShots.map((shot, index) => ({
              ...shot,
              shotNumber: index + 1,
              updatedAt: new Date().toISOString(),
            }))

            const otherShots = filtered.filter((s) => s.projectId !== projectId)

            return {
              shots: [...otherShots, ...renumberedShots],
              selectedShotIds: state.selectedShotIds.filter((id) => id !== shotId),
            }
          })

          // 更新项目统计
          const total = get().shots.length - 1
          const completed = get().shots.filter((s) => s.description && s.description.trim()).length
          useProjectStore.getState().updateShotProgress(projectId, total, completed)

          toast.success('分镜头已删除')
        } catch (error) {
          console.error('Delete shot error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to delete shot',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 批量删除
      deleteShots: async (ids) => {
        try {
          set({ isLoading: true, error: null })

          await storyboardApi.batchDeleteShots({ shotIds: ids })

          set((state) => ({
            shots: state.shots.filter((s) => !ids.includes(s.id)),
            selectedShotIds: state.selectedShotIds.filter((id) => !ids.includes(id)),
            isLoading: false,
            syncStatus: 'synced',
          }))

          toast.success(`已删除 ${ids.length} 个分镜头`)

          // 更新项目统计
          if (get().currentProjectId) {
            const total = get().shots.length - ids.length
            const completed = get().shots.filter((s) => s.description && s.description.trim() && !ids.includes(s.id)).length
            useProjectStore.getState().updateShotProgress(get().currentProjectId, total, completed)
          }
        } catch (error) {
          console.error('Batch delete shots error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to delete shots',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 根据项目获取分镜头
      getShotsByProject: (projectId) => {
        return get().shots.filter((s) => s.projectId === projectId).sort((a, b) => a.shotNumber - b.shotNumber)
      },

      // 根据 ID 获取分镜头
      getShotById: (id) => {
        return get().shots.find((s) => s.id === id)
      },

      // 重新排序
      reorderShots: async (shotIds) => {
        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          const projectId = get().currentProjectId!

          await storyboardApi.reorderShots({ shotIds, projectId })

          // 重新编号
          set((state) => {
            const shotMap = new Map(state.shots.map((s) => [s.id, s]))
            const reorderedShots = shotIds.map((shotId, index) => ({
              ...shotMap.get(shotId)!,
              shotNumber: index + 1,
              updatedAt: new Date().toISOString(),
            }))

            const otherShots = state.shots.filter((s) => !shotIds.includes(s.id))

            return {
              shots: [...otherShots, ...reorderedShots],
              isLoading: false,
              syncStatus: 'synced',
            }
          })

          toast.success('分镜头已重新排序')
        } catch (error) {
          console.error('Reorder shots error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to reorder shots',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 移动分镜头
      moveShot: (shotId, newIndex) => {
        const state = get()
        const currentProjectId = state.currentProjectId
        if (!currentProjectId) return

        const projectShots = state.shots
          .filter((s) => s.projectId === currentProjectId)
          .sort((a, b) => a.shotNumber - b.shotNumber)

        const currentIndex = projectShots.findIndex((s) => s.id === shotId)
        if (currentIndex === -1 || currentIndex === newIndex) return

        const [movedShot] = projectShots.splice(currentIndex, 1)
        projectShots.splice(newIndex, 0, movedShot)

        const renumberedShots = projectShots.map((shot, index) => ({
          ...shot,
          shotNumber: index + 1,
          updatedAt: new Date().toISOString(),
        }))

        const otherShots = state.shots.filter((s) => s.projectId !== currentProjectId)

        set({
          shots: [...otherShots, ...renumberedShots],
        })
      },

      // 上传图片
      uploadShotImage: async (shotId, file) => {
        try {
          set({ isLoading: true, error: null })

          const { imageUrl, thumbnailUrl } = await storyboardApi.uploadShotImage(shotId, file)

          set((state) => ({
            shots: state.shots.map((s) =>
              s.id === shotId
                ? { ...s, image: imageUrl, imageThumbnail: thumbnailUrl }
                : s
            ),
            isLoading: false,
            syncStatus: 'synced',
          }))

          toast.success('图片上传成功')
          return { imageUrl, thumbnailUrl }
        } catch (error) {
          console.error('Upload shot image error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to upload image',
            isLoading: false,
            syncStatus: 'error',
          })
          throw error
        }
      },

      // 删除图片
      removeShotImage: async (shotId) => {
        try {
          set({ isLoading: true, error: null })

          await storyboardApi.deleteShotImage(shotId)

          set((state) => ({
            shots: state.shots.map((s) =>
              s.id === shotId
                ? { ...s, image: undefined, imageThumbnail: undefined }
                : s
            ),
            isLoading: false,
            syncStatus: 'synced',
          }))

          toast.success('图片已删除')
        } catch (error) {
          console.error('Remove shot image error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to remove image',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 批量复制
      duplicateShots: async (shotIds) => {
        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          const projectId = get().currentProjectId!
          const { shots } = await storyboardApi.duplicateShots({ shotIds, projectId })

          set((state) => ({
            shots: [...state.shots, ...shots],
            isLoading: false,
            syncStatus: 'synced',
          }))

          toast.success(`已复制 ${shotIds.length} 个分镜头`)

          // 更新项目统计
          const total = get().shots.length + shots.length
          const completed = get().shots.filter((s) => s.description && s.description.trim()).length
          useProjectStore.getState().updateShotProgress(projectId, total, completed)
        } catch (error) {
          console.error('Duplicate shots error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to duplicate shots',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 本地添加单个分镜头（用于导入等场景，不调用 API）
      addShot: (data) => {
        const id = `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        const newShot: StoryboardShot = {
          id,
          ...data,
          createdAt: now,
          updatedAt: now,
        } as StoryboardShot

        set((state) => ({
          shots: [...state.shots, newShot],
        }))

        return id
      },

      // 本地批量添加分镜头（用于导入等场景，不调用 API）
      addShots: (shotsData) => {
        const now = new Date().toISOString()
        const newShots: StoryboardShot[] = shotsData.map((data, index) => ({
          id: `shot-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          createdAt: now,
          updatedAt: now,
        })) as StoryboardShot[]

        set((state) => ({
          shots: [...state.shots, ...newShots],
        }))
      },

      // 设置视图模式
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      // 选择分镜头
      selectShot: (shotId) => {
        set((state) => ({
          selectedShotIds: [...state.selectedShotIds, shotId],
        }))
      },

      // 取消选择
      deselectShot: (shotId) => {
        set((state) => ({
          selectedShotIds: state.selectedShotIds.filter((id) => id !== shotId),
        }))
      },

      // 全选
      selectAllShots: () => {
        const currentProjectId = get().currentProjectId
        if (!currentProjectId) return

        const projectShots = get().shots.filter((s) => s.projectId === currentProjectId)
        set({
          selectedShotIds: projectShots.map((s) => s.id),
        })
      },

      // 取消全选
      deselectAllShots: () => {
        set({ selectedShotIds: [] })
      },

      // 切换选择
      toggleShotSelection: (shotId) => {
        set((state) => ({
          selectedShotIds: state.selectedShotIds.includes(shotId)
            ? state.selectedShotIds.filter((id) => id !== shotId)
            : [...state.selectedShotIds, shotId],
        }))
      },

      // 删除选中的分镜头
      deleteSelectedShots: async () => {
        const selectedIds = get().selectedShotIds
        if (selectedIds.length > 0) {
          await get().deleteShots(selectedIds)
          set({ selectedShotIds: [] })
        }
      },

      // 设置当前项目
      setCurrentProject: (projectId) => {
        const wsClient = getWebSocketClient()

        // 切换项目时清理锁
        if (get().currentProjectId && get().currentProjectId !== projectId) {
          // 释放旧项目的所有锁
          get().editLocks.forEach((lock, shotId) => {
            if (wsClient.isConnected()) {
              wsClient.send('release_lock', { shotId })
            }
          })
          set({ editLocks: new Map() })
        }

        set({ currentProjectId: projectId, selectedShotIds: [] })
      },

      // 获取编辑锁
      acquireLock: async (shotId) => {
        const wsClient = getWebSocketClient()
        if (!wsClient.isConnected()) {
          return false
        }

        // 发送锁请求
        wsClient.send('acquire_lock', { shotId })

        // 等待响应（简化处理，实际应该有超时机制）
        return new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(false), 5000)

          // 监听锁状态变化
          const checkLock = setInterval(() => {
            const lock = get().getLock(shotId)
            if (lock && lock.userId === getCurrentUserId()) {
              clearTimeout(timeout)
              clearInterval(checkLock)
              resolve(true)
            }
          }, 100)
        })
      },

      // 释放编辑锁
      releaseLock: (shotId) => {
        const wsClient = getWebSocketClient()
        if (wsClient.isConnected()) {
          wsClient.send('release_lock', { shotId })
        }

        set((state) => {
          const newLocks = new Map(state.editLocks)
          newLocks.delete(shotId)
          return { editLocks: newLocks }
        })
      },

      // 检查是否被锁定
      isLocked: (shotId) => {
        return get().editLocks.has(shotId)
      },

      // 获取锁信息
      getLock: (shotId) => {
        return get().editLocks.get(shotId)
      },

      // 同步服务器数据
      syncWithServer: async () => {
        const projectId = get().currentProjectId
        if (!projectId) return

        try {
          set({ syncStatus: 'syncing' })
          await get().loadShots(projectId, true)
        } catch (error) {
          console.error('Sync with server error:', error)
          set({ syncStatus: 'error' })
        }
      },

      // 设置在线状态
      setOnlineStatus: (isOnline) => {
        set({ isOnline })

        // 如果恢复在线，尝试同步
        if (isOnline && get().syncStatus !== 'synced') {
          get().syncWithServer()
        }
      },

      // 处理 WebSocket 消息
      handleWebSocketMessage: (message) => {
        const currentProjectId = get().currentProjectId

        switch (message.type) {
          case 'lock_acquired':
            // 其他用户获取了锁
            if (message.data.projectId === currentProjectId) {
              const lock: EditLock = {
                shotId: message.data.shotId,
                userId: message.data.userId,
                userName: message.data.userName || message.data.userId,
                acquiredAt: new Date().toISOString(),
              }
              set((state) => {
                const newLocks = new Map(state.editLocks)
                newLocks.set(lock.shotId, lock)
                return { editLocks: newLocks }
              })
            }
            break

          case 'lock_released':
            // 锁被释放
            if (message.data.projectId === currentProjectId) {
              set((state) => {
                const newLocks = new Map(state.editLocks)
                newLocks.delete(message.data.shotId)
                return { editLocks: newLocks }
              })
            }
            break

          case 'shot_created':
            // 新分镜头被创建
            if (message.data.projectId === currentProjectId) {
              const shot = message.data.shot
              if (shot && !get().shots.find((s) => s.id === shot.id)) {
                set((state) => ({
                  shots: [...state.shots, shot],
                }))

                // 更新项目统计
                useProjectStore.getState().updateShotProgress(
                  currentProjectId,
                  get().shots.length + 1,
                  get().shots.filter((s) => s.description && s.description.trim()).length
                )
              }
            }
            break

          case 'shot_updated':
            // 分镜头被更新
            if (message.data.projectId === currentProjectId) {
              const updatedShot = message.data.shot
              set((state) => ({
                shots: state.shots.map((s) =>
                  s.id === updatedShot.id ? { ...s, ...updatedShot } : s
                ),
              }))
            }
            break

          case 'shot_deleted':
            // 分镜头被删除
            if (message.data.projectId === currentProjectId) {
              const deletedShotId = message.data.shotId
              set((state) => ({
                shots: state.shots.filter((s) => s.id !== deletedShotId),
                selectedShotIds: state.selectedShotIds.filter((id) => id !== deletedShotId),
              }))
            }
            break

          case 'shot_reordered':
            // 分镜头被重新排序
            if (message.data.projectId === currentProjectId) {
              const { shotIds } = message.data
              const shotMap = new Map(get().shots.map((s) => [s.id, s]))
              const reorderedShots = shotIds.map((shotId, index) => ({
                ...shotMap.get(shotId)!,
                shotNumber: index + 1,
                updatedAt: new Date().toISOString(),
              }))

              const otherShots = get().shots.filter((s) => !shotIds.includes(s.id))

              set({
                shots: [...otherShots, ...reorderedShots],
              })
            }
            break

          default:
            break
        }
      },
    }),
    {
      name: 'storyboard-storage',
      // 持久化必要的数据
      partialize: (state) => ({
        shots: state.shots,
        currentProjectId: state.currentProjectId,
        viewMode: state.viewMode,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
)

// 获取当前用户 ID
function getCurrentUserId(): string {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const auth = JSON.parse(authStorage)
      return auth?.state?.user?.id || 'unknown'
    }
  } catch {}
  return 'unknown'
}

// 设置 WebSocket 事件监听
export function setupWebSocketListeners() {
  const wsClient = getWebSocketClient()
  const store = useStoryboardStore.getState()

  // 监听所有 WebSocket 消息
  wsClient.onMessage((message) => {
    store.handleWebSocketMessage(message)
  })

  // 监听连接状态
  wsClient.onOpen(() => {
    console.log('Storyboard store: WebSocket connected')
    // 连接成功后，如果有当前项目，重新同步数据
    if (store.currentProjectId && store.isOnline) {
      store.syncWithServer()
    }
  })

  wsClient.onClose(() => {
    console.log('Storyboard store: WebSocket disconnected')
  })
}

// 监听网络状态变化
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useStoryboardStore.getState().setOnlineStatus(true)
  })

  window.addEventListener('offline', () => {
    useStoryboardStore.getState().setOnlineStatus(false)
  })
}
