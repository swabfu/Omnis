'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ContentType, ItemStatus, Database } from '@/types/database'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
}

interface ItemWithTags extends Item {
  tags: Tag[]
}

interface SearchInputProps {
  onResults: (items: ItemWithTags[]) => void
  onClear: () => void
}

export function SearchInput({ onResults, onClear }: SearchInputProps) {
  const [query, setQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        // Search in title, description, content, and url
        const { data } = await supabase
          .from('items')
          .select(`
            *,
            tags (
              id,
              name
            )
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%,url.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(50)

        if (data) {
          onResults((data || []) as ItemWithTags[])
        }
      } else {
        onClear()
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query, onResults, onClear])

  const handleTagSearch = async (tagName: string) => {
    const { data } = await supabase
      .from('items')
      .select(`
        *,
        tags (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (data) {
      const filtered = (data || []).filter((item: any) =>
        item.tags?.some((tag: any) =>
          typeof tag === 'object' && 'name' in tag && tag.name.toLowerCase() === tagName.toLowerCase()
        )
      )
      onResults(filtered as ItemWithTags[])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      // Check if it's a tag search (starts with #)
      if (query.startsWith('#')) {
        handleTagSearch(query.slice(1))
      }
    }
  }

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search items... (use #tag for tags)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-10"
      />
    </div>
  )
}
