/**
 * Asset Preview Video Component
 * 视频预览组件
 */

import { useState, useRef } from 'react'
import React from 'react'
import type { Asset } from '@/lib/types/assets'

interface AssetPreviewVideoProps {
  asset: Asset
}

export function AssetPreviewVideo({ asset }: AssetPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="aspect-video bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={asset.url}
        controls
        controlsList="nodownload"
        className="max-w-full max-h-full"
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  )
}
