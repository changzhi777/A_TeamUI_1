/**
 * character-tasks
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character AI Task API Client
 * 角色设计相关的任务队列 API 客户端
 */

import { api } from './client'
import type { Task, TaskType } from './tasks'

// ==================== Types ====================

export type ViewType = 'front' | 'side' | 'back' | 'threeQuarter' | `custom:${string}`

export interface ImageGenerationPayload {
  characterId: string
  characterName: string
  prompt: string
  resolution: string
  viewType: ViewType
  costumeId?: string
  callback: {
    type: 'character_view' | 'character_costume'
    characterId: string
    viewType?: ViewType
    costumeId?: string
  }
}

export interface ImageGenerationResult {
  imageUrl: string
  prompt: string
  resolution: string
  generatedAt: string
}

export interface TTSGenerationPayload {
  characterId: string
  characterName: string
  text: string
  voiceStyle: string
  speed?: number
  volume?: number
  responseFormat?: 'wav' | 'pcm' | 'mp3'
  callback: {
    type: 'character_voice'
    characterId: string
  }
}

export interface TTSGenerationResult {
  audioUrl: string
  text: string
  voiceStyle: string
  generatedAt: string
}

// ==================== Image Generation API ====================

/**
 * 创建图片生成任务
 */
export async function createImageGenerationTask(
  payload: ImageGenerationPayload,
  createdBy: string
): Promise<Task> {
  return api.post<Task>('/api/tasks', {
    type: 'image_generation' as TaskType,
    priority: 'normal',
    payload,
    createdBy,
    metadata: {
      characterId: payload.characterId,
      characterName: payload.characterName,
      viewType: payload.viewType,
      costumeId: payload.costumeId,
    },
  })
}

/**
 * 获取角色相关的图片生成任务
 */
export async function getCharacterImageTasks(characterId: string): Promise<Task[]> {
  // API returns { success: true, data: Task[], meta: {...} }
  // api.get already extracts response.data.data, so we get Task[] directly
  const tasks = await api.get<Task[]>('/api/tasks?type=image_generation')

  // Filter by characterId
  return tasks.filter(
    (task) => (task.payload as ImageGenerationPayload)?.characterId === characterId
  )
}

// ==================== TTS Generation API ====================

/**
 * 创建 TTS 生成任务
 */
export async function createTTSGenerationTask(
  payload: TTSGenerationPayload,
  createdBy: string
): Promise<Task> {
  return api.post<Task>('/api/tasks', {
    type: 'tts_generation' as TaskType,
    priority: 'normal',
    payload,
    createdBy,
    metadata: {
      characterId: payload.characterId,
      characterName: payload.characterName,
      voiceStyle: payload.voiceStyle,
    },
  })
}

/**
 * 获取角色相关的 TTS 任务
 */
export async function getCharacterTTSTasks(characterId: string): Promise<Task[]> {
  // API returns { success: true, data: Task[], meta: {...} }
  // api.get already extracts response.data.data, so we get Task[] directly
  const tasks = await api.get<Task[]>('/api/tasks?type=tts_generation')

  // Filter by characterId
  return tasks.filter(
    (task) => (task.payload as TTSGenerationPayload)?.characterId === characterId
  )
}

// ==================== Combined API ====================

/**
 * 获取角色相关的所有 AI 任务
 */
export async function getCharacterAITasks(characterId: string): Promise<{
  imageTasks: Task[]
  ttsTasks: Task[]
}> {
  const [imageTasks, ttsTasks] = await Promise.all([
    getCharacterImageTasks(characterId),
    getCharacterTTSTasks(characterId),
  ])

  return { imageTasks, ttsTasks }
}

/**
 * 检查任务是否完成
 */
export function isTaskCompleted(task: Task): boolean {
  return task.status === 'completed'
}

/**
 * 检查任务是否失败
 */
export function isTaskFailed(task: Task): boolean {
  return task.status === 'failed'
}

/**
 * 检查任务是否正在运行
 */
export function isTaskRunning(task: Task): boolean {
  return task.status === 'running' || task.status === 'pending'
}

/**
 * 获取图片生成任务结果
 */
export function getImageGenerationResult(task: Task): ImageGenerationResult | null {
  if (task.status !== 'completed' || !task.result) {
    return null
  }
  return task.result as ImageGenerationResult
}

/**
 * 获取 TTS 生成任务结果
 */
export function getTTSGenerationResult(task: Task): TTSGenerationResult | null {
  if (task.status !== 'completed' || !task.result) {
    return null
  }
  return task.result as TTSGenerationResult
}
