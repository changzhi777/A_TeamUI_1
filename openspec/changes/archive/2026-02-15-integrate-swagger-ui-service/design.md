# Design: Swagger UI 服务集成

## 架构概述

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  /settings/api-docs  →  嵌入式 API 文档页面               │
│  src/lib/api/openapi-types.ts  ←  类型同步               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Hono)                         │
├─────────────────────────────────────────────────────────┤
│  /api/docs              →  Swagger UI (Scalar)           │
│  /api/docs/openapi.json →  OpenAPI 3.0 规范              │
│  /api/*                 →  API 端点                      │
└─────────────────────────────────────────────────────────┘
```

## 技术选型

### 后端框架
- **Hono**: 已使用的轻量级 Web 框架
- **@hono/zod-openapi**: Hono 的 OpenAPI 扩展，支持 Zod 验证
- **@scalar/hono-api-reference**: 现代化的 API 文档 UI（比 Swagger UI 更美观）

### 为什么选择 Scalar 而非 Swagger UI？
1. 更现代的 UI 设计
2. 更好的中文支持
3. 更小的包体积
4. 与 Hono 集成更简单

## 文件结构

```
server/
├── src/
│   ├── api/
│   │   ├── openapi/
│   │   │   ├── index.ts          # OpenAPI Hono 实例
│   │   │   ├── routes/           # OpenAPI 路由定义
│   │   │   │   ├── auth.ts
│   │   │   │   ├── projects.ts
│   │   │   │   └── storyboard.ts
│   │   │   └── schemas/          # Zod Schema 定义
│   │   │       ├── user.ts
│   │   │       ├── project.ts
│   │   │       └── shot.ts
│   │   └── ...                   # 现有 API 路由
│   └── index.ts                  # 挂载 OpenAPI 路由
└── package.json                  # 添加新依赖
```

## API 文档结构

### OpenAPI Info
```yaml
openapi: 3.0.3
info:
  title: 帧服了短剧平台 API
  description: AI 辅助短剧创作平台后端 API 文档
  version: V0.1.0
  contact:
    name: 外星动物（常智）IoTchange
    email: 14455975@qq.com
servers:
  - url: http://localhost:3000/api
    description: 开发服务器
tags:
  - name: auth
    description: 认证相关
  - name: projects
    description: 项目管理
  - name: storyboard
    description: 分镜头管理
  - name: users
    description: 用户管理
  - name: members
    description: 成员管理
  - name: upload
    description: 文件上传
```

## 实现步骤

### 阶段 1: 后端基础设施
1. 安装依赖包
2. 创建 OpenAPI Hono 实例
3. 定义通用 Zod Schema
4. 配置 Scalar UI

### 阶段 2: API 文档化
1. Auth API 文档（登录、注册、token 刷新）
2. Projects API 文档
3. Storyboard API 文档
4. 其他 API 文档

### 阶段 3: 前端集成
1. 创建 API 文档页面路由
2. 嵌入 Swagger/Scalar UI
3. 配置代理（开发环境）

## 安全考虑

- **生产环境**: API 文档默认不对外公开，或仅显示公开 API
- **认证**: 文档页面需要登录后访问
- **敏感信息**: 不在文档中暴露内部实现细节

## 环境变量

```env
# server/.env
ENABLE_API_DOCS=true          # 是否启用 API 文档
API_DOCS_REQUIRES_AUTH=false  # 文档是否需要认证
```
