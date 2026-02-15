# Proposal: Refactor API Management

## Why

当前 API 设置页面将文生图和 TTS API 合并在一起管理，缺乏灵活性。用户需要：

1. 根据智谱 GLM-Image 文档正确配置文生图 API（支持多分辨率、自定义参数）
2. 独立管理三种不同类型的 API：文本 API、文生图 API、语音 API
3. 每种 API 可以独立配置参数，支持不同的服务提供商切换

## What Changes

### 1. 重构 API 类型定义
- 新增 `TextAPIConfig`、`ImageAPIConfig`、`VoiceAPIConfig` 三种独立配置类型
- 每种配置支持多个服务提供商（智谱、OpenAI 等）
- 文本 API 默认使用智谱 GLM-4.7-Flash（30B 级 SOTA 模型，支持 Agentic Coding）
- 语音 API 默认使用智谱 GLM-TTS-Clone（支持声音克隆的 TTS 模型）
- 保留 GLM-Image 特有参数：分辨率选择、自定义尺寸

### 2. 更新 AI API 服务
- 重构 `ai.ts` 支持新的 API 配置结构
- 实现 GLM-Image API 正确调用（`/images/generations` 端点）
- 支持多分辨率：1280x1280、1568x1056、1056x1568 等

### 3. 重构 API 设置页面
- 将单一的 API 设置页改为"API 管理"
- 使用 Tabs 分别展示：文本 API、文生图 API、语音 API
- 每个 Tab 内支持选择服务提供商和配置独立参数

### 4. 更新角色设计组件
- `CharacterGallery` 支持选择图片分辨率
- `CostumeGenerator` 使用新的 API 配置
- 生成时显示当前使用的 API 提供商

### 5. 更新国际化
- 添加 API 管理相关翻译
- 添加 GLM-Image 分辨率选项翻译

## Scope

| Area | Change Type |
|------|-------------|
| `src/lib/types/character.ts` | Modified |
| `src/lib/api/ai.ts` | Modified |
| `src/features/settings/api/api-settings.tsx` | Modified |
| `src/features/character/components/character-gallery.tsx` | Modified |
| `src/features/character/components/costume-generator.tsx` | Modified |
| `src/i18n/zh-CN.ts` | Modified |

## Acceptance Criteria

1. [ ] API 管理页面分为三个独立 Tab：文本 API、文生图 API、语音 API
2. [ ] 每个 Tab 支持选择不同的服务提供商
3. [ ] 文生图 API 支持 GLM-Image 的多分辨率配置
4. [ ] 角色设计中的图片生成使用正确配置的 API
5. [ ] API 配置参数独立存储，互不干扰
6. [ ] 构建无错误
