/**
 * Asset Library Route
 * 全局资产库路由
 */

import { createFileRoute } from '@tanstack/react-router'
import { AssetLibraryPage } from '@/features/assets/pages/asset-library-page'

export const Route = createFileRoute('/_authenticated/assets')({
  component: AssetLibraryPage,
})
