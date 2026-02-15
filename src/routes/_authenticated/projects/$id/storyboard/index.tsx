/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { StoryboardPage } from '@/features/storyboard'

export const Route = createFileRoute('/_authenticated/projects/$id/storyboard/')({
  component: StoryboardPage,
})
