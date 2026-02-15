/**
 * route
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Project Assets Route
 * 项目资产路由
 */

import { createFileRoute } from '@tanstack/react-router'
import { ProjectAssetsPage } from '@/features/assets/pages/project-assets-page'

export const Route = createFileRoute('/_authenticated/projects/$id/assets')({
  component: ProjectAssetsPage,
})
