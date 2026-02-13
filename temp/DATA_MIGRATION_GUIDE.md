# 数据迁移指南

本文档说明如何从 localStorage 演示数据迁移到新的后端架构。

## 迁移概述

### 迁移前（localStorage）
- 所有数据存储在浏览器 localStorage
- 数据结构：扁平化 JSON 格式
- 同步机制：无

### 迁移后（后端 + WebSocket）
- 数据存储：MySQL 数据库
- 同步机制：WebSocket 实时推送
- 离线支持：Redis 消息队列

## 迁移步骤

### 第一步：备份现有数据

```typescript
// 在浏览器控制台执行
const backup = localStorage.getItem('auth-storage')
const projectsBackup = localStorage.getItem('project-storage')
const storyboardBackup = localStorage.getItem('storyboard-storage')
console.log('Backup data:', { backup, projectsBackup, storyboardBackup })
```

### 第二步：清理迁移状态标识

```typescript
// 迁移完成后，清理标识
localStorage.removeItem('data_migrated_to_backend')
localStorage.removeItem('migration_version')
```

### 第三步：验证迁移

```bash
# 检查后端数据
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/projects

# 检查 WebSocket 连接
# 在浏览器开发者工具中检查 WebSocket 状态
```

## 数据结构映射

### 项目数据

**localStorage 格式**:
```json
{
  "items": [{
    "id": "project-id",
    "name": "项目名称",
    "description": "描述",
    "type": "shortDrama",
    "status": "planning",
    "episodeRange": "1-10",
    "director": "导演",
    "createdBy": "user-id",
    "totalShots": 10,
    "completedShots": 5,
    "isFavorite": false,
    "isPinned": false,
    "pinnedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }]
}
```

**后端格式**:
```sql
-- projects 表结构已对齐
-- 字段名称已统一
```

### 分镜头数据

**localStorage 格式**:
```json
{
  "shots": {
    "project-id": [{
      "id": "shot-id",
      "shotNumber": 1,
      "sceneNumber": "场1",
      "shotSize": "medium",
      "cameraMovement": "static",
      "duration": 5,
      "description": "镜头描述",
      "dialogue": "对白",
      "sound": "背景音乐",
      "imageUrl": "http://...",
      "imageThumbnailUrl": "http://...",
      "aiGenerated": false,
      "createdBy": "user-id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }]
  }
}
```

**后端格式**:
```sql
-- storyboard_shots 表结构已对齐
-- 字段名称已统一（imageUrl, imageThumbnailUrl）
```

## 迁移工具

项目包含数据迁移工具，位置：`src/lib/data-migration/`

### 使用迁移工具

```typescript
import { migrateFromLocalStorage } from '@/lib/data-migration'

// 执行迁移
const result = await migrateFromLocalStorage({
  onProgress: (progress) => {
    console.log(`Migration progress: ${progress.percent}%`)
  },
  onComplete: (stats) => {
    console.log('Migration complete:', stats)
  }
})
```

## 迁移验证

### 检查点

1. **用户认证**
   - [ ] 能否登录
   - [ ] Token 是否正确存储
   - [ ] 用户信息是否正确显示

2. **项目数据**
   - [ ] 项目列表是否正确显示
   - [ ] 项目详情是否能正确加载
   - [ ] 项目统计是否正确（总镜头数、完成数）

3. **分镜头数据**
   - [ ] 分镜头列表是否正确显示
   - [ ] 分镜头详情是否能正确加载
   - [ ] 分镜头创建/编辑/删除是否正常工作

4. **实时功能**
   - [ ] WebSocket 连接是否成功
   - [ ] 实时更新是否正确推送
   - [ ] 离线消息是否正确排队和推送

### 故障排除

**问题：迁移后找不到项目**
- 检查后端是否正常运行
- 检查 WebSocket 连接状态
- 检查网络请求是否成功
- 查看浏览器控制台错误信息

**问题：数据显示不一致**
- 清除浏览器缓存
- 重新登录获取新数据
- 检查是否使用了不同的用户账号

**问题：WebSocket 连接失败**
- 检查后端 WebSocket 服务是否启动
- 检查防火墙设置
- 检查 CORS 配置

## 回滚方案

如果迁移后出现问题，可以回滚到 localStorage：

```typescript
import { rollbackToLocalStorage } from '@/lib/data-migration'

// 执行回滚
await rollbackToLocalStorage({
  confirm: true // 确认回滚操作
})

console.log('Rollback complete. Data restored from localStorage.')
```

## 最佳实践

1. **先备份再迁移**
   - 始终保持一份最新数据备份
   - 使用版本控制管理迁移代码

2. **分步迁移**
   - 先迁移项目数据
   - 再迁移分镜头数据
   - 最后迁移用户设置

3. **验证每一步**
   - 每完成一个步骤后验证数据
   - 确保数据完整性后再进行下一步

4. **保留备份**
   - 迁移成功后，保留备份数据几天
   - 确认所有功能正常后再删除

5. **监控性能**
   - 监控迁移过程性能指标
   - 记录迁移时间
   - 追踪内存使用情况

## 支持

如遇到迁移问题，请查看：
- 迁移工具源码：`src/lib/data-migration/`
- API 客户端：`src/lib/api/`
- 后端 API 文档：`server/API.md`
- GitHub Issues：提交问题和 Bug
