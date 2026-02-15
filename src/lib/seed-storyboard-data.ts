/**
 * seed-storyboard-data
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useStoryboardStore } from '@/stores/storyboard-store'
import { useProjectStore, type ProjectType } from '@/stores/project-store'
import { generateMockShots } from '@/lib/mock-shots'

const SEED_DATA_MARKER = '__seed__'

/**
 * 为指定项目生成分镜头模拟数据
 * @param projectId 项目 ID
 * @param projectType 项目类型
 * @param count 需要生成的分镜头数量
 * @returns 生成的分镜头数量
 */
export function seedShotsForProject(
  projectId: string,
  projectType: ProjectType,
  count: number
): number {
  const { shots, addShot } = useStoryboardStore.getState()

  // 检查该项目是否已有分镜头数据
  const existingShots = shots.filter((s) => s.projectId === projectId)
  if (existingShots.length > 0) {
    console.log(`项目 ${projectId} 已有 ${existingShots.length} 个分镜头，跳过生成`)
    return 0
  }

  // 获取基础模板（每个类型 10 个模板）
  const baseTemplates = generateMockShots(projectId, projectType)
  const templateCount = baseTemplates.length

  let generatedCount = 0

  // 循环生成指定数量的分镜头
  for (let i = 0; i < count; i++) {
    const templateIndex = i % templateCount
    const cycleIndex = Math.floor(i / templateCount)

    const template = baseTemplates[templateIndex]

    // 为循环复用的模板添加变化
    let sceneNumber = template.sceneNumber
    let description = template.description
    let dialogue = template.dialogue

    if (cycleIndex > 0) {
      // 添加场次编号变化
      const baseSceneNum = parseInt(sceneNumber.replace(/\D/g, '')) || 1
      sceneNumber = `SC${String(baseSceneNum + cycleIndex * 10).padStart(2, '0')}`

      // 在描述中添加循环标记
      description = `${description} [${cycleIndex + 1}]`

      // 如果有对白，也可以添加变化
      if (dialogue) {
        dialogue = `${dialogue} (${cycleIndex + 1})`
      }
    }

    addShot({
      projectId,
      seasonNumber: 1, // 默认第一季
      episodeNumber: (i % 10) + 1, // 循环分配集数 1-10
      sceneNumber,
      shotSize: template.shotSize,
      cameraMovement: template.cameraMovement,
      duration: template.duration,
      description,
      dialogue,
      sound: template.sound,
      createdBy: SEED_DATA_MARKER,
      aiGenerated: true,
    })

    generatedCount++
  }

  console.log(`为项目 ${projectId} 生成了 ${generatedCount} 个分镜头`)
  return generatedCount
}

/**
 * 为所有演示项目生成分镜头数据
 * @param force 是否强制重新生成（覆盖现有数据）
 * @returns 生成的分镜头总数
 */
export function seedAllStoryboardData(force: boolean = false): number {
  const { user } = useProjectStore.getState()
  if (!user) {
    console.log('No user logged in, skipping storyboard seed data')
    return 0
  }

  const { projects } = useProjectStore.getState()
  const { shots, deleteShots } = useStoryboardStore.getState()

  // 筛选演示项目（createdBy 为 'system' 的项目）
  const demoProjects = projects.filter((p) => p.createdBy === 'system')

  if (demoProjects.length === 0) {
    console.log('No demo projects found')
    return 0
  }

  let totalGenerated = 0

  demoProjects.forEach((project) => {
    const existingShots = shots.filter((s) => s.projectId === project.id)

    // 如果不是强制模式且已有分镜头，跳过
    if (!force && existingShots.length > 0) {
      console.log(`项目 ${project.name} 已有 ${existingShots.length} 个分镜头，跳过`)
      return
    }

    // 如果是强制模式，先清除现有的模拟数据
    if (force) {
      const seedShotIds = existingShots
        .filter((s) => s.createdBy === SEED_DATA_MARKER)
        .map((s) => s.id)

      if (seedShotIds.length > 0) {
        deleteShots(seedShotIds)
        console.log(`清除项目 ${project.name} 的 ${seedShotIds.length} 个模拟分镜头`)
      }
    }

    // 根据项目的 totalShots 生成对应数量的分镜头
    const shotCount = project.totalShots || 10 // 默认 10 个
    const generated = seedShotsForProject(project.id, project.type, shotCount)
    totalGenerated += generated
  })

  console.log(`共为 ${demoProjects.length} 个演示项目生成了 ${totalGenerated} 个分镜头`)
  return totalGenerated
}

/**
 * 清除所有模拟生成的分镜头数据
 */
export function clearStoryboardSeedData(): void {
  const { shots, deleteShots } = useStoryboardStore.getState()

  // 筛选出所有模拟数据
  const seedShotIds = shots
    .filter((s) => s.createdBy === SEED_DATA_MARKER)
    .map((s) => s.id)

  if (seedShotIds.length > 0) {
    deleteShots(seedShotIds)
    console.log(`清除了 ${seedShotIds.length} 个模拟分镜头`)
  } else {
    console.log('没有找到模拟分镜头数据')
  }
}

/**
 * 检查项目是否有模拟数据
 */
export function hasSeedData(projectId: string): boolean {
  const { shots } = useStoryboardStore.getState()
  return shots.some(
    (s) => s.projectId === projectId && s.createdBy === SEED_DATA_MARKER
  )
}
