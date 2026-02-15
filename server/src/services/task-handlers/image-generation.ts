/**
 * image-generation
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Image Generation Task Handler
 * 文生图任务处理器
 */

import type { Task } from '../task-queue'

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

export interface ImageAPIConfig {
  provider: string
  apiKey: string
  model: string
  baseUrl: string
  defaultResolution: string
}

// ==================== API Config ====================

// Default config (can be overridden by environment or database)
const defaultImageConfig: ImageAPIConfig = {
  provider: 'zhipu',
  apiKey: process.env.ZHIPU_API_KEY || '',
  model: 'glm-image',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  defaultResolution: '1280x1280',
}

function getImageAPIConfig(): ImageAPIConfig {
  // In a real implementation, this would fetch from database or environment
  return defaultImageConfig
}

// ==================== Handler ====================

export async function handleImageGeneration(
  task: Task,
  context: { updateProgress: (progress: number) => Promise<void> }
): Promise<ImageGenerationResult> {
  const payload = task.payload as unknown as ImageGenerationPayload
  const config = getImageAPIConfig()

  // Validate config
  if (!config.apiKey) {
    throw new Error('API Key 未配置，请在设置中配置智谱 API Key')
  }

  // Update progress: starting
  await context.updateProgress(10)

  // Call AI API
  const response = await fetch(`${config.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      prompt: payload.prompt,
      n: 1,
      size: payload.resolution,
    }),
  })

  // Update progress: API call complete
  await context.updateProgress(50)

  // Handle error response
  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key 无效或已过期')
    }
    if (response.status === 429) {
      throw new Error('API 调用频率超限，请稍后重试')
    }
    throw new Error(`图片生成失败: ${response.status} ${errorText}`)
  }

  // Parse response
  const result = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> }

  // Update progress: parsing
  await context.updateProgress(80)

  // Extract image URL
  if (!result.data || result.data.length === 0) {
    throw new Error('未能生成图片，请检查提示词或 API 配置')
  }

  const imageData = result.data[0]
  let imageUrl: string

  if (imageData.url) {
    imageUrl = imageData.url
  } else if (imageData.b64_json) {
    // Convert base64 to data URL
    imageUrl = `data:image/png;base64,${imageData.b64_json}`
  } else {
    throw new Error('未能获取图片 URL')
  }

  // Update progress: almost done
  await context.updateProgress(90)

  // Return result
  return {
    imageUrl,
    prompt: payload.prompt,
    resolution: payload.resolution,
    generatedAt: new Date().toISOString(),
  }
}

export default handleImageGeneration
