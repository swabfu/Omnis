import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ListViewProps {
  children: ReactNode
  className?: string
}

export function ListView({ children, className }: ListViewProps) {
  return (
    <div className={cn('flex flex-col gap-2 transition-opacity duration-200', className)}>
      {children}
    </div>
  )
}
