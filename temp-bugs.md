# Omnis Bug Report - Agent Findings

Generated 2025-01-29. All bugs from Debugger + React-Specialist agents.

**Summary:** 26 issues - 2 Critical, 6 High, 6 Medium, 12 Low

---

## Critical (Fix Immediately)

### 1. Missing Toaster Provider
**File:** `app/layout.tsx`
**Issue:** `Toaster` component not rendered. Toasts used throughout app (`home-client.tsx`, `sidebar.tsx`, `tag-selector.tsx`) but container doesn't exist. No toast notifications will display.
**Fix:** Import `<Toaster />` from `@/components/ui/toaster` and render it in body after AuthProvider.

### 2. Missing Null Check in Reset Password
**File:** `app/reset-password/page.tsx`
**Issue:** `error` state typed as `string` initialized to empty string. Supabase may return non-string errors (objects).
**Fix:** Type as `string | null`, initialize to `null`, update JSX to handle null properly.

---

## High Severity

### 3. Non-Null Assertion in Header
**File:** `components/layout/header.tsx`
**Issue:** Uses `await props.params!` - will crash if params is undefined.
**Fix:** Remove `!`, add proper null coalescing: `const params = props.params ?? {}`

### 4. Redundant Await on Params
**File:** `components/layout/header.tsx`
**Issue:** Next.js 16 `props.params` is not a Promise. The `await` is leftover from Next.js 15 patterns.
**Fix:** Remove `await` keyword from params access.

### 5. Event Listener Cleanup - Sidebar
**File:** `components/layout/sidebar.tsx` (lines ~82-94)
**Issue:** `omnis:tags-updated` event listener needs cleanup in useEffect return. Verify cleanup exists and is correct.
**Fix:** Ensure useEffect returns cleanup function that removes the event listener.

### 6. Event Listener Cleanup - Tag Selector
**File:** `components/items/tag-selector.tsx` (lines ~58-70)
**Issue:** Same as #5 - verify event listener cleanup exists.
**Fix:** Ensure useEffect returns cleanup function.

### 7. Race Condition - Load More
**File:** `components/items/feed.tsx` (handleLoadMore function)
**Issue:** `isLoading` check isn't enough - state updates are async. Rapid calls can trigger duplicate fetches.
**Fix:** Add `useRef` to track pending requests, check ref in addition to state, set ref in try/finally block.

### 8. Memory Leak - Search Debounce
**File:** `components/items/feed.tsx` (search useEffect)
**Issue:** setTimeout may not be cleared on unmount, causing setState on unmounted component.
**Fix:** Return cleanup function that clears the timeout.

---

## Medium Severity

### 9. Unnecessary Re-renders - Context Functions
**File:** `lib/context/auth-context.tsx` (or similar)
**Issue:** `login`, `signup`, `logout` functions recreated on every render (not wrapped in useCallback).
**Fix:** Wrap functions in `useCallback` with empty deps array.

### 10. Missing Error Handling - Tag Operations
**File:** `lib/supabase/tags.ts`
**Issue:** Functions like `updateTagColor`, `deleteTag` use `.single()` but don't handle PGRST116 (not found) explicitly.
**Fix:** Check for `error.code === 'PGRST116'` and return appropriate error.

### 11. Type Inconsistency - View Mode
**File:** `lib/context/view-mode-context.tsx`
**Issue:** View mode from URL/localStorage not validated against allowed values (`'masonry' | 'uniform' | 'list'`).
**Fix:** Add `isValidViewMode()` type guard and `parseViewMode()` function, use when reading from storage/URL.

### 12. Silent Errors - Edit Item Dialog
**File:** `components/items/edit-item-dialog.tsx` (lines ~74-76, 96-98)
**Issue:** Errors logged to console but not shown to user via toast.
**Fix:** Add `useToast()` hook, show destructive toast on error with error.message.

### 13. Missing useEffect Dependency
**File:** `components/items/edit-item-dialog.tsx` (lines ~49-61)
**Issue:** useEffect depends on `form` but it's not in deps array (only `item`).
**Fix:** Add `form` to dependency array.

### 14. Duplicate Search Logic
**File:** `lib/context/item-context.tsx` + `components/items/feed.tsx`
**Issue:** Search/filter logic duplicated between context and feed components. Inconsistent behavior risk.
**Fix:** Consolidate into single `useItemFilter` hook in `lib/hooks/`, consume from both places.

---

## Low Severity

### 15. Missing Error Boundary
**File:** `app/layout.tsx`
**Issue:** No error boundary - app crashes to blank screen on component errors.
**Fix:** Create `app/error.tsx` with error UI and reset button.

### 16. Redundant 'use client' in UI Components
**Files:** Various `components/ui/*.tsx` (input, label, etc.)
**Issue:** Leaf components have `'use client'` but don't use client features (no hooks, browser APIs). Reduces RSC benefits.
**Fix:** Remove `'use client'` from components that don't need it.

### 17. Prop Drilling - User
**Files:** `components/items/feed.tsx` → `client-feed.tsx`
**Issue:** User prop passed through server to client component. Could use context directly.
**Fix:** Use `useAuth()` in client component instead of receiving user as prop.

### 18. Inconsistent Status Handling
**File:** `components/items/item-card-actions.tsx` (lines ~38-63)
**Issue:** Status update could use `startTransition` for non-blocking UI.
**Fix:** Wrap status change in `startTransition()` for better UX.

### 19. Auth Failures - Extension
**File:** `extension/popup.js` (lines ~10-18)
**Issue:** Silent console log when user not logged in. No user feedback.
**Fix:** Show error message in popup UI, add error CSS class.

### 20. Broken Settings Link
**File:** `components/layout/sidebar.tsx` (line ~126)
**Issue:** Hardcoded `/settings` link but page may not exist (404).
**Fix:** Either create `app/settings/page.tsx` or remove the link.

### 21. Unnecessary Re-renders - Home Client
**File:** `components/home-client.tsx` (line ~52)
**Issue:** Tag refresh on every `omnis:tags-updated` event, even if tags unchanged.
**Fix:** Add debounce to tag refresh handler.

### 22. Missing Loading State
**File:** `components/providers/async-client-provider.tsx`
**Issue:** Suspense fallback is blank (no loading indicator).
**Fix:** Add loading spinner with Loader2 icon as Suspense fallback.

### 23. Inconsistent Error Handling
**Files:** Multiple API files in `lib/api/`
**Issue:** Some functions throw, others return `{ data, error }`. Inconsistent pattern.
**Fix:** Standardize on Supabase `{ data, error }` pattern everywhere.

### 24. Large Context File
**File:** `lib/context/item-context.tsx`
**Issue:** File is large and complex, hard to maintain.
**Fix:** Consider splitting into smaller contexts or using Zustand. (Future improvement)

### 25. No Tag Name Validation
**File:** `lib/supabase/tags.ts`
**Issue:** Tag names not validated for length, characters, emptiness before DB insert.
**Fix:** Add `validateTagName()` function, check before insert. Max 50 chars, alphanumeric + spaces/hyphens/underscores.

### 26. Missing aria-labels
**File:** `components/items/item-card-actions.tsx` + others
**Issue:** Icon-only buttons lack aria-label for screen readers.
**Fix:** Add `aria-label` prop to all icon-only buttons.

---

## Recommended Fix Order

**Immediate:**
- Bug #1 (Toaster) - breaks toast functionality
- Bug #2 (null check) - potential crash

**This Week:**
- Bug #3-4 (header params)
- Bug #7-8 (race conditions)

**When Convenient:**
- Bug #5-6 (verify cleanup exists)
- Bug #9 (memoize context)

**Backlog:**
- All low severity issues

---

## Files Requiring Changes

| File | Bug Count | Bugs |
|------|-----------|------|
| `app/layout.tsx` | 3 | #1, #15 |
| `app/reset-password/page.tsx` | 1 | #2 |
| `components/layout/header.tsx` | 2 | #3, #4 |
| `components/layout/sidebar.tsx` | 2 | #5, #20 |
| `components/items/tag-selector.tsx` | 1 | #6 |
| `components/items/feed.tsx` | 2 | #7, #8 |
| `components/items/client-feed.tsx` | 1 | #17 |
| `components/items/edit-item-dialog.tsx` | 2 | #12, #13 |
| `components/items/item-card-actions.tsx` | 2 | #18, #26 |
| `lib/context/auth-context.tsx` | 1 | #9 |
| `lib/context/view-mode-context.tsx` | 1 | #11 |
| `lib/context/item-context.tsx` | 2 | #14, #24 |
| `lib/supabase/tags.ts` | 2 | #10, #25 |
| `lib/api/*.ts` | 1 | #23 |
| `components/providers/async-client-provider.tsx` | 1 | #22 |
| `extension/popup.js` | 1 | #19 |
