/**
 * 版权头添加脚本
 * 批量为源代码文件添加统一的版权信息头
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import * as fs from 'fs'
import * as path from 'path'

// 版权头模板
const COPYRIGHT_HEADER = `/**
 * [FILE_DESCRIPTION]
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */
`

// 需要处理的目录
const TARGET_DIRS = [
  'src/features',
  'src/stores',
  'src/hooks',
  'src/lib',
  'src/routes',
  'src/context',
  'src/i18n',
  'src/components/layout',
  'src/components/data-table',
  'src/components/auth',
  'src/components/confirm-dialog.tsx',
  'src/components/profile-dropdown.tsx',
  'src/components/theme-switch.tsx',
  'src/main.tsx',
  'server/src/api',
  'server/src/models',
  'server/src/middleware',
  'server/src/config',
  'server/src/utils',
  'server/src/index.ts',
]

// 排除的目录和文件
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.gen.ts',
  'routeTree.gen.ts',
  'src/components/ui',
]

// 检查文件是否已有版权头
function hasCopyrightHeader(content: string): boolean {
  return content.includes('@author') && content.includes('@copyright')
}

// 检查路径是否应该被排除
function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern))
}

// 获取文件描述（从文件路径推断）
function getFileDescription(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath))
  const dirName = path.basename(path.dirname(filePath))

  // 根据目录和文件名生成描述
  if (filePath.includes('/features/')) {
    const parts = filePath.split('/features/')[1]?.split('/')
    if (parts && parts.length >= 2) {
      const featureName = parts[0]
      const fileType = parts[1] // components, pages, etc.
      return `${featureName} 模块 - ${fileType}`
    }
  }

  if (filePath.includes('/stores/')) {
    return `${fileName} 状态管理`
  }

  if (filePath.includes('/hooks/')) {
    return `${fileName} Hook`
  }

  if (filePath.includes('/lib/')) {
    return `${fileName} 工具模块`
  }

  if (filePath.includes('/routes/')) {
    return `${fileName} 路由`
  }

  if (filePath.includes('/api/')) {
    return `${fileName} API`
  }

  if (filePath.includes('/middleware/')) {
    return `${fileName} 中间件`
  }

  if (filePath.includes('/models/')) {
    return `${fileName} 数据模型`
  }

  if (filePath.includes('/config/')) {
    return `${fileName} 配置`
  }

  if (filePath.includes('/utils/')) {
    return `${fileName} 工具函数`
  }

  return fileName
}

// 为文件添加版权头
function addCopyrightHeader(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 检查是否已有版权头
  if (hasCopyrightHeader(content)) {
    console.log(`  ⏭️  已有版权头: ${filePath}`)
    return false
  }

  // 获取文件描述
  const description = getFileDescription(filePath)
  const header = COPYRIGHT_HEADER.replace('[FILE_DESCRIPTION]', description)

  // 检查文件是否以注释开头
  let newContent: string
  if (content.trimStart().startsWith('/*') || content.trimStart().startsWith('//')) {
    // 文件已有注释，在注释前添加版权头
    newContent = header + '\n' + content
  } else if (content.trimStart().startsWith("'use strict'") || content.trimStart().startsWith('"use strict"')) {
    // 文件以 'use strict' 开头
    const lines = content.split('\n')
    const firstLine = lines[0]
    const restContent = lines.slice(1).join('\n')
    newContent = firstLine + '\n\n' + header + restContent
  } else {
    // 直接在文件开头添加版权头
    newContent = header + '\n' + content
  }

  fs.writeFileSync(filePath, newContent, 'utf-8')
  console.log(`  ✅ 已添加版权头: ${filePath}`)
  return true
}

// 递归遍历目录
function processDirectory(dirPath: string): { processed: number; skipped: number } {
  let processed = 0
  let skipped = 0

  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  目录不存在: ${dirPath}`)
    return { processed, skipped }
  }

  const stats = fs.statSync(dirPath)

  if (stats.isFile()) {
    if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      if (!shouldExclude(dirPath)) {
        if (addCopyrightHeader(dirPath)) {
          processed++
        } else {
          skipped++
        }
      }
    }
    return { processed, skipped }
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (shouldExclude(fullPath)) {
      continue
    }

    if (entry.isDirectory()) {
      const result = processDirectory(fullPath)
      processed += result.processed
      skipped += result.skipped
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (addCopyrightHeader(fullPath)) {
        processed++
      } else {
        skipped++
      }
    }
  }

  return { processed, skipped }
}

// 主函数
function main() {
  console.log('🚀 开始添加版权头...\n')

  let totalProcessed = 0
  let totalSkipped = 0

  for (const targetDir of TARGET_DIRS) {
    console.log(`\n📂 处理目录: ${targetDir}`)
    const result = processDirectory(targetDir)
    totalProcessed += result.processed
    totalSkipped += result.skipped
  }

  console.log('\n========================================')
  console.log(`✨ 完成！`)
  console.log(`  - 已添加版权头: ${totalProcessed} 个文件`)
  console.log(`  - 已跳过（已有版权头）: ${totalSkipped} 个文件`)
  console.log('========================================\n')
}

main()
