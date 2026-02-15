/**
 * asset-preview-audio
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Preview Audio Component
 * 音频预览组件
 */

import React from 'react'
import type { Asset } from '@/lib/types/assets'

interface AssetPreviewAudioProps {
  asset: Asset
}

export function AssetPreviewAudio({ asset }: AssetPreviewAudioProps) {
  return (
    <div className="bg-black/5 rounded-lg p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <audio
          src={asset.url}
          controls
          controlsList="nodownload"
          className="w-full"
        >
          您的浏览器不支持音频播放
        </audio>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">{asset.name}</p>
        </div>
      </div>
    </div>
  )
}
