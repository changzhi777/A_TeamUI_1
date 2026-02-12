import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToggleGroupProps {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  className?: string
  type: 'single'
}

const ToggleGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

export function ToggleGroup({ children, value, onValueChange, className }: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          className
        )}
        role="radiogroup"
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

interface ToggleGroupItemProps {
  value: string
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}

export function ToggleGroupItem({ value, children, className, 'aria-label': ariaLabel }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  const isActive = context.value === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
        className
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  )
}
