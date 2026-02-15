/**
 * upload-step-indicator
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Upload Step Indicator Component
 * 上传向导步骤指示器
 */

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description?: string
}

interface UploadStepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function UploadStepIndicator({
  steps,
  currentStep,
  className,
}: UploadStepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.id}>
            {/* 步骤项 */}
            <div className="flex flex-col items-center">
              {/* 圆圈 */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* 标题 */}
              <div className="mt-2 text-center">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* 连接线 */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{ minWidth: '20px', maxWidth: '80px' }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
