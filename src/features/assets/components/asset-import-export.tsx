/**
 * asset-import-export
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Import Export
 * 资产导入导出组件
 */

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAssetStore, useGlobalAssets } from '@/stores/asset-store'
import { exportAssetsCsv, importAssetsCsv } from '@/lib/api/assets'

interface AssetImportExportProps {
  className?: string
  onRefresh?: () => void
}

export function AssetImportExport({ className, onRefresh }: AssetImportExportProps) {
  const { selectedAssets } = useAssetStore()
  const { refetch } = useGlobalAssets()

  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    successCount: number
    failedCount: number
    errors: string[]
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 计算选中数量
  const selectedCount = selectedAssets.size

  // 导出资产
  const handleExport = async (exportSelected: boolean = false) => {
    setIsProcessing(true)
    try {
      const assetIds = exportSelected && selectedCount > 0 ? Array.from(selectedAssets) : undefined
      const csv = await exportAssetsCsv(assetIds)

      // 创建下载
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assets-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(
        exportSelected
          ? `已导出 ${selectedCount} 个选中资产`
          : '资产导出成功'
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导出失败')
    } finally {
      setIsProcessing(false)
    }
  }

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.endsWith('.csv')) {
      toast.error('请选择 CSV 文件')
      return
    }

    setIsProcessing(true)
    setImportResult(null)

    try {
      const content = await file.text()
      const result = await importAssetsCsv(content)
      setImportResult({
        success: result.success > 0,
        successCount: result.success,
        failedCount: result.failed,
        errors: result.errors.map(e => `${e.id}: ${e.error}`),
      })

      if (result.success > 0) {
        refetch()
        onRefresh?.()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导入失败')
    } finally {
      setIsProcessing(false)
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 导出按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(false)}
        disabled={isProcessing}
      >
        <Download className="h-4 w-4 mr-1" />
        导出
      </Button>

      {/* 导出选中 */}
      {selectedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport(true)}
          disabled={isProcessing}
        >
          <Download className="h-4 w-4 mr-1" />
          导出选中 ({selectedCount})
        </Button>
      )}

      {/* 导入按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowImportDialog(true)}
        disabled={isProcessing}
      >
        <Upload className="h-4 w-4 mr-1" />
        导入
      </Button>

      {/* 导入对话框 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入资产</DialogTitle>
            <DialogDescription>
              上传 CSV 文件批量导入资产元数据。文件格式要求：第一行为标题行，包含
              ID、名称、类型、来源、范围、URL、标签、描述、创建时间 列。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* 文件上传区域 */}
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    正在导入...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    点击选择 CSV 文件
                  </span>
                </div>
              )}
            </div>

            {/* 导入结果 */}
            {importResult && (
              <div className="mt-4 space-y-2">
                <Alert
                  variant={importResult.success ? 'default' : 'destructive'}
                >
                  <div className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      导入完成：成功 {importResult.successCount} 个
                      {importResult.failedCount > 0 &&
                        `，失败 ${importResult.failedCount} 个`}
                    </AlertDescription>
                  </div>
                </Alert>

                {importResult.errors.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">错误详情：</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... 还有 {importResult.errors.length - 5} 个错误</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false)
                setImportResult(null)
              }}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
