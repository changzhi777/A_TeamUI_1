/**
 * selected-project-api
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useProjectStore } from '@/stores/project-store'

export interface SelectedProjectAPI {
  getSelectedProjectId: () => string | null
  getSelectedProject: () => ReturnType<typeof useProjectStore.getState>['projects'][number] | null
  selectProject: (id: string | null) => void
  ensureSelectedProject: () => void
}

export function useSelectedProjectAPI(): SelectedProjectAPI {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId)
  const getSelectedProject = useProjectStore((state) => state.getSelectedProject)
  const selectProject = useProjectStore((state) => state.selectProject)
  const ensureSelectedProject = useProjectStore((state) => state.ensureSelectedProject)

  return {
    getSelectedProjectId: () => selectedProjectId,
    getSelectedProject,
    selectProject,
    ensureSelectedProject,
  }
}

export function getSelectedProjectId(): string | null {
  return useProjectStore.getState().selectedProjectId
}

export function getSelectedProject() {
  return useProjectStore.getState().getSelectedProject()
}

export function selectProject(id: string | null) {
  useProjectStore.getState().selectProject(id)
}

export function ensureSelectedProject() {
  useProjectStore.getState().ensureSelectedProject()
}
