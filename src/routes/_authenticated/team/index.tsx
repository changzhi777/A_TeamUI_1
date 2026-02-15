/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { TeamMembersPage } from '@/features/projects/components/team-members'

export const Route = createFileRoute('/_authenticated/team/')({
  component: TeamMembersPage,
})
