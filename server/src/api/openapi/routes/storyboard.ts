/**
 * Storyboard API 路由定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import {
  shotSchema,
  createShotRequestSchema,
  updateShotRequestSchema,
  shotListQuerySchema,
  shotListResponseSchema,
  shotDetailResponseSchema,
  errorResponseSchema,
  idParamSchema,
} from '../schemas'

// 获取分镜头列表路由
export const listShotsRoute = createRoute({
  method: 'get',
  path: '/shots',
  tags: ['storyboard'],
  summary: '获取分镜头列表',
  description: '获取指定项目的分镜头列表，支持分页和筛选',
  security: [{ bearerAuth: [] }],
  request: {
    query: shotListQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: shotListResponseSchema,
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

// 获取分镜头详情路由
export const getShotRoute = createRoute({
  method: 'get',
  path: '/shots/{id}',
  tags: ['storyboard'],
  summary: '获取分镜头详情',
  description: '根据 ID 获取分镜头的详细信息',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: shotDetailResponseSchema,
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
      description: '分镜头不存在',
    },
  },
})

// 创建分镜头路由
export const createShotRoute = createRoute({
  method: 'post',
  path: '/shots',
  tags: ['storyboard'],
  summary: '创建分镜头',
  description: '创建一个新的分镜头',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createShotRequestSchema,
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
            data: shotSchema,
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

// 更新分镜头路由
export const updateShotRoute = createRoute({
  method: 'put',
  path: '/shots/{id}',
  tags: ['storyboard'],
  summary: '更新分镜头',
  description: '更新指定分镜头的信息',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': {
          schema: updateShotRequestSchema,
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
            data: shotSchema,
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
      description: '分镜头不存在',
    },
  },
})

// 删除分镜头路由
export const deleteShotRoute = createRoute({
  method: 'delete',
  path: '/shots/{id}',
  tags: ['storyboard'],
  summary: '删除分镜头',
  description: '删除指定分镜头',
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
      description: '分镜头不存在',
    },
  },
})

// 批量删除分镜头路由
export const batchDeleteShotsRoute = createRoute({
  method: 'post',
  path: '/shots/batch-delete',
  tags: ['storyboard'],
  summary: '批量删除分镜头',
  description: '批量删除指定的分镜头',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()).min(1).describe('要删除的分镜头 ID 列表'),
          }),
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
            deletedCount: z.number().int().describe('删除数量'),
            message: z.string(),
          }),
        },
      },
      description: '删除成功',
    },
  },
})

// 重排序分镜头路由
export const reorderShotsRoute = createRoute({
  method: 'post',
  path: '/shots/reorder',
  tags: ['storyboard'],
  summary: '重排序分镜头',
  description: '调整分镜头的顺序',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            projectId: z.string().describe('项目 ID'),
            orders: z.array(z.object({
              id: z.string().describe('分镜头 ID'),
              shotNumber: z.number().int().describe('新的镜头编号'),
            })).describe('排序信息'),
          }),
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
            message: z.string(),
          }),
        },
      },
      description: '排序成功',
    },
  },
})
