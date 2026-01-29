'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTransitionState } from '@/lib/hooks/use-transition-state'
import { ContentType, ItemStatus, Database, ViewMode } from '@/types/database'
import { ItemCard } from './item-card'
import { MasonryGrid, MasonryItem } from './masonry-grid'
import { UniformGrid } from './uniform-grid'
import { ListView } from './list-view'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOADER_ICON_SIZE, AVATAR_ICON_SIZE, BUTTON_ICON_SIZE } from '@/lib/type-icons'
import { DRAGGING_OPACITY, NORMAL_OPACITY } from '@/lib/opacity-constants'
import { Button } from '@/components/ui/button'

// Pagination: load items in batches for better performance
const PAGE_SIZE = 50

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
  color?: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

export type { ItemWithTags }

interface FeedProps {
  initialType?: ContentType
  initialStatus?: ItemStatus
  initialTagId?: string
  searchResults?: ItemWithTags[] | null
  view?: ViewMode
}

export function Feed({ initialType, initialStatus, initialTagId, searchResults, view }: FeedProps) {
  const [items, setItems] = useState<ItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const currentView = view ?? 'masonry'
  const supabase = createClient()
  const filtersRef = useRef({ initialType, initialStatus, initialTagId, searchResults })

  // Use global transition hook for view switching animations
  const { phase, displayValue: displayView, transitionTo } = useTransitionState(currentView)

  // Handle view changes using the global hook
  const prevViewRef = useRef(currentView)
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      transitionTo(currentView)
      prevViewRef.current = currentView
    }
  }, [currentView, transitionTo])

  // Get animation classes based on transition phase
  const getAnimationClasses = () => {
    switch (phase) {
      case 'out':
        return `${DRAGGING_OPACITY} scale-[0.99] translate-y-0.5`
      case 'in':
        return `${NORMAL_OPACITY} scale-100 translate-y-0`
      default:
        return `${NORMAL_OPACITY} scale-100 translate-y-0`
    }
  }

  const fetchItems = useCallback(async (loadMore: boolean = false, pageParam?: number) => {
    // If search results are provided, use those (no pagination for search)
    if (searchResults !== null && searchResults !== undefined) {
      setItems(searchResults)
      setHasMore(false)  // Search results are not paginated
      setLoading(false)
      return
    }

    const currentPage = loadMore ? (pageParam ?? 1) : 1
    const offset = (currentPage - 1) * PAGE_SIZE

    // If filtering by tag, use item_tags junction table
    if (initialTagId) {
      const { data, error } = await supabase
        .from('item_tags')
        .select(`
          items (
            *,
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('tag_id', initialTagId)
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) {
        // Error fetching items - will be handled by UI
      } else if (data) {
        const itemsData = data
          .map((item_tag: { items: ItemWithTags | null }) => item_tag.items)
          .filter((item): item is ItemWithTags => item !== null)

        if (loadMore) {
          setItems(prev => [...prev, ...itemsData])
        } else {
          setItems(itemsData)
        }
        // If we got fewer items than PAGE_SIZE, there are no more
        setHasMore(itemsData.length === PAGE_SIZE)
      }
      if (!loadMore) setLoading(false)
      else setLoadingMore(false)
      return
    }

    // Standard query with optional type/status filters
    let query = supabase
      .from('items')
      .select(`
        *,
        tags (
          id,
          name,
          color
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (initialType) {
      query = query.eq('type', initialType)
    }
    if (initialStatus) {
      query = query.eq('status', initialStatus)
    }

    const { data, error } = await query

    if (error) {
      // Error fetching items - will be handled by UI
    } else {
      const newItems = (data || []) as ItemWithTags[]
      if (loadMore) {
        setItems(prev => [...prev, ...newItems])
      } else {
        setItems(newItems)
      }
      // If we got fewer items than PAGE_SIZE, there are no more
      setHasMore(newItems.length === PAGE_SIZE)
    }
    if (!loadMore) setLoading(false)
    else setLoadingMore(false)
  }, [supabase, initialType, initialStatus, initialTagId, searchResults])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount/param change is valid effect usage
    fetchItems()
  }, [fetchItems])

  // Reset pagination when filters change
  useEffect(() => {
    const currentFilters = { initialType, initialStatus, initialTagId, searchResults }
    const prevFilters = filtersRef.current

    // Check if any filter changed (deep comparison for searchResults)
    const filtersChanged =
      prevFilters.initialType !== currentFilters.initialType ||
      prevFilters.initialStatus !== currentFilters.initialStatus ||
      prevFilters.initialTagId !== currentFilters.initialTagId ||
      prevFilters.searchResults !== currentFilters.searchResults

    if (filtersChanged) {
      setPage(1)
      setHasMore(true)
      filtersRef.current = currentFilters
    }
  }, [initialType, initialStatus, initialTagId, searchResults])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    const nextPage = page + 1
    const offset = page * PAGE_SIZE

    // If filtering by tag, use item_tags junction table
    if (initialTagId) {
      const { data, error } = await supabase
        .from('item_tags')
        .select(`
          items (
            *,
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('tag_id', initialTagId)
        .range(offset, offset + PAGE_SIZE - 1)

      setLoadingMore(false)

      if (error) {
        return  // Error - will be handled silently
      }

      if (data) {
        const itemsData = data
          .map((item_tag: { items: ItemWithTags | null }) => item_tag.items)
          .filter((item): item is ItemWithTags => item !== null)

        setItems(prev => [...prev, ...itemsData])
        setHasMore(itemsData.length === PAGE_SIZE)
        if (itemsData.length > 0) {
          setPage(nextPage)
        }
      }
      return
    }

    // Standard query with optional type/status filters
    let query = supabase
      .from('items')
      .select(`
        *,
        tags (
          id,
          name,
          color
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (initialType) {
      query = query.eq('type', initialType)
    }
    if (initialStatus) {
      query = query.eq('status', initialStatus)
    }

    const { data, error } = await query

    setLoadingMore(false)

    if (error) {
      return  // Error - will be handled silently
    }

    const newItems = (data || []) as ItemWithTags[]
    setItems(prev => [...prev, ...newItems])
    setHasMore(newItems.length === PAGE_SIZE)
    if (newItems.length > 0) {
      setPage(nextPage)
    }
  }

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    const { error } = await supabase
      .from('items')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setItems(items.map(item =>
        item.id === id ? { ...item, status } : item
      ))
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (!error) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleItemUpdated = async () => {
    // Re-fetch items to get the updated data (reset pagination)
    setPage(1)
    setHasMore(true)
    await fetchItems(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className={`${LOADER_ICON_SIZE} animate-spin text-muted-foreground`} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className={cn('flex items-center justify-center rounded-full bg-muted', AVATAR_ICON_SIZE)}>
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="mt-6 text-xl font-semibold">No items yet</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Start building your second brain by adding links, tweets, images, or notes.
        </p>
      </div>
    )
  }

  // Render based on view mode
  const viewContent = (
    <>
      {displayView === 'list' ? (
        <ListView>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              {...item}
              tags={item.tags || []}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onItemUpdated={handleItemUpdated}
              variant="list"
            />
          ))}
        </ListView>
      ) : (
        (() => {
          const GridComponent = displayView === 'masonry' ? MasonryGrid : UniformGrid
          const ItemWrapper = displayView === 'masonry' ? MasonryItem : ({ children }: { children: React.ReactNode }) => <>{children}</>

          return (
            <GridComponent>
              {items.map((item) => (
                <ItemWrapper key={item.id}>
                  <ItemCard
                    {...item}
                    tags={item.tags || []}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    onItemUpdated={handleItemUpdated}
                  />
                </ItemWrapper>
              ))}
            </GridComponent>
          )
        })()
      )}
    </>
  )

  return (
    <div
      className={cn(
        // Smooth transition with ease-in-out for natural feel
        'transition-all duration-250 ease-in-out origin-top',
        getAnimationClasses()
      )}
    >
      {viewContent}

      {/* Load More button - only show when not loading and there are more items */}
      {!loading && hasMore && items.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            className="min-w-32"
          >
            {loadingMore ? (
              <>
                <Loader2 className={`${BUTTON_ICON_SIZE} animate-spin mr-2`} />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
