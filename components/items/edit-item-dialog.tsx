'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Tag as TagIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createTagAssociations } from '@/lib/supabase/tags'
import { Database } from '@/types/database'
import { TagSelector } from './tag-selector'
import { dispatchTagsUpdated } from '@/components/layout/sidebar'
import { BADGE_ICON_SIZE, NOTE_TYPE, IMAGE_TYPE } from '@/lib/type-icons'
import { TITLE_TRUNCATE_LENGTH, TRUNCATE_ELLIPSIS } from '@/lib/truncate-constants'

type Item = Database['public']['Tables']['items']['Row']

interface Tag {
  id: string
  name: string
  color?: string
}

interface EditItemDialogProps {
  item: Item & { tags?: Tag[] }
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemUpdated: () => void
}

export function EditItemDialog({ item, open, onOpenChange, onItemUpdated }: EditItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(item.title || '')
  const [description, setDescription] = useState(item.description || '')
  const [content, setContent] = useState(item.content || '')
  const [url, setUrl] = useState(item.url || '')
  const [selectedTags, setSelectedTags] = useState<Tag[]>(item.tags || [])
  const supabase = createClient()

  // Reset form when item changes
  useEffect(() => {
    setTitle(item.title || '')
    setDescription(item.description || '')
    setContent(item.content || '')
    setUrl(item.url || '')
    setSelectedTags(item.tags || [])
  }, [item])

  const handleUpdate = async () => {
    setLoading(true)

    try {
      // Update the item
      const updateData: Partial<Database['public']['Tables']['items']['Update']> = {}

      if (item.type === NOTE_TYPE) {
        updateData.content = content.trim()
        // Update title to first N chars of content if title is empty
        updateData.title = title || content.slice(0, TITLE_TRUNCATE_LENGTH) + (content.length > TITLE_TRUNCATE_LENGTH ? TRUNCATE_ELLIPSIS : '')
      } else {
        if (title !== (item.title || '')) updateData.title = title || null
        if (description !== (item.description || '')) updateData.description = description || null
        if (url !== (item.url || '')) updateData.url = url || null
      }

      const { error: updateError } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', item.id)

      if (updateError) throw updateError

      // Update tags: delete all existing associations and add new ones
      // First, get current tag associations from database
      const { data: currentTags, error: tagsError } = await supabase
        .from('item_tags')
        .select('tag_id')
        .eq('item_id', item.id)

      if (tagsError) throw tagsError

      const currentTagIds = currentTags?.map(t => t.tag_id) || []
      const newTagIds = selectedTags.map(t => t.id)

      // Tags to remove (in current but not in new)
      const toRemove = currentTagIds.filter(id => !newTagIds.includes(id))
      // Tags to add (in new but not in current)
      const toAdd = newTagIds.filter(id => !currentTagIds.includes(id))

      // Remove old associations
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('item_tags')
          .delete()
          .eq('item_id', item.id)
          .in('tag_id', toRemove)
        if (removeError) {
          throw removeError
        }
      }

      // Add new associations
      if (toAdd.length > 0) {
        const { success, error } = await createTagAssociations(item.id, toAdd, supabase)
        if (!success) {
          throw new Error(error)
        }
      }

      onOpenChange(false)
      onItemUpdated()
        } catch {
      alert('Failed to update item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
    // Note type
    if (item.type === NOTE_TYPE) {
      return (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={8}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TagIcon className={BADGE_ICON_SIZE} />
              <span>Tags</span>
            </div>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              onTagCreated={dispatchTagsUpdated}
            />
          </div>
        </div>
      )
    }

    // Image type (can only add tags)
    if (item.type === IMAGE_TYPE) {
      return (
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Images can be tagged but not edited.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TagIcon className={BADGE_ICON_SIZE} />
              <span>Tags</span>
            </div>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              onTagCreated={dispatchTagsUpdated}
            />
          </div>
        </div>
      )
    }

    // Link and Tweet types
    return (
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">URL</label>
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TagIcon className={BADGE_ICON_SIZE} />
            <span>Tags</span>
          </div>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {item.type}</DialogTitle>
          <DialogDescription>
            Update this item&apos;s details and tags.
          </DialogDescription>
        </DialogHeader>

        {renderForm()}

        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
