# Tasks: Add GLM-TTS

## Implementation Tasks

### 1. 类型定义更新
- [x] 在 `src/lib/types/character.ts` 中添加 GLM-TTS 音色常量 `GLM_TTS_VOICES`（已存在）
- [x] 在 `VOICE_MODELS` 中添加 `glm-tts` 模型选项
- [x] 扩展 `VoiceAPIConfig` 接口，添加 `speed`、`volume` 和 `responseFormat` 字段（已存在）

### 2. API 服务更新
- [x] 在 `src/lib/api/ai.ts` 中更新 `generateTTS` 函数，支持传递 speed、volume 参数
- [x] 根据模型类型选择正确的音色 ID 映射

### 3. API 设置页面更新
- [x] 在 `src/features/settings/api/api-settings.tsx` 中添加 GLM-TTS 音色选择下拉框
- [x] 添加语速和音量滑块控件
- [x] 添加响应格式选择（WAV/PCM/MP3）

### 4. 国际化更新
- [x] 在 `src/i18n/zh-CN.ts` 中添加 GLM-TTS 相关翻译文本

### 5. 验证
- [x] 确保构建通过
- [x] 验证 API 设置页面功能正常

## Dependencies
- 无外部依赖

## Estimated Effort
- 约 1-2 小时
