/**
 * template
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { StoryboardShot, ShotSize, CameraMovement, CustomFieldValue } from '@/stores'


// 读取文件为文本
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsText(file, 'UTF-8')
  })
}

export interface ParsedShot {
  shotNumber: number
  seasonNumber?: number
  episodeNumber?: number
  sceneNumber: string
  shotSize: string
  cameraMovement: string
  duration: number
  description?: string
  dialogue?: string
  sound?: string
  customFields?: Record<string, CustomFieldValue>
}

export interface ImportResult {
  success: boolean
  data?: ParsedShot[]
  errors: string[]
  warnings: string[]
  rowCount: number
  encoding: string
  // Raw data with original column names for field mapping step
  rawColumns?: string[]
  rawData?: Record<string, string>[]
}

// 列名映射
const FIELD_MAPPING: Record<string, string> = {
  '镜头编号': 'shotNumber',
  '季数': 'seasonNumber',
  '集数': 'episodeNumber',
  '场次': 'sceneNumber',
  '景别': 'shotSize',
  '运镜方式': 'cameraMovement',
  '时长': 'duration',
  '时长(秒)': 'duration',
  '画面描述': 'description',
  '对白/旁白': 'dialogue',
  '音效说明': 'sound',
  '音效/配乐': 'sound',
  // 英文字段名
  'shot number': 'shotNumber',
  'season': 'seasonNumber',
  'episode': 'episodeNumber',
  'scene': 'sceneNumber',
  'shot size': 'shotSize',
  'camera movement': 'cameraMovement',
  'duration': 'duration',
  'description': 'description',
  'dialogue': 'dialogue',
  'sound': 'sound',
}

// 反向映射景别标签
const SHOT_SIZE_REVERSE: Record<string, string> = {
  '远景': 'extremeLong',
  '全景': 'long',
  '中景': 'medium',
  '近景': 'closeUp',
  '特写': 'extremeCloseUp',
}

// 反向映射运镜方式标签
const MOVEMENT_REVERSE: Record<string, string> = {
  '固定': 'static',
  '摇': 'pan',
  '俯仰': 'tilt',
  '推拉': 'dolly',
  '平移': 'truck',
  '升降': 'pedestral',
  '吊臂': 'crane',
  '手持': 'handheld',
  '斯坦尼康': 'steadicam',
  '跟拍': 'tracking',
  '弧形': 'arc',
}

// 解析 CSV 文件
export async function parseCSVFile(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    errors: [],
    warnings: [],
    rowCount: 0,
    encoding: 'UTF-8',
  }

  try {
    const text = await readFileAsText(file)
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      result.errors.push('文件内容为空或格式不正确')
      return result
    }

    // 解析列标题 - 保存原始列名
    const headers = parseCSVLine(lines[0])
    result.rawColumns = headers

    const columnMapping = mapColumns(headers)

    if (columnMapping.shotNumber === null || columnMapping.sceneNumber === null) {
      result.errors.push('缺少必需的列：镜头编号、场次')
      return result
    }

    // 解析数据行
    const data: ParsedShot[] = []
    const rawData: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        if (values.length === 0) continue

        // 保存原始行数据
        const rawRow: Record<string, string> = {}
        headers.forEach((header, index) => {
          rawRow[header] = values[index] || ''
        })
        rawData.push(rawRow)

        const shot = parseShotRow(values, columnMapping, i + 1)
        if (shot) {
          data.push(shot)
        }
      } catch (error) {
        result.errors.push(`第 ${i + 1} 行解析失败: ${(error as Error).message}`)
      }
    }

    result.data = data
    result.rawData = rawData
    result.rowCount = data.length
    result.success = true

    // 检测编码（简单判断）
    if (/[\u4e00-\u9fa5]/.test(text)) {
      result.encoding = 'UTF-8'
    }

    return result
  } catch (error) {
    result.errors.push(`文件读取失败: ${(error as Error).message}`)
    return result
  }
}

// 解析 CSV 行（处理引号）
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// 映射列名到系统字段
function mapColumns(headers: string[]): Record<string, number | null> {
  const mapping: Record<string, number | null> = {
    shotNumber: null,
    seasonNumber: null,
    episodeNumber: null,
    sceneNumber: null,
    shotSize: null,
    cameraMovement: null,
    duration: null,
    description: null,
    dialogue: null,
    sound: null,
  }

  headers.forEach((header, index) => {
    const trimmedHeader = header.trim()
    // 首先尝试直接匹配（包括中文）
    let key = FIELD_MAPPING[trimmedHeader]
    // 如果没有匹配到，尝试小写匹配（用于英文）
    if (!key) {
      key = FIELD_MAPPING[trimmedHeader.toLowerCase()]
    }
    if (key && mapping.hasOwnProperty(key)) {
      mapping[key] = index
    }
  })
  return mapping
}

// 解析单行数据为分镜头对象
function parseShotRow(
  values: string[],
  mapping: Record<string, number | null>,
  rowNumber: number
): ParsedShot | null {
  const shot: any = {}

  Object.entries(mapping).forEach(([field, index]) => {
    if (index === null) return

    const value = values[index] || ''
    const cleanValue = value.trim().replace(/^"|"$/g, '').replace(/""/g, '"')

    switch (field) {
      case 'shotNumber':
        shot.shotNumber = parseInt(cleanValue) || rowNumber
        break
      case 'seasonNumber':
        shot.seasonNumber = cleanValue ? parseInt(cleanValue) : undefined
        break
      case 'episodeNumber':
        shot.episodeNumber = cleanValue ? parseInt(cleanValue) : undefined
        break
      case 'sceneNumber':
        shot.sceneNumber = cleanValue
        break
      case 'shotSize':
        shot.shotSize = SHOT_SIZE_REVERSE[cleanValue] || cleanValue
        break
      case 'cameraMovement':
        shot.cameraMovement = MOVEMENT_REVERSE[cleanValue] || cleanValue
        break
      case 'duration':
        // 处理 "5:30" 或 "5" 格式
        if (cleanValue.includes(':')) {
          const parts = cleanValue.split(':')
          shot.duration = parseInt(parts[0]) * 60 + parseInt(parts[1])
        } else {
          shot.duration = parseInt(cleanValue) || 5
        }
        break
      default:
        shot[field] = cleanValue
    }
  })

  return shot as ParsedShot
}

// 解析 JSON 模板文件
export async function parseJSONTemplate(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    errors: [],
    warnings: [],
    rowCount: 0,
    encoding: 'UTF-8',
  }

  try {
    const text = await file.text()

    // 尝试解析 JSON
    let data: any
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      const error = parseError as Error
      // 提取更详细的错误信息
      const match = error.message.match(/position (\d+)/)
      const position = match ? `位置 ${match[1]}` : ''
      result.errors.push(`JSON 格式错误 (${position})：${error.message.replace(/at position \d+/, '').trim()}`)
      return result
    }

    // 验证是否为有效的向导文件
    if (!data || typeof data !== 'object') {
      result.errors.push('文件内容不是有效的 JSON 对象')
      return result
    }

    if (data.type !== 'storyboard-template') {
      result.errors.push(`不是有效的分镜头向导文件（type: ${data.type || '空'}，应为 storyboard-template）`)
      return result
    }

    if (!data.shots) {
      result.errors.push('模板文件缺少 shots 字段')
      return result
    }

    if (!Array.isArray(data.shots)) {
      result.errors.push(`shots 字段类型错误（应为数组，实际类型: ${typeof data.shots}）`)
      return result
    }

    if (data.shots.length === 0) {
      result.warnings.push('模板文件中没有包含任何分镜头数据')
    }

    result.data = data.shots
    result.rowCount = data.shots.length
    result.success = true

    // For JSON templates, extract columns from the first shot
    if (data.shots.length > 0) {
      const firstShot = data.shots[0]
      result.rawColumns = Object.keys(firstShot)
      result.rawData = data.shots
    }

    return result
  } catch (error) {
    result.errors.push(`文件读取失败: ${(error as Error).message}`)
    return result
  }
}

// 验证导入数据
export function validateImportData(data: ParsedShot[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  data.forEach((shot, index) => {
    const row = index + 1

    // 必填字段验证
    if (!shot.sceneNumber) {
      errors.push(`第 ${row} 行：场次不能为空`)
    }
    if (!shot.shotSize) {
      errors.push(`第 ${row} 行：景别不能为空`)
    }
    if (!shot.cameraMovement) {
      errors.push(`第 ${row} 行：运镜方式不能为空`)
    }
    if (!shot.duration || shot.duration <= 0) {
      errors.push(`第 ${row} 行：时长必须大于 0`)
    }

    // 枚举值验证
    const validSizes = Object.keys(SHOT_SIZE_REVERSE)
    if (!validSizes.includes(shot.shotSize)) {
      warnings.push(`第 ${row} 行：景别 "${shot.shotSize}" 不在标准值中`)
    }

    const validMovements = Object.keys(MOVEMENT_REVERSE)
    if (!validMovements.includes(shot.cameraMovement)) {
      warnings.push(`第 ${row} 行：运镜方式 "${shot.cameraMovement}" 不在标准值中`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// 验证景别值是否有效
function validateShotSize(value: string): ShotSize {
  const validSizes: ShotSize[] = ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp']
  if (validSizes.includes(value as ShotSize)) {
    return value as ShotSize
  }
  // 如果是中文标签，转换为对应的英文值
  const SHOT_SIZE_LABELS: Record<string, ShotSize> = {
    '远景': 'extremeLong',
    '全景': 'long',
    '中景': 'medium',
    '近景': 'closeUp',
    '特写': 'extremeCloseUp',
  }
  return SHOT_SIZE_LABELS[value] || 'medium'
}

// 验证运镜方式值是否有效
function validateCameraMovement(value: string): CameraMovement {
  const validMovements: CameraMovement[] = ['static', 'pan', 'tilt', 'dolly', 'truck', 'pedestral', 'crane', 'handheld', 'steadicam', 'tracking', 'arc']
  if (validMovements.includes(value as CameraMovement)) {
    return value as CameraMovement
  }
  // 如果是中文标签，转换为对应的英文值
  const MOVEMENT_LABELS: Record<string, CameraMovement> = {
    '固定': 'static',
    '摇': 'pan',
    '俯仰': 'tilt',
    '推拉': 'dolly',
    '平移': 'truck',
    '升降': 'pedestral',
    '吊臂': 'crane',
    '手持': 'handheld',
    '斯坦尼康': 'steadicam',
    '跟拍': 'tracking',
    '弧形': 'arc',
  }
  return MOVEMENT_LABELS[value] || 'static'
}

// 将 ParsedShot 转换为 StoryboardShot
export function convertToStoryboardShot(
  parsed: ParsedShot,
  projectId: string,
  shotNumber?: number
): StoryboardShot {
  const now = new Date().toISOString()
  return {
    id: `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    shotNumber: shotNumber || parsed.shotNumber,
    seasonNumber: parsed.seasonNumber,
    episodeNumber: parsed.episodeNumber,
    sceneNumber: parsed.sceneNumber,
    shotSize: validateShotSize(parsed.shotSize),
    cameraMovement: validateCameraMovement(parsed.cameraMovement),
    duration: parsed.duration,
    description: parsed.description || '',
    dialogue: parsed.dialogue || '',
    sound: parsed.sound || '',
    customFields: parsed.customFields,
    createdAt: now,
    updatedAt: now,
    createdBy: 'import',
  }
}
