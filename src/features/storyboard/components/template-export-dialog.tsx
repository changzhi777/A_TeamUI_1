/**
 * template-export-dialog
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Steps, Step } from '@/components/ui/steps'
import { Progress } from '@/components/ui/progress'
import { Download, FolderOpen } from 'lucide-react'
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

const DEFAULT_PROJECT_NAME = '未知项目'

export type TemplateType = 'blank' | 'data'
export type ExportFormat = 'csv' | 'json' | 'word' | 'md' | 'pdf'

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
      const {
        exportBlankCSVTemplate,
        exportDataCSVTemplate,
        exportBlankJSONTemplate,
        exportDataJSONTemplate,
        exportBlankPDFTemplate,
        exportDataPDFTemplate,
        generateFilename,
        TEMPLATE_COLUMNS
      } = await import('@/lib/export/template')

      const { exportBlankMarkdownTemplate, exportDataMarkdownTemplate } = await import('@/lib/export/markdown')

      const selectedColumnsDefs = TEMPLATE_COLUMNS.filter(c =>
        config.selectedColumns.includes(c.key)
      )

      const filename = config.filename || generateFilename(config.templateType, config.format, projectName)

      if (config.templateType === 'blank') {
        switch (config.format) {
          case 'csv':
            exportBlankCSVTemplate(selectedColumnsDefs, filename)
            break
          case 'json':
            exportBlankJSONTemplate(selectedColumnsDefs, filename)
            break
          case 'md':
            exportBlankMarkdownTemplate(selectedColumnsDefs, filename)
            break
          case 'pdf':
            await exportBlankPDFTemplate(selectedColumnsDefs, filename)
            break
          case 'word':
            // TODO: Word format
            break
        }
      } else {
        switch (config.format) {
          case 'csv':
            exportDataCSVTemplate(shots, selectedColumnsDefs, filename)
            break
          case 'json':
            exportDataJSONTemplate(shots, selectedColumnsDefs, projectName || '分镜头向导', filename)
            break
          case 'md':
            exportDataMarkdownTemplate(shots, selectedColumnsDefs, projectName || '分镜头向导', filename)
            break
          case 'pdf':
            await exportDataPDFTemplate(shots, selectedColumnsDefs, projectName || '分镜头向导', filename)
            break
          case 'word':
            // TODO: Word format
            break
        }
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
      <DialogContent className="p-0" defaultWidth={1000} defaultHeight={600}>
        {/* 横版布局：左侧进度 + 右侧内容 */}
        <div className="flex h-full">
          {/* 左侧：竖置进度区域 */}
          <div className="w-52 border-e bg-muted/30 p-4 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Download className="h-4 w-4" />
                导出分镜头向导
              </DialogTitle>
              {/* 项目名称 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 pt-2 border-t">
                <FolderOpen className="h-3 w-3" />
                <span className="truncate">{projectName || DEFAULT_PROJECT_NAME}</span>
              </div>
            </DialogHeader>

            {/* 竖置步骤 */}
            <Steps currentStep={currentStep} maxStep={5} orientation="vertical" className="flex-1">
              <Step step={1} title="选择向导类型" />
              <Step step={2} title="选择格式" />
              <Step step={3} title="选择列" />
              <Step step={4} title="预览设置" />
              <Step step={5} title="确认导出" />
            </Steps>

            {/* 底部竖置进度条 */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  orientation="vertical"
                  className="h-16 w-2"
                />
                <div className="text-xs text-muted-foreground">
                  <div>步骤 {currentStep}/{totalSteps}</div>
                  <div className="font-medium text-foreground">{Math.round((currentStep / totalSteps) * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：内容区域 */}
          <div className="flex-1 p-6">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
