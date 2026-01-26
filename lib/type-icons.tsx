import { LucideIcon, Inbox, Link2, Twitter, Image as ImageIcon, FileText } from 'lucide-react'
import { ContentType } from '@/types/database'

// Global icon styling constants - used across all nav items (types, tags, status)
export const NAV_ICON_SIZE = 'h-5 w-5'
export const NAV_ICON_STROKE_WIDTH = 2.5

// Action icon sizes (edit, delete, plus, x, etc.) - smaller than nav icons
export const ACTION_ICON_SIZE = 'h-3 w-3'
export const ACTION_ICON_STROKE_WIDTH = 2.5

// Overlay icon size (pencil on tag icon hover)
export const OVERLAY_ICON_SIZE = 'h-2.5 w-2.5'
export const OVERLAY_ICON_STROKE_WIDTH = 3

// Badge icon size (tags on item cards, small icons in cards)
export const BADGE_ICON_SIZE = 'h-4 w-4'
export const BADGE_ICON_STROKE_WIDTH = 2.5

// Small inline icons (external links, etc.)
export const SMALL_ICON_SIZE = 'h-3 w-3'

export const typeIcons: Record<ContentType, LucideIcon> = {
  link: Link2,
  tweet: Twitter,
  image: ImageIcon,
  note: FileText,
}

// Default "all items" icon - use Inbox
export const allItemsIcon = Inbox

export const typeColors: Record<ContentType | 'all', string> = {
  all: 'text-neutral-900 dark:text-neutral-100',
  link: 'text-green-500 dark:text-green-400',
  tweet: 'text-sky-500 dark:text-sky-400',
  image: 'text-red-500 dark:text-red-400',
  note: 'text-yellow-600 dark:text-yellow-400',
}

export const typeLabels: Record<ContentType | 'all', string> = {
  all: 'All Items',
  link: 'Link',
  tweet: 'Tweet',
  image: 'Image',
  note: 'Note',
}
