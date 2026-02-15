/**
 * template
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { StoryboardShot, CustomFieldValue } from '@/stores'
import type { CustomFieldConfig } from '@/lib/types/api'

export interface ColumnDefinition {
  key: string
  label: string
  required: boolean
  isCustomField?: boolean
  customFieldConfig?: CustomFieldConfig
}

// 基础固定列
export const BASE_TEMPLATE_COLUMNS: ColumnDefinition[] = [
  { key: 'shotNumber', label: '镜头编号', required: true },
  { key: 'seasonNumber', label: '季数', required: false },
  { key: 'episodeNumber', label: '集数', required: false },
  { key: 'sceneNumber', label: '场次', required: true },
  { key: 'shotSize', label: '景别', required: true },
  { key: 'cameraMovement', label: '运镜方式', required: true },
  { key: 'duration', label: '时长', required: true },
  { key: 'description', label: '画面描述', required: false },
  { key: 'dialogue', label: '对白/旁白', required: false },
  { key: 'sound', label: '音效说明', required: false },
]

// 向后兼容：导出默认列（不包含季数和集数）
export const TEMPLATE_COLUMNS: ColumnDefinition[] = BASE_TEMPLATE_COLUMNS.filter(
  (col) => col.key !== 'seasonNumber' && col.key !== 'episodeNumber'
)

// 生成包含自定义字段的列定义
export function generateColumnsWithCustomFields(
  customFields: CustomFieldConfig[]
): ColumnDefinition[] {
  const customColumns: ColumnDefinition[] = customFields.map((field) => ({
    key: `custom_${field.id}`,
    label: field.name,
    required: field.required,
    isCustomField: true,
    customFieldConfig: field,
  }))

  return [...BASE_TEMPLATE_COLUMNS, ...customColumns]
}

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

function getShotValue(shot: StoryboardShot, column: ColumnDefinition): string {
  // Handle custom fields
  if (column.isCustomField && column.customFieldConfig) {
    const value = shot.customFields?.[column.customFieldConfig.id] ?? null
    return formatCustomFieldValue(value, column.customFieldConfig)
  }

  // Handle base fields
  switch (column.key) {
    case 'shotNumber':
      return String(shot.shotNumber)
    case 'seasonNumber':
      return shot.seasonNumber !== undefined && shot.seasonNumber !== null ? String(shot.seasonNumber) : ''
    case 'episodeNumber':
      return shot.episodeNumber !== undefined && shot.episodeNumber !== null ? String(shot.episodeNumber) : ''
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

// Format custom field value for export
function formatCustomFieldValue(value: CustomFieldValue, field: CustomFieldConfig): string {
  if (value === null || value === undefined) return ''

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return String(value)
    case 'number':
      return String(value)
    case 'checkbox':
      return value ? '是' : '否'
    case 'select':
      if (field.options && typeof value === 'string') {
        const index = parseInt(value, 10)
        return field.options[index] || String(value)
      }
      return String(value)
    case 'multiselect':
      if (Array.isArray(value) && field.options) {
        return value
          .map((v) => {
            const index = parseInt(v, 10)
            return field.options![index] || v
          })
          .join('; ')
      }
      return Array.isArray(value) ? value.join('; ') : ''
    default:
      return String(value)
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
    // Handle custom fields
    if (c.isCustomField && c.customFieldConfig) {
      if (c.customFieldConfig.type === 'number') return '1'
      if (c.customFieldConfig.type === 'checkbox') return '是/否'
      if (c.customFieldConfig.type === 'select' && c.customFieldConfig.options?.length) {
        return c.customFieldConfig.options[0]
      }
      return '示例'
    }
    // Handle base fields
    if (c.key === 'shotNumber') return '1'
    if (c.key === 'seasonNumber') return '1'
    if (c.key === 'episodeNumber') return '1'
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
      const value = getShotValue(shot, c)
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
  filename: string,
  customFields?: CustomFieldConfig[]
) {
  const cleanShots = shots.map(shot => {
    const cleaned: Record<string, any> = {}
    columns.forEach(col => {
      cleaned[col.key] = getShotValue(shot, col)
    })
    return cleaned
  })

  const template = {
    type: 'storyboard-template',
    version: '1.1', // Updated version for new fields
    templateType: 'data',
    templateName,
    exportDate: new Date().toISOString(),
    columns: columns.map(c => ({
      key: c.key,
      label: c.label,
      required: c.required,
      isCustomField: c.isCustomField,
    })),
    // Include custom field configurations if provided
    ...(customFields && customFields.length > 0 && {
      customFields: customFields.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        required: f.required,
        options: f.options,
        visible: f.visible,
      })),
    }),
    shots: cleanShots,
    instructions: {
      shotSize: ['远景', '全景', '中景', '近景', '特写'],
      cameraMovement: ['固定', '摇', '俯仰', '推拉', '平移', '升降', '吊臂', '手持', '斯坦尼康', '跟拍', '弧形'],
    },
  }

  downloadJSON(template, filename)
}

// 导出空白 PDF 模板
export async function exportBlankPDFTemplate(columns: ColumnDefinition[], filename: string) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF('l', 'mm', 'a4') // 横向 A4
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  let yPosition = margin

  // 标题
  doc.setFontSize(16)
  doc.text('分镜头向导模板', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  // 生成日期
  doc.setFontSize(10)
  doc.text(`生成日期: ${new Date().toLocaleDateString('zh-CN')}`, margin, yPosition)
  yPosition += 10

  // 表头
  const headers = columns.map(c => c.label)
  const sampleRow = columns.map(c => {
    if (c.isCustomField && c.customFieldConfig) {
      if (c.customFieldConfig.type === 'number') return '1'
      if (c.customFieldConfig.type === 'checkbox') return '是/否'
      if (c.customFieldConfig.type === 'select' && c.customFieldConfig.options?.length) {
        return c.customFieldConfig.options[0]
      }
      return '示例'
    }
    if (c.key === 'shotNumber') return '1'
    if (c.key === 'seasonNumber') return '1'
    if (c.key === 'episodeNumber') return '1'
    if (c.key === 'sceneNumber') return '1-1'
    if (c.key === 'shotSize') return '全景'
    if (c.key === 'cameraMovement') return '固定'
    if (c.key === 'duration') return '5'
    if (c.key === 'description') return '示例描述'
    if (c.key === 'dialogue') return '示例对白'
    if (c.key === 'sound') return '示例音效'
    return ''
  })

  // 计算列宽
  const colWidth = (pageWidth - 2 * margin) / headers.length

  // 绘制表头
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  headers.forEach((header, index) => {
    const x = margin + index * colWidth
    doc.rect(x, yPosition, colWidth, 8)
    doc.text(header, x + 1, yPosition + 5)
  })
  yPosition += 8

  // 绘制示例行
  doc.setFont('helvetica', 'normal')
  sampleRow.forEach((cell, index) => {
    const x = margin + index * colWidth
    doc.rect(x, yPosition, colWidth, 8)
    doc.text(cell.slice(0, 15), x + 1, yPosition + 5)
  })

  // 下载
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

// 导出数据 PDF 模板
export async function exportDataPDFTemplate(
  shots: StoryboardShot[],
  columns: ColumnDefinition[],
  projectName: string,
  filename: string
) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF('l', 'mm', 'a4') // 横向 A4
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  let yPosition = margin

  // 标题
  doc.setFontSize(16)
  doc.text(`${projectName} - 分镜头列表`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 8

  // 元信息
  doc.setFontSize(10)
  doc.text(`导出时间: ${new Date().toLocaleString('zh-CN')}  |  总镜头数: ${shots.length}`, margin, yPosition)
  yPosition += 10

  const headers = columns.map(c => c.label)
  const colWidth = (pageWidth - 2 * margin) / headers.length
  const rowHeight = 8

  // 绘制表头
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  headers.forEach((header, index) => {
    const x = margin + index * colWidth
    doc.setFillColor(240, 240, 240)
    doc.rect(x, yPosition, colWidth, rowHeight, 'F')
    doc.rect(x, yPosition, colWidth, rowHeight)
    doc.text(header, x + 1, yPosition + 5)
  })
  yPosition += rowHeight

  // 绘制数据行
  doc.setFont('helvetica', 'normal')
  shots.forEach((shot, rowIndex) => {
    // 检查是否需要新页面
    if (yPosition > pageHeight - 20) {
      doc.addPage()
      yPosition = margin

      // 重复表头
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, index) => {
        const x = margin + index * colWidth
        doc.setFillColor(240, 240, 240)
        doc.rect(x, yPosition, colWidth, rowHeight, 'F')
        doc.rect(x, yPosition, colWidth, rowHeight)
        doc.text(header, x + 1, yPosition + 5)
      })
      yPosition += rowHeight
      doc.setFont('helvetica', 'normal')
    }

    const rowData = columns.map(c => {
      const value = getShotValue(shot, c)
      return value.slice(0, 20) // 截断长文本
    })

    rowData.forEach((cell, colIndex) => {
      const x = margin + colIndex * colWidth
      doc.rect(x, yPosition, colWidth, rowHeight)
      doc.text(cell || '-', x + 1, yPosition + 5)
    })
    yPosition += rowHeight
  })

  // 下载
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
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
  format: 'csv' | 'json' | 'word' | 'md' | 'pdf',
  projectName?: string
): string {
  const date = new Date().toISOString().slice(0, 10)
  const prefix = type === 'blank' ? '空白向导' : '数据向导'
  const projectSuffix = projectName ? `_${projectName}` : ''
  const ext = format === 'md' ? 'md' : format
  return `分镜头${prefix}${projectSuffix}_${date}.${ext}`
}
