/**
 * step4-data-preview
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useCustomFieldStore } from '@/stores/custom-field-store'
import type { ImportResult } from '@/lib/import/template'

interface Step4_DataPreviewProps {
  parsedData: ImportResult | null
  fieldMapping: Record<string, string>
  onNext: () => void
  onPrevious: () => void
  projectId?: string
}

const PREVIEW_ROWS = 3

// Base field labels - use Chinese labels for consistency
const BASE_FIELD_LABELS: Record<string, string> = {
  shotNumber: '镜头编号',
  seasonNumber: '季数',
  episodeNumber: '集数',
  sceneNumber: '场次',
  shotSize: '景别',
  cameraMovement: '运镜',
  duration: '时长',
  description: '画面描述',
  dialogue: '对白',
  sound: '音效',
}

export function Step4_DataPreview({
  parsedData,
  fieldMapping,
  onNext,
  onPrevious,
  projectId,
}: Step4_DataPreviewProps) {
  // Get custom fields for label lookup
  const { getMergedFields } = useCustomFieldStore()
  const customFields = useMemo(() => {
    return projectId ? getMergedFields(projectId) : []
  }, [projectId, getMergedFields])

  // Build field labels including custom fields
  const fieldLabels = useMemo(() => {
    const labels = { ...BASE_FIELD_LABELS }
    customFields.forEach((field) => {
      labels[`custom_${field.id}`] = field.name
    })
    return labels
  }, [customFields])

  const mappedFields = Object.entries(fieldMapping)
    .filter(([_, field]) => field && field !== '__skip__')
    .map(([column, field]) => ({ column, field }))

  // Use rawData for preview (original column names mapped to values)
  const rawData = parsedData?.rawData || []
  const previewData = rawData.slice(0, PREVIEW_ROWS)
  const totalRows = parsedData?.data?.length || 0

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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground">总数据行数:</span>
              <span className="font-medium">{totalRows}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground">预览行数:</span>
              <span className="font-medium">{Math.min(totalRows, PREVIEW_ROWS)}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground">已映射字段:</span>
              <span className="font-medium">{mappedFields.length}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground">错误数:</span>
              <span className="font-medium text-red-600">{parsedData?.errors?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>数据预览 (前 {PREVIEW_ROWS} 行)</span>
            {totalRows > PREVIEW_ROWS && (
              <span className="text-xs text-muted-foreground font-normal">
                共 {totalRows} 行数据
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {previewData.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">暂无数据可预览</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 text-xs font-medium whitespace-nowrap px-2">#</TableHead>
                    {mappedFields.map(({ column, field }) => (
                      <TableHead key={field} className="text-xs font-medium whitespace-nowrap px-3 min-w-[60px]">
                        {fieldLabels[field] || field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs px-2">{index + 1}</TableCell>
                      {mappedFields.map(({ column, field }) => (
                        <TableCell
                          key={field}
                          className="text-xs px-3 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis"
                          title={String(row[column] || '-')}
                        >
                          {String(row[column] || '-')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {mappedFields.length === 0 && (
        <Alert className="border-yellow-500 text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>未映射任何字段</AlertTitle>
          <AlertDescription>
            请返回上一步设置字段映射，至少需要映射镜头编号和场次字段
          </AlertDescription>
        </Alert>
      )}

      {parsedData?.errors?.length && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
