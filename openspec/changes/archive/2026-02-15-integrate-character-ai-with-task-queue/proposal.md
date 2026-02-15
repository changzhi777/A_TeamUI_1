# Proposal: integrate-character-ai-with-task-queue

## Why

当前"角色设计"模块中的文生图（generateImage）和 TTS 语音合成（generateTTS）API 调用是同步执行的，存在以下问题：

1. **用户体验差**：文生图和 TTS 调用通常耗时 5-30 秒，用户需等待加载动画，无法进行其他操作
2. **并发受限**：无法同时生成多个视角图片或批量生成语音
3. **无状态追踪**：关闭页面后无法查看生成结果，需重新生成
4. **错误恢复困难**：网络超时等临时错误导致任务失败，需手动重试

## What Changes

将角色设计模块的 AI API 调用集成到任务队列系统中，实现异步执行和状态管理。

### 核心变更

1. **任务类型扩展**
   - 新增 `image_generation` 任务类型（文生图）
   - 新增 `tts_generation` 任务类型（语音合成）

2. **API 调用改造**
   - `generateImage()` 改为异步任务提交
   - `generateTTS()` 改为异步任务提交
   - 返回任务 ID，通过任务队列跟踪进度

3. **前端界面优化**
   - 生成操作立即返回，显示任务进度
   - 任务列表显示 AI 生成任务的进度和状态
   - 支持在角色详情页查看关联的生成任务

4. **任务结果处理**
   - 任务完成后自动更新角色图片/语音
   - 支持下载历史生成结果

### 集成点

| 组件 | 当前实现 | 改造后 |
|------|----------|--------|
| `CharacterGallery` | 同步调用 `aiApi.generateImage()` | 提交任务，轮询/WebSocket 监听进度 |
| `CostumeGenerator` | 同步调用 `aiApi.generateImage()` | 提交任务，监听完成事件 |
| `CharacterVoice` | 同步调用 `aiApi.generateTTS()` | 提交任务，监听完成事件 |

## Scope

### 新建文件

- `server/src/services/task-handlers/image-generation.ts` - 文生图任务处理器
- `server/src/services/task-handlers/tts-generation.ts` - TTS 任务处理器
- `src/lib/api/character-tasks.ts` - 角色 AI 任务 API 客户端

### 修改文件

- `server/src/services/task-worker.ts` - 注册 AI 任务处理器
- `src/features/character/components/character-gallery.tsx` - 集成任务队列
- `src/features/character/components/costume-generator.tsx` - 集成任务队列
- `src/features/character/components/character-voice.tsx` - 集成任务队列
- `src/stores/task-store.ts` - 添加角色任务类型
- `src/lib/types/character.ts` - 扩展任务相关类型

## Goals

1. AI 生成任务异步化，提升用户体验
2. 支持批量生成和并发控制
3. 任务状态可追踪、可恢复
4. 与任务队列系统无缝集成

## Non-Goals

- 不修改 AI API 的实际调用逻辑
- 不实现 AI 模型参数优化
- 不实现任务优先级调整（使用默认优先级）
