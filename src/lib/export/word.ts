/**
 * word
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
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

// 将 Base64 图片转换为 ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export async function exportToWord(
  project: Project,
  shots: StoryboardShot[]
): Promise<void> {
  // 计算总时长
  const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0)
  const minutes = Math.floor(totalDuration / 60)
  const seconds = totalDuration % 60

  // 创建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // 标题
          new Paragraph({
            text: project.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),

          // 项目信息
          new Paragraph({
            children: [
              new TextRun({
                text: '项目信息',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          // 项目信息表格
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableChildren: [
                  new TableCell({
                    children: [new Paragraph('项目名称')],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph(project.name)],
                    columnSpan: 3,
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                ],
              }),
              new TableRow({
                tableChildren: [
                  new TableCell({
                    children: [new Paragraph('创建时间')],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph(formatDateTime(project.createdAt))],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph('更新时间')],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph(formatDateTime(project.updatedAt))],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                ],
              }),
              new TableRow({
                tableChildren: [
                  new TableCell({
                    children: [new Paragraph('分镜头数')],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph(String(shots.length))],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph('总时长')],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(`${minutes}:${seconds.toString().padStart(2, '0')}`)
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                ],
              }),
            ],
          }),

          // 分镜头标题
          new Paragraph({
            children: [
              new TextRun({
                text: '分镜头脚本',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 600, after: 200 },
          }),

          // 分镜头列表
          ...shots.flatMap((shot, index) => [
            // 镜头标题
            new Paragraph({
              children: [
                new TextRun({
                  text: `镜头 #${shot.shotNumber}`,
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: ` - ${shot.sceneNumber || '未设置场次'}`,
                  size: 24,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            // 镜头信息表格
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  tableChildren: [
                    new TableCell({
                      children: [new Paragraph('景别')],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph(shotSizeLabels[shot.shotSize] || shot.shotSize)
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph('运镜')],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph(cameraMovementLabels[shot.cameraMovement] || shot.cameraMovement)
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                  ],
                }),
                new TableRow({
                  tableChildren: [
                    new TableCell({
                      children: [new Paragraph('时长')],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph(`${shot.duration} 秒`)],
                      columnSpan: 3,
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    }),
                  ],
                }),
              ],
              spacing: { after: 200 },
            }),

            // 画面描述
            shot.description
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '画面描述: ',
                        bold: true,
                      }),
                      new TextRun(shot.description),
                    ],
                    spacing: { after: 150 },
                  }),
                ]
              : [],

            // 对白
            shot.dialogue
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '对白/旁白: ',
                        bold: true,
                      }),
                      new TextRun(`"${shot.dialogue}"`),
                    ],
                    spacing: { after: 150 },
                  }),
                ]
              : [],

            // 音效
            shot.sound
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '音效/配乐: ',
                        bold: true,
                      }),
                      new TextRun(shot.sound),
                    ],
                    spacing: { after: 300 },
                  }),
                ]
              : [],

            // 分隔线
            new Paragraph({
              children: [
                new TextRun({
                  text: '─'.repeat(80),
                  color: 'CCCCCC',
                }),
              ],
              spacing: { before: 200, after: 200 },
            }),
          ]),
        ],
      },
    ],
  })

  // 生成并下载
  const blob = await Packer.toBlob(doc)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name}_分镜头脚本_${new Date().toISOString().split('T')[0]}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
