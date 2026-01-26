'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

interface Tag {
  id: string
  name: string
}

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  itemId?: string
}

export function TagSelector({ selectedTags, onTagsChange, itemId }: TagSelectorProps) {
  const { user } = useAuth()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [showInput, setShowInput] = useState(false)
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
      }
    } else {
      // Create new tag
      const { data: newTag } = await supabase
        .from('tags')
        .insert({ name: newTagName.trim(), user_id: user.id })
        .select()
        .single()

      if (newTag) {
        setAllTags([...allTags, newTag])
        onTagsChange([...selectedTags, newTag])
      }
    }

    setNewTagName('')
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
            <Badge key={tag.id} variant="secondary" className="gap-1 pl-2">
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Tag */}
      {showInput ? (
        <div className="flex gap-2">
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
            <Plus className="h-3 w-3 mr-1" />
            New Tag
          </Button>
        </div>
      )}
    </div>
  )
}
