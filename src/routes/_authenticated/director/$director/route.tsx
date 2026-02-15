/**
 * route
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { DirectorDetailPage } from '@/features/projects/components/director-detail'

export const Route = createFileRoute('/_authenticated/director/$director')({
  component: DirectorDetailPage,
})
