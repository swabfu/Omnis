# CLAUDE.md Cleanup Agent

Analyzes codebase for CLAUDE.md violations: hardcoded values, magic strings, missed globalizations, and duplicate patterns.

## Goal

Find and report code quality issues with the option to fix them interactively. The user reviews each finding and decides whether to apply the fix.

## Directories to Scan

- `components/` - React components and UI
- `app/` - Next.js app routes and pages
- `lib/` - Shared utilities, constants, helpers
- `types/` - TypeScript type definitions

## Scan Everything

Do NOT skip test files, specs, or generated types. Scan all files in scope.

## What to Look For (Priority Order)

### 1. Hardcoded UI Values (Highest Priority)
Search for:
- Tailwind size classes: `h-4`, `w-4`, `h-5`, `w-5`, `h-3`, `w-3`, etc.
- Tailwind stroke widths: `stroke-w-1`, `stroke-w-2`, `stroke-w-2.5`, `stroke-w-3`
- Repeated color values: `text-blue-500`, `bg-green-500`, `text-sky-500`, etc.
- Any icon size pattern in className

Should be using (from `lib/type-icons.tsx`):
- `NAV_ICON_SIZE`, `ACTION_ICON_SIZE`, `BADGE_ICON_SIZE`, `OVERLAY_ICON_SIZE`, `SMALL_ICON_SIZE`
- `NAV_ICON_STROKE_WIDTH`, `ACTION_ICON_STROKE_WIDTH`, `BADGE_ICON_STROKE_WIDTH`, `OVERLAY_ICON_STROKE_WIDTH`
- `typeIcons`, `typeColors`, `statusIcons`, `statusColors`, `statusBadgeColors`

### 2. Magic Strings
Search for:
- Literal status comparisons: `status === 'inbox'`, `status === 'done'`, `status === 'archived'`
- Literal type comparisons: `type === 'link'`, `type === 'tweet'`, `type === 'image'`, `type === 'note'`
- Any string literals that should be constants

Should be using (from `types/database.ts`):
- `ItemStatus` type, `ContentType` type

### 3. Duplicate Component Patterns
Search for:
- Similar JSX structures repeated across files
- Repeated prop type definitions
- Similar logic patterns (e.g., tag rendering, status badges)

### 4. Missed Globalizations
Search for:
- Inline styles that could be constants
- Repeated numbers that should be named constants
- Direct imports of lucide-react icons where centralized icons exist

### 5. Unused Imports and Dead Code
Search for:
- Imports that are never referenced
- Functions/components that are never called
- Commented-out code blocks

## Output Format

For each finding, provide:

```
[VIOLATION_TYPE] file:line

What: Brief description of the issue

Current: (code snippet showing the problem)

Should be: (what the code should look like after fix)

Implications: What changes, risks, or side effects if this fix is applied

Context: Why this matters (refer to CLAUDE.md section)
```

## Interactive Walkthrough

After reporting all findings, group them by type and ask:

```
Found X violations:

1. Hardcoded UI values (Y items)
2. Magic strings (Z items)
3. Duplicate patterns (W items)
...

Review each group? (yes/no/skip to specific)
```

If user says yes, walk through each item:

```
[1/X] Hardcoded icon size in components/items/item-card.tsx:42

What: className="h-4 w-4" should use BADGE_ICON_SIZE

Current: <Inbox className="h-4 w-4" />

Should be: <Inbox className={BADGE_ICON_SIZE} />

Implications: Will add import for BADGE_ICON_SIZE from lib/type-icons.tsx. No behavior change.

Fix this? (yes/no/skip rest)
```

## When Fixing

1. Read the file first
2. Apply the edit
3. Verify no syntax errors
4. Confirm the fix was applied

## Edge Cases

| Situation | Resolution |
|-----------|------------|
| Already uses constant but different name | Note it, ask if should consolidate |
| Similar but not identical pattern | Report as "potential duplicate" |
| Fix would break logic | Skip and explain why |
| File has multiple violations | Fix all in same file at once, confirm once |

## Final Summary

After walkthrough, provide:

```
Cleanup complete:

- Applied: X fixes
- Skipped: Y items
- Left for later: Z items

Files modified: (list)
```
