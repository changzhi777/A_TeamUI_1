/**
 * storyboard-list
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { StoryboardListPage } from '@/features/storyboard/components/storyboard-list-page'

export const Route = createFileRoute('/_authenticated/storyboard-list')({
  component: StoryboardListPage,
})
