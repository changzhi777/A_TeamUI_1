/**
 * Auth API 路由定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import {
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema,
  registerResponseSchema,
  refreshTokenRequestSchema,
  refreshTokenResponseSchema,
  errorResponseSchema,
} from '../schemas'

// 登录路由
export const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['auth'],
  summary: '用户登录',
  description: '使用邮箱和密码进行用户登录，返回访问令牌和用户信息',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: loginResponseSchema,
        },
      },
      description: '登录成功',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '邮箱或密码错误',
    },
  },
})

// 注册路由
export const registerRoute = createRoute({
  method: 'post',
  path: '/auth/register',
  tags: ['auth'],
  summary: '用户注册',
  description: '创建新用户账号',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: registerResponseSchema,
        },
      },
      description: '注册成功',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '请求参数错误或邮箱已存在',
    },
  },
})

// Token 刷新路由
export const refreshTokenRoute = createRoute({
  method: 'post',
  path: '/auth/refresh',
  tags: ['auth'],
  summary: '刷新令牌',
  description: '使用刷新令牌获取新的访问令牌',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: refreshTokenResponseSchema,
        },
      },
      description: '刷新成功',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '刷新令牌无效或已过期',
    },
  },
})

// 登出路由
export const logoutRoute = createRoute({
  method: 'post',
  path: '/auth/logout',
  tags: ['auth'],
  summary: '用户登出',
  description: '退出登录，使当前令牌失效',
  security: [{ bearerAuth: [] }],
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
      description: '登出成功',
    },
  },
})

// 获取当前用户信息路由
export const meRoute = createRoute({
  method: 'get',
  path: '/auth/me',
  tags: ['auth'],
  summary: '获取当前用户信息',
  description: '获取当前登录用户的详细信息',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              role: z.string(),
              avatar: z.string().optional(),
              createdAt: z.string(),
            }),
          }),
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
