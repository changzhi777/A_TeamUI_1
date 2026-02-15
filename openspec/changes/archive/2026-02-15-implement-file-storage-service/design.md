# Design: File Storage Service Architecture

## Overview
实现一个混合文件存储服务，在 AI 生成图片后自动将文件下载到后端服务器，同时在前端使用 IndexedDB 进行缓存，以支持离线访问和快速导出。

## Components

### 1. FileRecord Type
```typescript
interface FileRecord {
  id: string
  filename: string
  originalUrl: string      // AI 服务返回的原始 URL
  localUrl: string         // 本后端存储的 URL
  cachedBlob?: Blob        // IndexedDB 缓存（可选）
  mimeType: string
  size: number
  md5Hash: string
  category: 'view' | 'costume' | 'voice' | 'other'
  entityId: string         // 关联的角色/资产 ID
  entityType: 'character' | 'asset'
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}
```

### 2. StorageService
负责文件的下载、上传和缓存管理：

```typescript
class FileStorageService {
  // 下载远程文件并上传到后端
  async downloadAndStore(url: string, options: StoreOptions): Promise<FileRecord>

  // 获取文件（优先本地缓存）
  async getFile(recordId: string): Promise<Blob | null>

  // 批量预下载
  async prefetchFiles(urls: string[]): Promise<void>

  // 清理缓存
  async clearCache(olderThan?: Date): Promise<void>
}
```

### 3. IndexedDB Schema
```
file-storage-db
├── files          // 文件记录元数据
└── blobs          // 文件二进制数据
```

### 4. API Endpoints
```
POST /api/files/download    // 下载远程文件到服务器
GET  /api/files/:id         // 获取文件
GET  /api/files/:id/blob    // 获取文件二进制
DELETE /api/files/:id       // 删除文件
GET  /api/files/by-entity/:entityId  // 按实体获取文件列表
```

## Data Flow

### AI 生成图片流程
1. 用户触发生成 → AI API 返回图片 URL
2. **新增**：FileStorageService.downloadAndStore() 后台下载
3. 下载成功后更新本地 URL
4. 保存到 IndexedDB 缓存
5. 更新角色/资产记录

### 导出文件夹流程
1. 用户点击"导出文件夹"
2. FileStorageService.getFile() 获取本地文件
3. 如果本地有缓存，直接使用
4. 如果没有缓存，从后端服务器获取
5. 打包为 ZIP 并下载

### 资产同步流程
1. 用户点击"更新资产"
2. 检查文件是否有本地存储
3. 如果没有，触发预下载
4. 更新资产记录中的文件引用

## Implementation Phases

### Phase 1: 基础设施
- FileRecord 类型定义
- IndexedDB 数据库初始化
- 基础存储服务类

### Phase 2: 后端集成
- 文件下载 API
- 文件存储 API
- 错误处理和重试

### Phase 3: 集成到角色模块
- CharacterGallery 集成
- 自动预下载触发
- 服装变体集成

### Phase 4: 导出优化
- character-export.ts 使用本地文件
- 批量预下载
- 离线支持

### Phase 5: 资产同步优化
- character-asset-sync.ts 集成
- 文件迁移工具
- 清理机制

## Trade-offs

### 优点
- 离线可用性
- 快速导出
- 数据持久化
- 减少对第三方服务的依赖

### 缺点
- 增加存储成本
- 需要后端支持
- 实现复杂度增加

## Migration Strategy
1. 新生成的图片自动使用新流程
2. 现有图片保持原有 URL，按需迁移
3. 提供手动迁移工具
