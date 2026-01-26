'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ContentType, ItemStatus, Database } from '@/types/database'
import { ItemCard } from './item-card'
import { MasonryGrid, MasonryItem } from './masonry-grid'
import { UniformGrid } from './uniform-grid'
import { ListView } from './list-view'
import { Loader2 } from 'lucide-react'
import type { ViewMode } from './view-toggle'
import { cn } from '@/lib/utils'

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
  onViewChange?: (view: ViewMode) => void
}

export function Feed({ initialType, initialStatus, searchResults, view, onViewChange }: FeedProps) {
  const [items, setItems] = useState<ItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [internalView, setInternalView] = useState<ViewMode>('masonry')
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [displayView, setDisplayView] = useState<ViewMode>('masonry')
  const currentView = view ?? internalView
  const supabase = createClient()
  const prevViewRef = useRef(currentView)

  // Handle view transition with slide/fade animation
  useEffect(() => {
    if (prevViewRef.current !== currentView && !loading) {
      // Phase 1: Fade out + slide out (gentle)
      setTransitionPhase('out')
      const outTimer = setTimeout(() => {
        // Phase 2: Switch content during fade
        setDisplayView(currentView)
        // Phase 3: Fade in + slide in
        setTransitionPhase('in')
        const inTimer = setTimeout(() => {
          setTransitionPhase('idle')
        }, 300)
        prevViewRef.current = currentView
        return () => clearTimeout(inTimer)
      }, 250)
      return () => clearTimeout(outTimer)
    }
  }, [currentView, loading])

  // Get animation classes based on transition phase
  const getAnimationClasses = () => {
    switch (transitionPhase) {
      case 'out':
        return 'opacity-50 scale-[0.99] translate-y-0.5'
      case 'in':
        return 'opacity-100 scale-100 translate-y-0'
      default:
        return 'opacity-100 scale-100 translate-y-0'
    }
  }

  const fetchItems = async () => {
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
      console.error('Error fetching items:', error)
    } else {
      setItems((data || []) as ItemWithTags[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [initialType, initialStatus, searchResults])

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
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
