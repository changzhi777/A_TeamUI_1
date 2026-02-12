# 分镜头清单页面 - 设计文档

## 设计目标

创建高效的分镜头数据管理页面，以表格形式展示和编辑分镜头信息，支持批量操作和高级数据交互。

## 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│ 分镜头清单                                    [项目筛选器▼] │
├─────────────────────────────────────────────────────────────┤
│ [搜索框] [列筛选器] [视图选项]                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬────────┬──────┬────────┬──────┬────────┬────────┐ │
│ │选择 │镜头编号│场次  │景别    │运镜  │画面描述│操作    │ │
│ ├─────┼────────┼──────┼────────┼──────┼────────┼────────┤ │
│ │☑   │   1    │ 1-1  │中景    │固定  │进入房间│编辑 删除│ │
│ │☑   │   2    │ 1-2  │特写    │推    │主角表情│编辑 删除│ │
│ │☐   │   3    │ 1-3  │全景    │摇    │全景环视│编辑 删除│ │
│ └─────┴────────┴──────┴────────┴──────┴────────┴────────┘ │
│ [批量删除 2] [导出] [导出 PDF]                              │
└─────────────────────────────────────────────────────────────┘
```

## 数据表格架构

### 表格列配置

```typescript
const columns = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
  },
  {
    accessorKey: 'shotNumber',
    header: '镜头编号',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'scene',
    header: '场次',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'size',
    header: '景别',
    cell: (info) => getShotSizeLabel(info.getValue()),
  },
  {
    accessorKey: 'movement',
    header: '运镜方式',
    cell: (info) => getCameraMovementLabel(info.getValue()),
  },
  {
    accessorKey: 'duration',
    header: '时长',
    cell: (info) => formatDuration(info.getValue()),
  },
  {
    accessorKey: 'description',
    header: '画面描述',
    cell: (info) => <EditableCell value={info.getValue()} onSave={...} />,
  },
  {
    accessorKey: 'dialogue',
    header: '对白/旁白',
    cell: (info) => <EditableCell value={info.getValue()} onSave={...} />,
  },
  {
    accessorKey: 'audio',
    header: '音效说明',
    cell: (info) => <EditableCell value={info.getValue()} onSave={...} />,
  },
  {
    accessorKey: 'image',
    header: '配图',
    cell: (info) => info.getValue() ? <ImageThumbnail src={info.getValue()} /> : null,
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onEdit(row.original)}>编辑</Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>删除</Button>
      </div>
    ),
  },
]
```

### 状态管理

```typescript
// 表格状态
const [sorting, setSorting] = useState<SortingState>([])
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

// 项目筛选状态
const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all')
```

### 数据筛选逻辑

```typescript
const filteredShots = useMemo(() => {
  let result = shots

  // 按项目筛选
  if (selectedProjectId !== 'all') {
    result = result.filter(s => s.projectId === selectedProjectId)
  }

  // TanStack Table 处理列筛选和排序
  return result
}, [shots, selectedProjectId])
```

## 交互设计

### 行内编辑

1. **进入编辑模式**：
   - 点击单元格进入编辑状态
   - 文本单元格显示输入框
   - 下拉单元格显示选择器

2. **保存编辑**：
   - 按 Enter 键或点击外部保存
   - 按 Esc 键取消编辑
   - 显示保存加载状态

3. **验证**：
   - 必填字段验证
   - 数据格式验证

### 批量操作

1. **行选择**：
   - 表头复选框：全选/取消全选当前页
   - 行复选框：切换单行选择状态
   - 显示已选择数量

2. **批量操作栏**：
   - 仅在有选择时显示
   - 显示选中数量
   - 提供批量删除按钮
   - 提供取消选择按钮

### 拖拽排序

1. **拖拽手柄**：
   - 每行左侧显示拖拽手柄图标
   - 仅在排序模式下可拖拽

2. **排序逻辑**：
   - 拖拽时显示放置指示器
   - 释放后重新计算镜头编号
   - 更新 store 中的数据

## 响应式设计

### 桌面端 (>= 1024px)

- 显示所有列
- 完整功能

### 平板端 (768px - 1023px)

- 隐藏次要列（音效说明）
- 水平滚动查看更多列

### 移动端 (< 768px)

- 仅显示关键列
- 进入行详情查看完整信息
- 操作按钮移至详情页面

## 性能优化

### 虚拟滚动

当分镜头数量超过 100 时，启用虚拟滚动：

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: filteredShots.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 50, // 每行高度
  overscan: 10,
})
```

### 列渲染优化

- 使用 `memo` 包装行组件
- 仅渲染可见列
- 图片懒加载

## 可访问性

### 键盘导航

- `Tab` - 在可交互元素间导航
- `Enter` - 激活按钮/确认编辑
- `Esc` - 取消编辑/关闭对话框
- `Space` - 切换复选框
- `↑↓` - 在行之间导航

### 屏幕阅读器

- 表格使用语义化 `<table>` 标签
- 列头使用 `<th>` 标签
- 按钮添加 `aria-label`
- 状态变化添加 `aria-live`

## 国际化

### 翻译键

```typescript
// zh-CN.ts
{
  storyboardList: {
    title: '分镜头清单',
    projectFilter: '项目筛选',
    allProjects: '全部项目',
    searchPlaceholder: '搜索分镜头...',
    columns: {
      shotNumber: '镜头编号',
      scene: '场次',
      size: '景别',
      movement: '运镜方式',
      duration: '时长',
      description: '画面描述',
      dialogue: '对白/旁白',
      audio: '音效说明',
      image: '配图',
      actions: '操作',
    },
    actions: {
      edit: '编辑',
      delete: '删除',
      batchDelete: '批量删除',
      export: '导出',
      exportPdf: '导出 PDF',
    },
    empty: '暂无分镜头',
    noResults: '未找到匹配的分镜头',
  }
}
```

## 导航入口

### 侧边栏

在"创作工具"分组中添加：

```typescript
{
  title: '分镜头清单',
  url: '/storyboard-list',
  icon: List,
}
```

### 面包屑导航

```
项目列表 > 分镜头清单
```

## 错误处理

### 数据加载失败

```typescript
if (error) {
  return <ErrorMessage error={error} onRetry={fetchShots} />
}
```

### 编辑失败

```typescript
try {
  await updateShot(shotId, updates)
  toast.success('保存成功')
} catch (error) {
  toast.error('保存失败', { description: error.message })
}
```

## 未来扩展

- 支持自定义列显示/隐藏
- 支持列宽调整
- 支持列拖拽重排
- 支持保存表格视图配置
- 支持导出 Excel 格式
