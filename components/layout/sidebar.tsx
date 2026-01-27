'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Inbox,
  CheckCircle,
  Archive,
  Tag,
  LogOut,
  Plus,
  X,
  Pencil,
  Loader2,
  GripVertical,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { AddItemDialog } from '@/components/items/add-item-dialog'
import { TagManagerDialog } from '@/components/tags/tag-manager-dialog'
import { Database } from '@/types/database'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  typeIcons,
  typeColors,
  allItemsIcon,
  NAV_ICON_SIZE,
  NAV_ICON_STROKE_WIDTH,
  ACTION_ICON_SIZE,
  ACTION_ICON_STROKE_WIDTH,
  OVERLAY_ICON_SIZE,
  OVERLAY_ICON_STROKE_WIDTH,
  BADGE_ICON_SIZE,
  BADGE_ICON_STROKE_WIDTH,
} from '@/lib/type-icons'
import { statusColors } from '@/lib/status-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'

type Tag = Database['public']['Tables']['tags']['Row']

// Event name for tag updates across components
export const TAGS_UPDATED_EVENT = 'omnis:tags-updated'

// Helper function to dispatch tag update event
export function dispatchTagsUpdated() {
  window.dispatchEvent(new CustomEvent(TAGS_UPDATED_EVENT))
}

const navItems = [
  { name: 'All Items', href: '/', icon: allItemsIcon, color: typeColors.all },
  { name: 'Links', href: '/type/link', icon: typeIcons.link, color: typeColors.link },
  { name: 'Tweets', href: '/type/tweet', icon: typeIcons.tweet, color: typeColors.tweet },
  { name: 'Images', href: '/type/image', icon: typeIcons.image, color: typeColors.image },
  { name: 'Notes', href: '/type/note', icon: typeIcons.note, color: typeColors.note },
]

const statusItems = [
  { name: 'Inbox', href: '/status/inbox', icon: Inbox, color: statusColors.inbox },
  { name: 'Done', href: '/status/done', icon: CheckCircle, color: statusColors.done },
  { name: 'Archived', href: '/status/archived', icon: Archive, color: statusColors.archived },
]

interface TagInlineEditProps {
  tag: Tag
  onUpdate: (tagId: string, updates: Partial<Tag>) => void
  onDelete: (tagId: string) => void
  isActive: boolean
  deletingTagId: string | null
}

interface SortableTagItemProps extends TagInlineEditProps {}

function SortableTagItem({ tag, onUpdate, onDelete, isActive, deletingTagId }: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tag.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
        )}
      >
        {/* Drag handle */}
        <div
          className="absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          {...listeners}
        >
          <GripVertical className={BADGE_ICON_SIZE} />
        </div>

        {/* TagInlineEdit content without the wrapper div */}
        <PopoverWrapper
          tag={tag}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isActive={isActive}
          deletingTagId={deletingTagId}
        />
      </div>
    </div>
  )
}

interface PopoverWrapperProps {
  tag: Tag
  onUpdate: (tagId: string, updates: Partial<Tag>) => void
  onDelete: (tagId: string) => void
  isActive: boolean
  deletingTagId: string | null
}

function PopoverWrapper({ tag, onUpdate, onDelete, isActive, deletingTagId }: PopoverWrapperProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(tag.name)
  const [isEditingColor, setIsEditingColor] = useState(false)
  const [customColor, setCustomColor] = useState(tag.color)
  const [isSaving, setIsSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditedName(tag.name)
    setCustomColor(tag.color)
  }, [tag.name, tag.color])

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === tag.name) {
      setIsEditingName(false)
      setEditedName(tag.name)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(tag.id, { name: editedName.trim() })
      setIsEditingName(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveColor = async (color: string) => {
    if (color === tag.color) return
    await onUpdate(tag.id, { color })
    setIsEditingColor(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(tag.name)
    }
  }

  return (
    <>
      {/* Tag icon with color */}
      <Popover open={isEditingColor} onOpenChange={(open) => {
        setIsEditingColor(open)
        if (open) setCustomColor(tag.color)
      }}>
        <PopoverTrigger asChild>
          <button
            className="relative flex-shrink-0 transition-transform hover:scale-110 flex items-center justify-center"
            onClick={() => setIsEditingColor(true)}
          >
            <Tag className={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE_WIDTH} style={{ color: tag.color }} />
          </button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-56 p-3">
          <div className="space-y-3">
            <p className="text-xs font-medium">Edit Tag Color</p>
            {/* Preset colors */}
            <div className="grid grid-cols-9 gap-1.5">
              {PRESET_TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSaveColor(color)}
                  className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{
                    backgroundColor: color,
                    borderColor: customColor.toLowerCase() === color.toLowerCase() ? 'hsl(var(--background))' : 'transparent',
                    boxShadow: customColor.toLowerCase() === color.toLowerCase() ? `0 0 0 2px ${color}` : undefined,
                  }}
                />
              ))}
            </div>
            {/* Custom color picker */}
            <div className="flex items-center gap-2 pt-1 border-t">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-7 flex-1 text-xs font-mono"
                placeholder={DEFAULT_TAG_COLOR}
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleSaveColor(customColor)}
                disabled={customColor === tag.color}
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Tag name with edit capability */}
      <div className="flex-1 min-w-0 flex items-center">
        {isEditingName ? (
          <div className="flex items-center gap-1 w-full">
            <Input
              ref={nameInputRef}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              disabled={isSaving}
              className="h-6 py-0 px-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            {isSaving && <Loader2 className={ACTION_ICON_SIZE} animate-spin />}
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full">
            <Link
              href={`/tag/${tag.id}`}
              className="flex-1 truncate inline group/name"
              onClick={(e) => {
                // Don't navigate if we just clicked to edit
                if (isEditingName) e.preventDefault()
              }}
            >
              <span className="flex items-center gap-1">
                <span className="truncate">{tag.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted-foreground/20 opacity-0 group-hover/name:opacity-100 transition-opacity"
                  title="Edit tag name"
                >
                  <Pencil className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
                </button>
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(tag.id)
        }}
        className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        disabled={deletingTagId === tag.id}
        title="Delete tag"
      >
        {deletingTagId === tag.id ? (
          <Loader2 className={ACTION_ICON_SIZE} animate-spin />
        ) : (
          <X className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
        )}
      </button>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [tags, setTags] = useState<Tag[]>([])
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTags = useCallback(async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true })

    if (data) {
      setTags(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchTags()

    // Listen for tag updates from other components (dialogs, etc.)
    const handleTagsUpdated = () => {
      fetchTags()
    }

    window.addEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    return () => {
      window.removeEventListener(TAGS_UPDATED_EVENT, handleTagsUpdated)
    }
  }, [fetchTags])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleUpdateTag = async (tagId: string, updates: Partial<Tag>) => {
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)

    if (error) {
      console.error('Error updating tag:', error)
      alert('Failed to update tag. Please try again.')
      return
    }

    // Update local state
    setTags(tags.map(t => t.id === tagId ? { ...t, ...updates } : t))
    // Dispatch event to update other components
    dispatchTagsUpdated()
  }

  const handleDeleteClick = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (tag) {
      setTagToDelete(tag)
      setDeleteDialogOpen(true)
    }
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
      dispatchTagsUpdated()
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('Failed to delete tag. Please try again.')
    } finally {
      setDeletingTagId(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tags.findIndex(t => t.id === active.id)
    const newIndex = tags.findIndex(t => t.id === over.id)

    if (oldIndex === newIndex) return

    const newTags = arrayMove(tags, oldIndex, newIndex)
    setTags(newTags)

    // Update sort_order in database
    try {
      // Update each tag's sort_order
      const updates = newTags.map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      // Batch update all sort orders
      for (const update of updates) {
        await supabase
          .from('tags')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Error updating tag order:', error)
      // Revert local state on error
      setTags(tags)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-lg font-semibold">Omnis</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Add Button */}
        <AddItemDialog onTagCreated={dispatchTagsUpdated} />

        <Separator className="my-4" />

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Content Types
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <span className={cn('flex items-center justify-center', item.color)}>
                  <Icon className={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        {/* Status Filters */}
        <nav className="space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Status
          </p>
          {statusItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <span className={cn('flex items-center justify-center', item.color)}>
                  <Icon className={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        {/* Tags */}
        <nav className="space-y-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold text-muted-foreground">Tags</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setTagManagerOpen(true)}
            >
              <Plus className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
            </Button>
          </div>
          {tags.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tags.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {tags.slice(0, 8).map((tag, index) => (
                    <SortableTagItem
                      key={tag.id}
                      tag={tag}
                      onUpdate={handleUpdateTag}
                      onDelete={handleDeleteClick}
                      isActive={pathname === `/tag/${tag.id}`}
                      deletingTagId={deletingTagId}
                    />
                  ))}
                </div>
                {tags.length > 8 && (
                  <Link
                    href="/tags"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50"
                  >
                    View all {tags.length} tags
                  </Link>
                )}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No tags yet
            </p>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className={`mr-2 ${BADGE_ICON_SIZE}`} />
          Sign Out
        </Button>
      </div>

      {/* Tag Manager Dialog */}
      <TagManagerDialog
        open={tagManagerOpen}
        onOpenChange={setTagManagerOpen}
        onTagCreated={fetchTags}
        onTagDeleted={fetchTags}
      />

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
    </div>
  )
}
