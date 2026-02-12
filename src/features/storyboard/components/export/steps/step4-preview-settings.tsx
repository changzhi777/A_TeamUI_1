import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TEMPLATE_COLUMNS } from '@/lib/export/template'
import type { ExportConfig } from '../../template-export-dialog'
import type { StoryboardShot } from '@/stores'

interface Step4_PreviewSettingsProps {
  config: ExportConfig
  shots: StoryboardShot[]
  onConfigChange: (updates: Partial<ExportConfig>) => void
  onNext: () => void
  onPrevious: () => void
}

export function Step4_PreviewSettings({
  config,
  shots,
  onConfigChange,
  onNext,
  onPrevious,
}: Step4_PreviewSettingsProps) {
  const { format, templateType } = config

  const selectedColumnsDefs = TEMPLATE_COLUMNS.filter(c =>
    config.selectedColumns.includes(c.key)
  )

  const previewData = templateType === 'data' ? shots.slice(0, 3) : [
    {
      shotNumber: 1,
      sceneNumber: '1-1',
      shotSize: 'long' as const,
      cameraMovement: 'static' as const,
      duration: 5,
      description: '示例：城市天际线，日出时分',
      dialogue: '示例：旁白：故事开始',
      sound: '示例：轻柔的背景音乐',
    },
    {
      shotNumber: 2,
      sceneNumber: '1-2',
      shotSize: 'medium' as const,
      cameraMovement: 'pan' as const,
      duration: 3,
      description: '示例：街道场景，主角走来',
      dialogue: '',
      sound: '示例：街道环境音',
    },
  ]

  const getCellValue = (shot: any, columnKey: string): string => {
    switch (columnKey) {
      case 'shotNumber':
        return String(shot.shotNumber)
      case 'sceneNumber':
        return shot.sceneNumber
      case 'shotSize':
        const sizeLabels: Record<string, string> = {
          extremeLong: '远景',
          long: '全景',
          medium: '中景',
          closeUp: '近景',
          extremeCloseUp: '特写',
        }
        return sizeLabels[shot.shotSize] || shot.shotSize
      case 'cameraMovement':
        const moveLabels: Record<string, string> = {
          static: '固定',
          pan: '摇',
          tilt: '俯仰',
          dolly: '推拉',
          truck: '平移',
          pedestral: '升降',
          crane: '吊臂',
          handheld: '手持',
          steadicam: '斯坦尼康',
          tracking: '跟拍',
          arc: '弧形',
        }
        return moveLabels[shot.cameraMovement] || shot.cameraMovement
      case 'duration':
        return templateType === 'blank' ? '5' : formatDuration(shot.duration)
      default:
        return shot[columnKey] || ''
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        预览导出内容并设置文件名
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="filename">文件名</Label>
          <Input
            id="filename"
            value={config.filename}
            onChange={(e) => onConfigChange({ filename: e.target.value })}
            placeholder={`分镜头向导_${new Date().toISOString().slice(0, 10)}.${format}`}
          />
        </div>

        {/* 数据预览表格 */}
        <div>
          <Label className="mb-2">
                {templateType === 'data' ? '数据预览（前3行）' : '空白向导预览'}
              </Label>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted">镜头编号</TableHead>
                  {selectedColumnsDefs.filter(c => c.key !== 'shotNumber').map(col => (
                    <TableHead key={col.key} className="bg-muted">{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((shot, index) => (
                  <TableRow key={index}>
                    <TableCell>{shot.shotNumber}</TableCell>
                    {selectedColumnsDefs.filter(c => c.key !== 'shotNumber').map(col => (
                      <TableCell key={col.key}>
                        {getCellValue(shot, col.key) || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 选项 */}
        {templateType === 'data' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDescription"
                checked={config.includeDescription}
                onCheckedChange={(checked) => onConfigChange({ includeDescription: checked })}
              />
              <Label htmlFor="includeDescription" className="text-sm">
                包含向导说明
              </Label>
            </div>
            {format === 'json' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSampleData"
                  checked={config.includeSampleData}
                  onCheckedChange={(checked) => onConfigChange({ includeSampleData: checked })}
                />
                <Label htmlFor="includeSampleData" className="text-sm">
                  包含示例数据
                </Label>
              </div>
            )}
          </div>
        )}
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
