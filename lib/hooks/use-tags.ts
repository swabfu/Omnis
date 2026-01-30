'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import { dispatchTagsUpdated, TAGS_UPDATED_EVENT } from '@/lib/supabase/tags'
import type { Tag } from '@/types/items'

/**
 * Shared hook for fetching and managing tags.
 * Replaces duplicated fetchTags logic in sidebar.tsx, tag-selector.tsx,
 * and tag-manager-dialog.tsx.
 *
 * Provides:
 * - tags: Array of user's tags ordered by sort_order
 * - fetchTags: Function to refresh tags from server
 * - setTags: Function to update local tag state
 */
export function useTags() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTags = useCallback(async () => {
    if (!user?.id) {
      setTags([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (data) {
      setTags(data)
    }
    setLoading(false)
  }, [supabase, user?.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount is valid
    fetchTags()

    const handleTagsUpdated = () => {
      fetchTags()
    }

    window.addEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    return () => {
      window.removeEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    }
  }, [fetchTags])

  return { tags, fetchTags, setTags, loading, dispatchTagsUpdated }
}
