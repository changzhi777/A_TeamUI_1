import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { ImportResult } from '@/lib/import/template'

interface Step3_FieldMappingProps {
  parsedData: ImportResult | null
  fieldMapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
  onNext: () => void
  onPrevious: () => void
}

const SYSTEM_FIELDS = [
  { value: 'shotNumber', label: '镜头编号' },
  { value: 'sceneNumber', label: '场次' },
  { value: 'shotSize', label: '景别' },
  { value: 'cameraMovement', label: '运镜方式' },
  { value: 'duration', label: '时长' },
  { value: 'description', label: '画面描述' },
  { value: 'dialogue', label: '对白/旁白' },
  { value: 'sound', label: '音效说明' },
]

const REQUIRED_FIELDS = ['shotNumber', 'sceneNumber']

export function Step3_FieldMapping({ parsedData, fieldMapping, onMappingChange, onNext, onPrevious }: Step3_FieldMappingProps) {
  const [currentMapping, setCurrentMapping] = useState<Record<string, string>>(fieldMapping)
  const [autoMappingApplied, setAutoMappingApplied] = useState(false)

  const fileColumns = parsedData?.data && parsedData.data.length > 0 ? Object.keys(parsedData.data[0]) : []

  const handleAutoMap = () => {
    const mapping: Record<string, string> = {}
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

    fileColumns.forEach(column => {
      const lowerColumn = column.toLowerCase()
      for (const [field, label] of Object.entries(fieldLabels)) {
        if (lowerColumn.includes(label.toLowerCase()) || 
            lowerColumn.includes(field.toLowerCase())) {
          mapping[column] = field
          break
        }
      }
    })

    setCurrentMapping(mapping)
    onMappingChange(mapping)
    setAutoMappingApplied(true)
  }

  const handleResetMapping = () => {
    const emptyMapping: Record<string, string> = {}
    setCurrentMapping(emptyMapping)
    onMappingChange(emptyMapping)
    setAutoMappingApplied(false)
  }

  const isMappingComplete = () => {
    return REQUIRED_FIELDS.every(field => 
      Object.values(currentMapping).includes(field)
    )
  }

  const getFieldStatus = (field: string) => {
    const isMapped = Object.values(currentMapping).includes(field)
    const isRequired = REQUIRED_FIELDS.includes(field)
    return { isMapped, isRequired }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          请将文件中的列映射到系统字段，确保数据能正确导入
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>字段映射</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAutoMap} disabled={autoMappingApplied}>
                自动映射
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetMapping}>
                重置
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              {SYSTEM_FIELDS.map((field) => {
                const { isMapped, isRequired } = getFieldStatus(field.value)
                return (
                  <div key={field.value} className="flex items-center gap-2">
                    {isMapped ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isRequired ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className={`text-sm ${isRequired ? 'font-medium' : 'text-muted-foreground'}`}>
                      {field.label}{isRequired ? ' *' : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">文件列映射</h4>
              {fileColumns.length === 0 ? (
                <p className="text-sm text-muted-foreground">未检测到文件列，请先验证文件</p>
              ) : (
                <div className="space-y-3">
                  {fileColumns.map((column) => (
                    <div key={column} className="flex items-center gap-3">
                      <div className="flex-1 text-sm min-w-[150px]">{column}</div>
                      <Select
                        value={currentMapping[column] || '__none__'}
                        onValueChange={(value) => {
                          const newMapping = { ...currentMapping }
                          if (value && value !== '__none__') {
                            newMapping[column] = value
                          } else {
                            delete newMapping[column]
                          }
                          setCurrentMapping(newMapping)
                          onMappingChange(newMapping)
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="选择字段" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">不映射</SelectItem>
                          {SYSTEM_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-yellow-500 text-yellow-700 text-sm">
        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <AlertTitle className="font-medium">映射提示</AlertTitle>
          <AlertDescription className="text-xs mt-1 space-y-1">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>镜头编号</strong> 和 <strong>场次</strong> 为必填字段</li>
              <li>建议映射所有可用字段以获得完整数据</li>
              <li>点击自动映射可快速匹配常见列名</li>
            </ul>
          </AlertDescription>
        </div>
      </Alert>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button 
          variant="default" 
          onClick={onNext} 
          disabled={!isMappingComplete()}
        >
          下一步
        </Button>
      </div>
    </div>
  )
}
