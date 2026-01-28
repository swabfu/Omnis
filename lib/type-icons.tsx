import { LucideIcon, Inbox, Link2, Twitter, Image as ImageIcon, FileText } from 'lucide-react'
import { ContentType } from '@/types/database'

// Content type value constants - use instead of magic strings
export const LINK_TYPE: ContentType = 'link'
export const TWEET_TYPE: ContentType = 'tweet'
export const IMAGE_TYPE: ContentType = 'image'
export const NOTE_TYPE: ContentType = 'note'

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

// Label icon size (badge labels on item cards)
export const LABEL_ICON_SIZE = 'h-4.5 w-4.5'
export const LABEL_ICON_STROKE_WIDTH = 2.5

// Dropdown trigger icon size
export const DROPDOWN_ICON_SIZE = 'h-3.5 w-3.5'
export const DROPDOWN_ICON_STROKE_WIDTH = 2.5

// Loader/spinner icon size
export const LOADER_ICON_SIZE = 'h-8 w-8'
export const LOADER_ICON_STROKE_WIDTH = 2.5

// Success icon size (auth pages)
export const SUCCESS_ICON_SIZE = 'h-16 w-16'
export const SUCCESS_ICON_STROKE_WIDTH = 2.5

// Large icon size (upload placeholders, etc.)
export const LARGE_ICON_SIZE = 'h-10 w-10'
export const LARGE_ICON_STROKE_WIDTH = 2

// Icon button sizes (buttons with icons inside)
export const ICON_BUTTON_SIZE_SM = 'h-6 w-6'
export const ICON_BUTTON_SIZE_MD = 'h-7 w-7'
export const ICON_BUTTON_SIZE_LG = 'h-8 w-8'

// Tag color picker button sizes
export const TAG_COLOR_BUTTON_SIZE = 'h-5 w-5'
export const TAG_COLOR_PICKER_SIZE = 'h-6 w-8'
export const TAG_COLOR_PICKER_SIZE_LG = 'h-8 w-10'

// Avatar placeholder size (for feed empty state)
export const AVATAR_ICON_SIZE = 'h-20 w-20'

// Button icon size (icons inside buttons, like "Load More")
export const BUTTON_ICON_SIZE = 'h-4 w-4'

// Sidebar logo size (Omnis logo in sidebar)
export const SIDEBAR_LOGO_SIZE = 'h-8 w-8'
export const SIDEBAR_LOGO_STROKE_WIDTH = 2

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
