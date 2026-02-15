/**
 * api
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * API Settings Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { ApiSettings } from '@/features/settings/api/api-settings'

export const Route = createFileRoute('/_authenticated/settings/api')({
  component: ApiSettings,
})
