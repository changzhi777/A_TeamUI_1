/**
 * asset-mock
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Mock Service
 * 资产模拟数据服务
 *
 * 提供本地模拟数据，支持 localStorage 持久化
 */

import type {
  Asset,
  AssetType,
  AssetSource,
  AssetScope,
  AssetStats,
  AssetUsageDetails,
  AssetBatchResult,
  AssetReference,
} from '../types/assets'

const STORAGE_KEY = 'asset-mock-data'

// ============================================================
// 数据生成配置
// ============================================================

interface MockDataConfig {
  totalCount: number
  typeDistribution: Partial<Record<AssetType, number>>
  timeRange: {
    start: Date
    end: Date
  }
}

const DEFAULT_CONFIG: MockDataConfig = {
  totalCount: 60,
  typeDistribution: {
    image: 30,
    audio: 10,
    video: 8,
    script: 8,
    aiGenerated: 4,
  },
  timeRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 天前
    end: new Date(),
  },
}

// ============================================================
// 模拟数据模板
// ============================================================

// 场景背景图
const SCENE_BACKGROUNDS = [
  { name: '城市夜景-霓虹灯街道', tags: ['城市', '夜景', '现代'] },
  { name: '咖啡馆内部-温馨氛围', tags: ['室内', '咖啡馆', '现代'] },
  { name: '海边日落-浪漫场景', tags: ['海边', '日落', '浪漫'] },
  { name: '办公室-现代简约', tags: ['室内', '办公室', '现代'] },
  { name: '古装庭院-江南水乡', tags: ['古装', '庭院', '江南'] },
  { name: '现代公寓-客厅', tags: ['室内', '公寓', '现代'] },
  { name: '校园操场-青春气息', tags: ['校园', '室外', '青春'] },
  { name: '医院走廊-医疗场景', tags: ['医院', '室内', '现代'] },
  { name: '餐厅包间-商务氛围', tags: ['餐厅', '室内', '商务'] },
  { name: '山顶日出-壮丽风景', tags: ['山顶', '日出', '自然'] },
]

// 角色设计图
const CHARACTER_DESIGNS = [
  { name: '女主角-职场白领造型', tags: ['角色', '女主角', '现代'] },
  { name: '男主角-商务精英造型', tags: ['角色', '男主角', '现代'] },
  { name: '女配角-闺蜜造型', tags: ['角色', '女配角', '现代'] },
  { name: '男配角-暖男造型', tags: ['角色', '男配角', '现代'] },
  { name: '古装女主-宫廷贵妃', tags: ['角色', '女主角', '古装'] },
  { name: '古装男主-将军铠甲', tags: ['角色', '男主角', '古装'] },
  { name: '反派角色-阴险表情', tags: ['角色', '反派', '现代'] },
  { name: '老人角色-慈祥奶奶', tags: ['角色', '配角', '家庭'] },
]

// 道具设计图
const PROP_DESIGNS = [
  { name: '古董怀表-特写道具', tags: ['道具', '特写', '古装'] },
  { name: '手机-现代通讯工具', tags: ['道具', '手机', '现代'] },
  { name: '情书-手写信件', tags: ['道具', '情书', '浪漫'] },
  { name: '订婚戒指-珠宝首饰', tags: ['道具', '戒指', '浪漫'] },
  { name: '古装佩剑-武侠道具', tags: ['道具', '佩剑', '古装'] },
  { name: '笔记本电脑-办公设备', tags: ['道具', '电脑', '现代'] },
]

// AI 生成场景
const AI_GENERATED_SCENES = [
  { name: 'AI生成-未来城市街景', prompt: 'Futuristic city street at night, neon lights, cyberpunk style', tags: ['AI生成', '科幻', '城市'] },
  { name: 'AI生成-梦幻森林场景', prompt: 'Magical forest with glowing flowers, fantasy style', tags: ['AI生成', '奇幻', '自然'] },
  { name: 'AI生成-古装宫殿内景', prompt: 'Ancient Chinese palace interior, traditional style', tags: ['AI生成', '古装', '宫殿'] },
  { name: 'AI生成-现代都市天际线', prompt: 'Modern city skyline at sunset, realistic', tags: ['AI生成', '城市', '现代'] },
]

// 背景音乐
const BACKGROUND_MUSIC = [
  { name: '背景音乐-轻柔钢琴曲', duration: 180, tags: ['背景音乐', '钢琴', '舒缓'] },
  { name: '背景音乐-浪漫弦乐', duration: 210, tags: ['背景音乐', '弦乐', '浪漫'] },
  { name: '背景音乐-紧张悬疑', duration: 120, tags: ['背景音乐', '悬疑', '紧张'] },
  { name: '背景音乐-欢快节奏', duration: 150, tags: ['背景音乐', '欢快', '节奏'] },
]

// 环境音效
const AMBIENT_SOUNDS = [
  { name: '环境音-城市交通', duration: 60, tags: ['环境音', '城市', '交通'] },
  { name: '环境音-咖啡馆人声', duration: 90, tags: ['环境音', '咖啡馆', '人声'] },
  { name: '环境音-海边浪涛', duration: 120, tags: ['环境音', '海边', '自然'] },
  { name: '环境音-森林鸟鸣', duration: 80, tags: ['环境音', '森林', '自然'] },
]

// 配音片段
const VOICE_CLIPS = [
  { name: '配音-女主内心独白', duration: 30, tags: ['配音', '女主角', '独白'] },
  { name: '配音-男主告白台词', duration: 45, tags: ['配音', '男主角', '告白'] },
  { name: '配音-旁白解说', duration: 60, tags: ['配音', '旁白', '解说'] },
]

// 视频素材
const VIDEO_CLIPS = [
  { name: '片头动画-公司Logo', duration: 5, tags: ['片头', 'Logo', '动画'] },
  { name: '转场效果-淡入淡出', duration: 2, tags: ['转场', '效果', '通用'] },
  { name: '转场效果-滑动切换', duration: 1, tags: ['转场', '效果', '滑动'] },
  { name: '空镜素材-城市延时', duration: 15, tags: ['空镜', '城市', '延时'] },
  { name: '空镜素材-云朵流动', duration: 20, tags: ['空镜', '自然', '延时'] },
  { name: '片尾-演职员表', duration: 10, tags: ['片尾', '演职员表', '通用'] },
]

// 剧本文档
const SCRIPT_DOCUMENTS = [
  { name: '剧本大纲-第一集', content: '# 第一集大纲\n\n## 故事梗概\n\n女主角林小雨是一名职场新人...', tags: ['剧本', '大纲', '第一集'] },
  { name: '剧本大纲-第二集', content: '# 第二集大纲\n\n## 故事梗概\n\n林小雨遇到了男主角...', tags: ['剧本', '大纲', '第二集'] },
  { name: '角色设定-女主角林小雨', content: '# 角色设定：林小雨\n\n- 年龄：25岁\n- 职业：市场部助理...', tags: ['角色设定', '女主角', '详细'] },
  { name: '角色设定-男主角陈默', content: '# 角色设定：陈默\n\n- 年龄：28岁\n- 职业：技术总监...', tags: ['角色设定', '男主角', '详细'] },
  { name: '分镜脚本-第一场', content: '# 第一场分镜\n\n## 场景1：公司大堂\n\n- 镜头1：全景...', tags: ['分镜', '脚本', '第一场'] },
  { name: '分镜脚本-第二场', content: '# 第二场分镜\n\n## 场景2：办公室\n\n- 镜头1：中景...', tags: ['分镜', '脚本', '第二场'] },
]

// ============================================================
// 工具函数
// ============================================================

function generateId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function randomDate(start: Date, end: Date): string {
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(timestamp).toISOString()
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// ============================================================
// 资产生成器
// ============================================================

function generateImageAsset(
  template: { name: string; tags: string[] },
  config: MockDataConfig,
  source: AssetSource = 'upload'
): Asset {
  const now = randomDate(config.timeRange.start, config.timeRange.end)
  const isAi = source === 'ai'
  const seed = randomInt(1, 1000)

  return {
    id: generateId(),
    name: template.name + (template.name.endsWith('.jpg') || template.name.endsWith('.png') ? '' : '.jpg'),
    type: isAi ? 'aiGenerated' : 'image',
    source,
    scope: Math.random() > 0.3 ? 'global' : 'project',
    projectId: Math.random() > 0.3 ? undefined : 'proj-demo-001',
    url: `https://picsum.photos/seed/${seed}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/${seed}/200/150`,
    fileSize: randomInt(100000, 10000000),
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
    tags: [...template.tags],
    description: `${template.name}，用于短剧制作`,
    aiGenerated: isAi,
    aiModel: isAi ? randomElement(['DALL-E 3', 'Midjourney', 'Stable Diffusion']) : undefined,
    aiPrompt: isAi && 'prompt' in template ? (template as any).prompt : undefined,
    uploadedBy: 'user-demo',
    uploadedByName: '演示用户',
    createdAt: now,
    updatedAt: Math.random() > 0.7 ? randomDate(new Date(now), config.timeRange.end) : now,
  }
}

function generateAudioAsset(
  template: { name: string; duration: number; tags: string[] },
  config: MockDataConfig
): Asset {
  const now = randomDate(config.timeRange.start, config.timeRange.end)

  return {
    id: generateId(),
    name: template.name + '.mp3',
    type: 'audio',
    source: 'upload',
    scope: Math.random() > 0.5 ? 'global' : 'project',
    projectId: Math.random() > 0.5 ? undefined : 'proj-demo-001',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fileSize: randomInt(1000000, 50000000),
    mimeType: 'audio/mpeg',
    duration: template.duration,
    tags: [...template.tags],
    description: `${template.name}，用于短剧配乐`,
    uploadedBy: 'user-demo',
    uploadedByName: '演示用户',
    createdAt: now,
    updatedAt: Math.random() > 0.7 ? randomDate(new Date(now), config.timeRange.end) : now,
  }
}

function generateVideoAsset(
  template: { name: string; duration: number; tags: string[] },
  config: MockDataConfig
): Asset {
  const now = randomDate(config.timeRange.start, config.timeRange.end)
  const seed = randomInt(1, 1000)

  return {
    id: generateId(),
    name: template.name + '.mp4',
    type: 'video',
    source: 'upload',
    scope: Math.random() > 0.5 ? 'global' : 'project',
    projectId: Math.random() > 0.5 ? undefined : 'proj-demo-001',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: `https://picsum.photos/seed/${seed}/200/150`,
    fileSize: randomInt(5000000, 500000000),
    mimeType: 'video/mp4',
    duration: template.duration,
    width: 1920,
    height: 1080,
    tags: [...template.tags],
    description: `${template.name}，用于短剧制作`,
    uploadedBy: 'user-demo',
    uploadedByName: '演示用户',
    createdAt: now,
    updatedAt: Math.random() > 0.7 ? randomDate(new Date(now), config.timeRange.end) : now,
  }
}

function generateScriptAsset(
  template: { name: string; content: string; tags: string[] },
  config: MockDataConfig
): Asset {
  const now = randomDate(config.timeRange.start, config.timeRange.end)
  const ext = template.name.includes('大纲') ? '.md' : '.txt'

  return {
    id: generateId(),
    name: template.name + ext,
    type: 'script',
    source: 'upload',
    scope: Math.random() > 0.5 ? 'global' : 'project',
    projectId: Math.random() > 0.5 ? undefined : 'proj-demo-001',
    url: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(template.content)))}`,
    fileSize: template.content.length,
    mimeType: ext === '.md' ? 'text/markdown' : 'text/plain',
    tags: [...template.tags],
    description: `${template.name}，短剧创作文档`,
    uploadedBy: 'user-demo',
    uploadedByName: '演示用户',
    createdAt: now,
    updatedAt: Math.random() > 0.7 ? randomDate(new Date(now), config.timeRange.end) : now,
  }
}

// ============================================================
// 主生成函数
// ============================================================

function generateMockAssets(config: MockDataConfig = DEFAULT_CONFIG): Asset[] {
  const assets: Asset[] = []

  // 生成场景背景图
  SCENE_BACKGROUNDS.forEach((template) => {
    assets.push(generateImageAsset(template, config))
  })

  // 生成角色设计图
  CHARACTER_DESIGNS.forEach((template) => {
    assets.push(generateImageAsset(template, config))
  })

  // 生成道具设计图
  PROP_DESIGNS.forEach((template) => {
    assets.push(generateImageAsset(template, config))
  })

  // 生成 AI 生成图片
  AI_GENERATED_SCENES.forEach((template) => {
    assets.push(generateImageAsset(template as any, config, 'ai'))
  })

  // 生成背景音乐
  BACKGROUND_MUSIC.forEach((template) => {
    assets.push(generateAudioAsset(template, config))
  })

  // 生成环境音效
  AMBIENT_SOUNDS.forEach((template) => {
    assets.push(generateAudioAsset(template, config))
  })

  // 生成配音片段
  VOICE_CLIPS.forEach((template) => {
    assets.push(generateAudioAsset(template, config))
  })

  // 生成视频素材
  VIDEO_CLIPS.forEach((template) => {
    assets.push(generateVideoAsset(template, config))
  })

  // 生成剧本文档
  SCRIPT_DOCUMENTS.forEach((template) => {
    assets.push(generateScriptAsset(template, config))
  })

  // 添加外部链接资产
  assets.push({
    id: generateId(),
    name: '外部素材-免费图标库',
    type: 'image',
    source: 'link',
    scope: 'global',
    url: 'https://icons8.com',
    externalUrl: 'https://icons8.com',
    fileSize: 0,
    mimeType: 'text/html',
    tags: ['外部链接', '图标', '素材'],
    description: '免费图标素材网站',
    uploadedBy: 'user-demo',
    uploadedByName: '演示用户',
    createdAt: randomDate(config.timeRange.start, config.timeRange.end),
    updatedAt: randomDate(config.timeRange.start, config.timeRange.end),
  })

  return assets
}

// ============================================================
// 存储操作
// ============================================================

function loadFromStorage(): Asset[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load assets from storage:', error)
  }
  return []
}

function saveToStorage(assets: Asset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch (error) {
    console.error('Failed to save assets to storage:', error)
  }
}

function initializeData(): Asset[] {
  let assets = loadFromStorage()
  if (assets.length === 0) {
    assets = generateMockAssets()
    saveToStorage(assets)
  }
  return assets
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// API 函数
// ============================================================

export async function fetchAssets(params?: {
  type?: string
  source?: string
  scope?: string
  projectId?: string
  tags?: string[]
  search?: string
}): Promise<Asset[]> {
  await delay()
  let assets = initializeData()

  if (params) {
    if (params.type) {
      assets = assets.filter((a) => a.type === params.type)
    }
    if (params.source) {
      assets = assets.filter((a) => a.source === params.source)
    }
    if (params.scope) {
      assets = assets.filter((a) => a.scope === params.scope)
    }
    if (params.projectId) {
      assets = assets.filter((a) => a.projectId === params.projectId)
    }
    if (params.tags && params.tags.length > 0) {
      assets = assets.filter((a) =>
        params.tags!.every((tag) => a.tags.includes(tag))
      )
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower) ||
          a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
  }

  return assets
}

export async function fetchAssetById(id: string): Promise<Asset | null> {
  await delay(100)
  const assets = initializeData()
  return assets.find((a) => a.id === id) || null
}

export async function fetchGlobalAssets(): Promise<Asset[]> {
  return fetchAssets({ scope: 'global' })
}

export async function fetchProjectAssets(projectId: string): Promise<Asset[]> {
  return fetchAssets({ projectId })
}

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
  width?: number
  height?: number
  duration?: number
}): Promise<Asset> {
  await delay(500)
  const assets = initializeData()

  const now = new Date().toISOString()
  const newAsset: Asset = {
    id: generateId(),
    name: data.name,
    type: data.type,
    source: data.source,
    scope: data.scope,
    projectId: data.projectId,
    url: data.externalUrl || (data.file ? URL.createObjectURL(data.file) : ''),
    externalUrl: data.externalUrl,
    thumbnailUrl: data.type === 'image' && data.file ? URL.createObjectURL(data.file) : undefined,
    fileSize: data.file?.size || 0,
    mimeType: data.file?.type || '',
    width: data.width,
    height: data.height,
    duration: data.duration,
    tags: data.tags || [],
    description: data.description,
    uploadedBy: 'current-user',
    uploadedByName: '当前用户',
    createdAt: now,
    updatedAt: now,
  }

  assets.push(newAsset)
  saveToStorage(assets)

  return newAsset
}

export async function updateAsset(
  id: string,
  data: Partial<Asset>
): Promise<Asset | null> {
  await delay(200)
  const assets = initializeData()
  const index = assets.findIndex((a) => a.id === id)

  if (index === -1) {
    return null
  }

  assets[index] = {
    ...assets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  saveToStorage(assets)
  return assets[index]
}

export async function deleteAsset(id: string): Promise<boolean> {
  await delay(200)
  const assets = initializeData()
  const index = assets.findIndex((a) => a.id === id)

  if (index === -1) {
    return false
  }

  assets.splice(index, 1)
  saveToStorage(assets)
  return true
}

export async function batchDeleteAssets(ids: string[]): Promise<AssetBatchResult> {
  await delay(300)
  const assets = initializeData()
  const initialCount = assets.length

  const remainingAssets = assets.filter((a) => !ids.includes(a.id))
  saveToStorage(remainingAssets)

  const deletedCount = initialCount - remainingAssets.length

  return {
    success: deletedCount,
    failed: ids.length - deletedCount,
    errors: [],
  }
}

export async function addAssetTag(
  assetId: string,
  tag: string
): Promise<Asset | null> {
  await delay(100)
  const assets = initializeData()
  const index = assets.findIndex((a) => a.id === assetId)

  if (index === -1) {
    return null
  }

  if (!assets[index].tags.includes(tag)) {
    assets[index].tags.push(tag)
    assets[index].updatedAt = new Date().toISOString()
    saveToStorage(assets)
  }

  return assets[index]
}

export async function removeAssetTag(
  assetId: string,
  tag: string
): Promise<Asset | null> {
  await delay(100)
  const assets = initializeData()
  const index = assets.findIndex((a) => a.id === assetId)

  if (index === -1) {
    return null
  }

  assets[index].tags = assets[index].tags.filter((t) => t !== tag)
  assets[index].updatedAt = new Date().toISOString()
  saveToStorage(assets)

  return assets[index]
}

export async function moveAssetToProject(
  assetId: string,
  projectId: string | null
): Promise<Asset | null> {
  await delay(200)
  const assets = initializeData()
  const index = assets.findIndex((a) => a.id === assetId)

  if (index === -1) {
    return null
  }

  assets[index].projectId = projectId || undefined
  assets[index].scope = projectId ? 'project' : 'global'
  assets[index].updatedAt = new Date().toISOString()
  saveToStorage(assets)

  return assets[index]
}

export async function batchMoveAssetsToProject(
  assetIds: string[],
  projectId: string | null
): Promise<AssetBatchResult> {
  await delay(300)
  const assets = initializeData()
  let successCount = 0

  assetIds.forEach((id) => {
    const index = assets.findIndex((a) => a.id === id)
    if (index !== -1) {
      assets[index].projectId = projectId || undefined
      assets[index].scope = projectId ? 'project' : 'global'
      assets[index].updatedAt = new Date().toISOString()
      successCount++
    }
  })

  saveToStorage(assets)

  return {
    success: successCount,
    failed: assetIds.length - successCount,
    errors: [],
  }
}

export async function copyAssetToProject(
  assetId: string,
  projectId: string
): Promise<Asset | null> {
  await delay(200)
  const assets = initializeData()
  const original = assets.find((a) => a.id === assetId)

  if (!original) {
    return null
  }

  const now = new Date().toISOString()
  const copy: Asset = {
    ...original,
    id: generateId(),
    projectId,
    scope: 'project',
    name: `${original.name} (副本)`,
    createdAt: now,
    updatedAt: now,
  }

  assets.push(copy)
  saveToStorage(assets)

  return copy
}

export async function getAssetStats(): Promise<AssetStats> {
  await delay(100)
  const assets = initializeData()
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats: AssetStats = {
    total: assets.length,
    totalSize: assets.reduce((sum, a) => sum + a.fileSize, 0),
    uploadedThisMonth: assets.filter((a) => new Date(a.createdAt) >= thisMonth).length,
    byType: {
      image: assets.filter((a) => a.type === 'image').length,
      audio: assets.filter((a) => a.type === 'audio').length,
      video: assets.filter((a) => a.type === 'video').length,
      script: assets.filter((a) => a.type === 'script').length,
      aiGenerated: assets.filter((a) => a.type === 'aiGenerated').length,
    },
    bySource: {
      upload: assets.filter((a) => a.source === 'upload').length,
      link: assets.filter((a) => a.source === 'link').length,
      ai: assets.filter((a) => a.source === 'ai').length,
      external: assets.filter((a) => a.source === 'external').length,
      storage: assets.filter((a) => a.source === 'storage').length,
    },
  }

  return stats
}

export async function getAssetUsage(id: string): Promise<AssetUsageDetails> {
  await delay(100)
  // 模拟使用情况
  const references: AssetReference[] = [
    {
      type: 'storyboardShot',
      id: 'shot-001',
      name: '镜头1-开场',
      url: '/projects/proj-demo-001/storyboard',
    },
  ]

  return {
    assetId: id,
    referenceCount: references.length,
    references,
  }
}

export async function searchAssetTags(query: string): Promise<string[]> {
  await delay(100)
  const assets = initializeData()
  const allTags = new Set<string>()

  assets.forEach((a) => {
    a.tags.forEach((tag) => allTags.add(tag))
  })

  if (!query) {
    return Array.from(allTags).slice(0, 20)
  }

  const queryLower = query.toLowerCase()
  return Array.from(allTags)
    .filter((tag) => tag.toLowerCase().includes(queryLower))
    .slice(0, 20)
}

export async function getPopularTags(): Promise<{ tag: string; count: number }[]> {
  await delay(100)
  const assets = initializeData()
  const tagCounts = new Map<string, number>()

  assets.forEach((a) => {
    a.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}

export async function exportAssetsCsv(assetIds?: string[]): Promise<string> {
  await delay(200)
  const assets = initializeData()
  const toExport = assetIds ? assets.filter((a) => assetIds.includes(a.id)) : assets

  const headers = ['ID', '名称', '类型', '来源', '范围', 'URL', '标签', '描述', '创建时间']
  const rows = toExport.map((a) => [
    a.id,
    a.name,
    a.type,
    a.source,
    a.scope,
    a.url,
    a.tags.join(';'),
    a.description || '',
    a.createdAt,
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return csv
}

export async function importAssetsCsv(csvContent: string): Promise<AssetBatchResult> {
  await delay(500)
  const lines = csvContent.split('\n').filter((line) => line.trim())

  if (lines.length < 2) {
    return {
      success: 0,
      failed: 0,
      errors: [{ id: '', error: 'CSV 文件为空或格式错误' }],
    }
  }

  const assets = initializeData()
  let successCount = 0
  const errors: Array<{ id: string; error: string }> = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].match(/(".*?"|[^,]+)/g)?.map((v) =>
        v.replace(/^"|"$/g, '').replace(/""/g, '"')
      ) || []

      if (values.length < 6) {
        errors.push({ id: `row-${i}`, error: '列数不足' })
        continue
      }

      const now = new Date().toISOString()
      const newAsset: Asset = {
        id: generateId(),
        name: values[1] || `导入资产 ${i}`,
        type: (values[2] as AssetType) || 'image',
        source: 'link',
        scope: (values[4] as AssetScope) || 'global',
        url: values[5] || '',
        externalUrl: values[5] || '',
        tags: values[6] ? values[6].split(';').filter(Boolean) : [],
        description: values[7] || '',
        fileSize: 0,
        mimeType: 'text/html',
        uploadedBy: 'current-user',
        uploadedByName: '当前用户',
        createdAt: now,
        updatedAt: now,
      }

      assets.push(newAsset)
      successCount++
    } catch (error) {
      errors.push({ id: `row-${i}`, error: `解析失败: ${error}` })
    }
  }

  saveToStorage(assets)

  return {
    success: successCount,
    failed: lines.length - 1 - successCount,
    errors,
  }
}

export function resetMockData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 强制重新生成模拟数据
 */
export function regenerateMockData(config?: MockDataConfig): Asset[] {
  const assets = generateMockAssets(config || DEFAULT_CONFIG)
  saveToStorage(assets)
  return assets
}
