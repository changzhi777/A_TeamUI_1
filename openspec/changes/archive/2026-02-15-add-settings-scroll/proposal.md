# add-settings-scroll

## Summary

为"设置"页面的内容区域添加垂直滚动条，确保当内容超出可视区域时用户可以滚动查看完整内容。

## Motivation

当前设置页面使用 `Main fixed` 布局，内容区域设置了 `overflow-y-hidden`，导致当表单内容超出屏幕高度时，用户无法滚动查看完整内容。这影响了以下页面的可用性：

- 个人资料设置
- 账户设置
- 外观设置
- 通知设置
- 显示设置
- API 管理

## Approach

修改 `src/features/settings/index.tsx` 中的内容区域容器：

1. 将 `overflow-y-hidden` 改为 `overflow-y-auto`
2. 添加 `flex-1` 确保内容区域正确填充剩余空间
3. 添加最大高度限制确保滚动区域边界清晰

## Impact

- **用户体验**: 用户可以完整查看和操作所有设置表单内容
- **响应式**: 在较小屏幕设备上体验更好
- **兼容性**: 不影响现有的布局结构

## Risks

- 无明显风险，这是一个纯 CSS 修改

## Dependencies

无

## Timeline

单个任务，预计 10 分钟完成
