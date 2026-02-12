import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Database } from 'lucide-react'
import type { TemplateType } from '../../template-export-dialog'

interface Step1_TypeSelectionProps {
  selectedType: TemplateType
  onTypeChange: (type: TemplateType) => void
  onNext: () => void
}

export function Step1_TypeSelection({ selectedType, onTypeChange, onNext }: Step1_TypeSelectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-6">
        请选择要导出的向导类型
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            selectedType === 'blank' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onTypeChange('blank')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              空白向导
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              包含标准空白结构的向导，适合线下填写和团队协作
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedType === 'data' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onTypeChange('data')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              数据向导
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              基于当前项目数据生成可复用向导，保留配置和示例
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext}>下一步</Button>
      </div>
    </div>
  )
}
