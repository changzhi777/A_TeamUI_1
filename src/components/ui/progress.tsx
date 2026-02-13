/**
 * Progress 进度条组件
 *
 * 基于 Radix UI Progress 封装的进度条组件
 * 支持横版和竖版两种显示模式
 *
 * ## 使用示例
 * ```tsx
 * // 横版进度条（默认）
 * <Progress value={50} />
 *
 * // 竖版进度条
 * <Progress value={50} orientation="vertical" className="h-48 w-2" />
 * ```
 *
 * ## 参数说明
 * | 参数 | 说明 | 默认值 |
 * |------|------|--------|
 * | value | 进度值（0-100） | 0 |
 * | orientation | 方向：horizontal/vertical | horizontal |
 * | className | 自定义样式 | - |
 */

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 进度条方向 */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Progress 进度条组件
 *
 * @param value - 进度值（0-100）
 * @param orientation - 方向：'horizontal'（横版）或 'vertical'（竖版）
 * @param className - 自定义样式类
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, orientation = 'horizontal', ...props }, ref) => {
  const isVertical = orientation === 'vertical'

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-full bg-primary/20',
        // 横版：高度固定，宽度100%
        !isVertical && 'h-2 w-full',
        // 竖版：宽度固定，高度100%
        isVertical && 'h-full w-2',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'bg-primary transition-all',
          // 横版：高度100%，宽度跟随父容器
          !isVertical && 'h-full w-full flex-1',
          // 竖版：宽度100%，高度跟随父容器
          isVertical && 'w-full h-full flex-1'
        )}
        style={
          isVertical
            ? { transform: `translateY(${100 - (value || 0)}%)` }
            : { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
