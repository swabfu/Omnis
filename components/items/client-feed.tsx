'use client'

import { useState } from 'react'
import { Feed } from './feed'
import { AddItemDialog } from './add-item-dialog'
import { ContentType, ItemStatus, ViewMode } from '@/types/database'
import { statusLabels } from '@/lib/status-icons'
import { dispatchTagsUpdated } from '@/lib/supabase/tags'
import { useViewMode } from '@/lib/context/view-mode-context'
import { useContext } from 'react'
import { SearchContext } from '@/lib/context/search-context'
import type { ItemWithTags } from './feed'

interface ClientFeedProps {
  initialType?: ContentType
  initialStatus?: ItemStatus
  initialTagId?: string
  initialTagName?: string
  searchResults?: ItemWithTags[] | null
  view?: ViewMode
}

function getTitle(initialType?: ContentType, initialStatus?: ItemStatus, initialTagName?: string): string {
  if (initialTagName) return `#${initialTagName}`
  if (initialStatus) return statusLabels[initialStatus]
  if (initialType) return initialType.charAt(0).toUpperCase() + initialType.slice(1) + 's'
  return 'All Items'
}

function getSubtitle(initialType?: ContentType, initialStatus?: ItemStatus, initialTagName?: string): string {
  if (initialTagName) return `Items tagged with "${initialTagName}"`
  if (initialStatus) return `${statusLabels[initialStatus]} items`
  if (initialType) return `${initialType.charAt(0).toUpperCase() + initialType.slice(1)}s only`
  return 'Your second brain, organized.'
}

export function ClientFeed({
  initialType,
  initialStatus,
  initialTagId,
  initialTagName,
  searchResults: searchResultsProp,
  view
}: ClientFeedProps) {
  // Consume view mode context
  const { view: contextView } = useViewMode()
  const actualView = view ?? contextView

  // Consume search context (optional - falls back if no provider)
  const search = useContext(SearchContext)
  const searchResults = searchResultsProp ?? search?.searchResults ?? null

  const [refreshKey, setRefreshKey] = useState(0)

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {getTitle(initialType, initialStatus, initialTagName)}
          </h1>
          <p className="text-muted-foreground">
            {getSubtitle(initialType, initialStatus, initialTagName)}
          </p>
        </div>
        <AddItemDialog onItemAdded={handleItemAdded} onTagCreated={dispatchTagsUpdated} />
      </div>
      <Feed
        key={refreshKey}
        initialType={initialType}
        initialStatus={initialStatus}
        initialTagId={initialTagId}
        searchResults={searchResults}
        view={actualView}
      />
    </>
  )
}
