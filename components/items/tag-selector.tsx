'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNextSortOrder, TAGS_UPDATED_EVENT } from '@/lib/supabase/tags'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'
import {
  ACTION_ICON_SIZE,
  ACTION_ICON_STROKE_WIDTH,
  TAG_COLOR_BUTTON_SIZE,
  TAG_COLOR_PICKER_SIZE,
  ICON_BUTTON_SIZE_SM,
} from '@/lib/type-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR, TAG_BADGE_OPACITY, TAG_BORDER_OPACITY, TAG_OUTLINE_BORDER_OPACITY } from '@/lib/tag-colors'
import { TAG_SELECTOR_UNSELECTED_LIMIT } from '@/lib/sidebar-constants'

interface Tag {
  id: string
  name: string
  color?: string
}

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  onTagCreated?: () => void
}

export function TagSelector({ selectedTags, onTagsChange, onTagCreated }: TagSelectorProps) {
  const { user } = useAuth()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_TAG_COLOR)
  const [showInput, setShowInput] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const supabase = createClient()

  const fetchTags = useCallback(async () => {
    if (!user?.id) return

    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (data) {
      setAllTags(data)
    }
  }, [supabase, user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount is valid effect usage
    fetchTags()

    const handleTagsUpdated = () => {
      fetchTags()
    }

    window.addEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    return () => {
      window.removeEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    }
  }, [fetchTags])

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user?.id) return

    // Check if tag already exists
    const existingTag = allTags.find(t =>
      t.name.toLowerCase() === newTagName.trim().toLowerCase()
    )

    if (existingTag) {
      // Add existing tag if not already selected
      if (!selectedTags.find(t => t.id === existingTag.id)) {
        onTagsChange([...selectedTags, existingTag])
      }
    } else {
      const nextSortOrder = await getNextSortOrder(user.id, supabase)

      // Create new tag with selected color and sort_order
      const { data: newTag, error: insertError } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          user_id: user.id,
          color: selectedColor,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      if (insertError) {
        toast.error('Failed to create tag. Please try again.')
        return
      }

      if (newTag) {
        setAllTags([...allTags, newTag])
        onTagsChange([...selectedTags, newTag])
        onTagCreated?.()
      }
    }

    setNewTagName('')
    setSelectedColor(DEFAULT_TAG_COLOR)
    setShowInput(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId))
  }

  const handleToggleTag = (tag: Tag) => {
    if (selectedTags.find(t => t.id === tag.id)) {
      handleRemoveTag(tag.id)
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const unselectedTags = allTags.filter(
    t => !selectedTags.find(st => st.id === t.id)
  )

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pl-2"
              style={{
                backgroundColor: `${tag.color || DEFAULT_TAG_COLOR}${TAG_BADGE_OPACITY}`,
                borderColor: `${tag.color || DEFAULT_TAG_COLOR}${TAG_BORDER_OPACITY}`,
                color: tag.color || DEFAULT_TAG_COLOR,
              }}
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Tag */}
      {showInput ? (
        <div className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateTag()
                } else if (e.key === 'Escape') {
                  setShowInput(false)
                  setNewTagName('')
                }
              }}
              autoFocus
            />
            {/* Color preview and picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(ICON_BUTTON_SIZE_SM, 'rounded-full border-2 transition-transform hover:scale-110')}
                    style={{ backgroundColor: selectedColor, borderColor: selectedColor }}
                  />
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-56 p-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Pick a color</p>
                    <div className="grid grid-cols-9 gap-1.5">
                      {PRESET_TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color)
                            setShowColorPicker(false)
                          }}
                          className={cn(TAG_COLOR_BUTTON_SIZE, 'rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2')}
                          style={{
                            backgroundColor: color,
                            borderColor: selectedColor === color ? 'hsl(var(--background))' : 'transparent',
                            boxShadow: selectedColor === color ? `0 0 0 1px ${color}` : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className={cn(TAG_COLOR_PICKER_SIZE, 'cursor-pointer rounded border')}
                      />
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="h-7 flex-1 text-xs font-mono"
                        placeholder={DEFAULT_TAG_COLOR}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${selectedColor}${TAG_BADGE_OPACITY}`,
                  color: selectedColor,
                }}
              >
                {newTagName || 'Preview'}
              </span>
            </div>
          </div>
          <Button type="button" size="sm" onClick={handleCreateTag}>
            Add
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {unselectedTags.slice(0, TAG_SELECTOR_UNSELECTED_LIMIT).map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              style={{
                borderColor: `${tag.color || DEFAULT_TAG_COLOR}${TAG_OUTLINE_BORDER_OPACITY}`,
                color: tag.color || DEFAULT_TAG_COLOR,
              }}
              onClick={() => handleToggleTag(tag)}
            >
              + {tag.name}
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowInput(true)}
          >
            <Plus className={cn(ACTION_ICON_SIZE, 'mr-1')} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
            New Tag
          </Button>
        </div>
      )}
    </div>
  )
}
