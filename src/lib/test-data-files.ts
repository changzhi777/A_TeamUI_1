import type { ParsedShot } from '@/lib/import/template'

/**
 * 获取测试用的分镜头数据
 * @returns 包含 10 个示例分镜头的数组
 */
export function getTestShotData(): ParsedShot[] {
  return [
    {
      shotNumber: 1,
      sceneNumber: 'SC01',
      shotSize: '远景',
      cameraMovement: '固定',
      duration: 8,
      description: '城市天际线远景，夕阳西下，华灯初上',
      dialogue: '',
      sound: '轻柔的城市环境音，远处车流声',
    },
    {
      shotNumber: 2,
      sceneNumber: 'SC02',
      shotSize: '全景',
      cameraMovement: '跟拍',
      duration: 6,
      description: '主角从远处走来，背影，街道两旁店铺林立',
      dialogue: '',
      sound: '脚步声，街道背景音',
    },
    {
      shotNumber: 3,
      sceneNumber: 'SC03',
      shotSize: '中景',
      cameraMovement: '推拉',
      duration: 4,
      description: '主角停下脚步，抬头看向前方，表情凝重',
      dialogue: '（内心独白）终于到了...',
      sound: '音乐渐强，营造紧张感',
    },
    {
      shotNumber: 4,
      sceneNumber: 'SC04',
      shotSize: '近景',
      cameraMovement: '俯仰',
      duration: 3,
      description: '主角特写，眼神坚定，嘴角微微上扬',
      dialogue: '（轻声）我不会放弃的',
      sound: '心跳音效',
    },
    {
      shotNumber: 5,
      sceneNumber: 'SC05',
      shotSize: '特写',
      cameraMovement: '固定',
      duration: 2,
      description: '主角手部特写，紧握成拳',
      dialogue: '',
      sound: '拳头紧握音效',
    },
    {
      shotNumber: 6,
      sceneNumber: 'SC06',
      shotSize: '中景',
      cameraMovement: '摇',
      duration: 5,
      description: '镜头摇向右侧，展示一家老旧的咖啡馆招牌',
      dialogue: '',
      sound: '咖啡馆环境音',
    },
    {
      shotNumber: 7,
      sceneNumber: 'SC07',
      shotSize: '近景',
      cameraMovement: '推拉',
      duration: 4,
      description: '主角推开咖啡馆门，门铃响起',
      dialogue: '',
      sound: '门铃叮咚声',
    },
    {
      shotNumber: 8,
      sceneNumber: 'SC08',
      shotSize: '中景',
      cameraMovement: '跟拍',
      duration: 6,
      description: '主角走进咖啡馆，环顾四周，寻找座位',
      dialogue: '',
      sound: '轻柔的爵士乐背景音',
    },
    {
      shotNumber: 9,
      sceneNumber: 'SC09',
      shotSize: '近景',
      cameraMovement: '固定',
      duration: 3,
      description: '主角发现窗边的座位，眼中闪过一丝惊讶',
      dialogue: '',
      sound: '音乐突然停止',
    },
    {
      shotNumber: 10,
      sceneNumber: 'SC10',
      shotSize: '全景',
      cameraMovement: '吊臂',
      duration: 8,
      description: '镜头缓缓上升，展示整个咖啡馆内景，主角走向窗边',
      dialogue: '',
      sound: '钢琴独奏渐入',
    },
  ]
}

/**
 * 生成 CSV 格式的测试数据
 * @param shots 示例分镜头数据
 * @param filename 文件名
 */
export function generateTestCSVFile(shots: ParsedShot[], filename: string): void {
  // CSV 表头
  const headers = ['镜头编号', '场次', '景别', '运镜方式', '时长', '画面描述', '对白/旁白', '音效说明']

  // 转换数据为 CSV 行
  const rows = shots.map((shot) => {
    return [
      shot.shotNumber,
      shot.sceneNumber,
      shot.shotSize,
      shot.cameraMovement,
      shot.duration,
      `"${shot.description.replace(/"/g, '""')}"`, // 处理引号
      `"${(shot.dialogue || '').replace(/"/g, '""')}"`,
      `"${(shot.sound || '').replace(/"/g, '""')}"`,
    ].join(',')
  })

  // 组合 CSV
  const csv = [headers.join(','), ...rows].join('\n')

  // 添加 BOM 以支持 Excel 正确显示中文
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  // 触发下载
  downloadBlob(blob, filename)
}

/**
 * 生成 JSON 格式的测试数据
 * @param shots 示例分镜头数据
 * @param filename 文件名
 */
export function generateTestJSONFile(shots: ParsedShot[], filename: string): void {
  const template = {
    type: 'storyboard-template',
    version: '1.0',
    templateType: 'data',
    templateName: '测试分镜头数据',
    exportDate: new Date().toISOString(),
    columns: [
      { key: 'shotNumber', label: '镜头编号', required: true },
      { key: 'sceneNumber', label: '场次', required: true },
      { key: 'shotSize', label: '景别', required: true },
      { key: 'cameraMovement', label: '运镜方式', required: true },
      { key: 'duration', label: '时长', required: true },
      { key: 'description', label: '画面描述', required: false },
      { key: 'dialogue', label: '对白/旁白', required: false },
      { key: 'sound', label: '音效说明', required: false },
    ],
    shots,
    instructions: {
      shotSize: ['远景', '全景', '中景', '近景', '特写'],
      cameraMovement: ['固定', '摇', '俯仰', '推拉', '平移', '升降', '吊臂', '手持', '斯坦尼康', '跟拍', '弧形'],
    },
  }

  const content = JSON.stringify(template, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })

  // 触发下载
  downloadBlob(blob, filename)
}

/**
 * 下载 Blob 文件
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 生成默认文件名
 */
export function generateTestFilename(format: 'csv' | 'json'): string {
  const date = new Date().toISOString().slice(0, 10)
  return `分镜头测试数据_${date}.${format}`
}
