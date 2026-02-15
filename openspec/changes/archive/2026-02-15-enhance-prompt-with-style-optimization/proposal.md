# Proposal: Enhance Prompt with Style Optimization

## Why
当前角色提示词功能存在以下问题：
1. 用户需要手动编写英文提示词，对非专业用户门槛较高
2. 缺少常用的人物风格预设，用户不知道如何描述不同风格
3. 基础提示词优化功能不够便捷，需要填写六维模板较繁琐
4. 生成的提示词缺少风格统一性，每次都需要重新设置风格

## What Changes
1. **新增人物风格选择**：在角色表单中添加"人物风格"下拉选择
   - 动漫人物 (Anime Style)
   - 吉卜力风格 (Ghibli Style)
   - 电影级真人 (Cinematic Realistic)
2. **新增 AI 一键优化**：在基础提示词区域添加"AI 优化"按钮
   - 读取当前基础提示词
   - 调用 AI API 进行优化
   - 将优化结果替换原提示词
3. **风格自动转换为英文提示词**：选择风格后自动添加对应的英文提示词前缀

## Impact
- **character-design** spec: 新增人物风格和 AI 优化需求
- `character-form.tsx`: 添加风格选择和 AI 优化按钮
- `prompt-optimizer.tsx`: 增强优化功能
- `character.ts`: 添加 CharacterStyle 类型

## Dependencies
- 现有 AI API (`src/lib/api/ai.ts`)
- 现有 PromptOptimizer 组件
