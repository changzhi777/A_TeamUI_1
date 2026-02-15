/**
 * 用户 Schema 定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'

// 用户角色
export const userRoleSchema = z.enum([
  'super_admin',
  'admin',
  'director',
  'screenwriter',
  'editor',
  'member',
]).describe('用户角色')

// 用户基础信息
export const userSchema = z.object({
  id: z.string().describe('用户 ID'),
  name: z.string().describe('用户名称'),
  email: z.string().email().describe('用户邮箱'),
  avatar: z.string().optional().describe('用户头像 URL'),
  role: userRoleSchema.describe('用户角色'),
  createdAt: z.string().datetime().describe('创建时间'),
  updatedAt: z.string().datetime().optional().describe('更新时间'),
})

// 登录请求
export const loginRequestSchema = z.object({
  email: z.string().email().describe('邮箱地址'),
  password: z.string().min(6).describe('密码'),
  rememberMe: z.boolean().optional().describe('记住我'),
})

// 登录响应
export const loginResponseSchema = z.object({
  success: z.literal(true),
  user: userSchema.describe('用户信息'),
  accessToken: z.string().describe('访问令牌'),
  refreshToken: z.string().describe('刷新令牌'),
  expiresAt: z.number().describe('令牌过期时间戳'),
})

// 注册请求
export const registerRequestSchema = z.object({
  name: z.string().min(2).max(30).describe('用户名称'),
  email: z.string().email().describe('邮箱地址'),
  password: z.string().min(8).describe('密码'),
})

// 注册响应
export const registerResponseSchema = z.object({
  success: z.literal(true),
  user: userSchema.describe('用户信息'),
  accessToken: z.string().describe('访问令牌'),
  refreshToken: z.string().describe('刷新令牌'),
})

// Token 刷新请求
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().describe('刷新令牌'),
})

// Token 刷新响应
export const refreshTokenResponseSchema = z.object({
  success: z.literal(true),
  accessToken: z.string().describe('新的访问令牌'),
  refreshToken: z.string().describe('新的刷新令牌'),
  expiresAt: z.number().describe('令牌过期时间戳'),
})

// 类型导出
export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type RegisterResponse = z.infer<typeof registerResponseSchema>
