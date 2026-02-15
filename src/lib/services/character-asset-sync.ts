/**
 * character-asset-sync
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character-Asset Sync Service
 * 角色与资产库双向同步服务
 */

import type { Character } from '@/lib/types/character'
import type { Asset, CharacterAssetData } from '@/lib/types/assets'
import { useCharacterStore } from '@/stores/character-store'
import { useAuthStore } from '@/stores/auth-store'
import * as assetsApi from '@/lib/api/assets'

/**
 * 同步选项
 */
export interface SyncOptions {
  /** 上传者信息（可选，不传时自动获取当前用户） */
  uploader?: {
    id: string
    name: string
  }
}

/**
 * 从角色生成角色资产数据
 */
export function createCharacterAssetData(character: Character): CharacterAssetData {
  return {
    code: character.code,
    description: character.description,
    personality: character.personality,
    attributes: character.attributes,
    basePrompt: character.basePrompt,
    views: {
      front: character.views.front ? {
        url: character.views.front.url,
        prompt: character.views.front.prompt,
        generatedAt: character.views.front.generatedAt,
      } : undefined,
      side: character.views.side ? {
        url: character.views.side.url,
        prompt: character.views.side.prompt,
        generatedAt: character.views.side.generatedAt,
      } : undefined,
      back: character.views.back ? {
        url: character.views.back.url,
        prompt: character.views.back.prompt,
        generatedAt: character.views.back.generatedAt,
      } : undefined,
      threeQuarter: character.views.threeQuarter ? {
        url: character.views.threeQuarter.url,
        prompt: character.views.threeQuarter.prompt,
        generatedAt: character.views.threeQuarter.generatedAt,
      } : undefined,
    },
    costumes: character.costumes.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      prompt: c.prompt,
      generatedAt: c.generatedAt,
    })),
    voice: character.voice ? {
      style: character.voice.style,
      sampleUrl: character.voice.sampleUrl,
      sampleText: character.voice.sampleText,
    } : undefined,
    characterId: character.id,
  }
}

/**
 * 获取角色缩略图 URL
 */
export function getCharacterThumbnailUrl(character: Character): string | undefined {
  // 优先使用正面视角
  if (character.views.front?.url) {
    return character.views.front.url
  }
  // 其次使用其他视角
  return character.views.threeQuarter?.url ||
    character.views.side?.url ||
    character.views.back?.url
}

/**
 * 同步角色到资产库（异步版本）
 * @param character 角色数据
 * @param options 同步选项（包含上传者信息）
 */
export async function syncCharacterToAssetAsync(
  character: Character,
  options?: SyncOptions
): Promise<string | null> {
  const characterStore = useCharacterStore.getState()
  const authStore = useAuthStore.getState()

  // 获取上传者信息：优先使用传入的，否则使用当前用户
  const uploader = options?.uploader || {
    id: authStore.user?.id || 'unknown',
    name: authStore.user?.name || authStore.user?.email || '未知用户',
  }

  // 检查是否已有关联资产
  const existingAsset = character.assetId
    ? await assetsApi.fetchAssetById(character.assetId)
    : null

  const characterData = createCharacterAssetData(character)
  const thumbnailUrl = getCharacterThumbnailUrl(character)

  if (existingAsset) {
    // 更新现有资产
    await assetsApi.updateAsset(existingAsset.id, {
      name: character.name,
      description: character.description,
      tags: character.tags,
      thumbnailUrl,
      characterData,
      updatedAt: new Date().toISOString(),
    })
    return existingAsset.id
  } else {
    // 创建新资产
    const newAsset = await assetsApi.uploadAsset({
      name: character.name,
      type: 'character',
      source: 'ai',
      scope: character.projectId ? 'project' : 'global',
      projectId: character.projectId,
      externalUrl: thumbnailUrl,
      tags: character.tags,
      description: character.description,
      characterData,
      uploadedBy: uploader.id,
      uploadedByName: uploader.name,
    })

    // 更新角色的 assetId 和 syncedToAsset 状态
    characterStore.updateCharacter(character.id, {
      assetId: newAsset.id,
      syncedToAsset: true,
    } as any)

    return newAsset.id
  }
}

/**
 * 同步角色到资产库（同步版本，用于简单场景）
 */
export function syncCharacterToAsset(character: Character): string | null {
  // 使用异步版本的包装
  let result: string | null = null
  syncCharacterToAssetAsync(character)
    .then((assetId) => {
      result = assetId
    })
    .catch((error) => {
      console.error('Failed to sync character to asset:', error)
    })
  return character.assetId || result
}

/**
 * 从资产同步到角色（异步版本）
 */
export async function syncAssetToCharacterAsync(asset: Asset): Promise<boolean> {
  if (asset.type !== 'character' || !asset.characterData) {
    return false
  }

  const characterStore = useCharacterStore.getState()
  const character = characterStore.getCharacterById(asset.characterData.characterId)

  if (!character) {
    return false
  }

  // 更新角色信息（不包括视角图片和服装，这些需要通过角色设计页面管理）
  characterStore.updateCharacter(character.id, {
    name: asset.name,
    description: asset.description || '',
    tags: asset.tags,
  })

  return true
}

/**
 * 删除角色关联的资产（异步版本）
 */
export async function deleteCharacterAssetAsync(characterId: string): Promise<boolean> {
  const characterStore = useCharacterStore.getState()

  const character = characterStore.getCharacterById(characterId)
  if (!character || !character.assetId) {
    return false
  }

  return await assetsApi.deleteAsset(character.assetId)
}

/**
 * 检查角色是否需要同步
 */
export async function isCharacterSyncNeededAsync(character: Character): Promise<boolean> {
  // 如果从未同步过，需要同步
  if (!character.syncedToAsset) {
    return true
  }

  // 如果有关联资产但资产不存在，需要同步
  if (character.assetId) {
    const asset = await assetsApi.fetchAssetById(character.assetId)
    if (!asset) {
      return true
    }

    // 检查更新时间是否一致
    if (new Date(character.updatedAt) > new Date(asset.updatedAt)) {
      return true
    }
  }

  return false
}

/**
 * 获取角色的同步状态
 */
export function getCharacterSyncStatus(character: Character): {
  synced: boolean
  assetId?: string
  needsSync: boolean
} {
  return {
    synced: character.syncedToAsset,
    assetId: character.assetId,
    needsSync: !character.syncedToAsset,
  }
}

/**
 * 批量同步项目角色到资产库
 */
export async function syncProjectCharactersToAssetsAsync(projectId: string): Promise<{
  total: number
  synced: number
  failed: number
}> {
  const characterStore = useCharacterStore.getState()
  const characters = characterStore.getCharactersByProject(projectId)

  let synced = 0
  let failed = 0

  for (const character of characters) {
    try {
      await syncCharacterToAssetAsync(character)
      synced++
    } catch {
      failed++
    }
  }

  return {
    total: characters.length,
    synced,
    failed,
  }
}
