import { Database } from './database'

/**
 * Tag type - the full database row type for tags.
 * Replaces duplicated definitions in feed.tsx, item-card.tsx, search-input.tsx,
 * add-item-dialog.tsx, and edit-item-dialog.tsx.
 */
export type Tag = Database['public']['Tables']['tags']['Row']

/**
 * Item with its associated tags.
 * Replaces duplicated definitions in multiple files.
 */
export type ItemWithTags = Database['public']['Tables']['items']['Row'] & {
  tags: Tag[]
}
