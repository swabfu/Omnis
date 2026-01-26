'use client'

import { useState } from 'react'
import { Feed } from './feed'
import { AddItemDialog } from './add-item-dialog'
import { ContentType, ItemStatus } from '@/types/database'
import type { ItemWithTags } from './feed'

interface ClientFeedProps {
  initialType?: ContentType
  initialStatus?: ItemStatus
  searchResults?: ItemWithTags[] | null
}

export function ClientFeed({ initialType, initialStatus, searchResults }: ClientFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {initialType ? initialType.charAt(0).toUpperCase() + initialType.slice(1) + 's' : 'All Items'}
          </h1>
          <p className="text-muted-foreground">
            Your second brain, organized.
          </p>
        </div>
        <AddItemDialog onItemAdded={handleItemAdded} />
      </div>
      <Feed key={refreshKey} initialType={initialType} initialStatus={initialStatus} searchResults={searchResults} />
    </>
  )
}
