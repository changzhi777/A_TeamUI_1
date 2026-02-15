/**
 * OpenAPI 文档定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { OpenAPIHono } from '@hono/zod-openapi'
import { env } from '../../config'

/**
 * OpenAPI 3.0 文档对象
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: '帧服了短剧平台 API',
    version: 'V0.1.0',
    description: `
AI 辅助短剧创作平台后端 API 文档

## 功能模块
- **认证 (auth)**: 用户登录、注册、Token 管理
- **项目管理 (projects)**: 短剧项目的 CRUD 操作
- **分镜头 (storyboard)**: 分镜头的创建、编辑、排序
- **用户管理 (users)**: 用户信息和权限管理
- **成员管理 (members)**: 项目团队成员管理
- **文件上传 (upload)**: 图片、文档等文件上传

## 认证方式
使用 Bearer Token 认证，在请求头中添加：
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## 版权信息
- 作者: 外星动物（常智）IoTchange
- 邮箱: 14455975@qq.com
- 版权: ©2026 IoTchange
    `,
    contact: {
      name: '外星动物（常智）IoTchange',
      email: '14455975@qq.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api`,
      description: '开发服务器',
    },
    {
      url: 'https://api.iotchange.com/api',
      description: '生产服务器',
    },
  ],
  tags: [
    { name: 'auth', description: '认证相关 API' },
    { name: 'projects', description: '项目管理 API' },
    { name: 'storyboard', description: '分镜头管理 API' },
    { name: 'users', description: '用户管理 API' },
    { name: 'members', description: '成员管理 API' },
    { name: 'upload', description: '文件上传 API' },
  ],
  paths: {
    // Auth
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: '用户登录',
        description: '使用邮箱和密码进行用户登录',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', description: '邮箱地址' },
                  password: { type: 'string', minLength: 6, description: '密码' },
                  rememberMe: { type: 'boolean', description: '记住我' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: '邮箱或密码错误',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['auth'],
        summary: '用户注册',
        description: '创建新用户账号',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 30, description: '用户名称' },
                  email: { type: 'string', format: 'email', description: '邮箱地址' },
                  password: { type: 'string', minLength: 8, description: '密码' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: '注册成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterResponse' },
              },
            },
          },
          '400': {
            description: '请求参数错误或邮箱已存在',
          },
        },
      },
    },
    // Projects
    '/projects': {
      get: {
        tags: ['projects'],
        summary: '获取项目列表',
        description: '获取当前用户可访问的项目列表',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: '每页数量' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: '搜索关键词' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['planning', 'filming', 'postProduction', 'completed'] }, description: '状态筛选' },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProjectListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['projects'],
        summary: '创建项目',
        description: '创建一个新的短剧项目',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
          },
        },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['projects'],
        summary: '获取项目详情',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '项目 ID' },
        ],
        responses: {
          '200': {
            description: '获取成功',
          },
          '404': {
            description: '项目不存在',
          },
        },
      },
      put: {
        tags: ['projects'],
        summary: '更新项目',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProjectRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
          },
        },
      },
      delete: {
        tags: ['projects'],
        summary: '删除项目',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '删除成功',
          },
        },
      },
    },
    // Storyboard
    '/shots': {
      get: {
        tags: ['storyboard'],
        summary: '获取分镜头列表',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', required: true, schema: { type: 'string' }, description: '项目 ID' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          '200': {
            description: '获取成功',
          },
        },
      },
      post: {
        tags: ['storyboard'],
        summary: '创建分镜头',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateShotRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
          },
        },
      },
    },
    '/shots/{id}': {
      get: {
        tags: ['storyboard'],
        summary: '获取分镜头详情',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '获取成功',
          },
        },
      },
      put: {
        tags: ['storyboard'],
        summary: '更新分镜头',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateShotRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
          },
        },
      },
      delete: {
        tags: ['storyboard'],
        summary: '删除分镜头',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '删除成功',
          },
        },
      },
    },
    // Users
    '/users/me': {
      get: {
        tags: ['users'],
        summary: '获取当前用户信息',
        description: '获取当前登录用户的详细信息',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserDetailResponse' },
              },
            },
          },
          '401': {
            description: '未授权',
          },
        },
      },
      put: {
        tags: ['users'],
        summary: '更新用户资料',
        description: '更新当前用户的个人资料',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
          },
          '401': {
            description: '未授权',
          },
        },
      },
    },
    '/users/me/password': {
      put: {
        tags: ['users'],
        summary: '修改密码',
        description: '修改当前用户的密码',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '修改成功',
          },
          '400': {
            description: '原密码错误',
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['users'],
        summary: '获取用户列表',
        description: '管理员获取所有用户列表',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserListResponse' },
              },
            },
          },
          '403': {
            description: '权限不足',
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['users'],
        summary: '获取用户详情',
        description: '管理员获取指定用户的详细信息',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '获取成功',
          },
          '404': {
            description: '用户不存在',
          },
        },
      },
      put: {
        tags: ['users'],
        summary: '更新用户角色',
        description: '管理员更新指定用户的角色',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRoleRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
          },
        },
      },
      delete: {
        tags: ['users'],
        summary: '删除用户',
        description: '管理员删除指定用户（软删除）',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '删除成功',
          },
        },
      },
    },
    // Members
    '/members': {
      get: {
        tags: ['members'],
        summary: '获取成员列表',
        description: '获取所有项目成员的列表',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'projectIds', in: 'query', schema: { type: 'string' }, description: '逗号分隔的项目 ID' },
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MemberListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['members'],
        summary: '添加成员',
        description: '管理员添加新成员',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddMemberRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: '添加成功',
          },
          '409': {
            description: '邮箱已存在',
          },
        },
      },
    },
    '/members/{id}': {
      get: {
        tags: ['members'],
        summary: '获取成员详情',
        description: '获取指定成员的详细信息',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '获取成功',
          },
          '404': {
            description: '成员不存在',
          },
        },
      },
      put: {
        tags: ['members'],
        summary: '更新成员信息',
        description: '管理员更新指定成员的信息',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMemberRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
          },
        },
      },
      delete: {
        tags: ['members'],
        summary: '删除成员',
        description: '管理员删除指定成员',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: '删除成功',
          },
        },
      },
    },
    '/members/{id}/projects': {
      post: {
        tags: ['members'],
        summary: '添加成员到项目',
        description: '将指定成员添加到某个项目',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '成员 ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddToProjectRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '添加成功',
          },
          '409': {
            description: '已是项目成员',
          },
        },
      },
    },
    // Upload
    '/upload/avatar': {
      post: {
        tags: ['upload'],
        summary: '上传头像',
        description: '上传用户头像图片，支持裁剪',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/UploadAvatarRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '上传成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UploadResponse' },
              },
            },
          },
          '400': {
            description: '文件无效',
          },
        },
      },
      delete: {
        tags: ['upload'],
        summary: '删除头像',
        description: '删除当前用户的头像',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '删除成功',
          },
        },
      },
    },
    '/upload/image': {
      post: {
        tags: ['upload'],
        summary: '上传图片',
        description: '上传通用图片（分镜图等）',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/UploadImageRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: '上传成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UploadResponse' },
              },
            },
          },
          '400': {
            description: '文件无效',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 认证令牌',
      },
    },
    schemas: {
      // User
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'createdAt'],
        properties: {
          id: { type: 'string', description: '用户 ID' },
          name: { type: 'string', description: '用户名称' },
          email: { type: 'string', format: 'email', description: '用户邮箱' },
          avatar: { type: 'string', description: '用户头像 URL' },
          role: { type: 'string', enum: ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member'], description: '用户角色' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
        },
      },
      // Login Response
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', description: '访问令牌' },
          refreshToken: { type: 'string', description: '刷新令牌' },
          expiresAt: { type: 'number', description: '令牌过期时间戳' },
        },
      },
      // Register Response
      RegisterResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      // Project
      Project: {
        type: 'object',
        required: ['id', 'name', 'type', 'status', 'createdAt'],
        properties: {
          id: { type: 'string', description: '项目 ID' },
          name: { type: 'string', description: '项目名称' },
          description: { type: 'string', description: '项目描述' },
          type: { type: 'string', enum: ['shortDrama', 'realLifeDrama', 'aiPodcast', 'advertisement', 'mv', 'documentary', 'other'], description: '项目类型' },
          status: { type: 'string', enum: ['planning', 'filming', 'postProduction', 'completed'], description: '项目状态' },
          director: { type: 'string', description: '导演' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
        },
      },
      // Project List Response
      ProjectListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
          total: { type: 'integer', description: '总数' },
          page: { type: 'integer', description: '当前页码' },
          limit: { type: 'integer', description: '每页数量' },
        },
      },
      // Create Project Request
      CreateProjectRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, description: '项目名称' },
          description: { type: 'string', maxLength: 500, description: '项目描述' },
          type: { type: 'string', enum: ['shortDrama', 'realLifeDrama', 'aiPodcast', 'advertisement', 'mv', 'documentary', 'other'], description: '项目类型' },
          director: { type: 'string', maxLength: 50, description: '导演' },
        },
      },
      // Update Project Request
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['planning', 'filming', 'postProduction', 'completed'] },
        },
      },
      // Shot
      Shot: {
        type: 'object',
        required: ['id', 'projectId', 'shotNumber', 'sceneNumber', 'createdAt'],
        properties: {
          id: { type: 'string', description: '分镜头 ID' },
          projectId: { type: 'string', description: '所属项目 ID' },
          shotNumber: { type: 'integer', description: '镜头编号' },
          sceneNumber: { type: 'string', description: '场次' },
          shotSize: { type: 'string', enum: ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp'], description: '景别' },
          cameraMovement: { type: 'string', enum: ['static', 'pan', 'tilt', 'dolly', 'truck', 'pedestal', 'crane', 'handheld', 'steadicam', 'tracking', 'arc'], description: '运镜方式' },
          duration: { type: 'number', description: '时长（秒）' },
          description: { type: 'string', description: '画面描述' },
          dialogue: { type: 'string', description: '对白/旁白' },
          sound: { type: 'string', description: '音效/配乐' },
          imageUrl: { type: 'string', description: '配图 URL' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
        },
      },
      // Create Shot Request
      CreateShotRequest: {
        type: 'object',
        required: ['projectId', 'shotNumber', 'sceneNumber'],
        properties: {
          projectId: { type: 'string', description: '所属项目 ID' },
          shotNumber: { type: 'integer', minimum: 1, description: '镜头编号' },
          sceneNumber: { type: 'string', minLength: 1, description: '场次' },
          shotSize: { type: 'string', enum: ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp'] },
          cameraMovement: { type: 'string', enum: ['static', 'pan', 'tilt', 'dolly', 'truck', 'pedestal', 'crane', 'handheld', 'steadicam', 'tracking', 'arc'] },
          duration: { type: 'number', minimum: 0, description: '时长（秒）' },
          description: { type: 'string', description: '画面描述' },
          dialogue: { type: 'string', description: '对白/旁白' },
          sound: { type: 'string', description: '音效/配乐' },
        },
      },
      // Update Shot Request
      UpdateShotRequest: {
        type: 'object',
        properties: {
          shotNumber: { type: 'integer', minimum: 1 },
          sceneNumber: { type: 'string', minLength: 1 },
          shotSize: { type: 'string', enum: ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp'] },
          cameraMovement: { type: 'string', enum: ['static', 'pan', 'tilt', 'dolly', 'truck', 'pedestal', 'crane', 'handheld', 'steadicam', 'tracking', 'arc'] },
          duration: { type: 'number', minimum: 0 },
          description: { type: 'string' },
          dialogue: { type: 'string' },
          sound: { type: 'string' },
        },
      },
      // Error Response
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          error: { type: 'string', description: '错误类型' },
          message: { type: 'string', description: '错误消息' },
          details: { type: 'object', description: '错误详情' },
        },
      },
      // User Detail Response
      UserDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          bio: { type: 'string' },
          avatar: { type: 'string' },
          role: { type: 'string' },
          isEmailVerified: { type: 'boolean' },
          isOtpEnabled: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // Update Profile Request
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          phone: { type: 'string' },
          bio: { type: 'string', maxLength: 500 },
          avatar: { type: 'string', format: 'uri' },
        },
      },
      // Change Password Request
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', minLength: 6 },
          newPassword: { type: 'string', minLength: 8, maxLength: 100 },
        },
      },
      // Update Role Request
      UpdateRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member'] },
        },
      },
      // User List Response
      UserListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      // Member List Response
      MemberListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                avatar: { type: 'string' },
                role: { type: 'string' },
                projectCount: { type: 'integer' },
                projects: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      projectId: { type: 'string' },
                      projectName: { type: 'string' },
                      role: { type: 'string' },
                      joinedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          total: { type: 'integer' },
        },
      },
      // Add Member Request
      AddMemberRequest: {
        type: 'object',
        required: ['email', 'name', 'role', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 2, maxLength: 100 },
          role: { type: 'string', enum: ['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member'] },
          password: { type: 'string', minLength: 8 },
          projects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                role: { type: 'string', enum: ['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor'] },
              },
            },
          },
        },
      },
      // Update Member Request
      UpdateMemberRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['super_admin', 'admin', 'auditor', 'director', 'screenwriter', 'editor', 'member'] },
          phone: { type: 'string' },
          bio: { type: 'string', maxLength: 500 },
        },
      },
      // Add To Project Request
      AddToProjectRequest: {
        type: 'object',
        required: ['projectId', 'role'],
        properties: {
          projectId: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'member', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor'] },
        },
      },
      // Upload Avatar Request
      UploadAvatarRequest: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary', description: '头像图片文件' },
          crop: { type: 'string', description: '裁剪数据 JSON（可选）' },
        },
      },
      // Upload Image Request
      UploadImageRequest: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary', description: '图片文件' },
          type: { type: 'string', description: '图片类型（如 storyboard）' },
        },
      },
      // Upload Response
      UploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          url: { type: 'string', description: '文件 URL' },
          filename: { type: 'string', description: '文件名' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
} as const

export default openApiDocument
