﻿import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  currentStep: number
  maxStep?: number
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
  title: string
  description?: string
  status?: "completed" | "current" | "pending"
}

interface StepContextValue {
  maxStep: number
}

const StepContext = React.createContext<StepContextValue>({
  maxStep: 5,
})

export function Steps({ children, currentStep, className, maxStep }: StepsProps) {
  const childrenArray = React.Children.toArray(children)
  const calculatedMaxStep = maxStep ?? childrenArray.length

  return (
    <StepContext.Provider value={{ maxStep: calculatedMaxStep }}>
      <div className={cn("w-full", className)}>
        <div className="flex mb-6 flex-row items-center justify-between gap-2">
          {childrenArray.map((child, index) => {
            if (React.isValidElement(child)) {
              const stepNumber = index + 1
              const status = stepNumber < currentStep ? "completed"
                             : stepNumber === currentStep ? "current"
                             : "pending"
              return React.cloneElement(child as React.ReactElement<any>, {
                step: stepNumber,
                status,
              })
            }
            return child
          })}
        </div>
      </div>
    </StepContext.Provider>
  )
}

export function Step({ step, title, description, status = "pending", className }: StepProps) {
  const { maxStep } = React.useContext(StepContext)
  return <HorizontalStep step={step} title={title} description={description} status={status} className={className} maxStep={maxStep} />
}

function HorizontalStep({ step, title, description, status = "pending", className, maxStep }: StepProps & { maxStep: number }) {
  return (
    <div className={cn("flex items-center min-w-0", className)}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 sm:w-9 md:w-10 rounded-full border-2 text-sm font-semibold transition-colors shrink-0",
            status === "completed" && "bg-primary border-primary text-primary-foreground",
            status === "current" && "border-primary text-primary",
            status === "pending" && "border-muted-foreground/30 text-muted-foreground"
          )}
        >
          {status === "completed" ? <Check className="h-4 w-4 sm:h-5 md:h-5" /> : step}
        </div>

        <div className="flex flex-col min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              status === "current" && "text-primary",
              status === "pending" && "text-muted-foreground"
            )}
          >
            {title}
          </p>
          {description && (
            <p className="hidden lg:block text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>

      {step < maxStep && (
        <div
          className={cn(
            "h-px w-8 sm:w-12 md:w-16 mx-2 sm:mx-3 shrink-0",
            status === "completed" || status === "current" ? "bg-primary" : "bg-muted"
          )}
        />
      )}
    </div>
  )
}
