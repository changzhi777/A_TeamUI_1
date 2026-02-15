/**
 * asset-list
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset List Component
 * 资产列表视图组件
 */

import React from 'react'
import type { Asset } from '@/lib/types/assets'
import { AssetCard } from './asset-card'
import { AssetPreviewDialog } from './asset-preview-dialog'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AssetListProps {
  assets: Asset[]
  onUpdate?: () => void
}

export function AssetList({ assets, onUpdate }: AssetListProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)

  const handlePreview = (asset: Asset) => {
    setPreviewAsset(asset)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
