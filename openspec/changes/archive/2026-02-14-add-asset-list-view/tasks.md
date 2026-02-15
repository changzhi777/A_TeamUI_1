# Tasks

## Implementation Tasks

### 1. 扩展视图模式类型
- [x] 更新 `asset-store.ts` 中的 `viewMode` 类型为 `'grid' | 'card' | 'table'`
- [x] 确保向后兼容：'list' 自动映射到 'card'

### 2. 创建 AssetDataTable 组件
- [x] 创建 `src/features/assets/components/asset-data-table.tsx`
- [x] 使用 TanStack Table 实现表格
- [x] 定义表格列（缩略图、名称、类型、来源、大小、标签、上传者、时间、操作）
- [x] 实现列排序功能
- [x] 实现行选择（复用 store 中的 selectedAssets）
- [x] 集成预览、编辑、删除操作
- [x] 添加分页支持

### 3. 更新 AssetLibraryPage
- [x] 更新视图切换按钮（3 个按钮：网格、卡片、表格）
- [x] 根据视图模式渲染对应组件（AssetGrid / AssetList / AssetDataTable）
- [x] 保留筛选和搜索功能在所有视图中的兼容性

### 4. 添加列显示/隐藏功能
- [x] 添加"显示列"下拉菜单
- [x] 实现列可见性状态管理

### 5. 测试和验证
- [x] 验证三种视图模式正常切换
- [x] 验证表格排序功能
- [x] 验证批量选择和操作
- [x] 验证筛选和搜索在表格视图中的兼容性

## Dependencies
- Task 1 must complete before Task 3
- Task 2 must complete before Task 3
- Task 3 must complete before Task 5

## Parallelization
- Task 1 and Task 2 can be done in parallel
