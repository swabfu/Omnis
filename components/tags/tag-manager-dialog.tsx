'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, X, Tag, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { Database } from '@/types/database'
import {
  BADGE_ICON_SIZE,
  BADGE_ICON_STROKE_WIDTH,
  ACTION_ICON_SIZE,
  ACTION_ICON_STROKE_WIDTH,
} from '@/lib/type-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'

type Tag = Database['public']['Tables']['tags']['Row']

interface TagManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTagCreated?: () => void
  onTagDeleted?: () => void
}

export function TagManagerDialog({ open, onOpenChange, onTagCreated, onTagDeleted }: TagManagerDialogProps) {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_TAG_COLOR)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchTags()
    }
  }, [open])

  const fetchTags = async () => {
    if (!user?.id) return

    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (data) {
      setTags(data)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user?.id) return

    setLoading(true)

    try {
      // Check if tag already exists
      const { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', newTagName.trim())
        .single()

      if (existingTag) {
        alert('A tag with this name already exists.')
        setLoading(false)
        return
      }

      // Get the current max sort_order for this user
      const { data: maxOrder } = await supabase
        .from('tags')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const nextSortOrder = (maxOrder?.sort_order ?? -1) + 1

      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          user_id: user.id,
          color: selectedColor,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      if (error) throw error

      if (newTag) {
        setTags([...tags, newTag])
        setNewTagName('')
        setSelectedColor(DEFAULT_TAG_COLOR)
        onTagCreated?.()
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Failed to create tag. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return

    setDeletingTagId(tagToDelete.id)

    try {
      // First, remove all associations with items
      const { error: associationError } = await supabase
        .from('item_tags')
        .delete()
        .eq('tag_id', tagToDelete.id)

      if (associationError) throw associationError

      // Then delete the tag itself
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagToDelete.id)

      if (deleteError) throw deleteError

      setTags(tags.filter(t => t.id !== tagToDelete.id))
      setDeleteDialogOpen(false)
      setTagToDelete(null)
      onTagDeleted?.()
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('Failed to delete tag. Please try again.')
    } finally {
      setDeletingTagId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateTag()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create new tags or delete existing ones. Deleting a tag removes it from all items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Create New Tag Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className={BADGE_ICON_SIZE} text-muted-foreground strokeWidth={BADGE_ICON_STROKE_WIDTH} />
                <span className="text-sm font-medium">Create New Tag</span>
              </div>

              <Input
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />

              {/* Color Picker */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Color</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="h-6 w-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColor === color ? 'hsl(var(--background))' : color,
                        boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : undefined,
                      }}
                    >
                      {selectedColor === color && (
                        <Check className={ACTION_ICON_SIZE} mx-auto strokeWidth={ACTION_ICON_STROKE_WIDTH} style={{ color: 'white' }} />
                      )}
                    </button>
                  ))}
                </div>
                {/* Custom color picker */}
                <div className="flex items-center gap-2 pt-1 border-t">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-8 flex-1 text-xs font-mono"
                    placeholder={DEFAULT_TAG_COLOR}
                  />
                </div>
              </div>

              {/* Preview */}
              {newTagName.trim() && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Preview:</span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${selectedColor}20`,
                      color: selectedColor,
                      border: `1px solid ${selectedColor}40`,
                    }}
                  >
                    <Tag className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
                    {newTagName}
                  </span>
                </div>
              )}

              <Button
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className={`mr-2 ${BADGE_ICON_SIZE}`} />
                    Create Tag
                  </>
                )}
              </Button>
            </div>

            {/* Existing Tags Section */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Existing Tags</span>
                  <span className="text-xs text-muted-foreground">{tags.length} tag{tags.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between group rounded-md border px-3 py-2 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} style={{ color: tag.color }} />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteClick(tag)}
                        disabled={deletingTagId === tag.id}
                      >
                        {deletingTagId === tag.id ? (
                          <Loader2 className={ACTION_ICON_SIZE} animate-spin />
                        ) : (
                          <X className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{tagToDelete?.name}"</strong>?
              This will remove the tag from all items, but the items themselves will not be deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
