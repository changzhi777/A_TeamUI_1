# Tasks

## Implementation Tasks

### 1. 更新列可见性默认状态
- [x] 修改 `shot-list-table.tsx` 中 `columnVisibility` 初始状态
- [x] 将 `projectId` 添加到默认隐藏列表

### 2. 实现紧凑布局样式
- [x] 为 Table 添加紧凑模式样式类
- [x] 减少单元格 padding 和行高

### 3. 更新画面描述列截断逻辑
- [x] 修改 `description` 列的 cell 渲染逻辑
- [x] 限制显示最多 8 个中文字符
- [x] 超出部分使用省略号替代

### 4. 更新音效说明列截断逻辑
- [x] 修改 `sound` 列的 cell 渲染逻辑
- [x] 限制显示最多 5 个中文字符
- [x] 超出部分使用省略号替代

### 5. 验证和测试
- [x] 确认构建成功
- [x] 验证悬停显示完整内容功能正常

## Dependencies

- 无依赖，所有任务可顺序执行

## Parallelization

- 任务 3、4 可并行执行
