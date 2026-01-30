# Remaining Tasks

## Medium Priority

### 1. Inconsistent Error Handling
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

## Completed

### ~~Duplicated Color Picker UI~~
**Created:** `components/ui/tag-color-picker.tsx`

Extracted duplicated color picker code into reusable component supporting both `dialog` and `popover` variants.

---

### ~~Environment Variable Assumptions~~
**Created:** `lib/env.ts`

Replaced `!` assertions in `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `lib/supabase/middleware.ts` with validated env config that provides clear error messages at startup.

---

## Note

Task 3 from original list ("Direct useContext() Instead of Custom Hook" in `search-header.tsx`) was **incorrectly identified**. The component intentionally uses `useContext(SearchContext)` with a null check because it's designed to work both with and without a SearchProvider. Using `useSearch()` would throw an error when no provider exists, breaking the intended behavior.

---

## Reference

For completed work, see git history for:
- Toast notifications (sonner)
- DeleteConfirmDialog component
- React.memo on ItemCard
- Context memoization
- Transition timing fix
- **N+1 Query fix** - Bulk tag sort order via RPC function
- **Duplicated Tag Fetching fix** - Shared `useTags()` hook
- **Duplicated Type Definitions fix** - Centralized `types/items.ts`
