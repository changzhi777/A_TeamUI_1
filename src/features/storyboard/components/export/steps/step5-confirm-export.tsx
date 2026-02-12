import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import type { ExportConfig } from '../../template-export-dialog'
import type { StoryboardShot } from '@/stores'

interface Step5_ConfirmExportProps {
  config: ExportConfig
  shots: StoryboardShot[]
  projectName?: string
  onExport: () => void
  onPrevious: () => void
  isExporting: boolean
}

const FORMAT_LABELS: Record<string, string> = {
  csv: 'CSV',
  json: 'JSON',
  word: 'Word',
}

const TYPE_LABELS: Record<string, string> = {
  blank: '空白向导',
  data: '数据向导',
}

export function Step5_ConfirmExport({
  config,
  shots,
  projectName,
  onExport,
  onPrevious,
  isExporting,
}: Step5_ConfirmExportProps) {
  const dataCount = config.templateType === 'data' ? shots.length : 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        确认导出设置并执行导出
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">导出摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">向导类型</p>
              <p className="font-medium">{TYPE_LABELS[config.templateType]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">导出格式</p>
              <p className="font-medium">{FORMAT_LABELS[config.format]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">包含列数</p>
              <p className="font-medium">{config.selectedColumns.length} 列</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">文件名</p>
              <p className="font-medium truncate" title={config.filename}>
                {config.filename || '未命名'}
              </p>
            </div>
          </div>

          {config.templateType === 'data' && projectName && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">源项目</p>
              <p className="font-medium">{projectName}</p>
              <p className="text-sm text-muted-foreground">分镜头数量</p>
              <p className="font-medium">{dataCount} 个</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled={isExporting}>
          上一步
        </Button>
        <Button onClick={onExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? '导出中...' : '确认导出'}
        </Button>
      </div>
    </div>
  )
}
