# 角色设计功能模块

## Summary

在创作工具中新增"角色设计"功能模块，支持根据剧本描述和提示词生成角色人物的多视角图片，并支持服装变更、角色属性管理、个性描述编辑，以及通过 TTS 生成角色语音。

## Why

当前创作工具缺少角色设计功能，创作者需要：
1. **统一角色形象** - 在整个剧本创作过程中保持角色视觉一致性
2. **多视角参考** - 生成角色的正面、侧面、背面等多角度设计图
3. **服装变更** - 根据场景需要快速生成不同服装的角色形象
4. **角色属性管理** - 记录角色的基本属性、性格特点等设定
5. **语音生成** - 为角色生成专属语音，用于配音预览

## What Changes

### 1. 新增角色设计功能模块
- 创建 `src/features/character/` 目录，包含组件、页面、Store
- 角色卡片展示（头像、名称、简介、标签）
- 角色详情页面（属性、个性、多视角图片、语音）

### 2. 角色生成功能
- 文生图 API 集成（智谱 CogView 或兼容 API）
- 支持多视角生成：正面、侧面、背面、3/4视角
- 服装变更：基于角色基础形象 + 服装描述生成变体

### 3. TTS 语音生成
- TTS API 集成（智谱 TTS 或兼容 API）
- 支持角色语音风格设置
- 支持试听和下载

### 4. API 设置页面
- 在设置中新增"API 设置"页面
- 配置文生图 API Key
- 配置 TTS API Key
- 默认 API Key：智谱 `e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg`

### 5. 侧边栏导航更新
- 在"创作工具"分组中添加"角色设计"入口

## Scope

### In Scope
- 角色列表页面（卡片/表格视图）
- 角色创建/编辑对话框
- 角色详情页面
- 多视角图片生成（调用外部 API）
- 服装变体生成
- TTS 语音生成（调用外部 API）
- API 设置页面
- 角色 Store 状态管理
- 侧边栏导航更新

### Out of Scope
- 本地图片生成（完全依赖外部 API）
- 高级图片编辑功能
- 语音波形编辑
- 批量角色导入/导出

## Design

### 目录结构

```
src/
├── features/
│   ├── character/                    # 新增：角色设计模块
│   │   ├── components/
│   │   │   ├── character-card.tsx    # 角色卡片
│   │   │   ├── character-form.tsx    # 角色创建/编辑表单
│   │   │   ├── character-gallery.tsx # 多视角图片展示
│   │   │   ├── character-voice.tsx   # 语音播放/生成
│   │   │   ├── costume-generator.tsx # 服装变更生成器
│   │   │   └── character-list.tsx    # 角色列表
│   │   └── pages/
│   │       ├── character-page.tsx    # 角色列表页面
│   │       └── character-detail.tsx  # 角色详情页面
│   └── settings/
│       └── api/                      # 新增：API 设置
│           └── api-settings.tsx
├── stores/
│   └── character-store.ts            # 新增：角色状态管理
├── lib/
│   ├── api/
│   │   └── ai.ts                     # 新增：AI API 调用
│   └── types/
│       └── character.ts              # 新增：角色类型定义
└── routes/
    └── _authenticated/
        └── character/                # 新增：角色路由
            └── index.tsx
```

### 数据模型

```typescript
interface Character {
  id: string
  name: string
  description: string           // 角色简介
  personality: string           // 个性描述
  attributes: {                 // 角色属性
    age?: string
    gender?: string
    height?: string
    occupation?: string
    [key: string]: string
  }
  tags: string[]
  basePrompt: string            // 基础提示词（用于生成一致性）
  views: {                      // 多视角图片
    front?: CharacterImage
    side?: CharacterImage
    back?: CharacterImage
    threeQuarter?: CharacterImage
  }
  costumes: CostumeVariant[]    // 服装变体
  voice?: {                     // 语音设置
    style: string
    sampleUrl?: string
  }
  projectId?: string            // 所属项目（可选）
  createdAt: string
  updatedAt: string
}

interface CharacterImage {
  url: string
  prompt: string
  generatedAt: string
}

interface CostumeVariant {
  id: string
  name: string                  // 服装名称
  description: string           // 服装描述
  imageUrl: string
  prompt: string
  generatedAt: string
}
```

### API 配置

```typescript
interface AISettings {
  imageApiKey: string           // 文生图 API Key
  ttsApiKey: string             // TTS API Key
  imageModel: string            // 文生图模型
  ttsModel: string              // TTS 模型
  baseUrl?: string              // API 基础 URL（可选）
}

// 默认配置
const DEFAULT_AI_SETTINGS: AISettings = {
  imageApiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
  ttsApiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
  imageModel: 'cogviewx',
  ttsModel: 'tts-1',
}
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API Key 泄露 | 中 | 高 | 存储在 localStorage，不在代码中硬编码；提供清除功能 |
| API 调用失败 | 中 | 中 | 提供重试机制和错误提示；支持离线查看已生成内容 |
| 生成图片质量不稳定 | 高 | 低 | 支持重新生成；保存历史版本 |
| API 额度限制 | 中 | 中 | 显示调用次数；提示用户注意额度 |

## Related Changes

- 依赖现有的 `asset-management` 规格存储生成的图片
- 复用现有的 UI 组件库
- 遵循现有的状态管理模式（Zustand + persist）

## Success Criteria

1. 用户可以在侧边栏"创作工具"中找到"角色设计"入口
2. 用户可以创建、编辑、删除角色
3. 用户可以为角色生成多视角图片（正面、侧面、背面、3/4视角）
4. 用户可以基于角色基础形象生成服装变体
5. 用户可以设置角色属性和个性描述
6. 用户可以为角色生成 TTS 语音并试听
7. 用户可以在设置中配置 API Key
8. API Key 默认使用智谱提供的测试 Key
