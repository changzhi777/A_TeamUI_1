# 分镜头清单页面

## 概述

创建独立的"分镜头清单"页面，以表格形式展示项目的所有分镜头信息，支持完整的表格交互功能，包括行选择、批量操作、行内编辑、列排序、筛选和拖拽排序。

## 背景

当前分镜头创作页面提供列表、网格、时间轴三种视图模式，但列表视图采用卡片形式展示，信息密度较低。当用户需要快速浏览、编辑或导出大量分镜头时，需要更高效的表格视图。

## 目标

1. 创建独立的 `/storyboard-list` 路由页面
2. 使用 TanStack Table 构建数据表格
3. 显示完整分镜头信息（所有字段）
4. 支持完整表格交互：行选择、批量操作、行内编辑、列排序、筛选、拖拽排序
5. 支持按项目筛选分镜头
6. 支持导出表格数据

## 实施范围

### 新增文件

- `src/routes/_authenticated/storyboard-list.tsx` - 路由页面
- `src/features/storyboard/components/storyboard-list-page.tsx` - 主页面组件
- `src/features/storyboard/components/shot-list-table.tsx` - 数据表格组件

### 修改文件

- `src/components/layout/data/sidebar-data.ts` - 添加侧边栏导航项
- `src/i18n/zh-CN.ts` - 添加翻译文本

### 复用组件

- `src/components/data-table/*` - 现有的 DataTable 组件集
- `src/stores/storyboard-store.ts` - 现有分镜头状态管理
- `src/stores/project-store.ts` - 现有项目管理状态

## 技术方案

### 路由结构

```
/_authenticated/storyboard-list  →  StoryboardListPage
```

### 表格列定义

| 列名 | 字段 | 类型 | 操作 |
|------|------|------|------|
| 选择 | - | 复选框 | 行选择 |
| 镜头编号 | shotNumber | 数字 | 排序 |
| 场次 | scene | 文本 | 排序、筛选 |
| 景别 | size | 下拉 | 排序、筛选 |
| 运镜方式 | movement | 下拉 | 排序、筛选 |
| 时长 | duration | 数字 | 排序 |
| 画面描述 | description | 文本 | 行内编辑 |
| 对白/旁白 | dialogue | 文本 | 行内编辑 |
| 音效说明 | audio | 文本 | 行内编辑 |
| 配图 | image | 图片预览 | - |
| 操作 | - | 按钮 | 编辑、删除 |

### 状态管理

复用现有的 `storyboard-store.ts`：
- `shots` - 所有分镜头数据
- `selectedShotIds` - 选中的分镜头 ID 列表
- 现有的 CRUD 方法

### 数据流

1. 页面加载时从 `storyboard-store` 获取所有分镜头
2. 根据选中的项目筛选分镜头
3. TanStack Table 处理排序、筛选、分页状态
4. 行内编辑直接调用 store 的更新方法
5. 批量操作调用 store 的批量方法

## 用法示例

```tsx
// 用户访问 /storyboard-list
// 显示所有项目的分镜头表格
// 用户可以通过项目筛选器选择特定项目
// 用户可以排序、筛选、行内编辑、批量操作
```

## 成功标准

- [ ] 创建 `/storyboard-list` 路由
- [ ] 表格显示所有分镜头字段
- [ ] 支持按项目筛选
- [ ] 支持列排序
- [ ] 支持列筛选（场次、景别、运镜方式）
- [ ] 支持行选择（单选/多选）
- [ ] 支持批量删除
- [ ] 支持行内编辑（画面描述、对白、音效）
- [ ] 支持拖拽排序
- [ ] 支持导出表格数据
- [ ] 响应式布局适配

## 风险评估

- **中等风险**：表格功能复杂，需要仔细处理状态同步
- **兼容性**：复用现有 DataTable 组件，降低风险
- **性能**：大量分镜头时需要虚拟滚动优化

## 优先级

中等 - 提升用户体验，但非阻塞功能
