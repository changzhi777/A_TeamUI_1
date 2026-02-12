# add-episode-range 任务列表

## 数据模型更新

- [x] 在 `project-store.ts` 的 `Project` 接口中添加 `episodeRange: string` 字段
- [x] 确保 `addProject` 函数正确初始化 `episodeRange` 为空字符串
- [x] 验证现有项目数据向后兼容（无该字段时默认为空字符串）

## 国际化更新

- [x] 在 `src/i18n/zh-CN.ts` 中添加集数相关翻译
  - `episodeRange: '集数范围'`
  - `episodeRangePlaceholder: '如：第1-30集'`
  - `episodeRangeDescription: '可选，输入项目的集数范围'`

## 项目表单对话框更新

- [x] 在 `project-form-dialog.tsx` 中添加集数范围输入字段
- [x] 配置表单验证（非必填，可选格式验证）
- [x] 确保创建和编辑模式都能正确处理集数字段
- [x] 添加占位符和描述文本

## 项目卡片显示更新

- [x] 在 `project-list.tsx` 的 `ProjectCard` 组件中添加集数标签显示
- [x] 集数标签位置：项目名称下方，描述上方
- [x] 使用 `Badge` 组件 + `Film` 图标
- [x] 仅在 `episodeRange` 有值时显示
- [x] 确保样式与状态徽章协调

## 项目详情页更新

- [x] 在 `project-detail.tsx` 中添加集数范围显示
- [x] 位置与项目卡片保持一致
- [x] 样式统一

## 种子数据更新

- [x] 在 `src/lib/seed-data.ts` 中为示例项目添加集数范围
- [x] 确保示例数据展示不同格式的集数范围

## 测试验证

- [x] 测试创建项目时设置集数范围
- [x] 测试编辑项目时修改集数范围
- [x] 测试项目卡片正确显示集数标签
- [x] 测试项目详情页正确显示集数
- [x] 测试空集数时不显示标签
- [x] 测试不同格式集数的显示效果
- [x] 测试深色/浅色模式下的样式
- [x] 测试响应式布局下的显示

## 文档更新

- [x] 更新 `openspec/specs/project-management/spec.md` 添加集数范围相关规范
- [x] 更新 `openspec/specs/project-list/spec.md` 添加集数显示说明
