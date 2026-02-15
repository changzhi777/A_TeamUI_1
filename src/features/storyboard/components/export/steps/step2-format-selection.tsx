/**
 * step2-format-selection
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileSpreadsheet, FileCode, FileText, File, FileType } from 'lucide-react'
import type { TemplateType, ExportFormat } from '../../template-export-dialog'

interface Step2_FormatSelectionProps {
  selectedFormat: ExportFormat
  onFormatChange: (format: ExportFormat) => void
  templateType: TemplateType
  onNext: () => void
  onPrevious: () => void
}

export function Step2_FormatSelection({
  selectedFormat,
  onFormatChange,
  templateType,
  onNext,
  onPrevious,
}: Step2_FormatSelectionProps) {
  const formats = [
    {
      id: 'csv',
      name: 'CSV',
      icon: FileSpreadsheet,
      description: 'Excel兼容，适合线下编辑和数据交换',
      color: 'text-green-600',
    },
    {
      id: 'json',
      name: 'JSON',
      icon: FileCode,
      description: '完整数据结构，适合系统间传输和备份',
      color: 'text-blue-600',
    },
    {
      id: 'word',
      name: 'Word',
      icon: FileText,
      description: '专业排版，适合打印和分享',
      color: 'text-blue-800',
    },
    {
      id: 'md',
      name: 'Markdown',
      icon: FileType,
      description: '文档工具兼容，适合 Notion/Obsidian',
      color: 'text-purple-600',
    },
    {
      id: 'pdf',
      name: 'PDF',
      icon: File,
      description: '表格格式，适合打印和分享',
      color: 'text-red-600',
    },
  ] as const

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        请选择导出格式（{templateType === 'blank' ? '空白向导' : '数据向导'}）
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {formats.map((format) => (
          <Card
            key={format.id}
            className={`cursor-pointer transition-all ${
              selectedFormat === format.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
            }`}
            onClick={() => onFormatChange(format.id as ExportFormat)}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <format.icon className={`h-10 w-10 ${format.color}`} />
                <div>
                  <h3 className="font-semibold text-sm">{format.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button onClick={onNext}>下一步</Button>
      </div>
    </div>
  )
}
