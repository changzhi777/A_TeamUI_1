# Proposal: revert-wizard-to-horizontal

## Why

用户反馈分镜头清单的导入向导和导出向导改为竖版（9:16 比例）后，显示效果不理想。需要改回横版显示方式。

## What Changes

1. **恢复对话框尺寸**：从竖版比例改回横版比例
2. **恢复横向步骤导航**：使用 `orientation="horizontal"` 或移除 orientation 属性
3. **调整布局**：移除双栏布局，恢复单栏横向布局

## 范围

### 包含

- `src/features/storyboard/components/template-import-dialog.tsx` - 恢复横版布局
- `src/features/storyboard/components/template-export-dialog.tsx` - 恢复横版布局

### 不包含

- Steps 组件的修改（保持向后兼容）
- 其他功能的变更

## 验收标准

- [ ] 导入向导显示为横版布局
- [ ] 导出向导显示为横版布局
- [ ] 步骤导航横向显示
- [ ] 对话框比例适合横版显示
