# A_TeamUI 后端服务

基于 Node.js + Hono + Drizzle ORM + MySQL + Redis 的后端服务。

## 技术栈

- **框架**: Hono (轻量级 Web 框架)
- **数据库**: MySQL 8.0+
- **ORM**: Drizzle ORM
- **缓存**: Redis 7.0+
- **WebSocket**: 原生 ws
- **语言**: TypeScript

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 复制环境变量配置
cp .env.example .env

# 启动 MySQL 和 Redis
docker-compose up -d

# 安装依赖
pnpm install

# 启动服务
pnpm dev
```

### 手动安装 MySQL 和 Redis

#### Windows
- MySQL: 下载 MySQL Installer 或使用 WSL2
- Redis: 下载 Redis for Windows

#### macOS
```bash
brew install mysql
brew services start mysql
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server redis-server
sudo systemctl start mysql
sudo systemctl start redis
```

## 开发脚本

| 脚本 | 描述 |
|------|------|
| `pnpm dev` | 启动开发服务器（热重载）|
| `pnpm build` | 构建 TypeScript |
| `pnpm start` | 启动生产服务器 |
| `pnpm db:generate` | 生成数据库迁移 |
| `pnpm db:migrate` | 推送 schema 到数据库 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm lint` | 运行 ESLint |
| `pnpm format` | 格式化代码 |
| `pnpm test` | 运行测试套件 |
| `pnpm test:ui` | 运行测试 UI |
| `pnpm test:coverage` | 生成测试覆盖率报告 |

## 测试

详细的测试指南请参阅 [TESTING.md](./TESTING.md)。

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test --watch

# UI 模式
pnpm test:ui

# 覆盖率报告
pnpm test:coverage
```

## 部署

生产环境部署请参阅 [DEPLOYMENT.md](./DEPLOYMENT.md)。

完整的 API 文档请参阅 [API.md](./API.md)。

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码
- `GET /api/auth/sessions` - 获取活跃会话
- `DELETE /api/auth/sessions/:id` - 撤销会话

### 项目
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `POST /api/projects/:id/favorite` - 收藏/取消收藏
- `POST /api/projects/:id/pin` - 置顶/取消置顶

### 分镜头
- `GET /api/projects/:id/shots` - 获取分镜头列表
- `POST /api/projects/:id/shots` - 创建分镜头
- `PUT /api/shots/:shotId` - 更新分镜头
- `DELETE /api/shots/:shotId` - 删除分镜头
- `POST /api/shots/reorder` - 批量重新排序
- `POST /api/shots/duplicate` - 批量复制
- `DELETE /api/shots/batch` - 批量删除

## WebSocket

连接 URL: `ws://localhost:3001/ws?token=<TOKEN>&projectId=<PROJECT_ID>`

### 事件类型
- `project_updated` - 项目已更新
- `shot_created` - 分镜头已创建
- `shot_updated` - 分镜头已更新
- `shot_deleted` - 分镜头已删除
- `shot_reordered` - 分镜头已重新排序
- `lock_acquired` - 编辑锁已获取
- `lock_released` - 编辑锁已释放

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3001` |
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_USER` | MySQL 用户名 | `root` |
| `DB_PASSWORD` | MySQL 密码 | `password` |
| `DB_NAME` | 数据库名称 | `a_teamui` |
| `REDIS_HOST` | Redis 主机 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码 | - |
| `JWT_SECRET` | JWT 密钥 | - |
| `JWT_ACCESS_EXPIRY` | Token 过期时间 | `1h` |
| `JWT_REFRESH_EXPIRY` | 刷新 Token 过期时间 | `30d` |
| `CORS_ORIGIN` | CORS 源 | `http://localhost:5173` |

## 故障排除

### 数据库连接失败
```bash
# 检查 MySQL 是否运行
mysql -u root -p

# 创建数据库
CREATE DATABASE a_teamui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 端口已被占用
```bash
# Windows
netstat -ano | findstr :3001

# Linux/macOS
lsof -i :3001
```

## 许可证

MIT
