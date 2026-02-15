/**
 * 500
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { GeneralError } from '@/features/errors/general-error'

export const Route = createFileRoute('/(errors)/500')({
  component: GeneralError,
})
