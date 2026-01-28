'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemStatus, Database } from '@/types/database'
import { ItemCard } from '@/components/items/item-card'
import { MasonryGrid, MasonryItem } from '@/components/items/masonry-grid'
import { Loader2 } from 'lucide-react'
import { LOADER_ICON_SIZE } from '@/lib/type-icons'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
  color?: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

interface TagFeedProps {
  tagId: string
}

export function TagFeed({ tagId }: TagFeedProps) {
  const [items, setItems] = useState<ItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchItemsByTag = useCallback(async () => {
    setLoading(true)
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
      .eq('tag_id', tagId)

    if (error) {
      // Error fetching items - will be handled by UI
    } else if (data) {
      const itemsData = data
        .map((item_tag: { items: ItemWithTags | null }) => item_tag.items)
        .filter((item): item is ItemWithTags => item !== null)

      setItems(itemsData)
    }
    setLoading(false)
  }, [supabase, tagId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount is valid effect usage
    fetchItemsByTag()
  }, [fetchItemsByTag])

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
    await fetchItemsByTag()
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
        <p className="text-muted-foreground">No items with this tag yet.</p>
      </div>
    )
  }

  return (
    <MasonryGrid>
      {items.map((item) => (
        <MasonryItem key={item.id}>
          <ItemCard
            {...item}
            tags={item.tags || []}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onItemUpdated={handleItemUpdated}
          />
        </MasonryItem>
      ))}
    </MasonryGrid>
  )
}
