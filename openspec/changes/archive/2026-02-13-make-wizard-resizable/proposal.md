# Proposal: make-wizard-resizable

## Why

分镜头清单的导入向导和导出向导窗口目前是固定尺寸，用户无法根据需要调整窗口大小。需要添加可缩放功能，让用户可以自由调整窗口尺寸。

## What Changes

1. **添加缩放功能**：使用 `react-resizable-panels` 或原生 CSS resize 实现窗口缩放
2. **保持最小尺寸限制**：防止窗口缩放过小导致内容显示异常
3. **记住用户偏好**：可选，记住用户上次调整的窗口尺寸

## 范围

- `src/features/storyboard/components/template-import-dialog.tsx`
- `src/features/storyboard/components/template-export-dialog.tsx`

## 验收标准

- [ ] 导入向导窗口可缩放
- [ ] 导出向导窗口可缩放
- [ ] 窗口有最小尺寸限制
- [ ] 缩放时内容布局正常
