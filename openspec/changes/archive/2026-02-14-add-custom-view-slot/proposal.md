# Proposal: Add Custom View Slot and Fix Gallery Errors

## Why
当前多视角图片功能存在以下问题：
1. 用户无法添加自定义视角，仅限于 4 个固定视角（正面、侧面、背面、3/4视角）
2. "重新生成"按钮点击时立即报错（500错误），因为代码中使用了未定义的变量

## What Changes
1. **修复 VIEW_TYPE_LABELS_CONST 错误**：将未定义的 `VIEW_TYPE_LABELS_CONST` 替换为已导入的 `VIEW_TYPE_LABELS`
2. **添加自定义视角槽位**：在 4 个固定视角卡片之后，添加一个"自定义"卡片，允许用户创建自定义命名的视角

## Impact
- **character-design** spec: 新增自定义视角需求
- `character-gallery.tsx`: 修复错误并添加自定义视角功能
- `character.ts` 类型: 扩展 ViewType 类型支持自定义视角

## Dependencies
- 现有角色类型系统
- 现有角色 Store
