# Tasks

## Implementation Tasks

### 1. 创建角色类型定义
- [x] 创建 `src/lib/types/character.ts`，定义 Character、CharacterImage、CostumeVariant 类型
- [x] 定义 AISettings 类型用于 API 配置

### 2. 创建 AI API 服务
- [x] 创建 `src/lib/api/ai.ts`，封装文生图和 TTS API 调用
- [x] 实现智谱 API 兼容的接口
- [x] 添加错误处理和重试机制

### 3. 创建角色 Store
- [x] 创建 `src/stores/character-store.ts`
- [x] 实现角色 CRUD 操作
- [x] 实现图片生成状态管理
- [x] 添加 persist 持久化

### 4. 创建角色列表组件
- [x] 创建 `src/features/character/components/character-card.tsx`
- [x] 创建 `src/features/character/components/character-list.tsx`
- [x] 支持卡片/表格视图切换

### 5. 创建角色表单组件
- [x] 创建 `src/features/character/components/character-form.tsx`
- [x] 支持角色基本信息编辑
- [x] 支持属性和个性描述编辑

### 6. 创建多视角图片组件
- [x] 创建 `src/features/character/components/character-gallery.tsx`
- [x] 支持正面、侧面、背面、3/4视角展示
- [x] 支持单视角重新生成

### 7. 创建服装变更组件
- [x] 创建 `src/features/character/components/costume-generator.tsx`
- [x] 支持服装描述输入
- [x] 支持服装变体列表管理

### 8. 创建语音生成组件
- [x] 创建 `src/features/character/components/character-voice.tsx`
- [x] 集成 TTS API
- [x] 支持语音试听和下载

### 9. 创建角色页面
- [x] 创建 `src/features/character/pages/character-page.tsx`（列表页）
- [x] 创建角色详情对话框或页面
- [x] 添加路由 `src/routes/_authenticated/character/index.tsx`

### 10. 创建 API 设置页面
- [x] 创建 `src/features/settings/api/api-settings.tsx`
- [x] 支持配置文生图 API Key
- [x] 支持配置 TTS API Key
- [x] 设置默认 API Key
- [x] 更新设置页面导航

### 11. 更新侧边栏导航
- [x] 更新 `src/components/layout/data/sidebar-data.ts`
- [x] 在"创作工具"中添加"角色设计"入口

### 12. 更新国际化
- [x] 更新 `src/i18n/zh-CN.ts`，添加角色设计相关翻译
- [x] 添加 AI 设置相关翻译

### 13. 测试和验证
- [x] 验证角色 CRUD 功能
- [x] 验证图片生成（需 API 可用）
- [x] 验证 TTS 生成（需 API 可用）
- [x] 验证 API 设置保存和读取

## Dependencies
- Task 1 must complete before Task 3
- Task 2 must complete before Task 6, 7, 8
- Task 3 must complete before Task 4, 5
- Task 4, 5, 6, 7, 8 must complete before Task 9
- Task 10 must complete before Task 13

## Parallelization
- Task 1, 2 can be done in parallel
- Task 4, 5, 11, 12 can be done in parallel after Task 3
- Task 6, 7, 8 can be done in parallel after Task 2
