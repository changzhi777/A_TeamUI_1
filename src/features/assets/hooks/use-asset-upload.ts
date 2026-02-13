/**
 * Asset Upload Hook
 * 资产上传进度追踪 Hook
 */

import { useCallback } from 'react'
import type { AssetType } from '@/lib/types/assets'
import { ASSET_SIZE_LIMITS, formatAssetFileSize } from '@/lib/types/assets'
import { useAssetStore } from '@/stores/asset-store'
import type { AssetUploadTask } from '@/stores/asset-store'

export function useAssetUpload() {
  const { uploadTasks, addUploadTask, updateUploadTask, clearCompletedTasks } = useAssetStore()

  // 添加上传任务
  const startUpload = (
    file: File,
    scope?: 'global' | 'project',
    projectId?: string
  ): string => {
    const taskId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const controller = new AbortController()

    addUploadTask({
      id: taskId,
      file,
      progress: 0,
      status: 'pending',
      metadata: { scope, projectId },
      cancel: () => controller.abort(),
    })

    return taskId
  }

  // 更新上传任务进度
  const updateProgress = useCallback((taskId: string, progress: number) => {
    updateUploadTask(taskId, { progress, status: 'uploading' as const })
  }, [updateUploadTask])

  // 完成上传任务
  const completeTask = useCallback((taskId: string, assetId?: string) => {
    updateUploadTask(taskId, {
      status: 'completed',
      progress: 100,
      assetId,
    })

    // 延迟清理任务，防止快速点击时状态闪烁
    setTimeout(() => {
      clearCompletedTasks()
    }, 3000)
  }, [updateUploadTask, clearCompletedTasks])

  // 失败上传任务
  const failTask = useCallback((taskId: string, error: string) => {
    updateUploadTask(taskId, {
      status: 'error',
      error,
    })

    // 延迟清理任务
    setTimeout(() => {
      clearCompletedTasks()
    }, 3000)
  }, [updateUploadTask, clearCompletedTasks])

  // 取消上传任务
  const cancelTask = useCallback((taskId: string) => {
    const task = uploadTasks.get(taskId)
    if (!task || task.status === 'completed') {
      return
    }

    // 调用任务的 cancel 方法
    if (task.cancel) {
      task.cancel()
    }

    // 移除任务
    updateUploadTask(taskId, {
      status: 'error',
      error: '已取消',
    })

    // 立即清理任务
    clearCompletedTasks()
  }, [uploadTasks, updateUploadTask, clearCompletedTasks])

  // 清空已完成的任务
  const clearOldTasks = useCallback(() => {
    const now = Date.now()
    const threshold = now - 5 * 60 * 1000 // 5分钟前的任务视为已过期

    uploadTasks.forEach((task, id) => {
      const taskTimestamp = parseInt(id.split('-')[1]) || 0
      if (task.status === 'completed' && taskTimestamp < threshold) {
        // 已完成的任务不需要保留，状态会在 store 中自动清理
      }
    })
  }, [uploadTasks])

  // 获取上传统计
  const getUploadStats = useCallback(() => {
    const tasks = Array.from(uploadTasks.values())
    const total = tasks.length
    const uploading = tasks.filter((t) => t.status === 'uploading').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const error = tasks.filter((t) => t.status === 'error').length
    const hasUploadingOrCompleted = uploading > 0 || completed > 0
    const progress = hasUploadingOrCompleted
      ? Math.round(
          tasks.reduce((sum, t) => {
            const isUploadingOrCompleted = t.status === 'uploading' || t.status === 'completed'
            if (isUploadingOrCompleted) {
              const taskProgress = t.status === 'completed' ? 100 : (t.progress || 0)
              return sum + taskProgress
            }
            return sum
          }, 0) / tasks.length
        )
      : 0

    return {
      total,
      uploading,
      completed,
      error,
      progress,
    }
  }, [uploadTasks])

  return {
    startUpload,
    uploadTasks: Array.from(uploadTasks.values()),
    getUploadStats,
    cancelTask,
    updateProgress,
    completeTask,
    failTask,
    clearOldTasks,
  }
}
