/**
 * Asset Preview Image Component
 * 图片预览组件
 */

import { useState } from 'react'
import React from 'react'
import type { Asset } from '@/lib/types/assets'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssetPreviewImageProps {
  asset: Asset
  scale: number
  onScaleChange: (scale: number) => void
}

export function AssetPreviewImage({ asset, scale, onScaleChange }: AssetPreviewImageProps) {
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 25, 200))
  }

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 25, 50))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleFit = () => {
    onScaleChange(100)
    setRotation(0)
  }

  return (
    <div className="relative group">
      {/* 图片 */}
      <div className="flex items-center justify-center min-h-[300px] bg-background">
        <img
          src={asset.url}
          alt={asset.name}
          className="max-w-full max-h-[60vh] object-contain transition-transform"
          style={{
            transform: `scale(${scale / 100}) rotate(${rotation}deg)`,
          }}
        />
      </div>

      {/* 控制栏 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs w-12 text-center">{scale}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-white/20" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate} title="旋转">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleFit}>
          适应
        </Button>
      </div>
    </div>
  )
}
