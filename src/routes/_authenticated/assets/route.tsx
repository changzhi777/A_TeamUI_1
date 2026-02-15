/**
 * route
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Library Route
 * 全局资产库路由
 */

import { createFileRoute } from '@tanstack/react-router'
import { AssetLibraryPage } from '@/features/assets/pages/asset-library-page'

export const Route = createFileRoute('/_authenticated/assets')({
  component: AssetLibraryPage,
})
