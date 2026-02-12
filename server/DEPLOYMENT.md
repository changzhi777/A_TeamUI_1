# Deployment Guide

本指南介绍 A_TeamUI 后端服务的生产环境部署。

## 目录

- [前置要求](#前置要求)
- [环境变量](#环境变量)
- [Docker 部署](#docker-部署)
- [传统部署](#传统部署)
- [数据库迁移](#数据库迁移)
- [Nginx 反向代理](#nginx-反向代理)
- [SSL/TLS 配置](#ssltls-配置)
- [监控和日志](#监控和日志)
- [健康检查](#健康检查)
- [故障排除](#故障排除)

## 前置要求

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+ 推荐)、macOS、Windows Server
- **Node.js**: v18.0.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Redis**: 7.0 或更高版本
- **内存**: 最小 1GB，推荐 2GB+
- **磁盘空间**: 最小 10GB

### 网络端口

- **API 服务**: 默认 3001（可配置）
- **MySQL**: 默认 3306
- **Redis**: 默认 6379
- **WebSocket**: 与 API 服务共享端口

## 环境变量

生产环境需要配置以下环境变量：

### 必需变量

```bash
# 服务器配置
NODE_ENV=production
PORT=3001
API_PREFIX=/api

# 数据库配置
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=a_teamui

# Redis 配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d
```

### 可选变量

```bash
# CORS 配置
CORS_ORIGIN=https://your-frontend-domain.com

# 文件上传
UPLOAD_DIR=/var/uploads/a-teamui

# 日志级别
LOG_LEVEL=info
```

### 安全注意事项

⚠️ **重要安全建议**：

1. **JWT_SECRET**: 使用至少 32 字符的强随机密钥
   ```bash
   # 生成安全密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **数据库密码**: 使用强密码，至少 16 字符，包含大小写字母、数字和特殊字符

3. **Redis 密码**: 在生产环境中始终设置密码

4. **环境变量存储**: 使用安全的密钥管理服务（如 AWS Secrets Manager、HashiCorp Vault）

## Docker 部署

### 使用 Docker Compose（推荐）

1. **克隆仓库并配置环境**
   ```bash
   git clone https://github.com/your-org/a-teamui.git
   cd a-teamui/server
   cp .env.example .env
   # 编辑 .env 文件设置生产环境变量
   ```

2. **构建并启动服务**
   ```bash
   docker-compose up -d
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

4. **运行数据库迁移**
   ```bash
   docker-compose exec api pnpm run db:migrate
   ```

### 使用单独的 Docker 容器

1. **构建镜像**
   ```bash
   docker build -t a-teamui-server .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name a-teamui-api \
     -p 3001:3001 \
     --env-file .env \
     -v /var/uploads:/app/uploads \
     a-teamui-server
   ```

### Dockerfile 示例

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动服务
CMD ["node", "dist/index.js"]
```

## 传统部署

### 系统服务配置（systemd）

1. **创建服务文件**
   ```bash
   sudo nano /etc/systemd/system/a-teamui.service
   ```

2. **服务配置**
   ```ini
   [Unit]
   Description=A_TeamUI Backend API
   After=network.target mysql.service redis.service

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/a-teamui/server
   Environment=NODE_ENV=production
   EnvironmentFile=/var/www/a-teamui/server/.env
   ExecStart=/usr/bin/node dist/index.js
   Restart=always
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=a-teamui

   [Install]
   WantedBy=multi-user.target
   ```

3. **启用并启动服务**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable a-teamui
   sudo systemctl start a-teamui
   sudo systemctl status a-teamui
   ```

### PM2 进程管理

1. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **创建生态系统配置**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'a-teamui-api',
       script: 'dist/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       },
       env_file: '.env',
       error_file: './logs/error.log',
       out_file: './logs/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss',
       merge_logs: true,
       max_memory_restart: '1G'
     }]
   }
   ```

3. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 数据库迁移

### 创建生产数据库

```sql
-- 创建数据库
CREATE DATABASE a_teamui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'a_teamui'@'localhost' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON a_teamui.* TO 'a_teamui'@'localhost';
FLUSH PRIVILEGES;
```

### 运行迁移

```bash
# 生成迁移文件
pnpm run db:generate

# 推送到数据库
pnpm run db:migrate

# 或使用 Drizzle Studio 可视化
pnpm run db:studio
```

### 数据库备份

```bash
# 使用 mysqldump
mysqldump -u username -p a_teamui > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
mysql -u username -p a_teamui < backup_file.sql
```

## Nginx 反向代理

### 配置示例

```nginx
# /etc/nginx/sites-available/a-teamui-api

upstream a_teamui_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    # SSL 配置（见下一节）
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/a-teamui-access.log;
    error_log /var/log/nginx/a-teamui-error.log;

    # 请求体大小限制
    client_max_body_size 10M;

    # API 路由
    location /api/ {
        proxy_pass http://a_teamui_backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 路由
    location /ws {
        proxy_pass http://a_teamui_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 超时
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # 健康检查（不需要认证）
    location /health {
        proxy_pass http://a_teamui_backend;
        access_log off;
    }
}
```

## SSL/TLS 配置

### 使用 Let's Encrypt（Certbot）

1. **安装 Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **获取证书**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

3. **自动续期**
   ```bash
   sudo certbot renew --dry-run
   # Cron 任务已自动添加
   ```

### 使用 Cloudflare

1. **在 Cloudflare 托管域名**
2. **启用 "Flexible SSL" 或 "Full SSL"**
3. **配置页面规则缓存 API 路由（设置为绕过缓存）**

## 监控和日志

### 日志管理

使用 Winston 或 Bunyan 进行结构化日志：

```typescript
// src/config/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino/file',
    options: {
      destination: './logs/app.log',
      mkdir: true,
    },
  },
})
```

### 性能监控

推荐工具：
- **APM**: New Relic、DataDog、Elastic APM
- **指标**: Prometheus + Grafana
- **错误追踪**: Sentry、Rollbar

### 健康检查

端点 `GET /health` 返回：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

设置监控定期检查此端点。

## 故障排除

### 常见问题

#### 1. 数据库连接失败

**症状**: `Error: connect ECONNREFUSED`

**解决方案**:
```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 检查连接
mysql -u username -p -h hostname

# 检查防火墙
sudo ufw allow 3306
```

#### 2. Redis 连接失败

**症状**: `Error: Redis connection lost`

**解决方案**:
```bash
# 检查 Redis 状态
sudo systemctl status redis

# 测试连接
redis-cli -h hostname ping

# 检查配置
redis-cli CONFIG GET bind
```

#### 3. 端口已被占用

**症状**: `Error: listen EADDRINUSE: address already in use`

**解决方案**:
```bash
# 查找占用进程
sudo lsof -i :3001

# 终止进程
sudo kill -9 <PID>

# 或使用其他端口
PORT=3002 pnpm start
```

#### 4. 内存不足

**症状**: `JavaScript heap out of memory`

**解决方案**:
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS=--max-old-space-size=4096 pnpm start
```

#### 5. Token 验证失败

**症状**: `401 Unauthorized` 对有效用户

**解决方案**:
- 检查 `JWT_SECRET` 在所有服务器上一致
- 确认系统时间同步（NTP）
- 检查 token 时区设置

### 日志分析

```bash
# 查看最近的错误
grep -i "error" /var/log/a-teamui/error.log | tail -20

# 统计错误类型
grep -o '"error":"[^"]*"' /var/log/a-teamui/error.log | sort | uniq -c

# 实时监控
tail -f /var/log/a-teamui/access.log
```

## 扩展性

### 水平扩展

使用 PM2 集群模式：

```bash
pm2 start ecosystem.config.js --env production
```

### 负载均衡

使用 Nginx 或云负载均衡器在多个实例间分配流量。

### 数据库优化

- 添加索引到常用查询字段
- 配置连接池
- 考虑读写分离

## 安全检查清单

部署前确认：

- [ ] 所有密码使用强随机值
- [ ] CORS 仅允许受信任域名
- [ ] 启用 HTTPS/TLS
- [ ] 设置速率限制
- [ ] 配置防火墙规则
- [ ] 启用请求日志
- [ ] 设置自动备份
- [ ] 配置错误监控
- [ ] 测试灾难恢复计划
