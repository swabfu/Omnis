import { LucideIcon, Inbox, CheckCircle, Archive } from 'lucide-react'
import { ItemStatus } from '@/types/database'

// Status badge icon size (used in item cards and status badges)
export const STATUS_BADGE_ICON_SIZE = 'h-4.5 w-4.5'
export const STATUS_BADGE_STROKE_WIDTH = 2.5

export const statusIcons: Record<ItemStatus, LucideIcon> = {
  inbox: Inbox,
  done: CheckCircle,
  archived: Archive,
}

// Global status colors - used everywhere (sidebar, item cards, badges)
// NAV_ONLY: for sidebar navigation (no background)
export const statusColors: Record<ItemStatus, string> = {
  inbox: 'text-neutral-900 dark:text-neutral-100',
  done: 'text-green-500 dark:text-green-400',
  archived: 'text-orange-500 dark:text-orange-400',
}

// Badge colors (with background) - used in item cards
export const statusBadgeColors: Record<ItemStatus, string> = {
  inbox: 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400',
  done: 'bg-green-500/15 text-green-600 dark:text-green-400',
  archived: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
}

export const statusLabels: Record<ItemStatus, string> = {
  inbox: 'Inbox',
  done: 'Done',
  archived: 'Archived',
}

// Status value constants - use instead of magic strings
export const INBOX_STATUS: ItemStatus = 'inbox'
export const DONE_STATUS: ItemStatus = 'done'
export const ARCHIVED_STATUS: ItemStatus = 'archived'
