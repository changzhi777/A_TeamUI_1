/**
 * step3-column-selection
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckSquare, Square } from 'lucide-react'
import { TEMPLATE_COLUMNS } from '@/lib/export/template'

interface Step3_ColumnSelectionProps {
  selectedColumns: string[]
  onColumnsChange: (columns: string[]) => void
  onNext: () => void
  onPrevious: () => void
}

const RECOMMENDED_COLUMNS = ['shotNumber', 'sceneNumber', 'shotSize', 'cameraMovement', 'duration', 'description']

export function Step3_ColumnSelection({
  selectedColumns,
  onColumnsChange,
  onNext,
  onPrevious,
}: Step3_ColumnSelectionProps) {
  const allSelected = selectedColumns.length === TEMPLATE_COLUMNS.length
  const someSelected = selectedColumns.length > 0

  const handleToggleAll = () => {
    if (allSelected) {
      onColumnsChange([])
    } else {
      onColumnsChange(TEMPLATE_COLUMNS.map(c => c.key))
    }
  }

  const handleToggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      onColumnsChange(selectedColumns.filter(k => k !== key))
    } else {
      onColumnsChange([...selectedColumns, key])
    }
  }

  const handleRecommended = () => {
    onColumnsChange(RECOMMENDED_COLUMNS)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        请选择要包含在向导中的列
      </p>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleToggleAll}>
          {allSelected ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              取消全选
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4 mr-2" />
              全选
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleRecommended}>
          推荐选择
        </Button>
      </div>

      <ScrollArea className="h-[300px] border rounded-md p-4">
        <div className="space-y-2">
          {TEMPLATE_COLUMNS.map((column) => (
            <div key={column.key} className="flex items-center space-x-3">
              <Checkbox
                id={column.key}
                checked={selectedColumns.includes(column.key)}
                onCheckedChange={() => handleToggleColumn(column.key)}
              />
              <Label
                htmlFor={column.key}
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <span>{column.label}</span>
                {column.required && (
                  <span className="text-xs text-muted-foreground">(必填)</span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>

      <p className="text-sm text-muted-foreground">
        已选择: {selectedColumns.length} 列
      </p>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button onClick={onNext} disabled={!someSelected}>
          下一步
        </Button>
      </div>
    </div>
  )
}
