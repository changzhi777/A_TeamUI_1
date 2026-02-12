# enhance-project-list 设计文档

## 系统架构

### 数据模型变更

```typescript
interface Project {
  // ... 现有字段
  isFavorite: boolean     // 新增：是否收藏
  isPinned: boolean       // 新增：是否置顶
  pinnedAt?: string       // 新增：置顶时间
}
```

### 组件架构

```
project-list.tsx (主组件)
├── ProjectSearchBar (新增：搜索组件)
├── ProjectControls (新增：控制栏)
│   ├── ProjectSortSelect (新增：排序选择)
│   ├── ProjectViewToggle (新增：视图切换：列表/分组)
│   └── CreateProjectButton
├── ProjectGroupView (新增：分组视图)
│   └── ProjectGroup (按状态分组)
│       └── ProjectCard
└── ProjectListView (重构：列表视图)
    └── ProjectCard (简化版)
```

## 技术实现

### 搜索功能

使用本地字符串匹配，实时过滤项目列表：
```typescript
const filteredProjects = projects.filter(p =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

### 排序功能

提供三种排序选项：
1. 按创建时间降序（最新优先）
2. 按更新时间降序（最近更新优先）
3. 按项目名称升序（A-Z）

### 分组显示

按项目状态分组，使用折叠面板：
- 策划中 (planning)
- 拍摄中 (filming)
- 后期制作 (postProduction)
- 已完成 (completed)

每个分组显示项目数量，支持折叠/展开。

### 收藏/置顶逻辑

1. 置顶项目按 `pinnedAt` 时间降序排列在最前
2. 收藏项目在置顶项目之后按更新时间排序
3. 普通项目在收藏项目之后排序

```typescript
const sortedProjects = projects.sort((a, b) => {
  // 1. 置顶优先
  if (a.isPinned && !b.isPinned) return -1
  if (!a.isPinned && b.isPinned) return 1

  // 2. 收藏次之
  if (a.isFavorite && !b.isFavorite) return -1
  if (!a.isFavorite && b.isFavorite) return 1

  // 3. 按选择的排序方式
  return compareBy(a, b, sortBy)
})
```

## UI/UX 设计

### 搜索框设计

- 位置：页面顶部，标题右侧
- 样式：与现有 Search 组件一致
- 占位符："搜索项目..."
- 行为：实时搜索，无需按回车

### 排序选择器

- 类型：下拉菜单
- 选项：
  - "最新创建"（默认）
  - "最近更新"
  - "名称 A-Z"
  - "名称 Z-A"

### 视图切换

- 类型：分段控制器（Segmented Control）
- 选项：
  - "列表视图"（默认）：所有项目平铺显示
  - "分组视图"：按状态分组显示

### 简化的项目卡片

保留信息：
- 项目名称（可点击进入详情）
- 项目描述（一行截断）
- 状态标签
- 收藏/置顶图标（如果已收藏/置顶）
- 更新时间

移除信息：
- 分镜头进度条
- 分镜头数量统计
- 成员数量
- 操作菜单（改为点击卡片进入详情页操作）

### 收藏/置顶按钮

在项目详情页添加：
- 收藏按钮：星形图标，点击切换收藏状态
- 置顶按钮：图钉图标，点击切换置顶状态

## 性能考虑

- 所有筛选、排序操作在内存中完成，无需额外 API 调用
- 使用 React.useMemo 优化列表渲染性能
- 虚拟滚动（可选）：项目数量超过 100 时考虑引入

## 安全考虑

- 删除项目需要二次确认
- 删除操作需要权限检查（仅管理员可删除）
