'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ContentType, ItemStatus, Database, ViewMode } from '@/types/database'
import { ItemCard } from './item-card'
import { MasonryGrid, MasonryItem } from './masonry-grid'
import { UniformGrid } from './uniform-grid'
import { ListView } from './list-view'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOADER_ICON_SIZE, AVATAR_ICON_SIZE } from '@/lib/type-icons'
import { DRAGGING_OPACITY, NORMAL_OPACITY } from '@/lib/opacity-constants'
import { TRANSITION_IN_DELAY, TRANSITION_OUT_DELAY } from '@/lib/timeout-constants'

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
  searchResults?: ItemWithTags[] | null
  view?: ViewMode
}

export function Feed({ initialType, initialStatus, searchResults, view }: FeedProps) {
  const [items, setItems] = useState<ItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [displayView, setDisplayView] = useState<ViewMode>('masonry')
  const currentView = view ?? 'masonry'
  const supabase = createClient()
  const prevViewRef = useRef(currentView)

  // Handle view transition with slide/fade animation
  useEffect(() => {
    if (prevViewRef.current !== currentView && !loading) {
      // Phase 1: Fade out + slide out (gentle)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- View transition state updates are valid effect usage
      setTransitionPhase('out')
      const outTimer = setTimeout(() => {
        // Phase 2: Switch content during fade
        setDisplayView(currentView)
        // Phase 3: Fade in + slide in
        setTransitionPhase('in')
        const inTimer = setTimeout(() => {
          setTransitionPhase('idle')
        }, TRANSITION_IN_DELAY)
        prevViewRef.current = currentView
        return () => clearTimeout(inTimer)
      }, TRANSITION_OUT_DELAY)
      return () => clearTimeout(outTimer)
    }
  }, [currentView, loading])

  // Get animation classes based on transition phase
  const getAnimationClasses = () => {
    switch (transitionPhase) {
      case 'out':
        return `${DRAGGING_OPACITY} scale-[0.99] translate-y-0.5`
      case 'in':
        return `${NORMAL_OPACITY} scale-100 translate-y-0`
      default:
        return `${NORMAL_OPACITY} scale-100 translate-y-0`
    }
  }

  const fetchItems = useCallback(async () => {
    // If search results are provided, use those
    if (searchResults !== null && searchResults !== undefined) {
      setItems(searchResults)
      setLoading(false)
      return
    }

    setLoading(true)
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
      setItems((data || []) as ItemWithTags[])
    }
    setLoading(false)
  }, [supabase, initialType, initialStatus, searchResults])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount/param change is valid effect usage
    fetchItems()
  }, [fetchItems])

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
    // Re-fetch items to get the updated data
    await fetchItems()
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
    </div>
  )
}
