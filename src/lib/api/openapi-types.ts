/**
 * OpenAPI 类型定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 *
 * 此文件定义了 API 的数据模型 Schema，用于：
 * 1. 前后端接口类型统一
 * 2. 生成 Swagger/OpenAPI 文档
 * 3. API 请求/响应类型验证
 */

/**
 * OpenAPI 文档基础结构
 */
export interface OpenAPIDocument {
  openapi: '3.0.0' | '3.0.1' | '3.0.2' | '3.0.3' | '3.1.0'
  info: OpenAPIInfo
  servers?: OpenAPIServer[]
  paths: Record<string, OpenAPIPathItem>
  components?: OpenAPIComponents
  tags?: OpenAPITag[]
}

export interface OpenAPIInfo {
  title: string
  description?: string
  version: string
  contact?: {
    name: string
    email?: string
    url?: string
  }
  license?: {
    name: string
    url?: string
  }
}

export interface OpenAPIServer {
  url: string
  description?: string
  variables?: Record<string, {
    default: string
    enum?: string[]
    description?: string
  }>
}

export interface OpenAPIPathItem {
  get?: OpenAPIOperation
  post?: OpenAPIOperation
  put?: OpenAPIOperation
  delete?: OpenAPIOperation
  patch?: OpenAPIOperation
  parameters?: OpenAPIParameter[]
}

export interface OpenAPIOperation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: OpenAPIParameter[]
  requestBody?: OpenAPIRequestBody
  responses: Record<string, OpenAPIResponse>
  security?: OpenAPISecurityRequirement[]
}

export interface OpenAPIParameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema?: OpenAPISchema
}

export interface OpenAPIRequestBody {
  description?: string
  content: Record<string, {
    schema: OpenAPISchema | OpenAPIReference
  }>
  required?: boolean
}

export interface OpenAPIResponse {
  description: string
  content?: Record<string, {
    schema: OpenAPISchema | OpenAPIReference
  }>
}

export interface OpenAPISchema {
  type?: string
  format?: string
  description?: string
  properties?: Record<string, OpenAPISchema | OpenAPIReference>
  required?: string[]
  items?: OpenAPISchema | OpenAPIReference
  enum?: (string | number)[]
  default?: unknown
  example?: unknown
  nullable?: boolean
  allOf?: (OpenAPISchema | OpenAPIReference)[]
  oneOf?: (OpenAPISchema | OpenAPIReference)[]
  anyOf?: (OpenAPISchema | OpenAPIReference)[]
}

export interface OpenAPIReference {
  $ref: string
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>
  securitySchemes?: Record<string, OpenAPISecurityScheme>
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
}

export interface OpenAPISecurityRequirement {
  [name: string]: string[]
}

export interface OpenAPITag {
  name: string
  description?: string
}

// ============================================================
// 项目核心数据模型 Schema 定义
// ============================================================

/**
 * 用户 Schema
 */
export const UserSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'name', 'email', 'role', 'createdAt'],
  properties: {
    id: { type: 'string', description: '用户唯一标识' },
    name: { type: 'string', description: '用户名称' },
    email: { type: 'string', format: 'email', description: '用户邮箱' },
    avatar: { type: 'string', description: '用户头像 URL' },
    role: {
      type: 'string',
      enum: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'],
      description: '用户角色',
    },
    permissions: {
      type: 'array',
      items: { type: 'string' },
      description: '用户权限列表',
    },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
    updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
  },
}

/**
 * 项目 Schema
 */
export const ProjectSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'name', 'type', 'status', 'createdAt'],
  properties: {
    id: { type: 'string', description: '项目唯一标识' },
    name: { type: 'string', description: '项目名称' },
    description: { type: 'string', description: '项目描述' },
    type: {
      type: 'string',
      enum: ['shortDrama', 'realLifeDrama', 'aiPodcast', 'advertisement', 'mv', 'documentary', 'other'],
      description: '项目类型',
    },
    status: {
      type: 'string',
      enum: ['planning', 'filming', 'postProduction', 'completed'],
      description: '项目状态',
    },
    director: { type: 'string', description: '导演' },
    episodeRange: { type: 'string', description: '集数范围' },
    members: {
      type: 'array',
      items: { $ref: '#/components/schemas/ProjectMember' },
      description: '项目成员列表',
    },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
    updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
  },
}

/**
 * 项目成员 Schema
 */
export const ProjectMemberSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'userId', 'projectId', 'role', 'joinedAt'],
  properties: {
    id: { type: 'string', description: '成员记录唯一标识' },
    userId: { type: 'string', description: '用户 ID' },
    projectId: { type: 'string', description: '项目 ID' },
    role: {
      type: 'string',
      enum: ['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor'],
      description: '成员在项目中的角色',
    },
    joinedAt: { type: 'string', format: 'date-time', description: '加入时间' },
  },
}

/**
 * 分镜头 Schema
 */
export const ShotSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'projectId', 'shotNumber', 'sceneNumber', 'createdAt'],
  properties: {
    id: { type: 'string', description: '分镜头唯一标识' },
    projectId: { type: 'string', description: '所属项目 ID' },
    shotNumber: { type: 'integer', description: '镜头编号' },
    sceneNumber: { type: 'string', description: '场次' },
    shotSize: {
      type: 'string',
      enum: ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp'],
      description: '景别',
    },
    cameraMovement: {
      type: 'string',
      enum: ['static', 'pan', 'tilt', 'dolly', 'truck', 'pedestal', 'crane', 'handheld', 'steadicam', 'tracking', 'arc'],
      description: '运镜方式',
    },
    duration: { type: 'number', description: '时长（秒）' },
    description: { type: 'string', description: '画面描述' },
    dialogue: { type: 'string', description: '对白/旁白' },
    sound: { type: 'string', description: '音效/配乐' },
    imageUrl: { type: 'string', description: '配图 URL' },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
    updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
  },
}

/**
 * 资产 Schema
 */
export const AssetSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'name', 'type', 'scope', 'createdAt'],
  properties: {
    id: { type: 'string', description: '资产唯一标识' },
    name: { type: 'string', description: '资产名称' },
    description: { type: 'string', description: '资产描述' },
    type: {
      type: 'string',
      enum: ['image', 'audio', 'video', 'script', 'aiGenerated'],
      description: '资产类型',
    },
    scope: {
      type: 'string',
      enum: ['global', 'project'],
      description: '资产范围',
    },
    projectId: { type: 'string', description: '所属项目 ID（项目资产）' },
    source: {
      type: 'string',
      enum: ['upload', 'external', 'ai', 'storage', 'link'],
      description: '资产来源',
    },
    url: { type: 'string', description: '资产 URL' },
    thumbnailUrl: { type: 'string', description: '缩略图 URL' },
    fileSize: { type: 'integer', description: '文件大小（字节）' },
    mimeType: { type: 'string', description: 'MIME 类型' },
    dimensions: {
      type: 'object',
      properties: {
        width: { type: 'integer' },
        height: { type: 'integer' },
      },
      description: '尺寸（图片/视频）',
    },
    duration: { type: 'number', description: '时长（音频/视频，秒）' },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '标签列表',
    },
    metadata: {
      type: 'object',
      description: 'AI 生成相关元数据',
      properties: {
        aiModel: { type: 'string', description: 'AI 模型' },
        aiPrompt: { type: 'string', description: 'AI 提示词' },
      },
    },
    uploader: { $ref: '#/components/schemas/User' },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
    updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
  },
}

/**
 * 角色 Schema
 */
export const CharacterSchema: OpenAPISchema = {
  type: 'object',
  required: ['id', 'name', 'scope', 'createdAt'],
  properties: {
    id: { type: 'string', description: '角色唯一标识' },
    code: { type: 'string', description: '角色编号' },
    name: { type: 'string', description: '角色名称' },
    description: { type: 'string', description: '角色简介' },
    personality: { type: 'string', description: '个性描述' },
    scope: {
      type: 'string',
      enum: ['global', 'project'],
      description: '角色范围',
    },
    projectId: { type: 'string', description: '所属项目 ID（项目角色）' },
    basePrompt: { type: 'string', description: '基础提示词' },
    attributes: {
      type: 'object',
      description: '角色属性',
      properties: {
        age: { type: 'string' },
        gender: { type: 'string' },
        height: { type: 'string' },
        occupation: { type: 'string' },
        hairColor: { type: 'string' },
        eyeColor: { type: 'string' },
        bodyType: { type: 'string' },
      },
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '标签列表',
    },
    views: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['front', 'side', 'back', 'threeQuarter'] },
          imageUrl: { type: 'string' },
        },
      },
      description: '多视角图片',
    },
    costumes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
      description: '服装变体',
    },
    voice: {
      type: 'object',
      description: '语音设置',
      properties: {
        style: { type: 'string' },
        speed: { type: 'number' },
        volume: { type: 'number' },
      },
    },
    assetId: { type: 'string', description: '关联资产 ID' },
    createdBy: { $ref: '#/components/schemas/User' },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
    updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
  },
}

// ============================================================
// API 错误响应 Schema
// ============================================================

/**
 * 错误响应 Schema
 */
export const ErrorResponseSchema: OpenAPISchema = {
  type: 'object',
  required: ['error', 'message'],
  properties: {
    error: { type: 'string', description: '错误类型' },
    message: { type: 'string', description: '错误消息' },
    details: {
      type: 'object',
      description: '错误详情',
    },
  },
}

// ============================================================
// 完整 OpenAPI 文档配置
// ============================================================

/**
 * API 文档配置
 * 用于生成 Swagger UI
 */
export const openAPIDocument: OpenAPIDocument = {
  openapi: '3.0.3',
  info: {
    title: '帧服了短剧平台 API',
    description: 'AI 辅助短剧创作平台后端 API 文档',
    version: 'V0.1.0',
    contact: {
      name: '外星动物（常智）IoTchange',
      email: '14455975@qq.com',
    },
    license: {
      name: 'Copyright',
      url: 'https://iotchange.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: '开发服务器',
    },
    {
      url: 'https://api.iotchange.com/api',
      description: '生产服务器',
    },
  ],
  paths: {
    // API 路径将在后端实现时填充
  },
  components: {
    schemas: {
      User: UserSchema,
      Project: ProjectSchema,
      ProjectMember: ProjectMemberSchema,
      Shot: ShotSchema,
      Asset: AssetSchema,
      Character: CharacterSchema,
      Error: ErrorResponseSchema,
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 认证',
      },
    },
  },
  tags: [
    { name: 'auth', description: '认证相关 API' },
    { name: 'users', description: '用户管理 API' },
    { name: 'projects', description: '项目管理 API' },
    { name: 'storyboards', description: '分镜头管理 API' },
    { name: 'assets', description: '资产管理 API' },
    { name: 'characters', description: '角色管理 API' },
  ],
}

export default openAPIDocument
