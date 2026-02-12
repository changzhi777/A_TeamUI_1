import type { StoryboardShot } from '@/stores'

export interface ColumnDefinition {
  key: string
  label: string
  required: boolean
}

export const TEMPLATE_COLUMNS: ColumnDefinition[] = [
  { key: 'shotNumber', label: '镜头编号', required: true },
  { key: 'sceneNumber', label: '场次', required: true },
  { key: 'shotSize', label: '景别', required: true },
  { key: 'cameraMovement', label: '运镜方式', required: true },
  { key: 'duration', label: '时长', required: true },
  { key: 'description', label: '画面描述', required: false },
  { key: 'dialogue', label: '对白/旁白', required: false },
  { key: 'sound', label: '音效说明', required: false },
]

// 景别映射
const SHOT_SIZE_LABELS: Record<string, string> = {
  extremeLong: '远景',
  long: '全景',
  medium: '中景',
  closeUp: '近景',
  extremeCloseUp: '特写',
}

// 运镜方式映射
const MOVEMENT_LABELS: Record<string, string> = {
  static: '固定',
  pan: '摇',
  tilt: '俯仰',
  dolly: '推拉',
  truck: '平移',
  pedestral: '升降',
  crane: '吊臂',
  handheld: '手持',
  steadicam: '斯坦尼康',
  tracking: '跟拍',
  arc: '弧形',
}

function getShotValue(shot: StoryboardShot, column: string): string {
  switch (column) {
    case 'shotNumber':
      return String(shot.shotNumber)
    case 'sceneNumber':
      return shot.sceneNumber
    case 'shotSize':
      return SHOT_SIZE_LABELS[shot.shotSize] || shot.shotSize
    case 'cameraMovement':
      return MOVEMENT_LABELS[shot.cameraMovement] || shot.cameraMovement
    case 'duration':
      return String(shot.duration)
    case 'description':
      return shot.description || ''
    case 'dialogue':
      return shot.dialogue || ''
    case 'sound':
      return shot.sound || ''
    default:
      return ''
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 导出空白 CSV 模板
export function exportBlankCSVTemplate(columns: ColumnDefinition[], filename: string) {
  const headers = columns.map(c => c.label).join(',')
  // 第二行为示例数据
  const sampleRow = columns.map(c => {
    if (c.key === 'shotNumber') return '1'
    if (c.key === 'sceneNumber') return '1-1'
    if (c.key === 'shotSize') return '全景'
    if (c.key === 'cameraMovement') return '固定'
    if (c.key === 'duration') return '5'
    if (c.key === 'description') return '示例：城市天际线，日出时分'
    if (c.key === 'dialogue') return '示例：旁白：故事开始'
    if (c.key === 'sound') return '示例：轻柔的背景音乐'
    return ''
  }).join(',')

  const csv = `${headers}\n${sampleRow}`
  downloadCSV(csv, filename)
}

// 导出数据 CSV 模板
export function exportDataCSVTemplate(
  shots: StoryboardShot[],
  columns: ColumnDefinition[],
  filename: string
) {
  const headers = columns.map(c => c.label).join(',')
  const rows = shots.map(shot =>
    columns.map(c => {
      const value = getShotValue(shot, c.key)
      // 处理包含逗号和引号的字段
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  const csv = [headers, ...rows].join('\n')
  downloadCSV(csv, filename)
}

// 导出空白 JSON 模板
export function exportBlankJSONTemplate(columns: ColumnDefinition[], filename: string) {
  const template = {
    type: 'storyboard-template',
    version: '1.0',
    templateType: 'blank',
    exportDate: new Date().toISOString(),
    columns: columns.map(c => ({
      key: c.key,
      label: c.label,
      required: c.required,
    })),
    shots: [],
    instructions: {
      shotSize: ['远景', '全景', '中景', '近景', '特写'],
      cameraMovement: ['固定', '摇', '俯仰', '推拉', '平移', '升降', '吊臂', '手持', '斯坦尼康', '跟拍', '弧形'],
    },
  }

  downloadJSON(template, filename)
}

// 导出数据 JSON 模板
export function exportDataJSONTemplate(
  shots: StoryboardShot[],
  columns: ColumnDefinition[],
  templateName: string,
  filename: string
) {
  const cleanShots = shots.map(shot => {
    const cleaned: Record<string, any> = {}
    columns.forEach(col => {
      cleaned[col.key] = getShotValue(shot, col.key)
    })
    return cleaned
  })

  const template = {
    type: 'storyboard-template',
    version: '1.0',
    templateType: 'data',
    templateName,
    exportDate: new Date().toISOString(),
    columns: columns.map(c => ({
      key: c.key,
      label: c.label,
      required: c.required,
    })),
    shots: cleanShots,
    instructions: {
      shotSize: ['远景', '全景', '中景', '近景', '特写'],
      cameraMovement: ['固定', '摇', '俯仰', '推拉', '平移', '升降', '吊臂', '手持', '斯坦尼康', '跟拍', '弧形'],
    },
  }

  downloadJSON(template, filename)
}

// 下载 CSV 文件
function downloadCSV(content: string, filename: string) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// 下载 JSON 文件
function downloadJSON(data: any, filename: string) {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// 下载 Blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 生成默认文件名
export function generateFilename(
  type: 'blank' | 'data',
  format: 'csv' | 'json' | 'word',
  projectName?: string
): string {
  const date = new Date().toISOString().slice(0, 10)
  const prefix = type === 'blank' ? '空白向导' : '数据向导'
  const projectSuffix = projectName ? `_${projectName}` : ''
  return `分镜头${prefix}${projectSuffix}_${date}.${format}`
}
