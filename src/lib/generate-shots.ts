/**
 * generate-shots
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useStoryboardStore } from '@/stores/storyboard-store'
import { useProjectStore } from '@/stores/project-store'
import { generateMockShots } from '@/lib/mock-shots'
import { toast } from 'sonner'

export function generateShotsForSelectedProject() {
  const selectedProject = useProjectStore.getState().getSelectedProject()
  const addShot = useStoryboardStore.getState().addShot

  if (!selectedProject) {
    toast.error('请先选择一个项目')
    return
  }

  const existingShots = useStoryboardStore.getState().getShotsByProject(selectedProject.id)
  if (existingShots.length > 0) {
    toast.error('该项目已有分镜头数据，请先清空或手动添加')
    return
  }

  const mockShots = generateMockShots(selectedProject.id, selectedProject.type)

  mockShots.forEach(shot => {
    addShot(shot)
  })

  toast.success(`已为项目"${selectedProject.name}"生成${mockShots.length}个分镜头`)
}

export function generateShotsForProject(projectId: string, projectType: string) {
  const addShot = useStoryboardStore.getState().addShot
  const mockShots = generateMockShots(projectId, projectType as any)

  mockShots.forEach(shot => {
    addShot(shot)
  })

  return mockShots.length
}
