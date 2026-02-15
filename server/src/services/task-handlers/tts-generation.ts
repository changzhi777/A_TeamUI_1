/**
 * tts-generation
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * TTS Generation Task Handler
 * 语音合成任务处理器
 */

import type { Task } from '../task-queue'

// ==================== Types ====================

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

export interface VoiceAPIConfig {
  provider: string
  apiKey: string
  model: string
  baseUrl: string
  defaultVoice?: string
  speed?: number
  volume?: number
  responseFormat?: 'wav' | 'pcm' | 'mp3'
}

// ==================== API Config ====================

// Default config
const defaultVoiceConfig: VoiceAPIConfig = {
  provider: 'zhipu',
  apiKey: process.env.ZHIPU_API_KEY || '',
  model: 'glm-tts',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  defaultVoice: 'tongtong',
  speed: 1.0,
  volume: 1.0,
  responseFormat: 'wav',
}

function getVoiceAPIConfig(): VoiceAPIConfig {
  return defaultVoiceConfig
}

// ==================== Handler ====================

export async function handleTTSGeneration(
  task: Task,
  context: { updateProgress: (progress: number) => Promise<void> }
): Promise<TTSGenerationResult> {
  const payload = task.payload as unknown as TTSGenerationPayload
  const config = getVoiceAPIConfig()

  // Validate config
  if (!config.apiKey) {
    throw new Error('API Key 未配置，请在设置中配置智谱 API Key')
  }

  // Validate text
  if (!payload.text || payload.text.trim().length === 0) {
    throw new Error('文本内容不能为空')
  }

  // Update progress: starting
  await context.updateProgress(10)

  // Determine if using GLM-TTS model
  const isGLMTTS = config.model === 'glm-tts'

  // Build request body
  const requestBody: Record<string, unknown> = {
    model: config.model,
    input: payload.text,
    voice: payload.voiceStyle || config.defaultVoice || 'tongtong',
  }

  // Add GLM-TTS specific parameters
  if (isGLMTTS) {
    requestBody.speed = payload.speed ?? config.speed ?? 1.0
    requestBody.volume = payload.volume ?? config.volume ?? 1.0
    requestBody.response_format = payload.responseFormat || config.responseFormat || 'wav'
  }

  // Update progress: preparing request
  await context.updateProgress(20)

  // Call TTS API
  const response = await fetch(`${config.baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  // Update progress: API call complete
  await context.updateProgress(60)

  // Handle error response
  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key 无效或已过期')
    }
    if (response.status === 429) {
      throw new Error('API 调用频率超限，请稍后重试')
    }
    throw new Error(`语音生成失败: ${response.status} ${errorText}`)
  }

  // Check response type
  const contentType = response.headers.get('content-type') || ''
  let audioUrl: string

  if (contentType.includes('application/json')) {
    // JSON response with URL or base64
    const result = (await response.json()) as { audio_url?: string; audio_content?: string }

    if (result.audio_url) {
      audioUrl = result.audio_url
    } else if (result.audio_content) {
      audioUrl = `data:audio/mpeg;base64,${result.audio_content}`
    } else {
      throw new Error('未能获取音频数据')
    }
  } else {
    // Binary audio data
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Determine audio format from content-type
    let mimeType = 'audio/mpeg'
    if (contentType.includes('wav')) {
      mimeType = 'audio/wav'
    } else if (contentType.includes('pcm')) {
      mimeType = 'audio/pcm'
    }

    audioUrl = `data:${mimeType};base64,${base64}`
  }

  // Update progress: almost done
  await context.updateProgress(90)

  // Return result
  return {
    audioUrl,
    text: payload.text,
    voiceStyle: payload.voiceStyle,
    generatedAt: new Date().toISOString(),
  }
}

export default handleTTSGeneration
