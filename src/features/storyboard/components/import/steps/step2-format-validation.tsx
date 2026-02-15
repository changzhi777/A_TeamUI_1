/**
 * step2-format-validation
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { parseCSVFile, parseJSONTemplate, type ImportResult } from '@/lib/import/template'

interface Step2_FormatValidationProps {
  file: File | null
  onValidationComplete: (result: ImportResult) => void
  onNext: () => void
  onPrevious: () => void
}

export function Step2_FormatValidation({ file, onValidationComplete, onNext, onPrevious }: Step2_FormatValidationProps) {
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle')
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleValidate = async () => {
    if (!file) {
      setErrorMessage('请先选择文件')
      setValidationStatus('error')
      return
    }

    setValidationStatus('validating')
    setErrorMessage('')

    try {
      let result: ImportResult
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith('.csv')) {
        result = await parseCSVFile(file)
      } else if (fileName.endsWith('.json')) {
        result = await parseJSONTemplate(file)
      } else {
        throw new Error('不支持的文件格式')
      }

      setValidationResult(result)
      onValidationComplete(result)

      if (result.success) {
        setValidationStatus('success')
      } else {
        setValidationStatus('error')
        setErrorMessage(result.errors.join('\n'))
      }
    } catch (error) {
      setValidationStatus('error')
      setErrorMessage(`验证失败: ${(error as Error).message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          系统将验证文件格式并解析数据结构
        </p>
      </div>

      {file && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">文件信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">文件名:</span>
                <span>{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">大小:</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">类型:</span>
                <span>{file.name.toLowerCase().endsWith('.csv') ? 'CSV' : 'JSON'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-6">
        <div className="flex-1">
          {validationStatus === 'idle' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">点击验证按钮开始文件格式验证</p>
              <Button variant="default" onClick={handleValidate} disabled={!file}>
                开始验证
              </Button>
            </div>
          )}

          {validationStatus === 'validating' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">正在验证文件格式...</p>
            </div>
          )}

          {validationStatus === 'success' && validationResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  验证成功
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">数据行数:</span>
                    <span>{validationResult.rowCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">编码:</span>
                    <span>{validationResult.encoding}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">错误:</span>
                    <span>{validationResult.errors.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">警告:</span>
                    <span>{validationResult.warnings.length}</span>
                  </div>
                </div>

                {validationResult.warnings.length > 0 && (
                  <Alert className="border-yellow-500 text-yellow-700">
                    <AlertTitle>警告</AlertTitle>
                    <AlertDescription>
                      {validationResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm">{warning}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {validationStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>验证失败</AlertTitle>
              <AlertDescription>
                <pre className="text-sm whitespace-pre-wrap">{errorMessage}</pre>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button 
          variant="default" 
          onClick={validationStatus === 'success' ? onNext : handleValidate}
          disabled={validationStatus !== 'success'}
        >
          {validationStatus === 'success' ? '下一步' : '开始验证'}
        </Button>
      </div>
    </div>
  )
}
