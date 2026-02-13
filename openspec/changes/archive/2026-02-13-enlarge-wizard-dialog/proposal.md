# Proposal: enlarge-wizard-dialog

## Why

分镜头清单的导入向导和导出向导窗口尺寸较小，内容显示不够宽敞。需要将窗口尺寸放大2倍以提升用户体验。

## What Changes

1. **导入向导**：从 `max-w-5xl` (1024px) 放大到 `max-w-[2048px]`
2. **导出向导**：从 `max-w-2xl` (672px) 放大到 `max-w-6xl` (1152px)

## 范围

- `src/features/storyboard/components/template-import-dialog.tsx`
- `src/features/storyboard/components/template-export-dialog.tsx`

## 验收标准

- [ ] 导入向导窗口宽度放大2倍
- [ ] 导出向导窗口宽度放大2倍
