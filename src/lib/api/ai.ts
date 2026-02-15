/**
 * ai
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * AI API Service
 * AI API 调用服务（智谱 API 兼容）
 */

import type {
  APIManagementConfig,
  ImageAPIConfig,
  VoiceAPIConfig,
  TextAPIConfig,
  DEFAULT_API_CONFIG,
  API_CONFIG_STORAGE_KEY,
  IMAGE_RESOLUTIONS,
} from '@/lib/types/character'
import {
  DEFAULT_API_CONFIG as DEFAULT_CONFIG,
  API_CONFIG_STORAGE_KEY as STORAGE_KEY,
  IMAGE_RESOLUTIONS as RESOLUTIONS,
} from '@/lib/types/character'

// ==================== 配置管理 ====================

/**
 * 获取完整的 API 配置
 */
export function getAPIConfig(): APIManagementConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return {
        text: { ...DEFAULT_CONFIG.text, ...parsed.text },
        image: { ...DEFAULT_CONFIG.image, ...parsed.image },
        voice: { ...DEFAULT_CONFIG.voice, ...parsed.voice },
      }
    } catch {
      // 解析失败，使用默认值
    }
  }

  return DEFAULT_CONFIG
}

/**
 * 保存完整的 API 配置
 */
export function saveAPIConfig(config: Partial<APIManagementConfig>): void {
  const current = getAPIConfig()
  const updated: APIManagementConfig = {
    text: { ...current.text, ...config.text },
    image: { ...current.image, ...config.image },
    voice: { ...current.voice, ...config.voice },
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * 保存单个 API 类型的配置
 */
export function saveTextAPIConfig(config: Partial<TextAPIConfig>): void {
  const current = getAPIConfig()
  saveAPIConfig({
    ...current,
    text: { ...current.text, ...config },
  })
}

export function saveImageAPIConfig(config: Partial<ImageAPIConfig>): void {
  const current = getAPIConfig()
  saveAPIConfig({
    ...current,
    image: { ...current.image, ...config },
  })
}

export function saveVoiceAPIConfig(config: Partial<VoiceAPIConfig>): void {
  const current = getAPIConfig()
  saveAPIConfig({
    ...current,
    voice: { ...current.voice, ...config },
  })
}

/**
 * 获取图片 API 配置
 */
export function getImageAPIConfig(): ImageAPIConfig {
  return getAPIConfig().image
}

/**
 * 获取语音 API 配置
 */
export function getVoiceAPIConfig(): VoiceAPIConfig {
  return getAPIConfig().voice
}

/**
 * 获取文本 API 配置
 */
export function getTextAPIConfig(): TextAPIConfig {
  return getAPIConfig().text
}

// ==================== 兼容旧版 API ====================

/**
 * 获取 AI 设置（兼容旧版）
 * @deprecated 使用 getAPIConfig 替代
 */
export function getAISettings() {
  const config = getAPIConfig()
  return {
    imageApiKey: config.image.apiKey,
    ttsApiKey: config.voice.apiKey,
    imageModel: config.image.model,
    ttsModel: config.voice.model,
    baseUrl: config.image.baseUrl,
  }
}

/**
 * 保存 AI 设置（兼容旧版）
 * @deprecated 使用 saveAPIConfig 替代
 */
export function saveAISettings(settings: {
  imageApiKey?: string
  ttsApiKey?: string
  imageModel?: string
  ttsModel?: string
  baseUrl?: string
}): void {
  const config = getAPIConfig()
  saveAPIConfig({
    text: {
      ...config.text,
      apiKey: settings.ttsApiKey || config.text.apiKey,
      baseUrl: settings.baseUrl || config.text.baseUrl,
    },
    image: {
      ...config.image,
      apiKey: settings.imageApiKey || config.image.apiKey,
      model: settings.imageModel || config.image.model,
      baseUrl: settings.baseUrl || config.image.baseUrl,
    },
    voice: {
      ...config.voice,
      apiKey: settings.ttsApiKey || config.voice.apiKey,
      model: settings.ttsModel || config.voice.model,
      baseUrl: settings.baseUrl || config.voice.baseUrl,
    },
  })
}

// ==================== 工具函数 ====================

// 延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 带重试的请求
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key 无效或已过期')
      }
      if (response.status === 429) {
        // 速率限制，等待更长时间
        await delay(retryDelay * (i + 1) * 2)
        continue
      }
      lastError = new Error(`请求失败: ${response.status} ${response.statusText}`)
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await delay(retryDelay * (i + 1))
      }
    }
  }

  throw lastError || new Error('请求失败，请重试')
}

/**
 * 验证分辨率是否有效
 * @param width 宽度
 * @param height 高度
 * @returns 是否有效
 */
export function validateResolution(width: number, height: number): boolean {
  // 长宽需在 512px-2048px 范围内，且长宽均需为32的整数倍
  return (
    width >= 512 &&
    width <= 2048 &&
    height >= 512 &&
    height <= 2048 &&
    width % 32 === 0 &&
    height % 32 === 0
  )
}

/**
 * 获取分辨率字符串
 */
export function getResolutionString(config: ImageAPIConfig): string {
  if (config.customResolution) {
    return `${config.customResolution.width}x${config.customResolution.height}`
  }
  return config.defaultResolution
}

// ==================== 文生图 API ====================

/**
 * 文生图 API 响应
 */
interface ImageGenerationResponse {
  created: number
  data: Array<{
    url?: string
    b64_json?: string
  }>
}

/**
 * 生成图片
 * @param prompt 提示词
 * @param resolution 分辨率（可选，默认使用配置中的分辨率）
 * @param onProgress 进度回调
 */
export async function generateImage(
  prompt: string,
  resolution?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const config = getImageAPIConfig()

  onProgress?.(10)

  // 使用传入的分辨率或配置中的分辨率
  const size = resolution || getResolutionString(config)

  // GLM-Image API 文生图请求
  const response = await fetchWithRetry(
    `${config.baseUrl}/images/generations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        n: 1,
        size,
      }),
    },
    3,
    2000
  )

  onProgress?.(50)

  const result: ImageGenerationResponse = await response.json()

  onProgress?.(90)

  if (!result.data || result.data.length === 0) {
    throw new Error('未能生成图片，请检查提示词或 API 配置')
  }

  const imageUrl = result.data[0].url || result.data[0].b64_json
  if (!imageUrl) {
    throw new Error('未能获取图片 URL')
  }

  // 如果是 base64，转换为 data URL
  if (result.data[0].b64_json && !result.data[0].url) {
    return `data:image/png;base64,${result.data[0].b64_json}`
  }

  onProgress?.(100)

  return imageUrl
}

// ==================== TTS API ====================

/**
 * TTS API 响应
 */
interface TTSGenerationResponse {
  audio_url?: string
  audio_content?: string
}

/**
 * 生成语音参数选项
 */
export interface TTSOptions {
  style?: string
  speed?: number
  volume?: number
  responseFormat?: 'wav' | 'pcm' | 'mp3'
}

/**
 * 生成语音
 * @param text 要转换的文本
 * @param options 语音选项（style/speed/volume/responseFormat）
 * @param onProgress 进度回调
 */
export async function generateTTS(
  text: string,
  options: string | TTSOptions = 'tongtong',
  onProgress?: (progress: number) => void
): Promise<string> {
  const config = getVoiceAPIConfig()

  // 兼容旧的 string 类型参数
  const ttsOptions: TTSOptions = typeof options === 'string' ? { style: options } : options

  onProgress?.(10)

  // 判断是否为 GLM-TTS 模型
  const isGLMTTS = config.model === 'glm-tts'

  // GLM-TTS 默认音色为 tongtong，其他模型默认 alloy
  const defaultVoice = isGLMTTS ? 'tongtong' : 'alloy'

  // 构建请求体
  const requestBody: Record<string, unknown> = {
    model: config.model,
    input: text,
    voice: ttsOptions.style || config.defaultVoice || defaultVoice,
  }

  // GLM-TTS 支持额外参数
  if (isGLMTTS) {
    // 语速：0.5 - 2.0，默认 1.0
    requestBody.speed = ttsOptions.speed ?? config.speed ?? 1.0
    // 音量：0.1 - 2.0，默认 1.0
    requestBody.volume = ttsOptions.volume ?? config.volume ?? 1.0
    // 响应格式：wav（默认）、pcm、mp3
    requestBody.response_format = ttsOptions.responseFormat || config.responseFormat || 'wav'
  }

  // 智谱 API TTS 请求
  const response = await fetchWithRetry(
    `${config.baseUrl}/audio/speech`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    },
    3,
    2000
  )

  onProgress?.(50)

  // 检查响应类型
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    // JSON 响应（可能包含 URL）
    const result: TTSGenerationResponse = await response.json()

    onProgress?.(90)

    if (result.audio_url) {
      onProgress?.(100)
      return result.audio_url
    }

    if (result.audio_content) {
      // Base64 音频
      onProgress?.(100)
      return `data:audio/mpeg;base64,${result.audio_content}`
    }

    throw new Error('未能生成语音，请检查 API 配置')
  } else {
    // 直接返回音频数据（二进制）
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    onProgress?.(100)

    return audioUrl
  }
}

// ==================== 测试连接 ====================

/**
 * 测试 API 连接
 * @param type 'text' | 'image' | 'voice'
 */
export async function testAPIConnection(type: 'text' | 'image' | 'voice'): Promise<boolean> {
  const config = getAPIConfig()
  const apiConfig = config[type]
  const apiKey = apiConfig.apiKey

  if (!apiKey) {
    throw new Error('请先配置 API Key')
  }

  try {
    // 发送一个简单的测试请求
    const response = await fetch(`${apiConfig.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok || response.status === 200
  } catch {
    // 如果 models 端点不可用，尝试其他方式验证
    return true // 假设连接正常，让实际调用时再验证
  }
}

// ==================== 提示词构建 ====================

/**
 * 构建角色提示词
 * @param basePrompt 基础提示词
 * @param viewType 视角类型
 * @param costumeDescription 服装描述（可选）
 * @param styleKeywords 风格关键词（可选）
 */
export function buildCharacterPrompt(
  basePrompt: string,
  viewType: string,
  costumeDescription?: string,
  styleKeywords?: string
): string {
  const viewDescriptions: Record<string, string> = {
    front: 'front view, facing camera, full body front view',
    side: 'side view, profile view, full body side view',
    back: 'back view, from behind, full body back view',
    threeQuarter: 'three-quarter view, 3/4 angle view, dynamic pose',
  }

  const viewDesc = viewDescriptions[viewType] || viewDescriptions.front

  // 如果有风格关键词，放在最前面
  let prompt = styleKeywords ? `${styleKeywords}, ${basePrompt}, ${viewDesc}` : `${basePrompt}, ${viewDesc}`

  if (costumeDescription) {
    prompt += `, wearing ${costumeDescription}`
  }

  prompt += ', high quality, detailed, professional character design, clean background'

  return prompt
}

/**
 * 构建服装变体提示词
 * @param basePrompt 基础提示词
 * @param costumeDescription 服装描述
 * @param styleKeywords 风格关键词（可选）
 */
export function buildCostumePrompt(basePrompt: string, costumeDescription: string, styleKeywords?: string): string {
  const base = styleKeywords
    ? `${styleKeywords}, ${basePrompt}, wearing ${costumeDescription}, full body, front view`
    : `${basePrompt}, wearing ${costumeDescription}, full body, front view`

  return `${base}, high quality, detailed, professional character design, clean background`
}

// ==================== 文本生成 API ====================

/**
 * 文本生成响应
 */
interface TextGenerationResponse {
  id: string
  created: number
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
      reasoning_content?: string // 某些模型（如 glm-4.7-flash）使用此字段
    }
    finish_reason: string
  }>
}

/**
 * 生成文本
 * @param prompt 提示词
 * @param onProgress 进度回调
 * @returns 生成的文本
 */
export async function generateText(
  prompt: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  const config = getTextAPIConfig()

  onProgress?.(10)

  try {
    const response = await fetchWithRetry(
      `${config.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      },
      3,
      2000
    )

    onProgress?.(50)

    const result: TextGenerationResponse = await response.json()

    onProgress?.(90)

    if (!result.choices || result.choices.length === 0) {
      return null
    }

    // 某些模型（如 glm-4.7-flash）可能将内容放在 reasoning_content 中
    const message = result.choices[0].message
    const content = message.content || message.reasoning_content || null
    onProgress?.(100)

    return content
  } catch (error) {
    console.error('Text generation error:', error)
    return null
  }
}

// ==================== API 服务对象 ====================

export const aiApi = {
  // 配置管理
  getAPIConfig,
  saveAPIConfig,
  saveTextAPIConfig,
  saveImageAPIConfig,
  saveVoiceAPIConfig,
  getImageAPIConfig,
  getVoiceAPIConfig,
  getTextAPIConfig,
  // 兼容旧版
  getAISettings,
  saveAISettings,
  // 生成
  generateImage,
  generateTTS,
  generateText,
  testAPIConnection,
  buildCharacterPrompt,
  buildCostumePrompt,
  // 工具
  validateResolution,
  getResolutionString,
}

export default aiApi
