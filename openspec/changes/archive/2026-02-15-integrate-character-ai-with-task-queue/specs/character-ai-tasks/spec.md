# Spec: Character AI Tasks

角色设计模块的 AI 生成任务集成，实现文生图和 TTS 语音合成的异步任务执行。

## ADDED Requirements

### Requirement: Image Generation Task

系统 MUST 支持将角色图片生成请求作为异步任务提交到任务队列。任务处理器 SHALL 调用智谱 GLM-Image API 完成图片生成。

#### Scenario: Submit image generation task

**Given** 用户在角色详情页选择一个视角
**When** 用户点击"生成图片"按钮
**Then** 系统创建 `image_generation` 类型任务
**And** 任务立即入队并返回任务 ID
**And** 用户界面显示"任务已提交"提示
**And** 用户可继续进行其他操作

#### Scenario: Image generation task completes

**Given** 图片生成任务正在执行中
**When** AI API 返回图片 URL
**Then** 任务状态变为 "completed"
**And** 任务结果包含图片 URL 和元数据
**And** 通过 WebSocket 通知前端
**And** 前端自动更新角色视角图片

#### Scenario: Image generation task fails

**Given** 图片生成任务正在执行中
**When** AI API 返回错误（如内容违规、配额用尽）
**Then** 任务状态变为 "failed"
**And** 任务错误信息包含具体原因
**And** 通过 WebSocket 通知前端
**And** 前端显示错误提示

---

### Requirement: TTS Generation Task

系统 MUST 支持将角色语音生成请求作为异步任务提交到任务队列。任务处理器 SHALL 调用智谱 GLM-TTS API 完成语音合成。

#### Scenario: Submit TTS generation task

**Given** 用户在角色语音组件中输入了试听文本
**When** 用户点击"生成语音"按钮
**Then** 系统创建 `tts_generation` 类型任务
**And** 任务立即入队并返回任务 ID
**And** 用户界面显示"任务已提交"提示

#### Scenario: TTS generation task completes

**Given** TTS 生成任务正在执行中
**When** AI API 返回音频数据
**Then** 任务状态变为 "completed"
**And** 任务结果包含音频 URL
**And** 通过 WebSocket 通知前端
**And** 前端自动更新角色语音配置

#### Scenario: TTS with custom voice style

**Given** 用户选择了特定的音色和语速
**When** 用户提交 TTS 任务
**Then** 任务负载包含完整的语音参数
**And** 任务处理器使用指定参数调用 API

---

### Requirement: Task Progress Tracking

系统 SHALL 在角色详情页实时显示 AI 生成任务的进度状态。

#### Scenario: Display generating status

**Given** 角色有正在进行的生成任务
**When** 用户查看角色详情页
**Then** 对应的视角卡片显示"生成中"状态
**And** 显示任务进度百分比
**And** 生成按钮变为禁用状态

#### Scenario: Multiple concurrent tasks

**Given** 用户同时提交了多个视角的图片生成任务
**When** 任务在队列中执行
**Then** 每个视角独立显示各自任务的进度
**And** 用户可以分别取消各个任务

---

### Requirement: Task Result Auto-Apply

系统 MUST 在任务完成后自动将结果应用到角色数据。

#### Scenario: Auto-apply image result

**Given** 角色视角图片生成任务完成
**When** 前端收到任务完成事件
**Then** 系统自动更新角色的 `views` 数据
**And** 图片立即显示在视角卡片中
**And** 无需用户手动刷新

#### Scenario: Auto-apply voice result

**Given** 角色语音生成任务完成
**When** 前端收到任务完成事件
**Then** 系统自动更新角色的 `voice` 配置
**And** 语音播放器自动加载新的音频

#### Scenario: Costume variant result

**Given** 服装变体图片生成任务完成
**When** 前端收到任务完成事件
**Then** 系统自动添加新的服装变体到角色
**And** 服装列表自动刷新

---

### Requirement: Task-Character Association

系统 SHALL 维护任务与角色的关联关系，支持按角色查询任务。

#### Scenario: Query character tasks

**Given** 角色有历史生成任务
**When** 用户查看角色详情页
**Then** 系统显示该角色关联的所有任务
**And** 按时间倒序排列

#### Scenario: Task metadata

**Given** 任务被创建
**When** 系统存储任务
**Then** 任务 metadata 包含 characterId
**And** metadata 包含 characterName
**And** metadata 包含任务子类型（view/costume/voice）

---

## Data Types

### ImageGenerationPayload

```typescript
interface ImageGenerationPayload {
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
```

### TTSGenerationPayload

```typescript
interface TTSGenerationPayload {
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
```

### ImageGenerationResult

```typescript
interface ImageGenerationResult {
  imageUrl: string
  prompt: string
  resolution: string
  generatedAt: string
}
```

### TTSGenerationResult

```typescript
interface TTSGenerationResult {
  audioUrl: string
  text: string
  voiceStyle: string
  duration?: number
  generatedAt: string
}
```
