# Design: Character AI Task Queue Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                              │
├─────────────────────────────────────────────────────────────────────┤
│  CharacterGallery  │  CostumeGenerator  │  CharacterVoice           │
│        │                   │                    │                    │
│        └───────────────────┼────────────────────┘                    │
│                            ▼                                         │
│                   characterTasksApi                                  │
│                 (submitImageTask, submitTTSTask)                     │
│                            │                                         │
│                            ▼                                         │
│                     taskStore (Zustand)                              │
│               ┌────────────┴────────────┐                            │
│               │  WebSocket Listener     │                            │
│               └────────────┬────────────┘                            │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Backend (Hono)                                 │
├────────────────────────────────────────────────────────────────────┤
│                     Task Queue API                                  │
│                            │                                        │
│              ┌─────────────┴─────────────┐                          │
│              ▼                           ▼                          │
│     ImageGenerationHandler      TTSGenerationHandler               │
│              │                           │                          │
│              └─────────────┬─────────────┘                          │
│                            ▼                                        │
│                   External AI API                                   │
│              (智谱 GLM-Image / GLM-TTS)                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Task Payloads

### Image Generation Task

```typescript
interface ImageGenerationPayload {
  // 角色信息
  characterId: string
  characterName: string

  // 生成参数
  prompt: string
  resolution: string

  // 视角信息
  viewType: ViewType
  costumeId?: string // 如果是服装变体

  // 回调数据
  callback: {
    type: 'character_view' | 'character_costume'
    characterId: string
    viewType?: ViewType
    costumeId?: string
  }
}

interface ImageGenerationResult {
  imageUrl: string
  prompt: string
  resolution: string
  generatedAt: string
}
```

### TTS Generation Task

```typescript
interface TTSGenerationPayload {
  // 角色信息
  characterId: string
  characterName: string

  // 生成参数
  text: string
  voiceStyle: string
  speed?: number
  volume?: number
  responseFormat?: 'wav' | 'pcm' | 'mp3'

  // 回调数据
  callback: {
    type: 'character_voice'
    characterId: string
  }
}

interface TTSGenerationResult {
  audioUrl: string
  text: string
  voiceStyle: string
  duration?: number
  generatedAt: string
}
```

## Task Handlers

### Image Generation Handler

```typescript
// server/src/services/task-handlers/image-generation.ts

export async function handleImageGeneration(task: Task): Promise<ImageGenerationResult> {
  const payload = task.payload as ImageGenerationPayload
  const config = getImageAPIConfig()

  // 1. 调用 AI API
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

  // 2. 解析响应
  const result = await response.json()
  const imageUrl = result.data[0].url || result.data[0].b64_json

  // 3. 更新进度
  await updateTaskProgress(task.id, 90)

  // 4. 返回结果
  return {
    imageUrl,
    prompt: payload.prompt,
    resolution: payload.resolution,
    generatedAt: new Date().toISOString(),
  }
}
```

### TTS Generation Handler

```typescript
// server/src/services/task-handlers/tts-generation.ts

export async function handleTTSGeneration(task: Task): Promise<TTSGenerationResult> {
  const payload = task.payload as TTSGenerationPayload
  const config = getVoiceAPIConfig()

  // 1. 调用 TTS API
  const response = await fetch(`${config.baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: payload.text,
      voice: payload.voiceStyle,
      speed: payload.speed ?? 1.0,
      volume: payload.volume ?? 1.0,
      response_format: payload.responseFormat || 'wav',
    }),
  })

  // 2. 处理响应
  const contentType = response.headers.get('content-type')
  let audioUrl: string

  if (contentType?.includes('application/json')) {
    const result = await response.json()
    audioUrl = result.audio_url || `data:audio/mpeg;base64,${result.audio_content}`
  } else {
    // 二进制音频数据
    const blob = await response.blob()
    audioUrl = await uploadToStorage(blob) // 上传到文件存储服务
  }

  // 3. 返回结果
  return {
    audioUrl,
    text: payload.text,
    voiceStyle: payload.voiceStyle,
    generatedAt: new Date().toISOString(),
  }
}
```

## Frontend Integration

### API Client

```typescript
// src/lib/api/character-tasks.ts

export const characterTasksApi = {
  // 提交图片生成任务
  submitImageTask: async (params: {
    characterId: string
    viewType: ViewType
    prompt: string
    resolution: string
  }): Promise<Task> => {
    return api.post('/api/tasks', {
      type: 'image_generation',
      priority: 'normal',
      payload: {
        characterId: params.characterId,
        viewType: params.viewType,
        prompt: params.prompt,
        resolution: params.resolution,
        callback: {
          type: 'character_view',
          characterId: params.characterId,
          viewType: params.viewType,
        },
      },
    })
  },

  // 提交 TTS 生成任务
  submitTTSTask: async (params: {
    characterId: string
    text: string
    voiceStyle: string
    options?: TTSOptions
  }): Promise<Task> => {
    return api.post('/api/tasks', {
      type: 'tts_generation',
      priority: 'normal',
      payload: {
        characterId: params.characterId,
        text: params.text,
        voiceStyle: params.voiceStyle,
        ...params.options,
        callback: {
          type: 'character_voice',
          characterId: params.characterId,
        },
      },
    })
  },

  // 获取角色的任务列表
  getCharacterTasks: async (characterId: string): Promise<Task[]> => {
    return api.get(`/api/tasks?metadata.characterId=${characterId}`)
  },
}
```

### Component Integration

```typescript
// src/features/character/components/character-gallery.tsx (改造后)

const handleGenerateImage = async (viewType: ViewType) => {
  if (!character.basePrompt) {
    toast.error('请先设置角色的基础提示词')
    return
  }

  const prompt = aiApi.buildCharacterPrompt(character.basePrompt, viewType)
  const resolution = selectedResolution || getDefaultResolution()

  try {
    // 提交任务（异步）
    const task = await characterTasksApi.submitImageTask({
      characterId: character.id,
      viewType,
      prompt,
      resolution,
    })

    toast.info(`图片生成任务已提交 (${task.id})`)

    // 监听任务完成
    taskStore.subscribeToTask(task.id, (updatedTask) => {
      if (updatedTask.status === 'completed') {
        const result = updatedTask.result as ImageGenerationResult
        updateCharacterView(character.id, viewType, {
          url: result.imageUrl,
          prompt: result.prompt,
          generatedAt: result.generatedAt,
        })
        toast.success(`${getViewTypeLabel(viewType)}图片已生成`)
      } else if (updatedTask.status === 'failed') {
        toast.error(`图片生成失败: ${updatedTask.error}`)
      }
    })
  } catch (error) {
    toast.error('提交任务失败')
  }
}
```

## Task-Character Association

使用任务的 `metadata` 字段关联角色信息：

```typescript
// 任务创建时
{
  type: 'image_generation',
  payload: { ... },
  metadata: {
    characterId: 'char_001',
    characterName: '李明',
    viewType: 'front',
    category: 'character_design',
  }
}

// 查询角色关联任务
GET /api/tasks?metadata.characterId=char_001&metadata.category=character_design
```

## WebSocket Events

任务状态变更时推送：

```typescript
// 事件格式
{
  event: 'task:progress',
  data: {
    taskId: 'task_001',
    progress: 50,
    status: 'running',
    metadata: {
      characterId: 'char_001',
      characterName: '李明',
    }
  }
}

{
  event: 'task:completed',
  data: {
    taskId: 'task_001',
    result: {
      imageUrl: 'https://...',
      prompt: '...',
    },
    metadata: {
      characterId: 'char_001',
      viewType: 'front',
    }
  }
}
```

## Error Handling

| 错误类型 | 处理方式 |
|---------|---------|
| API Key 无效 | 任务失败，提示用户检查配置 |
| 网络超时 | 自动重试（最多 3 次） |
| 速率限制 (429) | 延迟重试，指数退避 |
| 内容违规 | 任务失败，返回错误信息 |

## Progress Tracking

通过任务 `progress` 字段和 WebSocket 推送：

| 阶段 | 进度 | 说明 |
|-----|------|------|
| 任务提交 | 0% | 任务入队 |
| 开始处理 | 10% | Worker 获取任务 |
| API 调用 | 20-80% | 调用 AI API（长轮询） |
| 结果处理 | 90% | 解析响应 |
| 完成 | 100% | 任务完成 |
