import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Steps, Step } from '@/components/ui/steps'
import { Progress } from '@/components/ui/progress'
import { Upload } from 'lucide-react'
import { Step1_FileUpload } from './import/steps/step1-file-upload'
import { Step2_FormatValidation } from './import/steps/step2-format-validation'
import { Step3_FieldMapping } from './import/steps/step3-field-mapping'
import { Step4_DataPreview } from './import/steps/step4-data-preview'
import { Step5_ImportOptions } from './import/steps/step5-import-options'
import { Step6_ImportResult } from './import/steps/step6-import-result'
import { convertToStoryboardShot, type ImportResult as ParserImportResult, type ParsedShot } from '@/lib/import/template'
import type { StoryboardShot } from '@/stores'
import { useStoryboardStore } from '@/stores/storyboard-store'
import { toast } from 'sonner'

interface TemplateImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export type ImportStatus = 'idle' | 'validating' | 'mapping' | 'previewing' | 'configuring' | 'importing' | 'completed' | 'failed'

interface ImportConfig {
  file: File | null
  parsedData: ParserImportResult | null
  fieldMapping: Record<string, string>
  importMode: 'append' | 'replace'
  startShotNumber: number
  validateData: boolean
  showWarnings: boolean
}

const DEFAULT_CONFIG: ImportConfig = {
  file: null,
  parsedData: null,
  fieldMapping: {},
  importMode: 'append',
  startShotNumber: 1,
  validateData: true,
  showWarnings: true,
}

export function TemplateImportDialog({ open, onOpenChange, projectId }: TemplateImportDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ImportConfig>(DEFAULT_CONFIG)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [importResult, setImportResult] = useState<{
    success: boolean
    importedCount: number
    errors: string[]
    warnings: string[]
  } | null>(null)

  const addShots = useStoryboardStore((state) => state.addShots)
  const deleteShots = useStoryboardStore((state) => state.deleteShots)
  const getShotsByProject = useStoryboardStore((state) => state.getShotsByProject)

  const totalSteps = 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfigChange = (updates: Partial<ImportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const handleImport = async () => {
    setStatus('importing')
    const errors: string[] = []
    const warnings: string[] = []
    let importedCount = 0

    try {
      if (!config.parsedData?.data) {
        throw new Error('没有可导入的数据')
      }

      const data = config.parsedData.data
      warnings.push(...config.parsedData.warnings)

      // 替换模式：先清除项目的现有分镜头
      if (config.importMode === 'replace') {
        const existingShots = getShotsByProject(projectId)
        if (existingShots.length > 0) {
          const shotIds = existingShots.map(s => s.id)
          deleteShots(shotIds)
          warnings.push(`已清除项目的 ${existingShots.length} 个现有分镜头`)
        }
      }

      // 计算起始镜头编号
      let currentShotNumber = config.startShotNumber
      if (config.importMode === 'append') {
        const existingShots = getShotsByProject(projectId)
        if (existingShots.length > 0) {
          const maxShotNumber = Math.max(...existingShots.map(s => s.shotNumber))
          currentShotNumber = Math.max(config.startShotNumber, maxShotNumber + 1)
        }
      }

      // 使用批量导入方法
      try {
        const shotsToImport: Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>[] = []
        for (let i = 0; i < data.length; i++) {
          const parsedShot: ParsedShot = data[i]
          const shotNumber = currentShotNumber + i
          const storyboardShot = convertToStoryboardShot(parsedShot, projectId, shotNumber)
          // 移除 id、createdAt 和 updatedAt 字段，因为 addShots 方法会自动生成这些字段
          const { id, createdAt, updatedAt, ...shotDataWithoutIdAndDates } = storyboardShot
          shotsToImport.push(shotDataWithoutIdAndDates)
        }
        addShots(shotsToImport)
        importedCount = shotsToImport.length
      } catch (error) {
        errors.push(`批量导入失败: ${(error as Error).message}`)
      }

      // 设置导入结果
      setImportResult({
        success: errors.length === 0,
        importedCount,
        errors,
        warnings,
      })

      setStatus(errors.length === 0 ? 'completed' : 'failed')
      setCurrentStep(6)

      // 显示 toast 提示
      if (errors.length === 0) {
        toast.success(`成功导入 ${importedCount} 个分镜头`, {
          description: config.importMode === 'replace' ? '原有数据已被清除' : '已追加到现有数据',
        })
      } else {
        toast.error(`导入完成但有 ${errors.length} 个错误`, {
          description: '请查看下方详细错误信息',
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        importedCount,
        errors: [`导入失败: ${(error as Error).message}`],
        warnings,
      })
      setStatus('failed')
      setCurrentStep(6)
      toast.error('导入失败，请查看错误详情')
    }
  }

  const handleClose = () => {
    if (status !== 'importing') {
      onOpenChange(false)
      setTimeout(() => {
        setCurrentStep(1)
        setConfig(DEFAULT_CONFIG)
        setStatus('idle')
        setImportResult(null)
      }, 300)
    }
  }

  const handleRestart = () => {
    setCurrentStep(1)
    setConfig(DEFAULT_CONFIG)
    setStatus('idle')
    setImportResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[1800px] max-h-[90vh] p-6 overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            导入分镜头向导
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <Steps currentStep={currentStep} maxStep={6}>
            <Step step={1} title="上传文件" />
            <Step step={2} title="格式验证" />
            <Step step={3} title="字段映射" />
            <Step step={4} title="数据预览" />
            <Step step={5} title="导入选项" />
            <Step step={6} title="导入结果" />
          </Steps>

          <Progress value={(currentStep / totalSteps) * 100} />

          <div className="space-y-4">
            {currentStep === 1 && (
              <Step1_FileUpload
                onFileSelected={(file) => handleConfigChange({ file })}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <Step2_FormatValidation
                file={config.file}
                onValidationComplete={(result) => handleConfigChange({ parsedData: result })}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 3 && (
              <Step3_FieldMapping
                parsedData={config.parsedData}
                fieldMapping={config.fieldMapping}
                onMappingChange={(mapping) => handleConfigChange({ fieldMapping: mapping })}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 4 && (
              <Step4_DataPreview
                parsedData={config.parsedData}
                fieldMapping={config.fieldMapping}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 5 && (
              <Step5_ImportOptions
                importMode={config.importMode}
                startShotNumber={config.startShotNumber}
                validateData={config.validateData}
                showWarnings={config.showWarnings}
                onOptionsChange={(options) => handleConfigChange(options)}
                onImport={handleImport}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 6 && (
              <Step6_ImportResult
                result={importResult}
                status={status}
                onClose={handleClose}
                onRestart={handleRestart}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
