/**
 * use-character-tasks
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Custom hook for managing character AI tasks
 * 角色设计 AI 任务管理 Hook
 */

import { useCallback, useEffect, useState } from 'react'
import { useTaskStore } from '@/stores/task-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  createImageGenerationTask,
  createTTSGenerationTask,
  getCharacterImageTasks,
  getCharacterTTSTasks,
  isTaskCompleted,
  isTaskFailed,
  isTaskRunning,
  getImageGenerationResult,
  getTTSGenerationResult,
  type ImageGenerationPayload,
  type TTSGenerationPayload,
  type ImageGenerationResult,
  type TTSGenerationResult,
} from '@/lib/api/character-tasks'
import type { Task } from '@/lib/api/tasks'
import type { ViewType } from '@/lib/types/character'

interface UseCharacterTasksOptions {
  characterId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface CharacterTasksState {
  // Image tasks
  imageTasks: Task[]
  runningImageTask: Task | null

  // TTS tasks
  ttsTasks: Task[]
  runningTTSTask: Task | null

  // Loading states
  isLoading: boolean
  error: string | null
}

interface CharacterTasksActions {
  // Create tasks
  createImageTask: (payload: ImageGenerationPayload) => Promise<Task | null>
  createTTSTask: (payload: TTSGenerationPayload) => Promise<Task | null>

  // Get results
  getImageResult: (task: Task) => ImageGenerationResult | null
  getTTSResult: (task: Task) => TTSGenerationResult | null

  // Check status
  isTaskRunning: (task: Task) => boolean
  isTaskCompleted: (task: Task) => boolean
  isTaskFailed: (task: Task) => boolean

  // Refresh
  refreshTasks: () => Promise<void>
}

export function useCharacterTasks(
  options: UseCharacterTasksOptions
): CharacterTasksState & CharacterTasksActions {
  const { characterId, autoRefresh = true, refreshInterval = 5000 } = options

  const [state, setState] = useState<CharacterTasksState>({
    imageTasks: [],
    runningImageTask: null,
    ttsTasks: [],
    runningTTSTask: null,
    isLoading: false,
    error: null,
  })

  const user = useAuthStore((s) => s.user)
  const { tasks: allTasks, subscribeToUpdates, unsubscribeFromUpdates } = useTaskStore()

  // Refresh tasks from server
  const refreshTasks = useCallback(async () => {
    if (!characterId) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const [imageTasks, ttsTasks] = await Promise.all([
        getCharacterImageTasks(characterId),
        getCharacterTTSTasks(characterId),
      ])

      // Sort by createdAt descending
      imageTasks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      ttsTasks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      const runningImageTask = imageTasks.find(isTaskRunning) || null
      const runningTTSTask = ttsTasks.find(isTaskRunning) || null

      setState({
        imageTasks,
        runningImageTask,
        ttsTasks,
        runningTTSTask,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载任务失败',
      }))
    }
  }, [characterId])

  // Create image generation task
  const createImageTask = useCallback(
    async (payload: ImageGenerationPayload): Promise<Task | null> => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: '用户未登录' }))
        return null
      }

      try {
        const task = await createImageGenerationTask(payload, user.id)
        await refreshTasks()
        return task
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '创建任务失败',
        }))
        return null
      }
    },
    [user?.id, refreshTasks]
  )

  // Create TTS generation task
  const createTTSTask = useCallback(
    async (payload: TTSGenerationPayload): Promise<Task | null> => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: '用户未登录' }))
        return null
      }

      try {
        const task = await createTTSGenerationTask(payload, user.id)
        await refreshTasks()
        return task
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '创建任务失败',
        }))
        return null
      }
    },
    [user?.id, refreshTasks]
  )

  // Get results
  const getImageResult = useCallback(getImageGenerationResult, [])
  const getTTSResult = useCallback(getTTSGenerationResult, [])

  // Initial load
  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    subscribeToUpdates()

    return () => {
      unsubscribeFromUpdates()
    }
  }, [autoRefresh, subscribeToUpdates, unsubscribeFromUpdates])

  // Update running task from allTasks when they change
  useEffect(() => {
    if (!autoRefresh) return

    // Filter tasks for this character
    const characterImageTasks = allTasks.filter(
      (t) =>
        t.type === 'image_generation' &&
        (t.payload as ImageGenerationPayload)?.characterId === characterId
    )
    const characterTTSTasks = allTasks.filter(
      (t) =>
        t.type === 'tts_generation' &&
        (t.payload as TTSGenerationPayload)?.characterId === characterId
    )

    const runningImage = characterImageTasks.find(isTaskRunning) || state.runningImageTask
    const runningTTS = characterTTSTasks.find(isTaskRunning) || state.runningTTSTask

    setState((prev) => ({
      ...prev,
      runningImageTask: runningImage || null,
      runningTTSTask: runningTTS || null,
    }))
  }, [allTasks, characterId, autoRefresh, state.runningImageTask, state.runningTTSTask])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(refreshTasks, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshTasks])

  return {
    ...state,
    createImageTask,
    createTTSTask,
    getImageResult,
    getTTSResult,
    isTaskRunning,
    isTaskCompleted,
    isTaskFailed,
    refreshTasks,
  }
}

/**
 * Hook for checking if task queue mode is enabled
 * Currently disabled - always returns false to use direct AI API calls
 */
export function useTaskQueueEnabled(): boolean {
  // Task queue mode is disabled for character design
  // Always use direct AI API calls instead
  return false
}
