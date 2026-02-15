/**
 * pdf
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import jsPDF from 'jspdf'
import type { Project, StoryboardShot, CustomFieldValue } from '@/stores'
import type { CustomFieldConfig } from '@/lib/types/api'
import { formatDateTime } from '@/lib/utils'

// 中文标签映射
const shotSizeLabels: Record<string, string> = {
  extremeLong: '远景',
  long: '全景',
  medium: '中景',
  closeUp: '近景',
  extremeCloseUp: '特写',
}

const cameraMovementLabels: Record<string, string> = {
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

// Format custom field value for PDF display
function formatCustomFieldValuePDF(value: CustomFieldValue, field: CustomFieldConfig): string {
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
          .map((v) => {
            const index = parseInt(v, 10)
            return field.options![index] || v
          })
          .join(', ')
      }
      return Array.isArray(value) ? value.join(', ') : '-'
    default:
      return String(value)
  }
}

// 将图片转换为 Base64
async function imageToBase64(img: HTMLImageElement): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(img, 0, 0)
  }
  return canvas.toDataURL('image/jpeg', 0.8)
}

// 加载图片
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function exportToPDF(
  project: Project,
  shots: StoryboardShot[],
  customFields?: CustomFieldConfig[]
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  let yPosition = margin

  // 添加中文字体支持（使用内置字体）
  doc.setFont('helvetica')

  // 标题页
  doc.setFontSize(24)
  doc.text(project.name, pageWidth / 2, 40, { align: 'center' })

  doc.setFontSize(12)
  doc.text(`Project: ${project.name}`, pageWidth / 2, 55, { align: 'center' })
  doc.text(`Type: ${project.type}`, pageWidth / 2, 62, { align: 'center' })
  doc.text(`Status: ${project.status}`, pageWidth / 2, 69, { align: 'center' })
  doc.text(`Created: ${formatDateTime(project.createdAt)}`, pageWidth / 2, 76, { align: 'center' })
  doc.text(`Updated: ${formatDateTime(project.updatedAt)}`, pageWidth / 2, 83, { align: 'center' })
  doc.text(`Shots: ${shots.length}`, pageWidth / 2, 90, { align: 'center' })

  // 计算总时长
  const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0)
  const minutes = Math.floor(totalDuration / 60)
  const seconds = totalDuration % 60
  doc.text(
    `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`,
    pageWidth / 2,
    97,
    { align: 'center' }
  )

  // 新页面开始分镜头列表
  doc.addPage()
  yPosition = margin

  // 分镜头列表标题
  doc.setFontSize(18)
  doc.text('Storyboard', margin, yPosition)
  yPosition += 15

  // 遍历每个分镜头
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i]

    // 检查是否需要新页面
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = margin
    }

    // 镜头编号
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    // Include season/episode in header if available
    const shotHeader = shot.seasonNumber || shot.episodeNumber
      ? `Shot #${shot.shotNumber} (S${shot.seasonNumber || '-'}E${shot.episodeNumber || '-'})`
      : `Shot #${shot.shotNumber}`
    doc.text(shotHeader, margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // 基本信息 - 第一行
    const infoY1 = yPosition
    doc.text(`Scene: ${shot.sceneNumber || '-'}`, margin, infoY1)
    doc.text(
      `Size: ${shotSizeLabels[shot.shotSize] || shot.shotSize}`,
      margin + 40,
      infoY1
    )
    doc.text(
      `Movement: ${cameraMovementLabels[shot.cameraMovement] || shot.cameraMovement}`,
      margin + 80,
      infoY1
    )
    doc.text(`Duration: ${shot.duration}s`, margin + 130, infoY1)
    yPosition += 6

    // 季数/集数 - 第二行（如果有）
    if (shot.seasonNumber || shot.episodeNumber) {
      const infoY2 = yPosition
      if (shot.seasonNumber) {
        doc.text(`Season: ${shot.seasonNumber}`, margin, infoY2)
      }
      if (shot.episodeNumber) {
        doc.text(`Episode: ${shot.episodeNumber}`, margin + 40, infoY2)
      }
      yPosition += 6
    }

    yPosition += 4

    // 画面描述
    if (shot.description) {
      const lines = doc.splitTextToSize(shot.description, contentWidth - 30)
      doc.text('Description:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
    }

    // 对白
    if (shot.dialogue) {
      const lines = doc.splitTextToSize(`"${shot.dialogue}"`, contentWidth - 30)
      doc.text('Dialogue:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
    }

    // 音效
    if (shot.sound) {
      const lines = doc.splitTextToSize(shot.sound, contentWidth - 30)
      doc.text('Sound:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
    }

    // 自定义字段
    if (customFields && customFields.length > 0 && shot.customFields) {
      for (const field of customFields) {
        const value = shot.customFields[field.id]
        if (value !== null && value !== undefined) {
          const displayValue = formatCustomFieldValuePDF(value, field)
          if (displayValue && displayValue !== '-') {
            const lines = doc.splitTextToSize(displayValue, contentWidth - 30)
            doc.text(`${field.name}:`, margin, yPosition)
            yPosition += 6
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5 + 5
          }
        }
      }
    }

    // 配图（如果有）
    if (shot.image) {
      try {
        yPosition += 5
        const img = await loadImage(shot.image)
        const imgAspectRatio = img.naturalWidth / img.naturalHeight
        const imgWidth = Math.min(contentWidth, 80)
        const imgHeight = imgWidth / imgAspectRatio

        // 检查图片是否超出页面
        if (yPosition + imgHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        const base64Data = shot.image.includes('base64')
          ? shot.image.split(',')[1]
          : shot.image

        doc.addImage(
          base64Data,
          'JPEG',
          margin,
          yPosition,
          imgWidth,
          imgHeight
        )
        yPosition += imgHeight + 10
      } catch (error) {
        console.error('Failed to load image for PDF:', error)
      }
    }

    // 分隔线
    yPosition += 5
    if (yPosition < pageHeight - 30) {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  }

  // 下载文件
  const fileName = `${project.name}_Storyboard_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
