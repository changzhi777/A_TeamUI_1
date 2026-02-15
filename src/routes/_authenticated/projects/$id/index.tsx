/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { ProjectDetailPage } from '@/features/projects/components/project-detail'

export const Route = createFileRoute('/_authenticated/projects/$id/')({
  component: ProjectDetailPage,
})
