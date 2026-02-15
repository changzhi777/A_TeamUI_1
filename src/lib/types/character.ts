/**
 * character
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Design Types
 * 角色设计相关类型定义
 */

/**
 * 固定视角类型
 */
export type FixedViewType = 'front' | 'side' | 'back' | 'threeQuarter'

/**
 * 视角类型（固定 + 自定义）
 * 固定视角使用预定义的键名，自定义视角使用 'custom:' 前缀 + 唯一 ID
 */
export type ViewType = FixedViewType | `custom:${string}`

/**
 * 自定义视角
 */
export interface CustomView {
  /** 唯一标识符 */
  id: string
  /** 自定义名称 */
  name: string
  /** 视角图片 */
  image?: CharacterImage
}

/**
 * 固定视角类型中文名称
 */
export const FIXED_VIEW_TYPE_LABELS: Record<FixedViewType, string> = {
  front: '正面',
  side: '侧面',
  back: '背面',
  threeQuarter: '3/4视角',
}

/**
 * 视角类型中文名称（兼容旧代码）
 * @deprecated 使用 getViewTypeLabel 函数替代
 */
export const VIEW_TYPE_LABELS: Record<FixedViewType, string> = FIXED_VIEW_TYPE_LABELS

/**
 * 获取视角的显示标签
 * @param viewType 视角类型
 * @param customViews 自定义视角列表（可选）
 * @returns 显示标签
 */
export function getViewTypeLabel(viewType: ViewType, customViews?: CustomView[]): string {
  // 固定视角
  if (viewType in FIXED_VIEW_TYPE_LABELS) {
    return FIXED_VIEW_TYPE_LABELS[viewType as FixedViewType]
  }
  // 自定义视角
  if (viewType.startsWith('custom:')) {
    const customId = viewType.slice(7)
    const customView = customViews?.find((v) => v.id === customId)
    return customView?.name || '自定义视角'
  }
  return '未知视角'
}

/**
 * 检查是否为固定视角
 */
export function isFixedViewType(viewType: string): viewType is FixedViewType {
  return viewType in FIXED_VIEW_TYPE_LABELS
}

/**
 * 检查是否为自定义视角
 */
export function isCustomViewType(viewType: string): viewType is `custom:${string}` {
  return viewType.startsWith('custom:')
}

/**
 * 从视角类型获取自定义视角 ID
 */
export function getCustomViewId(viewType: ViewType): string | null {
  if (isCustomViewType(viewType)) {
    return viewType.slice(7)
  }
  return null
}

/**
 * 创建自定义视角类型键
 */
export function createCustomViewType(id: string): `custom:${string}` {
  return `custom:${id}`
}

/**
 * 自定义视角最大数量
 */
export const MAX_CUSTOM_VIEWS = 10

/**
 * 角色属性中文名称
 */
export const ATTRIBUTE_LABELS_ZH: Record<string, string> = {
  age: '年龄',
  gender: '性别',
  height: '身高',
  occupation: '职业',
  hairColor: '发色',
  eyeColor: '瞳色',
  bodyType: '体型',
  // 支持扩展
}

/**
 * 角色图片
 */
export interface CharacterImage {
  url: string
  prompt: string
  generatedAt: string
}

/**
 * 服装变体
 */
export interface CostumeVariant {
  id: string
  name: string
  description: string
  imageUrl: string
  prompt: string
  generatedAt: string
}

/**
 * 角色语音配置
 */
export interface CharacterVoice {
  style: string
  sampleUrl?: string
  sampleText?: string
}

/**
 * 角色属性
 */
export interface CharacterAttributes {
  age?: string
  gender?: string
  height?: string
  occupation?: string
  hairColor?: string
  eyeColor?: string
  bodyType?: string
  [key: string]: string | undefined
}

/**
 * 角色接口
 */
export interface Character {
  id: string
  code: string // 角色编号，如 PROJ-001-CHAR-001 或 GLOBAL-CHAR-001
  name: string
  description: string
  personality: string
  attributes: CharacterAttributes
  tags: string[]
  basePrompt: string
  /** 人物风格（动漫/吉卜力/电影级真人） */
  style?: CharacterStyle
  views: {
    front?: CharacterImage
    side?: CharacterImage
    back?: CharacterImage
    threeQuarter?: CharacterImage
    [key: `custom:${string}`]: CharacterImage | undefined
  }
  /** 自定义视角定义列表 */
  customViews: CustomView[]
  costumes: CostumeVariant[]
  voice?: CharacterVoice
  projectId?: string
  assetId?: string // 关联的资产ID，用于双向同步
  syncedToAsset: boolean // 是否已同步到资产库
  createdAt: string
  updatedAt: string
}

/**
 * 创建角色参数
 */
export interface CreateCharacterParams {
  name: string
  description?: string
  personality?: string
  attributes?: CharacterAttributes
  tags?: string[]
  basePrompt?: string
  projectId?: string
}

/**
 * 更新角色参数
 */
export interface UpdateCharacterParams {
  name?: string
  description?: string
  personality?: string
  attributes?: Partial<CharacterAttributes>
  tags?: string[]
  basePrompt?: string
  style?: CharacterStyle
}

/**
 * 生成图片参数
 */
export interface GenerateImageParams {
  characterId: string
  viewType: ViewType
  customPrompt?: string
}

/**
 * 生成服装参数
 */
export interface GenerateCostumeParams {
  characterId: string
  name: string
  description: string
}

/**
 * 生成语音参数
 */
export interface GenerateVoiceParams {
  characterId: string
  text: string
  style?: string
}

/**
 * 语音风格选项
 */
export interface VoiceStyle {
  id: string
  name: string
  description: string
}

/**
 * 预设语音风格
 */
export const VOICE_STYLES: VoiceStyle[] = [
  { id: 'alloy', name: '沉稳男声', description: '成熟稳重的男性声音' },
  { id: 'echo', name: '温柔男声', description: '温和亲切的男性声音' },
  { id: 'fable', name: '磁性男声', description: '富有磁性的男性声音' },
  { id: 'onyx', name: '深沉男声', description: '低沉有力的男性声音' },
  { id: 'nova', name: '活力女声', description: '充满活力的女性声音' },
  { id: 'shimmer', name: '温柔女声', description: '柔和温婉的女性声音' },
]

// ==================== API 配置类型 ====================

/**
 * API 服务提供商
 */
export type APIProvider = 'zhipu' | 'openai' | 'custom'

/**
 * 文本 API 配置
 */
export interface TextAPIConfig {
  provider: APIProvider
  apiKey: string
  model: string
  baseUrl?: string
  enableThinking?: boolean
}

/**
 * 预设文本模型
 */
export const TEXT_MODELS = {
  zhipu: [
    { id: 'glm-4.7-flash', name: 'GLM-4.7-Flash', description: '30B级SOTA模型，支持Agentic Coding' },
    { id: 'glm-4-flash', name: 'GLM-4-Flash', description: '智谱快速响应模型' },
    { id: 'glm-4-plus', name: 'GLM-4-Plus', description: '智谱高级模型' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI最新多模态模型' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI快速模型' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'OpenAI经济型模型' },
  ],
} as const

/**
 * 图片分辨率选项
 */
export interface ImageResolution {
  id: string
  width: number
  height: number
  label: string
  aspectRatio: string
}

/**
 * 预设图片分辨率
 */
export const IMAGE_RESOLUTIONS: ImageResolution[] = [
  { id: '1280x1280', width: 1280, height: 1280, label: '1280×1280', aspectRatio: '1:1' },
  { id: '1568x1056', width: 1568, height: 1056, label: '1568×1056', aspectRatio: '3:4' },
  { id: '1056x1568', width: 1056, height: 1568, label: '1056×1568', aspectRatio: '4:3' },
  { id: '1472x1088', width: 1472, height: 1088, label: '1472×1088', aspectRatio: '4:3' },
  { id: '1088x1472', width: 1088, height: 1472, label: '1088×1472', aspectRatio: '3:4' },
  { id: '1728x960', width: 1728, height: 960, label: '1728×960', aspectRatio: '16:9' },
  { id: '960x1728', width: 960, height: 1728, label: '960×1728', aspectRatio: '9:16' },
]

/**
 * 文生图 API 配置
 */
export interface ImageAPIConfig {
  provider: APIProvider
  apiKey: string
  model: string
  baseUrl?: string
  defaultResolution: string
  customResolution?: {
    width: number
    height: number
  }
}

/**
 * 预设文生图模型
 */
export const IMAGE_MODELS = {
  zhipu: [
    { id: 'glm-image', name: 'GLM-Image', description: '智谱旗舰图像生成模型' },
    { id: 'cogviewx', name: 'CogViewX', description: '智谱文生图模型' },
    { id: 'cogview-3', name: 'CogView-3', description: '智谱 CogView-3' },
  ],
  openai: [
    { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI最新图像生成' },
    { id: 'dall-e-2', name: 'DALL-E 2', description: 'OpenAI图像生成' },
  ],
} as const

/**
 * GLM-TTS 音色选项
 */
export interface GLMTTSVoice {
  id: string
  name: string
  gender: 'male' | 'female'
}

/**
 * GLM-TTS 预设音色
 */
export const GLM_TTS_VOICES: GLMTTSVoice[] = [
  { id: 'tongtong', name: '彤彤', gender: 'female' },
  { id: 'xiaochen', name: '小陈', gender: 'male' },
  { id: 'chuichui', name: '锤锤', gender: 'male' },
  { id: 'jam', name: 'jam', gender: 'male' },
  { id: 'kazi', name: 'kazi', gender: 'male' },
  { id: 'douji', name: 'douji', gender: 'male' },
  { id: 'luodo', name: 'luodo', gender: 'male' },
]

/**
 * 语音 API 配置
 */
export interface VoiceAPIConfig {
  provider: APIProvider
  apiKey: string
  model: string
  baseUrl?: string
  defaultVoice?: string
  speed?: number
  volume?: number
  responseFormat?: 'wav' | 'pcm' | 'mp3'
}

/**
 * 预设语音模型
 */
export const VOICE_MODELS = {
  zhipu: [
    { id: 'glm-tts', name: 'GLM-TTS', description: '智谱超拟人语音合成' },
    { id: 'glm-tts-clone', name: 'GLM-TTS-Clone', description: '智谱声音克隆TTS' },
    { id: 'tts-1', name: 'TTS-1', description: '智谱标准TTS' },
    { id: 'tts-1-hd', name: 'TTS-1-HD', description: '智谱高清TTS' },
  ],
  openai: [
    { id: 'tts-1', name: 'TTS-1', description: 'OpenAI标准TTS' },
    { id: 'tts-1-hd', name: 'TTS-1-HD', description: 'OpenAI高清TTS' },
  ],
} as const

/**
 * API 管理配置（聚合类型）
 */
export interface APIManagementConfig {
  text: TextAPIConfig
  image: ImageAPIConfig
  voice: VoiceAPIConfig
}

/**
 * 默认 API 配置
 */
export const DEFAULT_API_CONFIG: APIManagementConfig = {
  text: {
    provider: 'zhipu',
    apiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
    model: 'glm-4.7-flash',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    enableThinking: false,
  },
  image: {
    provider: 'zhipu',
    apiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
    model: 'glm-image',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultResolution: '1280x1280',
  },
  voice: {
    provider: 'zhipu',
    apiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
    model: 'glm-tts',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultVoice: 'tongtong',
    speed: 1.0,
    volume: 1.0,
    responseFormat: 'wav',
  },
}

/**
 * API 配置存储键
 */
export const API_CONFIG_STORAGE_KEY = 'api-management-config'

// ==================== 兼容旧类型（逐步迁移） ====================

/**
 * AI 设置（兼容旧版）
 * @deprecated 使用 APIManagementConfig 替代
 */
export interface AISettings {
  imageApiKey: string
  ttsApiKey: string
  imageModel: string
  ttsModel: string
  baseUrl?: string
}

/**
 * 默认 AI 设置（兼容旧版）
 * @deprecated 使用 DEFAULT_API_CONFIG 替代
 */
export const DEFAULT_AI_SETTINGS: AISettings = {
  imageApiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
  ttsApiKey: 'e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg',
  imageModel: 'glm-image',
  ttsModel: 'glm-tts-clone',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
}

/**
 * AI 设置存储键（兼容旧版）
 * @deprecated 使用 API_CONFIG_STORAGE_KEY 替代
 */
export const AI_SETTINGS_STORAGE_KEY = 'ai-settings'

/**
 * 图片生成状态
 */
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error'

/**
 * 生成任务
 */
export interface GenerationTask {
  id: string
  characterId: string
  type: 'image' | 'costume' | 'voice'
  status: GenerationStatus
  progress: number
  error?: string
  result?: string
}

// ==================== 人物风格类型 ====================

/**
 * 人物风格类型
 * 用于文生图时添加风格提示词
 */
export type CharacterStyle = 'anime' | 'ghibli' | 'cinematic'

/**
 * 人物风格选项
 */
export interface CharacterStyleOption {
  id: CharacterStyle
  name: string
  nameEn: string
  promptKeywords: string
  description: string
}

/**
 * 人物风格预设
 * 每种风格对应的英文提示词
 */
export const CHARACTER_STYLES: CharacterStyleOption[] = [
  {
    id: 'anime',
    name: '动漫人物',
    nameEn: 'Anime Style',
    promptKeywords: 'anime style, anime art, Japanese animation style, vibrant colors, expressive features, cel shading',
    description: '日系动漫风格，色彩鲜明，线条流畅',
  },
  {
    id: 'ghibli',
    name: '吉卜力风格',
    nameEn: 'Studio Ghibli Style',
    promptKeywords: 'Studio Ghibli style, Miyazaki art style, hand-drawn animation, watercolor background, whimsical atmosphere, soft lighting, detailed nature',
    description: '宫崎骏吉卜力工作室风格，温暖治愈',
  },
  {
    id: 'cinematic',
    name: '电影级真人',
    nameEn: 'Cinematic Realistic',
    promptKeywords: 'cinematic, photorealistic, hyper-realistic, film photography, dramatic lighting, 8K resolution, professional photography, depth of field',
    description: '电影级写实风格，光影质感逼真',
  },
]

/**
 * 获取风格提示词
 * @param style 风格ID
 * @returns 风格关键词，如果未找到则返回空字符串
 */
export function getStylePrompt(style?: CharacterStyle): string {
  if (!style) return ''
  const styleOption = CHARACTER_STYLES.find((s) => s.id === style)
  return styleOption?.promptKeywords || ''
}

/**
 * 获取风格选项
 * @param style 风格ID
 * @returns 风格选项，如果未找到则返回 undefined
 */
export function getStyleOption(style?: CharacterStyle): CharacterStyleOption | undefined {
  if (!style) return undefined
  return CHARACTER_STYLES.find((s) => s.id === style)
}

// ==================== 六维角色模板类型 ====================

/**
 * 六维角色模板
 * 用于生成完整的角色描述提示词
 */
export interface SixDimensionTemplate {
  /** 外貌特征：身高、体型、发色、瞳色、穿着风格等 */
  appearance: string
  /** 性格特点：性格、情绪表达、行为倾向等 */
  personality: string
  /** 背景故事：出身、经历、职业背景等 */
  background: string
  /** 行为习惯：说话方式、肢体语言、习惯动作等 */
  behavior: string
  /** 语言风格：口头禅、用词习惯、语速语调等 */
  speechStyle: string
  /** 人际关系：家庭、朋友、社交圈等 */
  relationships: string
}

/**
 * 六维模板字段定义
 */
export const SIX_DIMENSION_FIELDS: Array<{
  key: keyof SixDimensionTemplate
  label: string
  description: string
  placeholder: string
}> = [
  {
    key: 'appearance',
    label: '外貌特征',
    description: '描述角色的外貌，包括身高、体型、发色、瞳色、穿着风格等',
    placeholder: '例如：25岁女性，身高168cm，身材苗条，黑色长直发，棕色眼睛，穿着简约时尚...',
  },
  {
    key: 'personality',
    label: '性格特点',
    description: '描述角色的性格特点，如外向/内向、情绪表达方式等',
    placeholder: '例如：性格开朗活泼，善于交际，有时有些冲动，但心地善良...',
  },
  {
    key: 'background',
    label: '背景故事',
    description: '描述角色的出身背景、成长经历、职业等',
    placeholder: '例如：出生于普通家庭，大学毕业后进入广告公司工作，梦想是成为创意总监...',
  },
  {
    key: 'behavior',
    label: '行为习惯',
    description: '描述角色的行为特点，如肢体语言、习惯动作等',
    placeholder: '例如：思考时喜欢咬嘴唇，紧张时会整理头发，走路带风...',
  },
  {
    key: 'speechStyle',
    label: '语言风格',
    description: '描述角色的说话方式，如口头禅、用词习惯等',
    placeholder: '例如：说话语速较快，喜欢用网络流行语，经常说"这个嘛"作为开头...',
  },
  {
    key: 'relationships',
    label: '人际关系',
    description: '描述角色的社交关系，如家人、朋友、同事等',
    placeholder: '例如：有一个哥哥关系很好，在公司有几个要好的同事，单身未婚...',
  },
]
