import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Steps, Step } from '@/components/ui/steps'
import { Progress } from '@/components/ui/progress'
import { Download } from 'lucide-react'
import { Step1_TypeSelection } from './export/steps/step1-type-selection'
import { Step2_FormatSelection } from './export/steps/step2-format-selection'
import { Step3_ColumnSelection } from './export/steps/step3-column-selection'
import { Step4_PreviewSettings } from './export/steps/step4-preview-settings'
import { Step5_ConfirmExport } from './export/steps/step5-confirm-export'
import { TEMPLATE_COLUMNS } from '@/lib/export/template'
import type { StoryboardShot } from '@/stores'

interface TemplateExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shots: StoryboardShot[]
  projectName?: string
}

export type TemplateType = 'blank' | 'data'
export type ExportFormat = 'csv' | 'json' | 'word'

export interface ExportConfig {
  templateType: TemplateType
  format: ExportFormat
  selectedColumns: string[]
  filename: string
  includeDescription: boolean
  includeSampleData: boolean
}

const DEFAULT_FILENAME = '分镜头向导'

export function TemplateExportDialog({
  open,
  onOpenChange,
  shots,
  projectName,
}: TemplateExportDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ExportConfig>({
    templateType: 'blank',
    format: 'csv',
    selectedColumns: TEMPLATE_COLUMNS.slice(0, 6).map(c => c.key), // 默认选择前6列
    filename: DEFAULT_FILENAME,
    includeDescription: true,
    includeSampleData: false,
  })

  const [isExporting, setIsExporting] = useState(false)

  const totalSteps = 5

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

  const handleConfigChange = (updates: Partial<ExportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // 根据选择的格式和类型执行导出
      const { exportBlankCSVTemplate, exportDataCSVTemplate, exportBlankJSONTemplate, exportDataJSONTemplate, generateFilename } = await import('@/lib/export/template')
      const { TEMPLATE_COLUMNS } = await import('@/lib/export/template')

      const selectedColumnsDefs = TEMPLATE_COLUMNS.filter(c =>
        config.selectedColumns.includes(c.key)
      )

      const filename = config.filename || generateFilename(config.templateType, config.format, projectName)

      if (config.templateType === 'blank') {
        if (config.format === 'csv') {
          exportBlankCSVTemplate(selectedColumnsDefs, filename)
        } else if (config.format === 'json') {
          exportBlankJSONTemplate(selectedColumnsDefs, filename)
        }
        // TODO: Word format
      } else {
        if (config.format === 'csv') {
          exportDataCSVTemplate(shots, selectedColumnsDefs, filename)
        } else if (config.format === 'json') {
          exportDataJSONTemplate(shots, selectedColumnsDefs, projectName || '分镜头向导', filename)
        }
        // TODO: Word format
      }

      // 导出成功后关闭对话框
      setTimeout(() => {
        onOpenChange(false)
        setCurrentStep(1)
      }, 500)
    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      onOpenChange(false)
      setTimeout(() => setCurrentStep(1), 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            导出分镜头向导
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Steps currentStep={currentStep} maxStep={5}>
            <Step step={1} title="选择向导类型" />
            <Step step={2} title="选择格式" />
            <Step step={3} title="选择列" />
            <Step step={4} title="预览设置" />
            <Step step={5} title="确认导出" />
          </Steps>

          {/* 进度条 */}
          <Progress value={(currentStep / totalSteps) * 100} className="mb-6" />

          {/* 步骤内容 */}
          {currentStep === 1 && (
            <Step1_TypeSelection
              selectedType={config.templateType}
              onTypeChange={(type) => handleConfigChange({ templateType: type })}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2_FormatSelection
              selectedFormat={config.format}
              onFormatChange={(format) => handleConfigChange({ format })}
              templateType={config.templateType}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <Step3_ColumnSelection
              selectedColumns={config.selectedColumns}
              onColumnsChange={(columns) => handleConfigChange({ selectedColumns: columns })}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <Step4_PreviewSettings
              config={config}
              shots={shots}
              onConfigChange={handleConfigChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 5 && (
            <Step5_ConfirmExport
              config={config}
              shots={shots}
              projectName={projectName}
              onExport={handleExport}
              onPrevious={handlePrevious}
              isExporting={isExporting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
