/**
 * export
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * 数据导出工具
 * 用于将 localStorage 中的项目、分镜头数据导出为 JSON 格式
 */

export interface ExportData {
  version: string
  exportedAt: string
  projects: any[]
  shots: any[]
  user: {
    id: string
    name: string
    email: string
  }
}

/**
 * 导出所有 localStorage 数据
 */
export function exportAllData(): ExportData {
  const projects: any[] = []
  const shots: any[] = []

  try {
    // 导出项目数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('project-storage-')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.state?.projects) {
          projects.push(...data.state.projects)
        }
      }
    }

    // 导出分镜头数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('storyboard-storage-')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.state?.shots) {
          shots.push(...data.state.shots)
        }
      }
    }

    // 导出用户数据
    const authKey = 'auth-storage'
    const authData = JSON.parse(localStorage.getItem(authKey) || '{"state":{}}')
    const user = authData.state?.user || null
  } catch (error) {
    console.error('Export error:', error)
  }

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects,
    shots,
    user,
  }
}

/**
 * 导出为 JSON 文件并触发下载
 */
export function downloadExport(data: ExportData, filename = 'a-teamui-export.json'): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
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
 * 清理 localStorage 中的过期或无效数据
 */
export function cleanupLocalStorage(): void {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    // 移除旧的或无效的缓存数据
    if (
      key.includes('project-storage-') &&
      !key.includes('project-storage') // 不是主存储的缓存
    ) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  if (keysToRemove.length > 0) {
    console.log(`Cleaned up ${keysToRemove.length} old cache entries`)
  }
}

/**
 * 获取导出数据的统计信息
 */
export function getExportStats(data: ExportData): {
  projectCount: number
  shotCount: number
  totalSize: string
} {
  const projectCount = data.projects.length
  const shotCount = data.shots.length

  // 估算 JSON 大小（2 字符 ≈ 1 字节，简化计算）
  const jsonSize = JSON.stringify(data).length
  const totalSize = jsonSize < 1024
    ? `${jsonSize} B`
    : `${(jsonSize / 1024).toFixed(2)} KB`

  return { projectCount, shotCount, totalSize }
}
