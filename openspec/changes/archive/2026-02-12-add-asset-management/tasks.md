# Tasks: add-asset-management

## 阶段 1：基础设施

- [x] **T1.1** 创建资产类型定义文件 `src/lib/types/assets.ts`
  - 定义 `AssetType`、`AssetSource`、`AssetScope` 类型
  - 定义 `Asset` 接口
  - 定义 `AssetQueryParams`、`AssetMetadata` 等辅助类型

- [x] **T1.2** 创建资产管理 API 客户端 `src/lib/api/assets.ts`
  - 实现 `fetchAssets()` 查询资产列表
  - 实现 `fetchAssetById()` 获取单个资产
  - 实现 `uploadAsset()` 上传资产
  - 实现 `deleteAsset()` 删除资产
  - 实现 `updateAsset()` 更新资产元数据
  - 实现 `batchDeleteAssets()` 批量删除
  - 实现 `getAssetStats()` 获取统计信息
  - 注意：当前为占位实现，需要后端 API 支持

- [x] **T1.3** 创建资产状态管理 `src/stores/asset-store.ts`
  - 实现 `assets`、`globalAssets`、`projectAssets` 状态
  - 实现 `filters`、`selectedAssets` 状态
  - 实现 `fetchAssets()`、`uploadAsset()`、`deleteAsset()` 等 action
  - 实现 `addTag()`、`removeTag()` 标签管理
  - 集成 TanStack Query 缓存

## 阶段 2：核心组件

- [x] **T2.1** 创建资产管理页面路由
  - 创建 `src/routes/_authenticated/assets/route.tsx`（全局资产库）
  - 创建 `src/routes/_authenticated/projects/$id/assets/route.tsx`（项目资产）

- [x] **T2.2** 创建资产页面组件 `src/features/assets/pages/asset-library-page.tsx`
  - 实现页面布局（头部、筛选、资产列表）
  - 集成 asset-store 状态
  - 处理路由参数（筛选、搜索）

- [x] **T2.3** 创建项目资产页面 `src/features/assets/pages/project-assets-page.tsx`
  - 实现与全局资产库类似的布局
  - 限制显示范围到当前项目
  - 添加项目上下文面包屑

- [x] **T2.4** 创建资产卡片组件 `src/features/assets/components/asset-card.tsx`
  - 显示缩略图/图标
  - 显示资产名称、类型、大小
  - 提供预览、编辑、删除操作按钮
  - 支持选中状态（用于批量操作）

- [x] **T2.5** 创建资产网格视图 `src/features/assets/components/asset-grid.tsx`
  - 使用响应式网格布局
  - 显示资产卡片
  - 支持批量选择

- [x] **T2.6** 创建资产列表视图 `src/features/assets/components/asset-list.tsx`
  - 使用表格布局
  - 显示更详细的资产信息
  - 支持排序功能

## 阶段 3：上传功能

- [x] **T3.1** 创建上传组件 `src/features/assets/components/asset-uploader.tsx`
  - 实现拖拽上传区域
  - 实现文件选择按钮
  - 显示上传进度（单文件和多文件）
  - 支持取消上传

- [x] **T3.2** 预留大文件分片上传接口 `src/lib/api/assets.ts`
  - 预留文件分片逻辑接口
  - 预留并发上传控制接口
  - 预留断点续传接口
  - 预留重试机制接口
  - 注意：需要后端支持

- [x] **T3.3** 创建上传进度追踪 `src/features/assets/hooks/use-asset-upload.ts`
  - 跟踪每个文件的上传状态
  - 计算总体进度
  - 处理上传失败和重试
  - 提供取消功能

## 阶段 4：预览功能

- [x] **T4.1** 创建资产预览对话框 `src/features/assets/components/asset-preview-dialog.tsx`
  - 显示资产详细元数据
  - 显示资产引用信息

- [x] **T4.2** 创建类型化预览组件
  - `src/features/assets/components/preview/asset-preview-image.tsx`（图片预览，支持缩放）
  - `src/features/assets/components/preview/asset-preview-video.tsx`（视频预览）
  - `src/features/assets/components/preview/asset-preview-audio.tsx`（音频预览）

## 阶段 5：筛选功能

- [x] **T5.1** 创建资产筛选面板 `src/features/assets/components/asset-filters.tsx`
  - 按类型筛选
  - 按来源筛选
  - 按标签筛选

## 阶段 6：资产选择器

- [x] **T6.1** 创建资产选择器组件 `src/features/assets/components/asset-selector.tsx`
  - 支持单选和多选模式
  - 支持按类型过滤
  - 支持搜索
  - 返回选中的资产信息

## 阶段 7：导航和菜单

- [x] **T7.1** 更新侧边栏导航 `src/components/layout/data/sidebar-data.ts`
  - 添加"资产管理"分组
  - 添加"资产库"入口

- [x] **T7.2** 更新导航规范 `openspec/specs/navigation/spec.md`
  - 添加资产管理路由定义

## 阶段 8：权限控制

- [x] **T8.1** 实现资产权限检查
  - 管理员可管理所有资产
  - 普通成员只能管理自己上传的资产
  - 项目资产仅项目成员可见

- [x] **T8.2** 集成权限组件
  - 使用 `PermissionGuard` 组件
  - 使用 `usePermissionCheck` hook
  - 更新 `asset-card.tsx` 集成权限控制

## 阶段 9：导入导出（后续迭代）

> ⚠️ 此阶段需要后端 API 支持，不在当前最小化实现范围内。

- [ ] **T9.1** 实现资产清单导出 `src/lib/api/assets.ts`
  - 导出 CSV 格式
  - 包含资产元数据
  - **依赖**：后端 `GET /api/assets/export` API

- [ ] **T9.2** 实现资产元数据导入 `src/lib/api/assets.ts`
  - 解析 CSV 文件
  - 创建 link 类型资产
  - **依赖**：后端 `POST /api/assets/import` API

## 阶段 10：集成

- [x] **T10.1** 分镜头表单集成资产选择器
  - 在分镜头图片选择中集成 `AssetSelector`
  - 支持"从资产库选择"和"直接上传"

- [x] **T10.2** 项目详情页集成资产标签
  - 在项目详情页添加资产标签页入口

## 阶段 11：测试与优化（后续迭代）

> ⚠️ 此阶段为后续迭代内容，不在当前最小化实现范围内。

- [ ] **T11.1** 编写单元测试
- [ ] **T11.2** 编写集成测试
- [ ] **T11.3** 性能优化（虚拟滚动）
- [ ] **T11.4** 无障碍优化

## 后端依赖说明

> ⚠️ **重要**：当前实现中，`src/lib/api/assets.ts` 为占位实现（placeholder）。完整功能需要后端提供以下 API：
>
> - `GET /api/assets` - 获取资产列表
> - `GET /api/assets/:id` - 获取单个资产
> - `POST /api/assets` - 上传资产
> - `PUT /api/assets/:id` - 更新资产
> - `DELETE /api/assets/:id` - 删除资产
> - `POST /api/assets/batch-delete` - 批量删除
> - `GET /api/assets/stats` - 获取统计信息
> - `GET /api/assets/:id/usage` - 获取使用情况
> - `POST /api/assets/:id/tags` - 添加标签
> - `DELETE /api/assets/:id/tags/:tag` - 移除标签
> - `POST /api/assets/import` - 导入资产
> - `GET /api/assets/export` - 导出资产

## 完成条件

- [x] 所有核心组件已创建
- [x] 路由已配置
- [x] 导航已添加
- [x] 权限控制已实现
- [x] 与分镜头创作集成完成
- [ ] 后端 API 对接完成
