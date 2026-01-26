'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemStatus, Database } from '@/types/database'
import { ItemCard } from '@/components/items/item-card'
import { MasonryGrid, MasonryItem } from '@/components/items/masonry-grid'
import { Loader2 } from 'lucide-react'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
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

  useEffect(() => {
    fetchItemsByTag()
  }, [tagId])

  const fetchItemsByTag = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('item_tags')
      .select(`
        items (
          *,
          tags (
            id,
            name
          )
        )
      `)
      .eq('tag_id', tagId)

    if (error) {
      console.error('Error fetching items:', error)
    } else if (data) {
      const itemsData = data
        .map((item_tag: any) => item_tag.items)
        .filter((item: any) => item !== null)

      setItems(itemsData)
    }
    setLoading(false)
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
          />
        </MasonryItem>
      ))}
    </MasonryGrid>
  )
}
