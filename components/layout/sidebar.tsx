'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { deleteTagWithAssociations } from '@/lib/supabase/tags'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { AddItemDialog } from '@/components/items/add-item-dialog'
import { TagManagerDialog } from '@/components/tags/tag-manager-dialog'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTags } from '@/lib/hooks/use-tags'
import type { Tag } from '@/types/items'
import {
  ACTION_ICON_SIZE,
  ACTION_ICON_STROKE_WIDTH,
  BADGE_ICON_SIZE,
  ICON_BUTTON_SIZE_SM,
  SIDEBAR_LOGO_SIZE,
} from '@/lib/type-icons'
import { SIDEBAR_TAGS_DISPLAY_LIMIT, SIDEBAR_WIDTH } from '@/lib/sidebar-constants'
import { SidebarTagItem } from './sidebar-tag-item'
import { SidebarContentTypesNav, SidebarStatusNav } from './sidebar-nav-sections'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { tags, setTags, dispatchTagsUpdated } = useTags()
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateTag = async (tagId: string, updates: Partial<Tag>) => {
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)

    if (error) {
      toast.error('Failed to update tag. Please try again.')
      return
    }

    setTags(tags.map(t => t.id === tagId ? { ...t, ...updates } : t))
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

    const { success, error } = await deleteTagWithAssociations(tagToDelete.id, supabase)

    if (success) {
      setTags(tags.filter(t => t.id !== tagToDelete.id))
      setDeleteDialogOpen(false)
      setTagToDelete(null)
      dispatchTagsUpdated()
    } else {
      toast.error(error || 'Failed to delete tag. Please try again.')
    }

    setDeletingTagId(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tags.findIndex(t => t.id === active.id)
    const newIndex = tags.findIndex(t => t.id === over.id)

    if (oldIndex === newIndex) return

    const newTags = arrayMove(tags, oldIndex, newIndex)
    setTags(newTags)

    try {
      const updates = newTags.map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      for (const update of updates) {
        await supabase
          .from('tags')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }
    } catch {
      setTags(tags)
    }
  }

  return (
    <div className={`flex h-full ${SIDEBAR_WIDTH} flex-col border-r bg-background`}>
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className={cn('flex items-center justify-center rounded-lg bg-primary', SIDEBAR_LOGO_SIZE)}>
          <span className="text-lg font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-lg font-semibold">Omnis</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Add Button */}
        <AddItemDialog onTagCreated={dispatchTagsUpdated} />

        <Separator className="my-4" />

        {/* Content Types Navigation */}
        <SidebarContentTypesNav />

        <Separator className="my-4" />

        {/* Status Filters */}
        <SidebarStatusNav />

        <Separator className="my-4" />

        {/* Tags */}
        <nav className="space-y-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold text-muted-foreground">Tags</p>
            <Button
              variant="ghost"
              size="sm"
              className={ICON_BUTTON_SIZE_SM}
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
                  {tags.slice(0, SIDEBAR_TAGS_DISPLAY_LIMIT).map((tag) => (
                    <SidebarTagItem
                      key={tag.id}
                      tag={tag}
                      onUpdate={handleUpdateTag}
                      onDelete={handleDeleteClick}
                      isActive={pathname === `/tag/${tag.id}`}
                      deletingTagId={deletingTagId}
                    />
                  ))}
                </div>
                {tags.length > SIDEBAR_TAGS_DISPLAY_LIMIT && (
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
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Tag"
        description={
          <>
            Are you sure you want to delete <strong>&ldquo;{tagToDelete?.name}&rdquo;</strong>?
            This will remove the tag from all items, but the items themselves will not be deleted.
            This action cannot be undone.
          </>
        }
        confirmText="Delete Tag"
        isLoading={deletingTagId !== null}
      />
    </div>
  )
}
