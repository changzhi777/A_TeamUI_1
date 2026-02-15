# swagger-api Specification

## Purpose
定义后端 Swagger UI 服务的 API 文档规范，提供交互式 API 文档界面。

## ADDED Requirements

### Requirement: OpenAPI 服务配置
系统 SHALL 在后端提供 OpenAPI 3.0 规范的 API 文档服务。

#### Scenario: OpenAPI JSON 导出
- **WHEN** 用户访问 `/api/docs/openapi.json`
- **THEN** 系统 MUST 返回符合 OpenAPI 3.0 规范的 JSON 文档
- **AND** 文档 MUST 包含所有已定义的 API 端点
- **AND** 文档 MUST 包含数据模型 Schema 定义

#### Scenario: OpenAPI 服务信息
- **WHEN** 用户查看 API 文档
- **THEN** 文档信息 MUST 包含：
  - 标题：`帧服了短剧平台 API`
  - 版本：`V0.1.0`
  - 描述：`AI 辅助短剧创作平台后端 API 文档`
  - 联系方式：`外星动物（常智）IoTchange` / `14455975@qq.com`

### Requirement: Swagger UI 界面
系统 SHALL 提供交互式的 API 文档界面。

#### Scenario: 访问 Swagger UI
- **WHEN** 用户访问 `/api/docs`
- **THEN** 系统 MUST 显示 Swagger UI 或 Scalar API Reference 界面
- **AND** 界面 MUST 支持中文显示
- **AND** 界面 MUST 显示所有 API 端点分组

#### Scenario: API 端点测试
- **WHEN** 用户在 Swagger UI 中选择一个 API 端点
- **THEN** 用户 MUST 能够查看请求参数和响应格式
- **AND** 用户 MUST 能够发送测试请求
- **AND** 系统 MUST 显示响应结果

### Requirement: Auth API 文档
系统 SHALL 为认证相关 API 提供完整文档。

#### Scenario: 登录 API 文档
- **WHEN** 用户查看 Auth API 文档
- **THEN** 文档 MUST 包含 POST `/api/auth/login` 端点
- **AND** MUST 定义请求体 Schema（email, password）
- **AND** MUST 定义响应 Schema（token, user）

#### Scenario: 注册 API 文档
- **WHEN** 用户查看 Auth API 文档
- **THEN** 文档 MUST 包含 POST `/api/auth/register` 端点
- **AND** MUST 定义请求体 Schema（name, email, password）
- **AND** MUST 定义响应 Schema（user, token）

### Requirement: Projects API 文档
系统 SHALL 为项目管理 API 提供完整文档。

#### Scenario: 项目列表 API 文档
- **WHEN** 用户查看 Projects API 文档
- **THEN** 文档 MUST 包含 GET `/api/projects` 端点
- **AND** MUST 定义查询参数（page, limit, search, status）
- **AND** MUST 定义响应 Schema（projects 数组, total, page, limit）

#### Scenario: 项目详情 API 文档
- **WHEN** 用户查看 Projects API 文档
- **THEN** 文档 MUST 包含 GET `/api/projects/:id` 端点
- **AND** MUST 定义路径参数（id）
- **AND** MUST 定义响应 Schema（Project 对象）

### Requirement: Storyboard API 文档
系统 SHALL 为分镜头管理 API 提供完整文档。

#### Scenario: 分镜头列表 API 文档
- **WHEN** 用户查看 Storyboard API 文档
- **THEN** 文档 MUST 包含 GET `/api/shots` 端点
- **AND** MUST 定义查询参数（projectId, page, limit）
- **AND** MUST 定义响应 Schema（shots 数组, total）

#### Scenario: 分镜头创建 API 文档
- **WHEN** 用户查看 Storyboard API 文档
- **THEN** 文档 MUST 包含 POST `/api/shots` 端点
- **AND** MUST 定义请求体 Schema（shotNumber, sceneNumber, description 等）
- **AND** MUST 定义响应 Schema（Shot 对象）

### Requirement: 前端 API 文档页面
系统 SHALL 在前端提供 API 文档访问入口。

#### Scenario: API 文档页面路由
- **WHEN** 用户访问 `/settings/api-docs`
- **THEN** 系统 MUST 显示 API 文档页面
- **AND** 页面 MUST 嵌入后端 Swagger UI 或提供链接

#### Scenario: API 文档页面权限
- **WHEN** 用户访问 API 文档页面
- **THEN** 仅 `super_admin` 和 `admin` 角色可访问
- **AND** 其他角色 MUST 收到权限不足提示
