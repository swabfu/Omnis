# Remaining Tasks

## High Priority - Performance & DRY Violations

### 1. Duplicated Color Picker UI
**Files:** `tag-manager-dialog.tsx` lines 188-230, `tag-selector.tsx` lines 182-230

**Issue:** Nearly identical color picker code in two places.

**Fix:** Create `components/ui/tag-color-picker.tsx` as reusable component.

---

## Medium Priority

### 2. Inconsistent Error Handling
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

### 3. Direct `useContext()` Instead of Custom Hook
**File:** `components/layout/search-header.tsx` line 15

**Issue:** Uses `useContext(SearchContext)` directly instead of `useSearch()`.

**Fix:** Replace with `useSearch()` for better error messages.

---

### 4. Environment Variable Assumptions
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
- **N+1 Query fix** - Bulk tag sort order via RPC function
- **Duplicated Tag Fetching fix** - Shared `useTags()` hook
- **Duplicated Type Definitions fix** - Centralized `types/items.ts`
