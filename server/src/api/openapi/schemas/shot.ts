/**
 * 分镜头 Schema 定义
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'

// 景别
export const shotSizeSchema = z.enum([
  'extremeLong',
  'long',
  'medium',
  'closeUp',
  'extremeCloseUp',
]).describe('景别')

// 运镜方式
export const cameraMovementSchema = z.enum([
  'static',
  'pan',
  'tilt',
  'dolly',
  'truck',
  'pedestal',
  'crane',
  'handheld',
  'steadicam',
  'tracking',
  'arc',
]).describe('运镜方式')

// 分镜头基础信息
export const shotSchema = z.object({
  id: z.string().describe('分镜头 ID'),
  projectId: z.string().describe('所属项目 ID'),
  shotNumber: z.number().int().describe('镜头编号'),
  sceneNumber: z.string().describe('场次'),
  shotSize: shotSizeSchema.optional().describe('景别'),
  cameraMovement: cameraMovementSchema.optional().describe('运镜方式'),
  duration: z.number().optional().describe('时长（秒）'),
  description: z.string().optional().describe('画面描述'),
  dialogue: z.string().optional().describe('对白/旁白'),
  sound: z.string().optional().describe('音效/配乐'),
  imageUrl: z.string().optional().describe('配图 URL'),
  notes: z.string().optional().describe('备注'),
  createdAt: z.string().datetime().describe('创建时间'),
  updatedAt: z.string().datetime().optional().describe('更新时间'),
})

// 创建分镜头请求
export const createShotRequestSchema = z.object({
  projectId: z.string().describe('所属项目 ID'),
  shotNumber: z.number().int().min(1).describe('镜头编号'),
  sceneNumber: z.string().min(1).describe('场次'),
  shotSize: shotSizeSchema.optional().describe('景别'),
  cameraMovement: cameraMovementSchema.optional().describe('运镜方式'),
  duration: z.number().min(0).optional().describe('时长（秒）'),
  description: z.string().optional().describe('画面描述'),
  dialogue: z.string().optional().describe('对白/旁白'),
  sound: z.string().optional().describe('音效/配乐'),
  notes: z.string().optional().describe('备注'),
})

// 更新分镜头请求
export const updateShotRequestSchema = z.object({
  shotNumber: z.number().int().min(1).optional().describe('镜头编号'),
  sceneNumber: z.string().min(1).optional().describe('场次'),
  shotSize: shotSizeSchema.optional().describe('景别'),
  cameraMovement: cameraMovementSchema.optional().describe('运镜方式'),
  duration: z.number().min(0).optional().describe('时长（秒）'),
  description: z.string().optional().describe('画面描述'),
  dialogue: z.string().optional().describe('对白/旁白'),
  sound: z.string().optional().describe('音效/配乐'),
  notes: z.string().optional().describe('备注'),
})

// 分镜头列表查询参数
export const shotListQuerySchema = z.object({
  projectId: z.string().describe('项目 ID'),
  page: z.coerce.number().int().min(1).default(1).describe('页码'),
  limit: z.coerce.number().int().min(1).max(100).default(50).describe('每页数量'),
  sceneNumber: z.string().optional().describe('场次筛选'),
  shotSize: shotSizeSchema.optional().describe('景别筛选'),
  search: z.string().optional().describe('搜索关键词'),
})

// 分镜头列表响应
export const shotListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(shotSchema).describe('分镜头列表'),
  total: z.number().int().describe('总数'),
  page: z.number().int().describe('当前页码'),
  limit: z.number().int().describe('每页数量'),
})

// 分镜头详情响应
export const shotDetailResponseSchema = z.object({
  success: z.literal(true),
  data: shotSchema.describe('分镜头详情'),
})

// 类型导出
export type Shot = z.infer<typeof shotSchema>
export type ShotSize = z.infer<typeof shotSizeSchema>
export type CameraMovement = z.infer<typeof cameraMovementSchema>
export type CreateShotRequest = z.infer<typeof createShotRequestSchema>
export type UpdateShotRequest = z.infer<typeof updateShotRequestSchema>
export type ShotListQuery = z.infer<typeof shotListQuerySchema>
