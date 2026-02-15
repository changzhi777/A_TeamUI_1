/**
 * 通用 Schema 定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'

// 通用分页参数
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('页码'),
  limit: z.coerce.number().int().min(1).max(100).default(10).describe('每页数量'),
})

// 通用分页响应
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema).describe('数据列表'),
    total: z.number().int().describe('总数'),
    page: z.number().int().describe('当前页码'),
    limit: z.number().int().describe('每页数量'),
    totalPages: z.number().int().describe('总页数'),
  })

// 通用成功响应
export const successResponseSchema = z.object({
  success: z.literal(true).describe('成功标识'),
  message: z.string().describe('成功消息'),
})

// 通用错误响应
export const errorResponseSchema = z.object({
  success: z.literal(false).describe('成功标识'),
  error: z.string().describe('错误类型'),
  message: z.string().describe('错误消息'),
  details: z.record(z.unknown()).optional().describe('错误详情'),
})

// ID 参数
export const idParamSchema = z.object({
  id: z.string().min(1).describe('资源 ID'),
})

// 通用类型导出
export type Pagination = z.infer<typeof paginationSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
