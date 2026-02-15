/**
 * Projects API 路由定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import {
  projectSchema,
  createProjectRequestSchema,
  updateProjectRequestSchema,
  projectListQuerySchema,
  projectListResponseSchema,
  projectDetailResponseSchema,
  errorResponseSchema,
  idParamSchema,
} from '../schemas'

// 获取项目列表路由
export const listProjectsRoute = createRoute({
  method: 'get',
  path: '/projects',
  tags: ['projects'],
  summary: '获取项目列表',
  description: '获取当前用户可访问的项目列表，支持分页、搜索和筛选',
  security: [{ bearerAuth: [] }],
  request: {
    query: projectListQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: projectListResponseSchema,
        },
      },
      description: '获取成功',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '未授权',
    },
  },
})

// 获取项目详情路由
export const getProjectRoute = createRoute({
  method: 'get',
  path: '/projects/{id}',
  tags: ['projects'],
  summary: '获取项目详情',
  description: '根据 ID 获取项目的详细信息',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: projectDetailResponseSchema,
        },
      },
      description: '获取成功',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '项目不存在',
    },
  },
})

// 创建项目路由
export const createProjectRoute = createRoute({
  method: 'post',
  path: '/projects',
  tags: ['projects'],
  summary: '创建项目',
  description: '创建一个新的短剧项目',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createProjectRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: projectSchema,
            message: z.string(),
          }),
        },
      },
      description: '创建成功',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '请求参数错误',
    },
  },
})

// 更新项目路由
export const updateProjectRoute = createRoute({
  method: 'put',
  path: '/projects/{id}',
  tags: ['projects'],
  summary: '更新项目',
  description: '更新指定项目的信息',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': {
          schema: updateProjectRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: projectSchema,
            message: z.string(),
          }),
        },
      },
      description: '更新成功',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '项目不存在',
    },
  },
})

// 删除项目路由
export const deleteProjectRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}',
  tags: ['projects'],
  summary: '删除项目',
  description: '删除指定项目（需要管理员权限）',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
      description: '删除成功',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '项目不存在',
    },
  },
})
