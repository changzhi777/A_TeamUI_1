import type { Project, StoryboardShot } from '@/stores'
import { formatDateTime } from '@/lib/utils'

// 导出项目数据为 JSON
export function exportProjectToJSON(
  project: Project,
  shots: StoryboardShot[]
): void {
  const data = {
    version: '1.0',
    exportDate: formatDateTime(new Date()),
    project: {
      ...project,
      // 移除不需要导出的内部字段
      shots: undefined,
    },
    shots: shots.map((shot) => ({
      ...shot,
      // 移除内部字段
      projectId: undefined,
    })),
  }

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name}_备份_${formatDateTime(new Date()).replace(/[:\s]/g, '_')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// 从 JSON 导入项目数据
export interface ImportedProjectData {
  version: string
  exportDate: string
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  shots: Array<Omit<StoryboardShot, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
}

export function importProjectFromJSON(
  jsonString: string
): ImportedProjectData | null {
  try {
    const data = JSON.parse(jsonString) as ImportedProjectData

    // 验证数据结构
    if (!data.version || !data.project || !Array.isArray(data.shots)) {
      throw new Error('Invalid JSON structure')
    }

    // 验证版本兼容性
    if (data.version !== '1.0') {
      console.warn(`Unknown version: ${data.version}, attempting to import...`)
    }

    return data
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
}

// 验证导入的数据
export function validateImportedData(data: ImportedProjectData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 验证项目数据
  if (!data.project.name) {
    errors.push('项目名称不能为空')
  }

  if (!data.project.type) {
    errors.push('项目类型不能为空')
  }

  if (!data.project.status) {
    errors.push('项目状态不能为空')
  }

  // 验证分镜头数据
  data.shots.forEach((shot, index) => {
    if (!shot.shotNumber) {
      errors.push(`分镜头 #${index + 1}: 缺少镜头编号`)
    }

    if (!shot.shotSize) {
      errors.push(`分镜头 #${index + 1}: 缺少景别`)
    }

    if (!shot.cameraMovement) {
      errors.push(`分镜头 #${index + 1}: 缺少运镜方式`)
    }

    if (!shot.duration || shot.duration <= 0) {
      errors.push(`分镜头 #${index + 1}: 时长无效`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 创建文件读取器
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
