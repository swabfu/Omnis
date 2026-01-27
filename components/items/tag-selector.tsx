'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Plus, Palette } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { ACTION_ICON_SIZE, ACTION_ICON_STROKE_WIDTH } from '@/lib/type-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'

interface Tag {
  id: string
  name: string
  color?: string
}

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  itemId?: string
  onTagCreated?: () => void
}

export function TagSelector({ selectedTags, onTagsChange, itemId, onTagCreated }: TagSelectorProps) {
  const { user } = useAuth()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_TAG_COLOR)
  const [showInput, setShowInput] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchTags()
    }
  }, [user?.id])

  const fetchTags = async () => {
    if (!user?.id) return

    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (data) {
      setAllTags(data)
    }
  }

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
        console.log('Added existing tag:', existingTag)
      }
    } else {
      // Get the current max sort_order for this user
      const { data: maxOrder } = await supabase
        .from('tags')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const nextSortOrder = (maxOrder?.sort_order ?? -1) + 1

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
        console.error('Error creating tag:', insertError)
        alert('Failed to create tag. Please try again.')
        return
      }

      if (newTag) {
        setAllTags([...allTags, newTag])
        onTagsChange([...selectedTags, newTag])
        onTagCreated?.()
        console.log('Created and added new tag:', newTag)
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
                backgroundColor: `${tag.color || DEFAULT_TAG_COLOR}20`,
                borderColor: `${tag.color || DEFAULT_TAG_COLOR}40`,
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
                    className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
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
                          className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                        className="h-6 w-8 cursor-pointer rounded border"
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
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                {newTagName || 'Preview'}
              </span>
            </div>
          </div>
          <Button size="sm" onClick={handleCreateTag}>
            Add
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {unselectedTags.slice(0, 5).map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              style={{
                borderColor: `${tag.color || DEFAULT_TAG_COLOR}60`,
                color: tag.color || DEFAULT_TAG_COLOR,
              }}
              onClick={() => handleToggleTag(tag)}
            >
              + {tag.name}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowInput(true)}
          >
            <Plus className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} mr-1 />
            New Tag
          </Button>
        </div>
      )}
    </div>
  )
}
