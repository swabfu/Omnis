'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Tag, Pencil, X, Loader2, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  NAV_ICON_SIZE,
  NAV_ICON_STROKE_WIDTH,
  ACTION_ICON_SIZE,
  ACTION_ICON_STROKE_WIDTH,
  BADGE_ICON_SIZE,
  TAG_COLOR_BUTTON_SIZE,
  TAG_COLOR_PICKER_SIZE,
} from '@/lib/type-icons'
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'
import {
  DRAGGING_OPACITY,
  ICON_HIDE_OPACITY,
  HOVER_SHOW_OPACITY,
  NAME_HOVER_SHOW_OPACITY,
  HOVER_MUTED_BG,
  HOVER_DESTRUCTIVE_BG,
  OPACITY_TRANSITION,
} from '@/lib/opacity-constants'
import type { Database } from '@/types/database'

type Tag = Database['public']['Tables']['tags']['Row']

interface SidebarTagItemProps {
  tag: Tag
  onUpdate: (tagId: string, updates: Partial<Tag>) => void
  onDelete: (tagId: string) => void
  isActive: boolean
  deletingTagId: string | null
}

function TagInlinePopover({ tag, onUpdate, onDelete, deletingTagId }: SidebarTagItemProps) {
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
      {/* Tag icon with color picker */}
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
                  className={cn(TAG_COLOR_BUTTON_SIZE, 'rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2')}
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
                className={cn(TAG_COLOR_PICKER_SIZE, 'cursor-pointer rounded border')}
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

      {/* Tag name with inline edit */}
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
            {isSaving && <Loader2 className={cn(ACTION_ICON_SIZE, 'animate-spin')} />}
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full">
            <Link
              href={`/tag/${tag.id}`}
              className="flex-1 truncate inline group/name"
              onClick={(e) => {
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
                  className={cn(TAG_COLOR_BUTTON_SIZE, 'flex items-center justify-center rounded', HOVER_MUTED_BG, ICON_HIDE_OPACITY, NAME_HOVER_SHOW_OPACITY, OPACITY_TRANSITION)}
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
        className={cn(TAG_COLOR_BUTTON_SIZE, 'flex items-center justify-center rounded', HOVER_DESTRUCTIVE_BG, 'text-destructive', ICON_HIDE_OPACITY, HOVER_SHOW_OPACITY, OPACITY_TRANSITION)}
        disabled={deletingTagId === tag.id}
        title="Delete tag"
      >
        {deletingTagId === tag.id ? (
          <Loader2 className={cn(ACTION_ICON_SIZE, 'animate-spin')} />
        ) : (
          <X className={ACTION_ICON_SIZE} strokeWidth={ACTION_ICON_STROKE_WIDTH} />
        )}
      </button>
    </>
  )
}

export function SidebarTagItem({ tag, onUpdate, onDelete, isActive, deletingTagId }: SidebarTagItemProps) {
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? DRAGGING_OPACITY : ''}>
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
          className={cn('absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none', ICON_HIDE_OPACITY, HOVER_SHOW_OPACITY, OPACITY_TRANSITION)}
          {...listeners}
        >
          <GripVertical className={BADGE_ICON_SIZE} />
        </div>

        {/* Tag content with inline edit */}
        <TagInlinePopover
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
