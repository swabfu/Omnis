'use client'

import { LayoutGrid, LayoutList, Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'masonry' | 'uniform' | 'list'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

const viewButtons = [
  { value: 'masonry' as const, icon: Columns, label: 'Masonry' },
  { value: 'uniform' as const, icon: LayoutGrid, label: 'Grid' },
  { value: 'list' as const, icon: LayoutList, label: 'List' },
] as const

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
      {viewButtons.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(value)}
          className={cn(
            'h-7 w-7 p-0',
            view === value
              ? 'bg-background shadow-sm'
              : 'hover:bg-transparent'
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  )
}
