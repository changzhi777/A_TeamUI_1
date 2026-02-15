# Proposal: 集成 Swagger UI 服务

## Why

当前项目已有前端 OpenAPI 类型定义，但缺乏后端的 API 文档服务和 Swagger UI 界面。开发者和 API 使用者需要：

1. 查看完整的 API 文档
2. 在线测试 API 接口
3. 了解请求/响应的数据结构
4. 下载 OpenAPI 规范文件

## What Changes

### 后端 (server/)

1. **安装依赖**: 添加 `@hono/zod-openapi` 和 `@scalar/hono-api-reference` (或 swagger-ui)
2. **创建 OpenAPI 规范**: 使用 Hono OpenAPI 扩展定义 API 文档
3. **挂载 Swagger UI**: 在 `/api/docs` 路径提供交互式 API 文档
4. **导出 OpenAPI JSON/YAML**: 提供 `/api/docs/openapi.json` 导出

### 前端 (src/)

1. **同步类型定义**: 确保前端类型与后端 OpenAPI 规范一致
2. **API 文档页面**: 创建前端路由 `/settings/api-docs` 嵌入 Swagger UI

## Scope

### 包含
- 后端 Swagger UI 服务集成
- OpenAPI 3.0 规范定义
- 主要 API 端点文档化（auth, projects, storyboard, users, members, upload）
- 前端 API 文档页面预留

### 不包含
- 所有 API 端点的完整文档（逐步完善）
- API 客户端代码自动生成
- API Mock 服务

## Technical Approach

使用 Hono 生态的 OpenAPI 扩展：

```typescript
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
```

## Acceptance Criteria

1. ✅ 访问 `http://localhost:3000/api/docs` 显示 Swagger UI
2. ✅ 访问 `http://localhost:3000/api/docs/openapi.json` 返回 OpenAPI 规范
3. ✅ 文档包含至少 auth、projects、storyboard 模块的 API 定义
4. ✅ 前端 `/settings/api-docs` 页面可访问 API 文档
