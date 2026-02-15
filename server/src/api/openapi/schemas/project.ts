/**
 * 项目 Schema 定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'

// 项目类型
export const projectTypeSchema = z.enum([
  'shortDrama',
  'realLifeDrama',
  'aiPodcast',
  'advertisement',
  'mv',
  'documentary',
  'other',
]).describe('项目类型')

// 项目状态
export const projectStatusSchema = z.enum([
  'planning',
  'filming',
  'postProduction',
  'completed',
]).describe('项目状态')

// 项目基础信息
export const projectSchema = z.object({
  id: z.string().describe('项目 ID'),
  name: z.string().describe('项目名称'),
  description: z.string().optional().describe('项目描述'),
  type: projectTypeSchema.describe('项目类型'),
  status: projectStatusSchema.describe('项目状态'),
  director: z.string().optional().describe('导演'),
  episodeRange: z.string().optional().describe('集数范围'),
  thumbnail: z.string().optional().describe('项目缩略图'),
  memberCount: z.number().int().optional().describe('成员数量'),
  shotCount: z.number().int().optional().describe('分镜头数量'),
  createdAt: z.string().datetime().describe('创建时间'),
  updatedAt: z.string().datetime().optional().describe('更新时间'),
})

// 创建项目请求
export const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(100).describe('项目名称'),
  description: z.string().max(500).optional().describe('项目描述'),
  type: projectTypeSchema.describe('项目类型'),
  director: z.string().max(50).optional().describe('导演'),
  episodeRange: z.string().max(50).optional().describe('集数范围'),
})

// 更新项目请求
export const updateProjectRequestSchema = z.object({
  name: z.string().min(1).max(100).optional().describe('项目名称'),
  description: z.string().max(500).optional().describe('项目描述'),
  type: projectTypeSchema.optional().describe('项目类型'),
  status: projectStatusSchema.optional().describe('项目状态'),
  director: z.string().max(50).optional().describe('导演'),
  episodeRange: z.string().max(50).optional().describe('集数范围'),
})

// 项目列表查询参数
export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('页码'),
  limit: z.coerce.number().int().min(1).max(100).default(10).describe('每页数量'),
  search: z.string().optional().describe('搜索关键词'),
  status: projectStatusSchema.optional().describe('状态筛选'),
  type: projectTypeSchema.optional().describe('类型筛选'),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt').describe('排序字段'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc').describe('排序方向'),
})

// 项目列表响应
export const projectListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(projectSchema).describe('项目列表'),
  total: z.number().int().describe('总数'),
  page: z.number().int().describe('当前页码'),
  limit: z.number().int().describe('每页数量'),
})

// 项目详情响应
export const projectDetailResponseSchema = z.object({
  success: z.literal(true),
  data: projectSchema.describe('项目详情'),
})

// 类型导出
export type Project = z.infer<typeof projectSchema>
export type ProjectType = z.infer<typeof projectTypeSchema>
export type ProjectStatus = z.infer<typeof projectStatusSchema>
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>
