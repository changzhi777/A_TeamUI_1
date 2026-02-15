# Tasks: Enhance Prompt with Style Optimization

## Phase 1: 类型定义
- [x] 1.1 在 `character.ts` 添加 CharacterStyle 类型
  - 'anime' | 'ghibli' | 'cinematic'
- [x] 1.2 添加 STYLE_PROMPTS 常量映射
  - 每种风格对应的英文提示词
- [x] 1.3 更新 Character 接口添加 style 字段

## Phase 2: 风格选择组件
- [x] 2.1 创建 `CharacterStyleSelect` 组件
  - 下拉选择框
  - 风格预览描述
- [x] 2.2 在 `CharacterForm` 中集成风格选择
- [x] 2.3 风格选择时自动更新 basePrompt（通过 AI 优化时传递 style 参数）

## Phase 3: AI 一键优化功能
- [x] 3.1 在 `prompt-optimizer.tsx` 添加快速优化模式
  - 一键优化按钮
  - 读取当前提示词
  - 调用 AI 优化
- [x] 3.2 实现 `optimizePrompt` 函数
  - 将中文提示词优化为英文
  - 保持原意，增强描述
  - 添加风格关键词
- [x] 3.3 优化结果直接替换基础提示词

## Phase 4: 集成和测试
- [x] 4.1 更新 character-store 支持保存 style 字段（通过更新 UpdateCharacterParams）
- [x] 4.2 运行构建验证
- [x] 4.3 测试风格选择功能
- [x] 4.4 测试 AI 优化功能

## Acceptance Criteria
1. ✅ 用户可以选择"动漫人物"、"吉卜力风格"、"电影级真人"三种风格
2. ✅ 选择风格后 AI 优化会自动在提示词前添加对应的英文风格提示
3. ✅ 点击"AI 优化"按钮可以优化当前基础提示词
4. ✅ 优化后的提示词自动替换原有内容
5. ✅ 优化结果为英文，包含更详细的描述
6. ✅ 现有六维模板优化功能不受影响
