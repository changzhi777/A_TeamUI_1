/**
 * Project Assets Route
 * 项目资产路由
 */

import { createFileRoute } from '@tanstack/react-router'
import { ProjectAssetsPage } from '@/features/assets/pages/project-assets-page'

export const Route = createFileRoute('/_authenticated/projects/$id/assets')({
  component: ProjectAssetsPage,
})
