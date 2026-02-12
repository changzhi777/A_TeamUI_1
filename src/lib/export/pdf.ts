import jsPDF from 'jspdf'
import type { Project, StoryboardShot } from '@/stores'
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
  shots: StoryboardShot[]
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
  doc.text(`项目: ${project.name}`, pageWidth / 2, 55, { align: 'center' })
  doc.text(`类型: ${project.type}`, pageWidth / 2, 62, { align: 'center' })
  doc.text(`状态: ${project.status}`, pageWidth / 2, 69, { align: 'center' })
  doc.text(`创建时间: ${formatDateTime(project.createdAt)}`, pageWidth / 2, 76, { align: 'center' })
  doc.text(`更新时间: ${formatDateTime(project.updatedAt)}`, pageWidth / 2, 83, { align: 'center' })
  doc.text(`分镜头数: ${shots.length}`, pageWidth / 2, 90, { align: 'center' })

  // 计算总时长
  const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0)
  const minutes = Math.floor(totalDuration / 60)
  const seconds = totalDuration % 60
  doc.text(
    `总时长: ${minutes}:${seconds.toString().padStart(2, '0')}`,
    pageWidth / 2,
    97,
    { align: 'center' }
  )

  // 新页面开始分镜头列表
  doc.addPage()
  yPosition = margin

  // 分镜头列表标题
  doc.setFontSize(18)
  doc.text('分镜头脚本', margin, yPosition)
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
    doc.text(`镜头 #${shot.shotNumber}`, margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // 基本信息
    const infoY = yPosition
    doc.text(`场次: ${shot.sceneNumber || '未设置'}`, margin, infoY)
    doc.text(
      `景别: ${shotSizeLabels[shot.shotSize] || shot.shotSize}`,
      margin + 40,
      infoY
    )
    doc.text(
      `运镜: ${cameraMovementLabels[shot.cameraMovement] || shot.cameraMovement}`,
      margin + 80,
      infoY
    )
    doc.text(`时长: ${shot.duration}s`, margin + 130, infoY)
    yPosition += 10

    // 画面描述
    if (shot.description) {
      const lines = doc.splitTextToSize(shot.description, contentWidth - 30)
      doc.text('画面:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
    }

    // 对白
    if (shot.dialogue) {
      const lines = doc.splitTextToSize(`"${shot.dialogue}"`, contentWidth - 30)
      doc.text('对白:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
    }

    // 音效
    if (shot.sound) {
      const lines = doc.splitTextToSize(shot.sound, contentWidth - 30)
      doc.text('音效:', margin, yPosition)
      yPosition += 6
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 5
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
  const fileName = `${project.name}_分镜头脚本_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
