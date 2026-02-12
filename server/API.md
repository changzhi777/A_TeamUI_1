# API Documentation

A_TeamUI 后端 API 完整文档。

## 基础信息

- **Base URL**: `https://api.yourdomain.com/api`
- **WebSocket URL**: `wss://api.yourdomain.com/ws`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

大多数 API 端点需要 JWT 认证。在请求头中包含 token：

```
Authorization: Bearer <your-access-token>
```

### Token 获取

1. 注册用户获取 token
2. 登录获取 token
3. 使用 refresh token 刷新

### Token 有效期

- **Access Token**: 1 小时
- **Refresh Token**: 30 天

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "meta": {
    "message": "操作成功"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "errors": {
    // 详细错误信息（验证错误时）
  }
}
```

### 分页响应

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 无内容（删除成功） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如 email 已存在） |
| 422 | 验证错误 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## API 端点

### 认证 API

#### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "用户名称",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresAt": 1234567890,
    "user": {
      "id": "user_xxx",
      "name": "用户名称",
      "email": "user@example.com",
      "role": "member"
    }
  }
}
```

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

#### 刷新 Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### 用户登出

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### 忘记密码

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 重置密码

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!"
}
```

#### 获取活跃会话

```http
GET /api/auth/sessions
Authorization: Bearer <token>
```

#### 撤销会话

```http
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <token>
```

### 项目 API

#### 获取项目列表

```http
GET /api/projects?page=1&pageSize=20&status=planning&type=shortDrama&search=关键词
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）
- `status`: 状态筛选（planning, filming, postProduction, completed）
- `type`: 类型筛选（shortDrama, realLifeDrama, aiPodcast 等）
- `search`: 搜索关键词（项目名称或描述）
- `sortBy`: 排序字段（createdAt, updatedAt, name）
- `sortOrder`: 排序方向（asc, desc）

#### 创建项目

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "项目名称",
  "description": "项目描述",
  "type": "shortDrama",
  "status": "planning",
  "episodeRange": "1-10",
  "director": "导演名称"
}
```

#### 获取项目详情

```http
GET /api/projects/:projectId
Authorization: Bearer <token>
```

#### 更新项目

```http
PUT /api/projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新项目名称",
  "status": "filming",
  "totalShots": 50
}
```

#### 删除项目

```http
DELETE /api/projects/:projectId
Authorization: Bearer <token>
```

#### 收藏/取消收藏项目

```http
POST /api/projects/:projectId/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "isFavorite": true
}
```

#### 置顶/取消置顶项目

```http
POST /api/projects/:projectId/pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPinned": true
}
```

### 项目成员 API

#### 获取项目成员

```http
GET /api/projects/:projectId/members?page=1&pageSize=20
Authorization: Bearer <token>
```

#### 添加项目成员

```http
POST /api/projects/:projectId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "editor"
}
```

**角色选项**:
- `admin`: 管理员
- `member`: 普通成员
- `director`: 导演
- `screenwriter`: 编剧
- `cinematographer`: 摄影师
- `editor`: 剪辑师
- `actor`: 演员

#### 更新成员角色

```http
PUT /api/projects/:projectId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### 移除项目成员

```http
DELETE /api/projects/:projectId/members/:memberId
Authorization: Bearer <token>
```

### 剧本 API

#### 获取剧本内容

```http
GET /api/projects/:projectId/script
Authorization: Bearer <token>
```

#### 更新剧本内容

```http
PUT /api/projects/:projectId/script
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "剧本内容..."
}
```

#### 获取剧本版本

```http
GET /api/projects/:projectId/versions
Authorization: Bearer <token>
```

#### 创建剧本版本

```http
POST /api/projects/:projectId/versions
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "剧本内容...",
  "description": "版本说明"
}
```

#### 恢复剧本版本

```http
POST /api/projects/:projectId/versions/:versionId/restore
Authorization: Bearer <token>
```

### 分镜头 API

#### 获取分镜头列表

```http
GET /api/projects/:projectId/shots
Authorization: Bearer <token>
```

#### 创建分镜头

```http
POST /api/projects/:projectId/shots
Authorization: Bearer <token>
Content-Type: application/json

{
  "sceneNumber": "1",
  "shotSize": "medium",
  "cameraMovement": "static",
  "duration": 5,
  "description": "镜头描述",
  "dialogue": "台词",
  "sound": "音效"
}
```

**景别选项**:
- `extremeLong`: 大远景
- `long`: 远景
- `medium`: 中景
- `closeUp`: 近景
- `extremeCloseUp`: 特写

**运镜选项**:
- `static`: 固定
- `pan`: 摇摄
- `tilt`: 俯仰
- `dolly`: 移动
- `truck`: 跟随
- `pedestral`: 升降
- `crane`: 升降
- `handheld`: 手持
- `steadicam`: 稳定器
- `tracking`: 轨道
- `arc`: 弧形

#### 获取分镜头详情

```http
GET /api/shots/:shotId
Authorization: Bearer <token>
```

#### 更新分镜头

```http
PUT /api/shots/:shotId
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "新的描述",
  "duration": 10
}
```

#### 删除分镜头

```http
DELETE /api/shots/:shotId
Authorization: Bearer <token>
```

#### 批量重排序

```http
POST /api/shots/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "shotIds": ["shot1", "shot2", "shot3"],
  "projectId": "project123"
}
```

#### 批量复制

```http
POST /api/shots/duplicate
Authorization: Bearer <token>
Content-Type: application/json

{
  "shotIds": ["shot1", "shot2"],
  "projectId": "project123"
}
```

#### 批量删除

```http
DELETE /api/shots/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "shotIds": ["shot1", "shot2", "shot3"]
}
```

#### 上传分镜头图片

```http
PUT /api/shots/:shotId/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

**限制**:
- 支持格式: JPEG, PNG, GIF, WebP
- 最大大小: 5MB

#### 删除分镜头图片

```http
DELETE /api/shots/:shotId/image
Authorization: Bearer <token>
```

## WebSocket 事件

### 连接

```
wss://api.yourdomain.com/ws?token=<jwt-token>&projectId=<project-id>
```

### 事件类型

#### 客户端 → 服务器

**订阅频道**
```json
{
  "type": "subscribe",
  "channel": "project:project123"
}
```

**取消订阅**
```json
{
  "type": "unsubscribe",
  "channel": "project:project123"
}
```

#### 服务器 → 客户端

**项目更新**
```json
{
  "type": "project_updated",
  "data": {
    "id": "project123",
    "name": "更新后的项目名"
  }
}
```

**分镜头创建**
```json
{
  "type": "shot_created",
  "data": {
    "id": "shot456",
    "projectId": "project123"
  }
}
```

**分镜头更新**
```json
{
  "type": "shot_updated",
  "data": {
    "id": "shot456",
    "description": "更新后的描述"
  }
}
```

**分镜头删除**
```json
{
  "type": "shot_deleted",
  "data": {
    "id": "shot456"
  }
}
```

**分镜头重排序**
```json
{
  "type": "shot_reordered",
  "data": {
    "shotIds": ["shot1", "shot2"]
  }
}
```

**编辑锁获取**
```json
{
  "type": "lock_acquired",
  "data": {
    "shotId": "shot456",
    "userId": "user789"
  }
}
```

**编辑锁释放**
```json
{
  "type": "lock_released",
  "data": {
    "shotId": "shot456"
  }
}
```

## 错误代码

| 代码 | 说明 |
|------|------|
| `AUTH_001` | Token 缺失或无效 |
| `AUTH_002` | Token 已过期 |
| `AUTH_003` | 刷新 Token 无效 |
| `USER_001` | 用户不存在 |
| `USER_002` | 邮箱已被注册 |
| `USER_003` | 密码不符合要求 |
| `PROJECT_001` | 项目不存在 |
| `PROJECT_002` | 无权限访问项目 |
| `PROJECT_003` | 项目成员已存在 |
| `SHOT_001` | 分镜头不存在 |
| `SHOT_002` | 无效的文件类型 |
| `SHOT_003` | 文件大小超出限制 |

## 速率限制

- **未认证用户**: 100 请求/小时
- **认证用户**: 1000 请求/小时
- **WebSocket 连接**: 每用户最多 5 个并发连接

超出限制返回 429 状态码。

## SDK / 客户端库

官方客户端库：

- **JavaScript/TypeScript**: `@a-teamui/api-client`
- **示例代码**: 见 `src/lib/api/` 目录

## 支持

- **文档**: https://docs.a-teamui.com
- **问题反馈**: https://github.com/your-org/a-teamui/issues
- **Discord**: https://discord.gg/a-teamui
