import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface UniformGridProps {
  children: ReactNode
  className?: string
}

export function UniformGrid({ children, className }: UniformGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
    >
      {children}
    </div>
  )
}
