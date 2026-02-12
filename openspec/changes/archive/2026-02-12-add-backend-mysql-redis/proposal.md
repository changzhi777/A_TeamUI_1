# Change: 添加后端服务（MySQL + Redis）实现数据持久化和实时协作

## Why

当前项目使用 Zustand + localStorage 进行数据存储，存在以下限制：

1. **数据孤岛**：每个浏览器/设备的数据独立，无法跨设备访问
2. **协作受限**：多用户无法实时协作编辑同一项目
3. **数据丢失风险**：localStorage 数据可能因浏览器清理而丢失
4. **无法扩展**：难以实现高级功能如数据统计、审计日志、权限细粒度控制

引入 MySQL + Redis 后端架构可解决上述问题，同时保留 localStorage 的前端缓存优势。

## What Changes

### 核心架构变更

- **新增后端服务**：Node.js + Express/Koa + Drizzle ORM
- **MySQL 数据库**：作为主数据存储，管理用户、项目、分镜头、团队成员等核心数据
- **Redis 缓存层**：缓存热点数据、处理实时通知、管理会话
- **混合存储策略**：前端 localStorage 作为本地缓存 + 后端 MySQL 作为数据源

### 功能变更

- **用户认证**：从模拟登录改为基于 JWT 的真实认证，支持多设备会话管理
- **项目协作**：支持多用户同时编辑项目，实时同步数据变更
- **数据同步**：实时双向同步，后端数据变更推送至前端
- **离线支持**：网络断开时继续使用 localStorage，恢复后自动同步

### **BREAKING** 变更

- 认证流程从模拟登录改为真实 JWT 认证
- 数据读取从 localStorage 改为 API 调用 + 本地缓存
- 需要部署后端服务和数据库服务

## Impact

### 影响的规格 (Specs)

- `auth` - 认证机制改为 JWT + Redis 会话管理
- `project-management` - 项目数据从本地迁移至 MySQL，添加协作锁
- `storyboard` - 分镜头数据添加实时协作同步
- `team-management` - 团队成员权限在后端统一管理

### 影响的代码

**前端变更：**
- `src/stores/auth-store.ts` - 改为 API 调用模式
- `src/stores/project-store.ts` - 改为 API + 本地缓存混合模式
- `src/stores/storyboard-store.ts` - 添加实时同步逻辑
- `src/lib/` - 新增 API 客户端层、WebSocket 连接管理
- 新增服务层处理 HTTP 请求和 WebSocket 通信

**新增后端代码：**
- `/server` 目录（建议 monorepo 或独立仓库）
  - `/api` - REST API 路由和控制器
  - `/services` - 业务逻辑层
  - `/models` - Drizzle ORM 数据模型
  - `/middleware` - 认证、权限、错误处理中间件
  - `/websocket` - WebSocket 处理器（实时同步）
  - `/config` - MySQL 和 Redis 连接配置
