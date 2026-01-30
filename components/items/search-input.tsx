'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { BADGE_ICON_SIZE } from '@/lib/type-icons'
import { SEARCH_RESULTS_LIMIT, SEARCH_DEBOUNCE_MS } from '@/lib/search-constants'
import type { ItemWithTags, Tag } from '@/types/items'

type Item = Database['public']['Tables']['items']['Row']

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
        // Escape LIKE special characters to prevent wildcard injection
        const sanitizedQuery = query.replace(/%/g, '\\%').replace(/_/g, '\\_')

        // Search in title, description, content, and url
        const { data } = await supabase
          .from('items')
          .select(`
            *,
            tags (*)
          `)
          .or(`title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%,url.ilike.%${sanitizedQuery}%`)
          .order('created_at', { ascending: false })
          .limit(SEARCH_RESULTS_LIMIT)

        if (data) {
          onResults((data || []) as ItemWithTags[])
        }
      } else {
        onClear()
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(searchTimeout)
  }, [query, onResults, onClear, supabase])

  const handleTagSearch = async (tagName: string) => {
    const { data } = await supabase
      .from('items')
      .select(`
        *,
        tags (*)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      const filtered = (data || []).filter((item: ItemWithTags) =>
        item.tags?.some((tag: Tag) =>
          tag.name.toLowerCase() === tagName.toLowerCase()
        )
      )
      onResults(filtered)
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
      <Search className={`absolute left-3 top-1/2 ${BADGE_ICON_SIZE} -translate-y-1/2 text-muted-foreground`} />
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
