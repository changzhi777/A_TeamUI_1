/**
 * sign-in-2
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/(auth)/sign-in-2')({
  component: SignIn2,
})
