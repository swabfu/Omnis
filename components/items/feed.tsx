'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ContentType, ItemStatus, Database } from '@/types/database'
import { ItemCard } from './item-card'
import { MasonryGrid, MasonryItem } from './masonry-grid'
import { UniformGrid } from './uniform-grid'
import { Loader2 } from 'lucide-react'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

interface FeedProps {
  initialType?: ContentType
  initialStatus?: ItemStatus
}

export function Feed({ initialType, initialStatus }: FeedProps) {
  const [items, setItems] = useState<ItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'masonry' | 'uniform'>('masonry')
  const supabase = createClient()

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase
      .from('items')
      .select(`
        *,
        tags (
          id,
          name
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
  }, [initialType, initialStatus])

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

  const GridComponent = view === 'masonry' ? MasonryGrid : UniformGrid
  const ItemWrapper = view === 'masonry' ? MasonryItem : ({ children }: { children: React.ReactNode }) => <>{children}</>

  return (
    <GridComponent>
      {items.map((item) => (
        <ItemWrapper key={item.id}>
          <ItemCard
            {...item}
            tags={item.tags || []}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </ItemWrapper>
      ))}
    </GridComponent>
  )
}
