import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChevronRight } from 'lucide-react'

interface Step5_ImportOptionsProps {
  importMode: 'append' | 'replace'
  startShotNumber: number
  validateData: boolean
  showWarnings: boolean
  onOptionsChange: (options: {
    importMode: 'append' | 'replace'
    startShotNumber: number
    validateData: boolean
    showWarnings: boolean
  }) => void
  onImport: () => void
  onPrevious: () => void
}

export function Step5_ImportOptions({ importMode, startShotNumber, validateData, showWarnings, onOptionsChange, onImport, onPrevious }: Step5_ImportOptionsProps) {
  const [currentOptions, setCurrentOptions] = useState({
    importMode,
    startShotNumber,
    validateData,
    showWarnings,
  })

  const handleOptionChange = (key: keyof typeof currentOptions, value: any) => {
    const newOptions = { ...currentOptions, [key]: value }
    setCurrentOptions(newOptions)
    onOptionsChange(newOptions)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          设置导入选项，配置导入模式和其他参数
        </p>
      </div>

      <div className="flex items-start gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">导入模式</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={currentOptions.importMode}
              onValueChange={(value) => handleOptionChange('importMode', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="append" id="mode-append" />
                <Label htmlFor="mode-append" className="flex-1">
                  <div className="font-medium">追加模式</div>
                  <div className="text-xs text-muted-foreground">将数据添加到现有分镜头之后</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="mode-replace" />
                <Label htmlFor="mode-replace" className="flex-1">
                  <div className="font-medium">替换模式</div>
                  <div className="text-xs text-muted-foreground">替换所有现有分镜头数据</div>
                </Label>
              </div>
            </RadioGroup>

            {currentOptions.importMode === 'replace' && (
              <Alert className="border-yellow-500 text-yellow-700 mt-4">
                <AlertTitle>警告</AlertTitle>
                <AlertDescription>
                  替换模式将删除所有现有分镜头数据，此操作不可撤销
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">导入参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-shot-number">起始镜头编号</Label>
              <Input
                id="start-shot-number"
                type="number"
                min="1"
                value={currentOptions.startShotNumber}
                onChange={(e) => handleOptionChange('startShotNumber', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                导入数据将从该编号开始编号，确保不与现有数据冲突
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validate-data"
                  checked={currentOptions.validateData}
                  onCheckedChange={(checked) => handleOptionChange('validateData', checked)}
                />
                <Label htmlFor="validate-data">数据验证</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                启用后将验证数据的完整性和有效性
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-warnings"
                  checked={currentOptions.showWarnings}
                  onCheckedChange={(checked) => handleOptionChange('showWarnings', checked)}
                />
                <Label htmlFor="show-warnings">显示警告</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                启用后将显示数据中的警告信息
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-500 text-blue-700">
        <AlertTitle>导入提示</AlertTitle>
        <AlertDescription>
          <ul className="text-xs space-y-1">
            <li>• 导入过程可能需要几秒钟，请耐心等待</li>
            <li>• 导入完成后会显示详细的导入结果</li>
            <li>• 如果遇到错误，请检查文件格式和数据完整性</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button variant="default" onClick={onImport}>
          开始导入
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
