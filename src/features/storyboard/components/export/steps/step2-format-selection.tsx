import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileSpreadsheet, FileCode, FileText } from 'lucide-react'
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
  ] as const

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        请选择导出格式（{templateType === 'blank' ? '空白向导' : '数据向导'}）
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <format.icon className={`h-12 w-12 ${format.color}`} />
                <div>
                  <h3 className="font-semibold">{format.name}</h3>
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
