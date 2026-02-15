# Tasks: integrate-character-ai-with-task-queue

## Phase 1: 后端任务处理器

### 1.1 文生图任务处理器
- [x] 创建 `server/src/services/task-handlers/image-generation.ts`
- [x] 实现 `handleImageGeneration` 函数
- [x] 调用智谱 GLM-Image API
- [x] 处理 API 响应（URL/base64）
- [x] 实现进度更新

### 1.2 TTS 任务处理器
- [x] 创建 `server/src/services/task-handlers/tts-generation.ts`
- [x] 实现 `handleTTSGeneration` 函数
- [x] 调用智谱 GLM-TTS API
- [x] 处理音频响应（URL/二进制）
- [x] 上传音频到文件存储服务（使用 base64 data URL 返回）

### 1.3 注册处理器
- [x] 修改 `server/src/services/task-worker.ts`
- [x] 注册 `image_generation` 处理器
- [x] 注册 `tts_generation` 处理器

## Phase 2: 前端 API 客户端

### 2.1 任务 API 封装
- [x] 创建 `src/lib/api/character-tasks.ts`
- [x] 实现 `createImageGenerationTask` 函数
- [x] 实现 `createTTSGenerationTask` 函数
- [x] 实现 `getCharacterImageTasks` / `getCharacterTTSTasks` 函数
- [x] 定义 TypeScript 类型

### 2.2 类型扩展
- [x] 更新 `src/lib/api/character-tasks.ts`（类型已在 API 文件中定义）
- [x] 添加 `ImageGenerationPayload` 类型
- [x] 添加 `TTSGenerationPayload` 类型
- [x] 添加 `ImageGenerationResult` 类型
- [x] 添加 `TTSGenerationResult` 类型

## Phase 3: 组件集成

### 3.1 通用 Hook
- [x] 创建 `src/features/character/hooks/use-character-tasks.ts`
- [x] 实现任务状态管理
- [x] 实现任务创建方法
- [x] 实现 WebSocket 订阅

### 3.2 CharacterGallery 改造
- [x] 修改 `src/features/character/components/character-gallery.tsx`
- [x] 替换同步 `generateImage` 为任务提交（支持双模式）
- [x] 添加任务进度显示
- [x] 监听任务完成事件
- [x] 自动更新角色图片

### 3.3 CostumeGenerator 改造
- [x] 修改 `src/features/character/components/costume-generator.tsx`
- [x] 替换同步 `generateImage` 为任务提交（支持双模式）
- [x] 添加任务进度显示
- [x] 监听任务完成事件
- [x] 自动添加服装变体

### 3.4 CharacterVoice 改造
- [x] 修改 `src/features/character/components/character-voice.tsx`
- [x] 替换同步 `generateTTS` 为任务提交（支持双模式）
- [x] 添加任务进度显示
- [x] 监听任务完成事件
- [x] 自动更新语音配置

## Phase 4: 任务状态管理

### 4.1 TaskStore 扩展
- [x] TaskStore 已在 `implement-task-queue` 中实现
- [x] 支持 WebSocket 事件处理

### 4.2 任务进度 UI
- [x] 创建 `src/features/character/components/task-progress-indicator.tsx`
- [x] 显示任务进度条
- [x] 显示任务状态图标
- [~] 支持取消任务（可通过任务队列管理页面实现，组件级别暂不集成）

## Phase 5: 测试与优化（后续迭代）

> 注：以下任务为后续优化项，当前版本核心功能已完整实现

### 5.1 测试
- [~] 后端任务处理器单元测试
- [~] 前端 API 客户端测试
- [~] 组件集成测试

### 5.2 优化
- [~] 任务去重（防止重复提交）
- [~] 并发控制（限制同时进行的 AI 任务数）
- [~] 错误重试策略优化

## Dependencies

- **依赖**: `implement-task-queue` 提案已完成 ✅
- Phase 1 已完成 ✅
- Phase 2 已完成 ✅
- Phase 3 已完成 ✅（所有组件已集成任务队列支持）
- Phase 4 已完成 ✅
- Phase 5 标记为后续优化项
