# Remaining Tasks

## High Priority - Performance & DRY Violations

### 1. N+1 Query on Tag Reorder
**File:** `components/layout/sidebar.tsx` lines 162-167

**Issue:** Reordering tags makes N separate database calls instead of one bulk operation.

**Fix:** Create Supabase RPC function or bulk update approach.
```typescript
// Current (bad):
for (const update of updates) {
  await supabase.from('tags').update({ sort_order }).eq('id', update.id)
}

// Target: Single bulk update query or RPC function
```

---

### 2. Duplicated Tag Fetching
**Files:** `sidebar.tsx`, `tag-selector.tsx`, `tag-manager-dialog.tsx`

**Issue:** Three components have identical `fetchTags` functions.

**Fix:** Create shared hook `lib/hooks/use-tags.ts`:
```typescript
export function useTags() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const supabase = createClient()
  // fetch, useEffect with TAGS_UPDATED_EVENT listener
  return { tags, fetchTags, setTags }
}
```

---

### 3. Duplicated Type Definitions
**Files:** `feed.tsx`, `item-card.tsx`, `search-input.tsx`, `add-item-dialog.tsx`, `edit-item-dialog.tsx`

**Issue:** `Tag` and `ItemWithTags` interfaces defined in 5+ files.

**Fix:** Export from `types/items.ts`:
```typescript
// types/items.ts
export interface Tag { id: string; name: string; color?: string }
export type ItemWithTags = Database['public']['Tables']['items']['Row'] & { tags: Tag[] }
```

Then replace all local definitions with imports.

---

### 4. Duplicated Color Picker UI
**Files:** `tag-manager-dialog.tsx` lines 188-230, `tag-selector.tsx` lines 182-230

**Issue:** Nearly identical color picker code in two places.

**Fix:** Create `components/ui/tag-color-picker.tsx` as reusable component.

---

## Medium Priority

### 5. Inconsistent Error Handling
**Files:** Multiple

**Issue:** Error handling patterns vary (silent catches, toasts, console.error).

**Fix:** Create unified error utility `lib/error-handler.ts`:
```typescript
export function handleApiError(error: unknown, context: string) {
  console.error(`[${context}]`, error)
  toast.error(error instanceof Error ? error.message : 'An error occurred')
}
```

---

### 6. Direct `useContext()` Instead of Custom Hook
**File:** `components/layout/search-header.tsx` line 15

**Issue:** Uses `useContext(SearchContext)` directly instead of `useSearch()`.

**Fix:** Replace with `useSearch()` for better error messages.

---

### 7. Environment Variable Assumptions
**File:** `lib/supabase/client.ts`

**Issue:** Uses `!` assertion, assumes env vars always exist.

**Fix:** Add validation:
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) throw new Error('Missing Supabase environment variables')
```

---

## Reference

For completed work, see git history for:
- Toast notifications (sonner)
- DeleteConfirmDialog component
- React.memo on ItemCard
- Context memoization
- Transition timing fix
