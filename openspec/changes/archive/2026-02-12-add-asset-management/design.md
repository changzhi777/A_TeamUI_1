# Design: add-asset-management

## 架构设计

### 数据模型

#### 资产 (Asset)

```typescript
type AssetType = 'image' | 'audio' | 'video' | 'script' | 'aiGenerated'

type AssetSource = 'upload' | 'external' | 'ai' | 'storage' | 'link'

type AssetScope = 'global' | 'project'

interface Asset {
  id: string
  name: string
  type: AssetType
  source: AssetSource
  scope: AssetScope
  projectId?: string  // scope 为 project 时必填

  // 文件信息
  url: string
  thumbnailUrl?: string
  fileSize: number
  mimeType: string
  width?: number
  height?: number
  duration?: number

  // 元数据
  tags: string[]
  description?: string
  externalUrl?: string  // source 为 link 时使用

  // AI 生成相关信息
  aiGenerated?: boolean
  aiModel?: string
  aiPrompt?: string

  // 用户信息
  uploadedBy: string
  uploadedByName: string

  // 时间戳
  createdAt: string
  updatedAt: string
}
```

### 状态管理

#### asset-store.ts

```typescript
interface AssetStore {
  // 资产列表
  assets: Asset[]
  globalAssets: Asset[]
  projectAssets: Asset[]

  // 筛选状态
  filters: AssetFilters
  selectedAssets: Set<string>

  // 操作
  fetchAssets: (params?: AssetQueryParams) => Promise<void>
  fetchGlobalAssets: () => Promise<void>
  fetchProjectAssets: (projectId: string) => Promise<void>
  uploadAsset: (file: File, metadata?: AssetMetadata) => Promise<Asset>
  deleteAsset: (id: string) => Promise<void>
  updateAsset: (id: string, data: Partial<Asset>) => Promise<void>
  addTag: (id: string, tag: string) => Promise<void>
  removeTag: (id: string, tag: string) => Promise<void>

  // 批量操作
  batchDelete: (ids: string[]) => Promise<void>
  batchMoveToProject: (ids: string[], projectId: string) => Promise<void>
}
```

### API 设计

#### 资产查询参数

```typescript
interface AssetQueryParams {
  page?: number
  pageSize?: number
  type?: AssetType
  source?: AssetSource
  scope?: AssetScope
  projectId?: string
  tags?: string[]
  search?: string
  sortBy?: 'createdAt' | 'name' | 'fileSize'
  sortOrder?: 'asc' | 'desc'
}
```

### 组件架构

```
features/assets/
├── pages/
│   ├── asset-library-page.tsx      # 全局资产库页面
│   └── project-assets-page.tsx     # 项目资产页面
├── components/
│   ├── asset-grid.tsx              # 资产网格视图
│   ├── asset-list.tsx              # 资产列表视图
│   ├── asset-card.tsx              # 资产卡片
│   ├── asset-uploader.tsx           # 上传组件
│   ├── asset-preview-dialog.tsx    # 预览对话框
│   ├── asset-selector.tsx           # 资产选择器（用于分镜头）
│   ├── asset-filters.tsx            # 筛选面板
│   └── asset-tags-input.tsx         # 标签输入
└── hooks/
    ├── use-asset-upload.ts
    └── use-asset-preview.ts
```

### 路由设计

| 路由 | 组件 | 权限 | 说明 |
|------|------|------|------|
| `/assets` | AssetLibraryPage | 已登录用户 | 全局资产库 |
| `/projects/$id/assets` | ProjectAssetsPage | 项目成员 | 项目资产 |

## 技术决策

### 1. 文件上传策略

**决策**：采用分片上传 + 断点续传

- 前端使用 `file.slice()` 分片
- 每片 5MB，并发上传 3 片
- 失败自动重试，最多 3 次
- 后端合并分片并验证完整性

**原因**：支持大文件上传，提高上传稳定性

### 2. 缩略图生成

**决策**：后端生成 + 前端缓存

- 图片上传后，后端自动生成多尺寸缩略图
- 前端使用 URL 参数指定尺寸（如 `?w=200&h=200`）
- 使用浏览器缓存减少请求

**原因**：减轻前端负担，保证缩略图质量

### 3. 资产预览

**决策**：基于 MIME 类型的组件化预览

- 图片：使用原生 `<img>` + 缩放控制
- 视频：使用 HTML5 `<video>`
- 音频：使用 `<audio>` + 波形可视化（可选）
- 文档：使用 iframe 或 PDF.js

**原因**：轻量级实现，兼容性好

### 4. 外部素材库集成

**决策**：第一阶段仅预留接口，不实现具体集成

- 提供 `ExternalAssetSource` 接口
- 预留 Pexels、Unsplash 等服务的集成点
- 后续迭代按需实现

**原因**：避免过度设计，优先核心功能

### 5. AI 生成内容管理

**决策**：将 AI 生成内容作为特殊资产类型处理

- 记录生成模型和提示词
- 支持重新生成和变体生成
- 标注 AI 生成状态，便于区分

**原因**：便于追溯和管理 AI 生成内容

## 迁移策略

### 阶段 1：新增功能（不影响现有系统）

1. 创建资产管理模块
2. 添加导航入口
3. 实现基础 CRUD

### 阶段 2：数据迁移（可选）

- 将现有分镜头中的图片 URL 迁移到资产表
- 保持向后兼容，分镜头仍可直接使用 URL

### 阶段 3：功能集成

- 在分镜头表单中集成资产选择器
- 支持"从资产库选择"和"直接上传"两种方式

## 性能考虑

1. **懒加载**：资产列表使用虚拟滚动
2. **缓存策略**：
   - 资产列表缓存 5 分钟
   - 缩略图永久缓存（通过 URL 版本控制）
3. **上传优化**：
   - 大文件显示上传进度
   - 后台队列处理，不阻塞 UI
4. **CDN 加速**：生产环境使用 CDN 分发静态资源

## 安全考虑

1. **文件类型验证**：前端和后端双重验证
2. **文件大小限制**：
   - 图片：最大 50MB
   - 音频：最大 200MB
   - 视频：最大 2GB
3. **权限控制**：
   - 用户只能删除自己上传的资产（admin 除外）
   - 项目资产仅项目成员可见
4. **病毒扫描**：后端集成病毒扫描（可选）
