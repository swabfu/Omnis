import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Delete a tag and all its associations with items.
 * @param tagId - The ID of the tag to delete
 * @param supabase - Supabase client instance
 * @returns Object with success status and error if any
 */
export async function deleteTagWithAssociations(
  tagId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, remove all associations with items
    const { error: associationError } = await supabase
      .from('item_tags')
      .delete()
      .eq('tag_id', tagId)

    if (associationError) throw associationError

    // Then delete the tag itself
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)

    if (deleteError) throw deleteError

    return { success: true }
    } catch {
    return { success: false, error: 'Failed to delete tag. Please try again.' }
  }
}

/**
 * Create tag associations for an item.
 * @param itemId - The ID of the item
 * @param tagIds - Array of tag IDs to associate with the item
 * @param supabase - Supabase client instance
 * @returns Object with success status and error if any
 */
export async function createTagAssociations(
  itemId: string,
  tagIds: string[],
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  if (tagIds.length === 0) return { success: true }

  try {
    const tagAssociations = tagIds.map(tagId => ({
      item_id: itemId,
      tag_id: tagId
    }))

    const { error } = await supabase.from('item_tags').insert(tagAssociations)

    if (error) throw error

    return { success: true }
    } catch {
    return { success: false, error: 'Failed to create tag associations.' }
  }
}

/**
 * Get the next sort order value for a new tag.
 * @param userId - The user ID to query tags for
 * @param supabase - Supabase client instance
 * @returns The next sort order value (current max + 1, or 0 if no tags exist)
 */
export async function getNextSortOrder(
  userId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { data: maxOrder } = await supabase
    .from('tags')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  return (maxOrder?.sort_order ?? -1) + 1
}
