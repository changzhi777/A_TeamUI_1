/**
 * Asset Management Store
 * 资产管理状态管理
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Asset,
  AssetQueryParams,
  AssetMetadata,
  AssetStats,
  AssetUsageDetails,
  AssetBatchResult,
  AssetType,
  AssetSource,
  AssetScope,
} from '../lib/types/assets'
import * as assetsApi from '../lib/api/assets'

/**
 * 资产筛选状态
 */
export interface AssetFilters {
  type?: string
  source?: string
  scope?: string
  tags: string[]
  search: string
}

/**
 * 资产视图模式
 */
export type AssetViewMode = 'grid' | 'list'

/**
 * 资产上传任务
 */
export interface AssetUploadTask {
  id: string
  file: File
  metadata?: AssetMetadata
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  assetId?: string
  cancel: () => void
}

/**
 * 资产 Store 状态
 */
interface AssetState {
  // 筛选和选择状态
  filters: AssetFilters
  viewMode: AssetViewMode
  selectedAssets: Set<string>
  uploadTasks: Map<string, AssetUploadTask>

  // 操作方法
  setFilters: (filters: Partial<AssetFilters>) => void
  resetFilters: () => void
  setViewMode: (mode: AssetViewMode) => void
  toggleSelectAsset: (id: string) => void
  selectAllAssets: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean

  // 上传任务管理
  addUploadTask: (task: AssetUploadTask) => void
  updateUploadTask: (id: string, updates: Partial<AssetUploadTask>) => void
  removeUploadTask: (id: string) => void
  clearCompletedTasks: () => void
  cancelUploadTask: (id: string) => void
}

/**
 * 初始筛选状态
 */
const initialFilters: AssetFilters = {
  type: undefined,
  source: undefined,
  scope: undefined,
  tags: [],
  search: '',
}

/**
 * 创建资产 Store
 */
export const useAssetStore = create<AssetState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // 初始状态
      filters: initialFilters,
      viewMode: 'grid',
      selectedAssets: new Set(),
      uploadTasks: new Map(),

      // 筛选操作
      setFilters: (newFilters) =>
        set((state) => {
          state.filters = { ...state.filters, ...newFilters }
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = initialFilters
          state.selectedAssets.clear()
        }),

      setViewMode: (mode) =>
        set((state) => {
          state.viewMode = mode
        }),

      // 选择操作
      toggleSelectAsset: (id) =>
        set((state) => {
          if (state.selectedAssets.has(id)) {
            state.selectedAssets.delete(id)
          } else {
            state.selectedAssets.add(id)
          }
        }),

      selectAllAssets: (ids) =>
        set((state) => {
          state.selectedAssets = new Set(ids)
        }),

      clearSelection: () =>
        set((state) => {
          state.selectedAssets.clear()
        }),

      isSelected: (id) => {
        return get().selectedAssets.has(id)
      },

      // 上传任务操作
      addUploadTask: (task) =>
        set((state) => {
          state.uploadTasks.set(task.id, task)
        }),

      updateUploadTask: (id, updates) =>
        set((state) => {
          const task = state.uploadTasks.get(id)
          if (task) {
            state.uploadTasks.set(id, { ...task, ...updates })
          }
        }),

      removeUploadTask: (id) =>
        set((state) => {
          state.uploadTasks.delete(id)
        }),

      clearCompletedTasks: () =>
        set((state) => {
          for (const [id, task] of state.uploadTasks) {
            if (task.status === 'completed' || task.status === 'error') {
              state.uploadTasks.delete(id)
            }
          }
        }),

      cancelUploadTask: (id) => {
        const task = get().uploadTasks.get(id)
        if (task?.cancel) {
          task.cancel()
          get().removeUploadTask(id)
        }
      },
    }))
  )
)

/**
 * 资产查询键工厂
 */
export const assetQueryKeys = {
  all: ['assets'] as const,
  lists: () => [...assetQueryKeys.all, 'list'] as const,
  list: (params: AssetQueryParams) => [...assetQueryKeys.lists(), params] as const,
  global: (params?: AssetQueryParams) => [...assetQueryKeys.all, 'global', params] as const,
  project: (projectId: string, params?: AssetQueryParams) =>
    [...assetQueryKeys.all, 'project', projectId, params] as const,
  detail: (id: string) => [...assetQueryKeys.all, 'detail', id] as const,
  stats: (projectId?: string) => [...assetQueryKeys.all, 'stats', projectId] as const,
  usage: (id: string) => [...assetQueryKeys.all, 'usage', id] as const,
  tags: () => [...assetQueryKeys.all, 'tags'] as const,
}

/**
 * 资产列表 Hook
 */
export function useAssets(params?: AssetQueryParams) {
  return useQuery({
    queryKey: assetQueryKeys.list(params || {}),
    queryFn: () => assetsApi.fetchAssets(params),
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

/**
 * 全局资产库 Hook
 */
export function useGlobalAssets(params?: Omit<AssetQueryParams, 'scope'>) {
  return useQuery({
    queryKey: assetQueryKeys.global(params),
    queryFn: () => assetsApi.fetchGlobalAssets(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 项目资产 Hook
 */
export function useProjectAssets(
  projectId: string,
  params?: Omit<AssetQueryParams, 'projectId' | 'scope'>
) {
  return useQuery({
    queryKey: assetQueryKeys.project(projectId, params),
    queryFn: () => assetsApi.fetchProjectAssets(projectId, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 资产详情 Hook
 */
export function useAsset(id: string) {
  return useQuery({
    queryKey: assetQueryKeys.detail(id),
    queryFn: () => assetsApi.fetchAssetById(id),
    enabled: !!id,
  })
}

/**
 * 资产统计 Hook
 */
export function useAssetStats(projectId?: string) {
  return useQuery({
    queryKey: assetQueryKeys.stats(projectId),
    queryFn: () => assetsApi.getAssetStats(projectId),
    staleTime: 10 * 60 * 1000, // 10 分钟
  })
}

/**
 * 资产使用详情 Hook
 */
export function useAssetUsage(id: string) {
  return useQuery({
    queryKey: assetQueryKeys.usage(id),
    queryFn: () => assetsApi.getAssetUsage(id),
    enabled: !!id,
  })
}

/**
 * 热门标签 Hook
 */
export function usePopularTags(limit: number = 20) {
  return useQuery({
    queryKey: [...assetQueryKeys.tags(), 'popular', limit],
    queryFn: () => assetsApi.getPopularTags(limit),
    staleTime: 15 * 60 * 1000, // 15 分钟
  })
}

/**
 * 资产操作 Hook
 */
export function useAssetMutations() {
  const queryClient = useQueryClient()

  // 更新资产
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Asset, 'name' | 'description' | 'tags'>> }) =>
      assetsApi.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 删除资产
  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => assetsApi.batchDeleteAssets(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 添加标签
  const addTagMutation = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => assetsApi.addAssetTag(id, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 移除标签
  const removeTagMutation = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => assetsApi.removeAssetTag(id, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 移动到项目
  const moveToProjectMutation = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      assetsApi.moveAssetToProject(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 批量移动
  const batchMoveMutation = useMutation({
    mutationFn: ({ ids, projectId }: { ids: string[]; projectId: string }) =>
      assetsApi.batchMoveAssetsToProject(ids, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 复制到项目
  const copyToProjectMutation = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      assetsApi.copyAssetToProject(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  // 上传资产
  const uploadMutation = useMutation({
    mutationFn: (params: {
      file?: File
      name: string
      type: AssetType
      source: AssetSource
      scope: AssetScope
      projectId?: string
      tags?: string[]
      description?: string
      externalUrl?: string
      metadata?: Record<string, unknown>
    }) => assetsApi.uploadAsset(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.lists() })
    },
  })

  return {
    updateAsset: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAsset: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    batchDeleteAssets: batchDeleteMutation.mutateAsync,
    isBatchDeleting: batchDeleteMutation.isPending,
    addTag: addTagMutation.mutateAsync,
    isAddingTag: addTagMutation.isPending,
    removeTag: removeTagMutation.mutateAsync,
    isRemovingTag: removeTagMutation.isPending,
    moveToProject: moveToProjectMutation.mutateAsync,
    isMoving: moveToProjectMutation.isPending,
    batchMoveToProject: batchMoveMutation.mutateAsync,
    isBatchMoving: batchMoveMutation.isPending,
    copyToProject: copyToProjectMutation.mutateAsync,
    isCopying: copyToProjectMutation.isPending,
    uploadAsset: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  }
}

/**
 * 当前项目 ID（从 localStorage 恢复）
 */
export function getCurrentProjectId(): string | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('currentProjectId')
  return stored || null
}

/**
 * 设置当前项目 ID
 */
export function setCurrentProjectId(projectId: string | null): void {
  if (typeof window === 'undefined') return
  if (projectId) {
    localStorage.setItem('currentProjectId', projectId)
  } else {
    localStorage.removeItem('currentProjectId')
  }
}
