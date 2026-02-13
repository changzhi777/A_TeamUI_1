# Proposal: make-wizard-responsive

## Why

分镜头清单的导入向导和导出向导窗口需要实时自适应屏幕大小，在不同设备上提供最佳显示效果。

## What Changes

1. **使用视口单位**：窗口尺寸使用 `vw`/`vh` 单位，实时跟随屏幕大小
2. **响应式断点**：在不同屏幕尺寸下调整布局
3. **移除固定尺寸**：移除 `resize` 属性和固定 `max-w-*` 限制

## 范围

- `src/features/storyboard/components/template-import-dialog.tsx`
- `src/features/storyboard/components/template-export-dialog.tsx`

## 验收标准

- [ ] 导入向导窗口实时自适应屏幕
- [ ] 导出向导窗口实时自适应屏幕
- [ ] 窗口调整大小时内容实时响应
