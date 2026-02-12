import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { ImportStatus } from '../../template-import-dialog'

interface Step6_ImportResultProps {
  result: {
    success: boolean
    importedCount: number
    errors: string[]
    warnings: string[]
  } | null
  status: ImportStatus
  totalCount?: number
  processedCount?: number
  onClose: () => void
  onRestart: () => void
}

export function Step6_ImportResult({ result, status, totalCount, processedCount, onClose, onRestart }: Step6_ImportResultProps) {
  const progressPercent = totalCount && processedCount !== undefined
    ? Math.round((processedCount / totalCount) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          导入结果反馈，显示导入过程的详细信息
        </p>
      </div>

      {status === 'importing' && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">正在导入数据...</h3>
          {totalCount && processedCount !== undefined ? (
            <p className="text-sm text-muted-foreground mb-4">
              已处理 {processedCount} / {totalCount} 个分镜头 ({progressPercent}%)
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              请耐心等待，导入过程可能需要几秒钟
            </p>
          )}
          {totalCount && processedCount !== undefined && (
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {(status === 'completed' || status === 'failed') && result && (
        <>
          <div className="flex items-start gap-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {result.success ? '导入成功' : '导入失败'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">成功导入</p>
                    <p className="text-2xl font-bold text-green-600">{result.importedCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">错误数量</p>
                    <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                  </div>
                </div>

                {result.success && result.errors.length === 0 && result.warnings.length === 0 && (
                  <Alert variant="success">
                    <AlertTitle>导入成功</AlertTitle>
                    <AlertDescription>
                      所有数据已成功导入，无错误或警告
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>详细信息</CardTitle>
              </CardHeader>
              <CardContent>
                {result.errors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>导入错误</AlertTitle>
                    <AlertDescription className="space-y-2">
                      {result.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">{error}</div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          还有 {result.errors.length - 5} 个错误未显示
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {result.warnings.length > 0 && (
                  <Alert variant="warning">
                    <AlertTitle>导入警告</AlertTitle>
                    <AlertDescription className="space-y-2">
                      {result.warnings.slice(0, 5).map((warning, index) => (
                        <div key={index} className="text-sm">{warning}</div>
                      ))}
                      {result.warnings.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          还有 {result.warnings.length - 5} 个警告未显示
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button variant="default" onClick={onClose}>
              完成
            </Button>
            <Button variant="outline" onClick={onRestart}>
              再次导入
            </Button>
          </div>
        </>
      )}

      {status === 'idle' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">导入过程尚未开始</p>
        </div>
      )}
    </div>
  )
}
