/**
 * display-form
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useI18n } from '@/i18n'
import { useDisplayStore, getGroupedDisplayItems } from '@/stores/display-store'

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.length > 0, {
    message: '您至少需要选择一个项目',
  }),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

export function DisplayForm() {
  const { t } = useI18n()
  const { visibleSidebarItems, setVisibleSidebarItems, resetToDefaults } =
    useDisplayStore()
  const groupedItems = getGroupedDisplayItems()

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      items: visibleSidebarItems,
    },
    values: {
      items: visibleSidebarItems,
    },
  })

  const onSubmit = (data: DisplayFormValues) => {
    setVisibleSidebarItems(data.items)
    toast.success(t.settings.display.saveSuccess || '显示设置已保存')
  }

  const handleReset = () => {
    resetToDefaults()
    toast.success('已恢复默认设置')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  {t.settings.display.sidebar}
                </FormLabel>
                <FormDescription>
                  {t.settings.display.sidebarDescription}
                </FormDescription>
              </div>

              {/* 按分组显示 */}
              {Object.entries(groupedItems).map(([group, items]) => (
                <div key={group} className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    {group}
                  </h4>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(item.id)
                          const isDisabled = item.isRequired

                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => {
                                    if (isDisabled) return

                                    if (checked) {
                                      field.onChange([...field.value, item.id])
                                    } else {
                                      field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <FormLabel
                                  className={`font-normal ${isDisabled ? 'text-muted-foreground' : ''}`}
                                >
                                  {item.label}
                                </FormLabel>
                                {item.isRequired && (
                                  <span className="text-xs text-muted-foreground">
                                    (必需)
                                  </span>
                                )}
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit">{t.settings.display.updateDisplay}</Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            恢复默认
          </Button>
        </div>
      </form>
    </Form>
  )
}
