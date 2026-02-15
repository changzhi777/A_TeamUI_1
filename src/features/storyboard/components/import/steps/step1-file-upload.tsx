/**
 * step1-file-upload
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, FileCode } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface Step1_FileUploadProps {
  onFileSelected: (file: File) => void
  onNext: () => void
}

export function Step1_FileUpload({ onFileSelected, onNext }: Step1_FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('文件大小超过限制，最大支持 10MB')
      return
    }

    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.csv') || fileName.endsWith('.json')) {
      setSelectedFile(file)
      onFileSelected(file)
    } else {
      toast.error('请上传 CSV 或 JSON 格式的文件')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          请上传包含分镜头数据的文件，支持 CSV 和 JSON 格式
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div
          className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-base font-medium mb-2">{isDragging ? '释放文件以上传' : '拖放文件到此处或点击选择'}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            支持 CSV 和 JSON 格式文件，最大 10MB
          </p>
          <Button variant="default" size="sm">
            选择文件
          </Button>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>CSV 格式</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCode className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>JSON 格式</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs">最大 10MB</span>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="p-3 bg-muted rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedFile.name.toLowerCase().endsWith('.csv') ? (
              <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <FileCode className="h-5 w-5 text-blue-600 flex-shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)} className="ml-4">
            更换
          </Button>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!selectedFile}>
          下一步
        </Button>
      </div>
    </div>
  )
}
