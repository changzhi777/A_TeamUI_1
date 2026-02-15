# Tasks

## Implementation Tasks

### 1. 重构 API 类型定义
- [x] 创建 `TextAPIConfig` 类型（支持智谱 GLM-4.7-Flash、OpenAI GPT 等）
- [x] 创建 `ImageAPIConfig` 类型（支持智谱 GLM-Image、DALL-E 等，含分辨率参数）
- [x] 创建 `VoiceAPIConfig` 类型（支持智谱 GLM-TTS-Clone、OpenAI TTS 等）
- [x] 创建 `APIManagementConfig` 聚合类型
- [x] 定义默认配置常量（文本默认：glm-4.7-flash，语音默认：glm-tts-clone）

### 2. 更新 AI API 服务
- [x] 重构 `ai.ts` 使用新的配置结构
- [x] 实现 GLM-Image API 调用（支持 size 参数）
- [x] 添加分辨率验证逻辑（512-2048px，32 倍数）
- [x] 更新 `getAPIConfig` 和 `saveAPIConfig` 函数

### 3. 重构 API 设置页面
- [x] 将页面标题改为"API 管理"
- [x] 添加 Tabs 组件：文本 API、文生图 API、语音 API
- [x] 每个 Tab 实现服务提供商选择
- [x] 文生图 Tab 添加分辨率选择器
- [x] 保留测试连接和重置功能

### 4. 更新角色设计组件
- [x] `CharacterGallery` 添加分辨率选择
- [x] 更新 `CostumeGenerator` 使用新 API 配置
- [x] 生成时传递分辨率参数

### 5. 更新国际化
- [x] 添加 `settings.apiManagement` 翻译
- [x] 添加服务提供商名称翻译
- [x] 添加分辨率选项翻译

### 6. 更新设置导航
- [x] 将"API 设置"改为"API 管理"
- [x] 更新导航图标

### 7. 验证和测试
- [x] 确认构建成功
- [x] 验证 API 配置存储正常
- [x] 验证图片生成使用正确参数

## Dependencies

- Task 1 must complete before Task 2, 3
- Task 2 must complete before Task 4
- Task 5, 6 can be done in parallel with Task 3, 4

## Parallelization

- Task 5, 6 can be done in parallel
- Task 4 can start after Task 2
