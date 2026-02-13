import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { ImportResult } from '@/lib/import/template'

interface Step4_DataPreviewProps {
  parsedData: ImportResult | null
  fieldMapping: Record<string, string>
  onNext: () => void
  onPrevious: () => void
}

export function Step4_DataPreview({ parsedData, fieldMapping, onNext, onPrevious }: Step4_DataPreviewProps) {
  const previewData = parsedData?.data?.slice(0, 5) || []
  const totalRows = parsedData?.data?.length || 0

  const mappedFields = Object.entries(fieldMapping)
    .filter(([_, field]) => field)
    .map(([column, field]) => ({ column, field }))

  const fieldLabels: Record<string, string> = {
    'shotNumber': '镜头编号',
    'sceneNumber': '场次',
    'shotSize': '景别',
    'cameraMovement': '运镜方式',
    'duration': '时长',
    'description': '画面描述',
    'dialogue': '对白/旁白',
    'sound': '音效说明',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          预览导入的数据，确保格式正确且映射无误
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">数据统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">总数据行数:</span>
              <span className="font-medium">{totalRows}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">预览行数:</span>
              <span className="font-medium">{Math.min(totalRows, 5)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">已映射字段:</span>
              <span className="font-medium">{mappedFields.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">错误数:</span>
              <span className="font-medium text-red-600">{parsedData?.errors?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>数据预览 (前5行)</span>
            {totalRows > 5 && (
              <span className="text-xs text-muted-foreground">
                共 {totalRows} 行数据
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无数据可预览</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">行号</TableHead>
                    {mappedFields.map(({ field }) => (
                      <TableHead key={field}>
                        {fieldLabels[field] || field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      {mappedFields.map(({ field }) => (
                        <TableCell key={field}>
                          {row[field as keyof typeof row] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {mappedFields.length === 0 && (
        <Alert className="border-yellow-500 text-yellow-700">
          <AlertTitle>未映射任何字段</AlertTitle>
          <AlertDescription>
            请返回上一步设置字段映射，至少需要映射镜头编号和场次字段
          </AlertDescription>
        </Alert>
      )}

      {parsedData?.errors?.length && (
        <Alert variant="destructive">
          <AlertTitle>数据错误</AlertTitle>
          <AlertDescription>
            {parsedData.errors.map((error, index) => (
              <div key={index} className="text-sm">{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button 
          variant="default" 
          onClick={onNext} 
          disabled={mappedFields.length === 0}
        >
          下一步
        </Button>
      </div>
    </div>
  )
}
