/**
 * asset-grid
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Grid Component
 * 资产网格视图组件
 */

import React from 'react'
import type { Asset } from '@/lib/types/assets'
import { AssetCard } from './asset-card'
import { AssetPreviewDialog } from './asset-preview-dialog'
import { useState } from 'react'

interface AssetGridProps {
  assets: Asset[]
  onUpdate?: () => void
}

export function AssetGrid({ assets, onUpdate }: AssetGridProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)

  const handlePreview = (asset: Asset) => {
    setPreviewAsset(asset)
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPreview={() => handlePreview(asset)}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {/* 预览对话框 */}
      {previewAsset && (
        <AssetPreviewDialog
          asset={previewAsset}
          open={!!previewAsset}
          onOpenChange={(open) => !open && setPreviewAsset(null)}
        />
      )}
    </>
  )
}
