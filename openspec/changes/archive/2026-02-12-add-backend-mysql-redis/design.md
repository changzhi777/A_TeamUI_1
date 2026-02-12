## Context

当前 A_TeamUI 短剧平台使用 Zustand + localStorage 进行数据存储，适合单用户、单设备场景。为支持多用户协作和数据持久化，需要引入后端服务。

**约束条件：**
- 前端技术栈已确定为 React + Vite + TypeScript
- 后端技术栈确定为 Node.js + Drizzle ORM
- 需要保持良好的用户体验（低延迟、离线支持）

**利益相关者：**
- 前端开发团队：维护现有 React 应用
- 后端开发团队：开发新后端服务
- 运维团队：部署和管理 MySQL、Redis 服务
- 最终用户：需要跨设备访问和协作功能

## Goals / Non-Goals

### Goals

1. **数据持久化**：所有用户数据、项目数据、分镜头数据持久化到 MySQL
2. **实时协作**：多用户可同时编辑项目，实时看到对方变更
3. **离线支持**：网络断开时继续工作，恢复后自动同步
4. **高性能**：利用 Redis 缓存热点数据，减少 MySQL 查询压力
5. **安全认证**：JWT 认证 + Redis 会话管理，支持多设备登录管理
6. **平滑迁移**：保留 localStorage 作为缓存层，减少对现有代码的破坏性改动

### Non-Goals

1. **完整重写**：不重写整个前端，采用渐进式迁移
2. **实时音视频**：本阶段不涉及实时音/视频通信
3. **文件存储**：图片等大文件暂使用 Base64 或对象存储，不在本提案范围内
4. **数据分析**：不包含复杂的数据分析和报表功能

## Decisions

### Decision 1: 混合存储架构

**选择：** 前端 localStorage (缓存) + 后端 MySQL (数据源)

**理由：**
- localStorage 作为首层缓存，提供极快的响应速度
- 后端 MySQL 作为唯一数据源，确保数据一致性
- 支持离线操作，网络恢复后同步

**替代方案考虑：**
- 纯 API 方案：每次操作都调用后端 → 用户体验差，离线无法工作
- 纯前端方案：使用 localStorage → 无法跨设备同步，数据易丢失
- PWA + Service Worker：实现复杂，与本方案互补

### Decision 2: Drizzle ORM

**选择：** Drizzle ORM 作为数据库访问层

**理由：**
- TypeScript-first，与前端技术栈一致
- 轻量级，性能优于 Prisma
- SQL-like 语法，学习曲线低
- 支持 migrations 和 schema 定义

**替代方案考虑：**
- Prisma：功能更全面，但性能略差，bundle 体积大
- TypeORM：维护不活跃，性能较差
- 原生 SQL：类型安全差，维护成本高

### Decision 3: Redis 用途

**选择：** Redis 用于会话管理 + 缓存 + 实时通知

**具体用途：**
1. **会话管理**：存储 JWT refresh token、活跃会话列表
2. **缓存热点数据**：缓存常用项目、用户信息，减少 MySQL 查询
3. **实时通知队列**：WebSocket 消息队列，推送数据变更通知
4. **协作锁**：防止多用户同时编辑同一资源产生冲突

**替代方案考虑：**
- 仅用 MySQL：性能差，无法高效处理实时通知
- 内存缓存：分布式场景下无法共享

### Decision 4: 实时同步方案

**选择：** WebSocket + 增量同步

**理由：**
- WebSocket 支持服务端主动推送，适合实时协作
- 增量同步只传输变更字段，节省带宽
- 断线重连机制保证可靠性

**替代方案考虑：**
- 轮询：延迟高，服务器压力大
- Server-Sent Events (SSE)：单向通信，不适合双向协作
- WebRTC：P2P 复杂，不适合服务端控制场景

### Decision 5: API 设计风格

**选择：** RESTful API + WebSocket 补充

**理由：**
- REST 成熟稳定，易于调试和文档化
- WebSocket 处理实时事件（如协作通知）
- 保持 API 简单直观

**API 设计原则：**
- 资源导向：`/api/projects`, `/api/shots`
- HTTP 方法语义：GET/POST/PUT/DELETE
- 统一响应格式：`{ success, data, error, meta }`
- 分页、排序、筛选通过查询参数

## Data Model

### MySQL Schema

```sql
-- 用户表
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','director','screenwriter','editor','member'),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  bio TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  otp_secret VARCHAR(255),
  recovery_codes JSON,
  special_permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- 项目表
CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('shortDrama','realLifeDrama','aiPodcast','advertisement','mv','documentary','other'),
  status ENUM('planning','filming','postProduction','completed'),
  episode_range VARCHAR(50),
  director VARCHAR(100),
  created_by CHAR(36) NOT NULL,
  total_shots INT DEFAULT 0,
  completed_shots INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_updated_at (updated_at)
);

-- 项目成员表
CREATE TABLE project_members (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('admin','member','director','screenwriter','cinematographer','editor','actor'),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_user (project_id, user_id),
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id)
);

-- 剧本版本表
CREATE TABLE script_versions (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  content LONGTEXT NOT NULL,
  description VARCHAR(500),
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at)
);

-- 分镜头表
CREATE TABLE storyboard_shots (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  shot_number INT NOT NULL,
  scene_number VARCHAR(50),
  shot_size ENUM('extremeLong','long','medium','closeUp','extremeCloseUp'),
  camera_movement ENUM('static','pan','tilt','dolly','truck','pedestral','crane','handheld','steadicam','tracking','arc'),
  duration INT DEFAULT 0,
  description TEXT,
  dialogue TEXT,
  sound TEXT,
  image_url VARCHAR(500),
  image_thumbnail_url VARCHAR(500),
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_project_shot (project_id, shot_number),
  INDEX idx_project_id (project_id),
  INDEX idx_shot_number (shot_number)
);

-- 登录历史表
CREATE TABLE login_history (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  device VARCHAR(100),
  browser VARCHAR(100),
  location VARCHAR(100),
  ip VARCHAR(45),
  is_anomalous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Redis 数据结构

```
# 会话管理
session:{user_id}:{session_id} -> Hash { token, expires_at, device, ip }
sessions:{user_id} -> Set [session_id, ...]

# 缓存
user:{user_id} -> Hash (用户信息缓存)
project:{project_id} -> Hash (项目信息缓存)
project_shots:{project_id} -> List (分镜头列表缓存)

# 实时通知
events:{project_id} -> List (事件队列)
online_users:{project_id} -> Set (在线用户)

# 协作锁
lock:project:{project_id} -> user_id (编辑锁)
lock:shot:{shot_id} -> user_id (分镜头编辑锁)
```

## API Endpoints

### 认证相关

```
POST   /api/auth/register          # 用户注册
POST   /api/auth/login             # 用户登录
POST   /api/auth/logout            # 用户登出
POST   /api/auth/refresh           # 刷新 Token
POST   /api/auth/forgot-password   # 忘记密码
POST   /api/auth/reset-password    # 重置密码
GET    /api/auth/sessions         # 获取活跃会话
DELETE /api/auth/sessions/:id      # 撤销会话
```

### 用户相关

```
GET    /api/users/me               # 当前用户信息
PUT    /api/users/me              # 更新用户信息
PUT    /api/users/me/password     # 修改密码
GET    /api/users/me/history      # 登录历史
POST   /api/users/me/otp/send     # 发送 OTP
POST   /api/users/me/otp/verify   # 验证 OTP
POST   /api/users/me/otp/enable   # 启用双因素认证
DELETE /api/users/me/otp/disable  # 禁用双因素认证
```

### 项目相关

```
GET    /api/projects               # 获取项目列表（支持分页、筛选、排序）
POST   /api/projects              # 创建项目
GET    /api/projects/:id          # 获取项目详情
PUT    /api/projects/:id          # 更新项目
DELETE /api/projects/:id          # 删除项目
POST   /api/projects/:id/favorite # 收藏/取消收藏
POST   /api/projects/:id/pin     # 置顶/取消置顶
```

### 项目成员相关

```
GET    /api/projects/:id/members   # 获取项目成员
POST   /api/projects/:id/members   # 添加成员
PUT    /api/projects/:id/members/:memberId # 更新成员角色
DELETE /api/projects/:id/members/:memberId # 移除成员
```

### 剧本相关

```
GET    /api/projects/:id/script    # 获取剧本内容
PUT    /api/projects/:id/script    # 更新剧本内容
GET    /api/projects/:id/versions # 获取剧本版本列表
POST   /api/projects/:id/versions # 创建剧本版本
POST   /api/projects/:id/versions/:versionId/restore # 恢复版本
```

### 分镜头相关

```
GET    /api/projects/:id/shots    # 获取分镜头列表
POST   /api/projects/:id/shots    # 创建分镜头
GET    /api/shots/:shotId         # 获取单个分镜头
PUT    /api/shots/:shotId         # 更新分镜头
DELETE /api/shots/:shotId         # 删除分镜头
POST   /api/shots/reorder         # 批量重新排序
POST   /api/shots/duplicate       # 批量复制分镜头
DELETE /api/shots/batch          # 批量删除分镜头
PUT    /api/shots/:shotId/image   # 上传/更新分镜头图片
DELETE /api/shots/:shotId/image   # 删除分镜头图片
```

### 全局成员相关

```
GET    /api/members               # 获取所有成员（跨项目）
POST   /api/members               # 添加全局成员
PUT    /api/members/:id           # 更新成员信息
DELETE /api/members/:id           # 删除成员
```

## Risks / Trade-offs

### 风险 1: 数据同步冲突

**描述：** 多用户同时编辑同一项目时可能产生冲突

**缓解措施：**
- 实现乐观锁（version 字段）
- 资源级编辑锁（Redis）
- 冲突解决策略（后端优先 / 用户选择）
- 记录操作历史，支持回滚

### 风险 2: 网络延迟影响体验

**描述：** 实时同步依赖网络，延迟可能导致操作卡顿

**缓解措施：**
- 乐观 UI 更新（先更新本地，后同步）
- localStorage 作为首层缓存
- 显示同步状态指示器
- 支持离线操作

### 风险 3: 扩展性问题

**描述：** 单点后端可能成为瓶颈

**缓解措施：**
- Redis 缓存减轻 MySQL 压力
- 数据库索引优化
- 连接池管理
- 预留水平扩展能力

### 风险 4: 迁移复杂性

**描述：** 从 localStorage 迁移到后端可能影响现有用户数据

**缓解措施：**
- 提供数据导入工具
- 兼容旧版本 localStorage 数据
- 渐进式迁移（可选）
- 清晰的迁移文档

## Migration Plan

### 阶段 1: 后端基础设施（1-2 周）

- [ ] 搭建 Node.js + Express 项目结构
- [ ] 配置 Drizzle ORM + MySQL 连接
- [ ] 配置 Redis 连接
- [ ] 实现数据库迁移系统
- [ ] 创建所有数据表和索引
- [ ] 搭建 WebSocket 服务器

### 阶段 2: 认证和用户 API（1 周）

- [ ] 实现用户注册/登录 API
- [ ] 实现 JWT Token 生成和验证
- [ ] 实现 Redis 会话管理
- [ ] 实现密码重置流程
- [ ] 实现 OTP 双因素认证
- [ ] 添加认证中间件

### 阶段 3: 项目管理 API（1 周）

- [ ] 实现项目 CRUD API
- [ ] 实现项目成员管理 API
- [ ] 实现权限检查逻辑
- [ ] 添加项目筛选、排序、分页

### 阶段 4: 分镜头和剧本 API（1 周）

- [ ] 实现分镜头 CRUD API
- [ ] 实现剧本管理 API
- [ ] 实现剧本版本管理 API
- [ ] 实现批量操作 API

### 阶段 5: 前端 API 客户端（1 周）

- [ ] 创建 API 客户端服务层
- [ ] 实现 HTTP 请求封装（Axios）
- [ ] 实现 WebSocket 客户端
- [ ] 添加错误处理和重试逻辑

### 阶段 6: 前端 Store 改造（2 周）

- [ ] 改造 auth-store，使用 API 认证
- [ ] 改造 project-store，混合 localStorage + API
- [ ] 改造 storyboard-store，添加实时同步
- [ ] 添加同步状态管理

### 阶段 7: 数据迁移和测试（1 周）

- [ ] 实现 localStorage 数据导出工具
- [ ] 实现数据导入 API
- [ ] 端到端测试同步功能
- [ ] 性能测试和优化

### 阶段 8: 部署和监控（持续）

- [ ] 配置生产环境 MySQL 和 Redis
- [ ] 配置反向代理和 SSL
- [ ] 设置日志和监控
- [ ] 备份和恢复流程

### 回滚计划

如果迁移出现问题：

1. **前端回滚**：保留原有 localStorage 逻辑，可通过 feature flag 切换
2. **数据恢复**：用户可导出后端数据，手动导入到 localStorage
3. **回退开关**：前端配置项可选择使用本地或远程数据源

## Open Questions

1. **WebSocket 认证方式**：使用 Token 附加在 Header 还是连接参数？
2. **数据保留策略**：删除的项目/分镜头是否软删除（保留备份）？
3. **图片存储方案**：继续 Base64 存储在数据库，还是使用对象存储（OSS/S3）？
4. **并发控制粒度**：项目级编辑锁还是分镜头级编辑锁？
5. **离线冲突解决**：自动合并还是用户手动选择？
