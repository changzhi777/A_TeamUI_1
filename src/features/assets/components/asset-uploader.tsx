/**
 * Asset Uploader Component (Wizard Style)
 * 资产上传组件 - 横版向导式
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Asset, AssetType, AssetSource, AssetScope } from '@/lib/types/assets'
import { useAssetMutations } from '@/stores/asset-store'
import { UploadStepIndicator } from './upload-step-indicator'
import { FileSelectionStep, type SelectedFile } from './file-selection-step'
import { MetadataStep, type FileMetadata } from './metadata-step'
import { ConfirmationStep } from './confirmation-step'

interface AssetUploaderProps {
  projectId?: string
  scope?: AssetScope
  onComplete?: (assets: Asset[]) => void
  onClose?: () => void
}

// 步骤定义
const STEPS = [
  { id: 1, title: '选择文件', description: '选择要上传的文件' },
  { id: 2, title: '填写信息', description: '设置资产元数据' },
  { id: 3, title: '确认上传', description: '检查并开始上传' },
]

// 上传状态
interface FileUploadStatus {
  fileId: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

// 默认元数据
function getDefaultMetadata(file: SelectedFile, scope: AssetScope): FileMetadata {
  const nameFromFile = file.file.name.replace(/\.[^/.]+$/, '')
  return {
    name: nameFromFile,
    type: file.type === 'unknown' ? 'image' : file.type,
    source: 'upload',
    scope,
    tags: [],
    description: '',
  }
}

export function AssetUploader({
  projectId,
  scope = 'global',
  onComplete,
  onClose,
}: AssetUploaderProps) {
  const { uploadAsset } = useAssetMutations()

  // 步骤状态
  const [currentStep, setCurrentStep] = useState(1)

  // 文件状态
  const [files, setFiles] = useState<SelectedFile[]>([])

  // 元数据状态
  const [metadataMap, setMetadataMap] = useState<Map<string, FileMetadata>>(new Map())

  // 上传状态
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatuses, setUploadStatuses] = useState<Map<string, FileUploadStatus>>(
    new Map()
  )

  // 已上传的资产
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([])

  // 当文件变化时，初始化元数据
  useEffect(() => {
    const newMetadataMap = new Map(metadataMap)
    let changed = false

    files.forEach((file) => {
      if (file.isValid && !newMetadataMap.has(file.id)) {
        newMetadataMap.set(file.id, getDefaultMetadata(file, scope))
        changed = true
      }
    })

    // 移除无效文件的元数据
    const validFileIds = new Set(files.filter((f) => f.isValid).map((f) => f.id))
    newMetadataMap.forEach((_, key) => {
      if (!validFileIds.has(key)) {
        newMetadataMap.delete(key)
        changed = true
      }
    })

    if (changed) {
      setMetadataMap(newMetadataMap)
    }
  }, [files, scope])

  // 获取有效文件
  const validFiles = files.filter((f) => f.isValid)

  // 步骤导航
  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        return validFiles.length > 0
      case 2:
        // 检查所有文件都有名称
        return validFiles.every((f) => {
          const metadata = metadataMap.get(f.id)
          return metadata?.name && metadata.name.trim().length > 0
        })
      case 3:
        return false // 最后一步不能继续
      default:
        return false
    }
  }, [currentStep, validFiles, metadataMap])

  const canGoBack = useCallback(() => {
    return currentStep > 1 && !isUploading
  }, [currentStep, isUploading])

  const handleNext = useCallback(() => {
    if (canGoNext() && currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [canGoNext, currentStep])

  const handleBack = useCallback(() => {
    if (canGoBack()) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [canGoBack])

  // 处理元数据变更
  const handleMetadataChange = useCallback(
    (fileId: string, metadata: FileMetadata) => {
      setMetadataMap((prev) => {
        const newMap = new Map(prev)
        newMap.set(fileId, metadata)
        return newMap
      })
    },
    []
  )

  const handleCommonMetadataChange = useCallback((metadata: FileMetadata) => {
    // 通用设置会单独处理
  }, [])

  // 开始上传
  const handleStartUpload = useCallback(async () => {
    if (isUploading || validFiles.length === 0) return

    setIsUploading(true)
    setUploadedAssets([])

    // 初始化上传状态
    const initialStatuses = new Map<string, FileUploadStatus>()
    validFiles.forEach((file) => {
      initialStatuses.set(file.id, {
        fileId: file.id,
        status: 'pending',
        progress: 0,
      })
    })
    setUploadStatuses(initialStatuses)

    const assets: Asset[] = []

    // 依次上传每个文件
    for (const file of validFiles) {
      const metadata = metadataMap.get(file.id)
      if (!metadata) continue

      // 更新状态为上传中
      setUploadStatuses((prev) => {
        const newMap = new Map(prev)
        newMap.set(file.id, {
          fileId: file.id,
          status: 'uploading',
          progress: 0,
        })
        return newMap
      })

      try {
        const asset = await uploadAsset({
          file: file.file,
          name: metadata.name,
          type: metadata.type as AssetType,
          source: metadata.source as AssetSource,
          scope: metadata.scope as AssetScope,
          projectId: projectId,
          tags: metadata.tags,
          description: metadata.description,
        })

        assets.push(asset)

        // 更新状态为成功
        setUploadStatuses((prev) => {
          const newMap = new Map(prev)
          newMap.set(file.id, {
            fileId: file.id,
            status: 'success',
            progress: 100,
          })
          return newMap
        })
      } catch (error) {
        // 更新状态为失败
        setUploadStatuses((prev) => {
          const newMap = new Map(prev)
          newMap.set(file.id, {
            fileId: file.id,
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error.message : '上传失败',
          })
          return newMap
        })
      }
    }

    setIsUploading(false)
    setUploadedAssets(assets)

    // 显示结果
    const successCount = assets.length
    const failCount = validFiles.length - successCount

    if (successCount > 0 && failCount === 0) {
      toast.success(`成功上传 ${successCount} 个资产`)
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`上传完成：${successCount} 个成功，${failCount} 个失败`)
    } else {
      toast.error('上传失败')
    }

    // 回调
    if (assets.length > 0 && onComplete) {
      onComplete(assets)
    }
  }, [isUploading, validFiles, metadataMap, projectId, uploadAsset, onComplete])

  // 检查是否全部完成
  const allCompleted =
    uploadStatuses.size > 0 &&
    Array.from(uploadStatuses.values()).every((s) => s.status === 'success')

  // 是否可以关闭（上传完成后或未开始上传时）
  const canClose = !isUploading

  // 处理关闭
  const handleClose = useCallback(() => {
    if (canClose) {
      if (allCompleted && onClose) {
        onClose()
      } else if (!isUploading && onClose) {
        onClose()
      }
    }
  }, [canClose, allCompleted, isUploading, onClose])

  return (
    <div className="flex flex-col h-full">
      {/* 步骤指示器 */}
      <div className="pb-6 border-b">
        <UploadStepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* 步骤内容 */}
      <div className="flex-1 overflow-y-auto py-6">
        {currentStep === 1 && (
          <FileSelectionStep files={files} onFilesChange={setFiles} />
        )}

        {currentStep === 2 && (
          <MetadataStep
            files={files}
            scope={scope}
            projectId={projectId}
            metadataMap={metadataMap}
            onMetadataChange={handleMetadataChange}
            onCommonMetadataChange={handleCommonMetadataChange}
          />
        )}

        {currentStep === 3 && (
          <ConfirmationStep
            files={files}
            metadataMap={metadataMap}
            uploadStatuses={uploadStatuses}
            isUploading={isUploading}
            onStartUpload={handleStartUpload}
          />
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={!canGoBack()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>

        <div className="flex gap-2">
          {allCompleted ? (
            <Button onClick={handleClose}>
              完成
            </Button>
          ) : currentStep === 3 ? (
            <Button disabled={isUploading}>
              {isUploading ? '上传中...' : '准备就绪'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              下一步
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
