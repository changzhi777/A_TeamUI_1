# Proposal: convert-wizard-to-vertical

## Why

当前分镜头清单的导入向导和导出向导使用横向步骤导航，在以下场景中体验不佳：
- 步骤数量多（导入 6 步，导出 5 步），横向显示在小屏幕上拥挤
- 步骤标题过长时需要截断，用户难以快速理解流程
- 移动端适配困难

竖版向导可以：
- 更清晰地展示完整步骤标题和描述
- 更好地适应移动端和窄屏幕
- 符合常见向导式交互模式

## What Changes

1. **扩展 Steps 组件**：添加 `orientation` 属性支持竖版布局
2. **调整导入向导**：改为竖版显示，调整对话框尺寸
3. **调整导出向导**：改为竖版显示，调整对话框尺寸
4. **优化内容布局**：各步骤内容适配竖版向导

## 范围

### 包含

- `src/components/ui/steps.tsx` - 添加竖版布局支持
- `src/features/storyboard/components/template-import-dialog.tsx` - 改为竖版
- `src/features/storyboard/components/template-export-dialog.tsx` - 改为竖版
- 各步骤组件的布局微调（如需要）

### 不包含

- 步骤逻辑和业务功能变更
- 新增步骤或删除步骤
- 其他使用 Steps 组件的地方（如资产上传向导）

## 影响范围

- `src/components/ui/steps.tsx`
- `src/features/storyboard/components/template-import-dialog.tsx`
- `src/features/storyboard/components/template-export-dialog.tsx`

## 验收标准

- [ ] 导入向导显示为竖版布局
- [ ] 导出向导显示为竖版布局
- [ ] 步骤标题完整显示，无需截断
- [ ] 步骤导航交互正常（上一步/下一步）
- [ ] 对话框尺寸适配竖版布局
- [ ] 响应式适配良好
