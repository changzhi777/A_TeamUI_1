# 资产库增加数据记录清单式显示模式

## Summary

为资产管理页面添加真正的表格/清单式列表视图，让用户能够以数据表的形式查看和管理资产，类似于分镜头列表的 DataTable 样式。

## Motivation

当前资产管理页面的"列表视图"实际上仍然以卡片网格形式展示资产，用户需要一个真正的表格视图：

1. **快速浏览大量数据** - 表格视图可以在有限空间内显示更多资产
2. **便于排序和筛选** - 表格支持按列排序，便于快速定位
3. **批量操作更高效** - 在表格中勾选和批量操作更加直观
4. **查看详细元数据** - 表格可以显示完整的资产信息（名称、类型、大小、来源、标签、上传者、时间等）

## Scope

### In Scope
- 新增 `AssetDataTable` 组件，使用 TanStack Table 实现表格视图
- 修改 `AssetLibraryPage` 中的视图模式逻辑，区分三种模式：grid（网格）、card（卡片）、table（表格）
- 表格支持以下列：
  - 选择框（批量操作）
  - 缩略图
  - 资产名称
  - 类型
  - 来源
  - 文件大小
  - 标签
  - 上传者
  - 创建时间
  - 操作（预览、编辑、删除）
- 支持列排序和列显示/隐藏
- 保留现有的网格和卡片视图

### Out of Scope
- 表格内联编辑
- 自定义列配置持久化
- 导出表格数据

## Design

### 组件结构

```
src/features/assets/components/
├── asset-data-table.tsx      # 新增：资产数据表组件
├── asset-list.tsx            # 现有：卡片列表（重命名为 asset-card-list.tsx 或保留）
├── asset-grid.tsx            # 现有：网格视图
└── ...
```

### 视图模式变更

当前：`viewMode: 'grid' | 'list'`（list 实际显示卡片）

变更后：`viewMode: 'grid' | 'card' | 'table'`
- `grid` - 网格视图（AssetGrid 组件）
- `card` - 卡片列表（AssetList 组件，显示为多列卡片）
- `table` - 表格视图（新增 AssetDataTable 组件）

### UI 设计

视图切换按钮从 2 个增加到 3 个，使用图标：
- 网格视图：Grid3x3 图标
- 卡片列表：LayoutGrid 图标
- 表格视图：Table 或 List 图标

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 视图模式状态兼容性 | 中 | 低 | 保留 'grid' 和 'list' 的向后兼容，'list' 映射到 'card' |
| 表格性能（大量数据） | 低 | 中 | 使用 TanStack Table 虚拟化或分页 |

## Related Changes

- 依赖现有 `asset-management` 规格中定义的资产类型和筛选功能
- 复用 `src/components/data-table/` 中的现有组件

## Success Criteria

1. 用户可以在网格、卡片、表格三种视图间切换
2. 表格视图显示所有关键资产信息
3. 表格支持按名称、类型、大小、时间等列排序
4. 用户可以选择多列进行显示或隐藏
5. 表格视图支持批量选择和操作
