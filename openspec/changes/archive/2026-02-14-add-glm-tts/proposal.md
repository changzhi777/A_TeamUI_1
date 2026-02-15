# Proposal: Add GLM-TTS

## Summary
增加 GLM-TTS 作为语音合成模型选项，支持智谱超拟人语音合成功能，包括多种预设音色、语速和音量调节。

## Motivation
GLM-TTS 是智谱新一代语音大模型，具备超拟人语音合成能力，支持情感表达增强、流式和非流式接口、动态调参（语速、音量）等功能。当前系统仅支持通用的 TTS 模型配置，需要增加 GLM-TTS 特有的功能支持。

## Goals
1. 在语音 API 配置中增加 `glm-tts` 模型选项
2. 添加 GLM-TTS 预设音色选项（彤彤、小陈、锤锤、jam、kazi、douji、luodo）
3. 扩展语音配置支持语速（speed）和音量（volume）参数
4. 更新 generateTTS 函数传递 GLM-TTS 特有参数
5. 在 API 设置页面增加音色选择和参数调节 UI

## Non-Goals
- 流式 TTS 接口（后续迭代）
- 声音克隆功能（需要单独的模型 glm-tts-clone）

## Scope
- `src/lib/types/character.ts` - 类型定义和常量
- `src/lib/api/ai.ts` - TTS 生成函数
- `src/features/settings/api/api-settings.tsx` - API 设置页面
- `src/i18n/zh-CN.ts` - 国际化文本

## Risks
- GLM-TTS 参数与现有 TTS 模型参数不完全兼容，需要处理默认值
- 音色 ID 与现有 OpenAI 风格的音色 ID 不同，需要区分处理
