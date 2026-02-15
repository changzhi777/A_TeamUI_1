/**
 * assets
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset API Client
 * 资产管理 API 客户端
 *
 * 当前使用模拟数据服务，后续可切换到真实后端 API
 */

import * as mockService from '../mocks/asset-mock'
import type {
  Asset,
  AssetType,
  AssetSource,
  AssetScope,
  AssetStats,
  AssetUsageDetails,
  AssetBatchResult,
} from '../types/assets'

// 是否使用模拟数据（可配置）
const USE_MOCK = true

/**
 * 查询资产列表
 */
export async function fetchAssets(params?: {
  type?: string
  source?: string
  scope?: string
  projectId?: string
  tags?: string[]
  search?: string
}): Promise<Asset[]> {
  if (USE_MOCK) {
    return mockService.fetchAssets(params)
  }
  // TODO: 真实 API 调用
  return []
}

/**
 * 获取单个资产
 */
export async function fetchAssetById(id: string): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.fetchAssetById(id)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 获取全局资产
 */
export async function fetchGlobalAssets(): Promise<Asset[]> {
  if (USE_MOCK) {
    return mockService.fetchGlobalAssets()
  }
  // TODO: 真实 API 调用
  return []
}

/**
 * 获取项目资产
 */
export async function fetchProjectAssets(projectId: string): Promise<Asset[]> {
  if (USE_MOCK) {
    return mockService.fetchProjectAssets(projectId)
  }
  // TODO: 真实 API 调用
  return []
}

/**
 * 上传资产
 */
export async function uploadAsset(data: {
  file?: File
  name: string
  type: AssetType
  source: AssetSource
  scope: AssetScope
  projectId?: string
  externalUrl?: string
  tags?: string[]
  description?: string
  metadata?: Record<string, any>
  characterData?: any // 角色资产数据
}): Promise<Asset> {
  if (USE_MOCK) {
    return mockService.uploadAsset(data)
  }
  // TODO: 真实 API 调用
  throw new Error('API not implemented')
}

/**
 * 更新资产
 */
export async function updateAsset(
  id: string,
  data: Partial<Asset>
): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.updateAsset(id, data)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 删除资产
 */
export async function deleteAsset(id: string): Promise<boolean> {
  if (USE_MOCK) {
    return mockService.deleteAsset(id)
  }
  // TODO: 真实 API 调用
  return false
}

/**
 * 批量删除资产
 */
export async function batchDeleteAssets(ids: string[]): Promise<AssetBatchResult> {
  if (USE_MOCK) {
    return mockService.batchDeleteAssets(ids)
  }
  // TODO: 真实 API 调用
  return { success: 0, failed: 0, errors: [{ id: '', error: 'API not implemented' }] }
}

/**
 * 添加资产标签
 */
export async function addAssetTag(
  assetId: string,
  tag: string
): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.addAssetTag(assetId, tag)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 移除资产标签
 */
export async function removeAssetTag(
  assetId: string,
  tag: string
): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.removeAssetTag(assetId, tag)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 移动资产到项目
 */
export async function moveAssetToProject(
  assetId: string,
  projectId: string | null
): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.moveAssetToProject(assetId, projectId)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 批量移动资产到项目
 */
export async function batchMoveAssetsToProject(
  assetIds: string[],
  projectId: string | null
): Promise<AssetBatchResult> {
  if (USE_MOCK) {
    return mockService.batchMoveAssetsToProject(assetIds, projectId)
  }
  // TODO: 真实 API 调用
  return { success: 0, failed: 0, errors: [{ id: '', error: 'API not implemented' }] }
}

/**
 * 复制资产到项目
 */
export async function copyAssetToProject(
  assetId: string,
  projectId: string
): Promise<Asset | null> {
  if (USE_MOCK) {
    return mockService.copyAssetToProject(assetId, projectId)
  }
  // TODO: 真实 API 调用
  return null
}

/**
 * 获取资产统计
 */
export async function getAssetStats(): Promise<AssetStats> {
  if (USE_MOCK) {
    return mockService.getAssetStats()
  }
  // TODO: 真实 API 调用
  return {
    total: 0,
    totalSize: 0,
    uploadedThisMonth: 0,
    byType: { image: 0, audio: 0, video: 0, script: 0, aiGenerated: 0 },
    bySource: { upload: 0, link: 0, ai: 0, external: 0, storage: 0 },
  }
}

/**
 * 获取资产使用情况
 */
export async function getAssetUsage(id: string): Promise<AssetUsageDetails> {
  if (USE_MOCK) {
    return mockService.getAssetUsage(id)
  }
  // TODO: 真实 API 调用
  return { assetId: id, referenceCount: 0, references: [] }
}

/**
 * 搜索标签
 */
export async function searchAssetTags(query: string): Promise<string[]> {
  if (USE_MOCK) {
    return mockService.searchAssetTags(query)
  }
  // TODO: 真实 API 调用
  return []
}

/**
 * 获取热门标签
 */
export async function getPopularTags(): Promise<{ tag: string; count: number }[]> {
  if (USE_MOCK) {
    return mockService.getPopularTags()
  }
  // TODO: 真实 API 调用
  return []
}

/**
 * 导出资产为 CSV
 */
export async function exportAssetsCsv(assetIds?: string[]): Promise<string> {
  if (USE_MOCK) {
    return mockService.exportAssetsCsv(assetIds)
  }
  // TODO: 真实 API 调用
  return ''
}

/**
 * 从 CSV 导入资产
 */
export async function importAssetsCsv(csvContent: string): Promise<AssetBatchResult> {
  if (USE_MOCK) {
    return mockService.importAssetsCsv(csvContent)
  }
  // TODO: 真实 API 调用
  return { success: 0, failed: 0, errors: [{ id: '', error: 'API not implemented' }] }
}

/**
 * 重置模拟数据（仅用于开发测试）
 */
export function resetMockData(): void {
  if (USE_MOCK) {
    mockService.resetMockData()
  }
}

// 保留旧的函数名以保持向后兼容
export const importAssets = importAssetsCsv
export const exportAssets = exportAssetsCsv
