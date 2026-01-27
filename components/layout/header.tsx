'use client'

import { SearchInput } from '@/components/items/search-input'
import { ViewToggle, type ViewMode } from '@/components/items/view-toggle'
import type { ItemWithTags } from '@/components/items/feed'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { BADGE_ICON_SIZE } from '@/lib/type-icons'

interface HeaderProps {
  onSearchResults?: (items: ItemWithTags[]) => void
  onSearchClear?: () => void
  isSearching?: boolean
  view?: ViewMode
  onViewChange?: (view: ViewMode) => void
}

export function Header({ onSearchResults, onSearchClear, isSearching, view, onViewChange }: HeaderProps) {
  // If search handlers are provided, use the full SearchInput
  // Otherwise, show a placeholder (non-functional) input for visual consistency
  const hasSearch = onSearchResults && onSearchClear

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        {hasSearch ? (
          <SearchInput
            onResults={onSearchResults!}
            onClear={onSearchClear!}
          />
        ) : (
          <div className="relative max-w-md">
            <Search className={`absolute left-3 top-1/2 ${BADGE_ICON_SIZE} -translate-y-1/2 text-muted-foreground`} />
            <Input
              type="search"
              placeholder="Search..."
              disabled
              className="pl-10"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isSearching && <span className="text-sm font-medium text-muted-foreground">Searching...</span>}
        {onViewChange && view && (
          <ViewToggle view={view} onChange={onViewChange} />
        )}
      </div>
    </header>
  )
}
