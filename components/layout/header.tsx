'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Grid, List } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onViewChange?: (view: 'grid' | 'masonry') => void
}

export function Header({ onViewChange }: HeaderProps) {
  const [view, setView] = useState<'grid' | 'masonry'>('masonry')

  const handleViewChange = (newView: 'grid' | 'masonry') => {
    setView(newView)
    onViewChange?.(newView)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={view === 'masonry' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('masonry')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('grid')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
