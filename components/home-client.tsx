'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ClientFeed } from '@/components/items/client-feed'
import { ContentType, ItemStatus, Database, ViewMode } from '@/types/database'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

interface HomeClientProps {
  initialType?: ContentType
  initialStatus?: ItemStatus
}

export function HomeClient({ initialType, initialStatus }: HomeClientProps) {
  const [searchResults, setSearchResults] = useState<ItemWithTags[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [view, setView] = useState<ViewMode>('masonry')

  const handleSearchResults = useCallback((items: ItemWithTags[]) => {
    setSearchResults(items)
    setIsSearching(true)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchResults(null)
    setIsSearching(false)
  }, [])

  const handleViewChange = useCallback((newView: ViewMode) => {
    setView(newView)
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header
          onSearchResults={handleSearchResults}
          onSearchClear={handleSearchClear}
          isSearching={isSearching}
          view={view}
          onViewChange={handleViewChange}
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <ClientFeed
              initialType={initialType}
              initialStatus={initialStatus}
              searchResults={searchResults}
              view={view}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
