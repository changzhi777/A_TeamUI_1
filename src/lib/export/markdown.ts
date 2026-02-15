/**
 * markdown
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { StoryboardShot } from '@/stores'
import type { ColumnDefinition, downloadBlob } from './template'

// 导出空白 Markdown 模板
export function exportBlankMarkdownTemplate(columns: ColumnDefinition[], filename: string) {
  const headers = columns.map(c => c.label)
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
  })

  const md = generateMarkdownTable(headers, [sampleRow])
  downloadMarkdown(md, filename)
}

// 导出数据 Markdown 模板
export function exportDataMarkdownTemplate(
  shots: StoryboardShot[],
  columns: ColumnDefinition[],
  projectName: string,
  filename: string
) {
  const headers = columns.map(c => c.label)

  // Import getShotValue from template.ts
  const rows = shots.map(shot =>
    columns.map(c => getShotValueForMarkdown(shot, c))
  )

  // Build document with header
  const header = `# ${projectName} - 分镜头列表\n\n`
  const metadata = `> 导出时间：${new Date().toLocaleString('zh-CN')}\n> 总镜头数：${shots.length}\n\n`
  const table = generateMarkdownTable(headers, rows)

  const md = header + metadata + table
  downloadMarkdown(md, filename)
}

// Generate Markdown table
function generateMarkdownTable(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`)

  return [headerRow, separatorRow, ...dataRows].join('\n')
}

// Get shot value for Markdown export
function getShotValueForMarkdown(shot: StoryboardShot, column: ColumnDefinition): string {
  // Handle custom fields
  if (column.isCustomField && column.customFieldConfig) {
    const value = shot.customFields?.[column.customFieldConfig.id] ?? null
    return formatCustomFieldValueForMarkdown(value, column.customFieldConfig)
  }

  // Handle base fields
  switch (column.key) {
    case 'shotNumber':
      return String(shot.shotNumber)
    case 'seasonNumber':
      return shot.seasonNumber !== undefined && shot.seasonNumber !== null ? String(shot.seasonNumber) : '-'
    case 'episodeNumber':
      return shot.episodeNumber !== undefined && shot.episodeNumber !== null ? String(shot.episodeNumber) : '-'
    case 'sceneNumber':
      return shot.sceneNumber
    case 'shotSize':
      return getShotSizeLabel(shot.shotSize)
    case 'cameraMovement':
      return getMovementLabel(shot.cameraMovement)
    case 'duration':
      return String(shot.duration)
    case 'description':
      return shot.description || '-'
    case 'dialogue':
      return shot.dialogue || '-'
    case 'sound':
      return shot.sound || '-'
    default:
      return '-'
  }
}

// Format custom field value for Markdown
function formatCustomFieldValueForMarkdown(value: any, field: any): string {
  if (value === null || value === undefined) return '-'

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
          .map((v: string) => {
            const index = parseInt(v, 10)
            return field.options[index] || v
          })
          .join(', ')
      }
      return Array.isArray(value) ? value.join(', ') : '-'
    default:
      return String(value)
  }
}

// Shot size labels
function getShotSizeLabel(value: string): string {
  const labels: Record<string, string> = {
    extremeLong: '远景',
    long: '全景',
    medium: '中景',
    closeUp: '近景',
    extremeCloseUp: '特写',
  }
  return labels[value] || value
}

// Movement labels
function getMovementLabel(value: string): string {
  const labels: Record<string, string> = {
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
  return labels[value] || value
}

// Download Markdown file
function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
