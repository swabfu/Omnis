# Omnis Detailed References

This file contains detailed documentation for specific subsystems. Referenced from CLAUDE.md for on-demand lookup.

---

## Type Icons & Colors

**File:** `lib/type-icons.tsx`

**Icon Size Constants:**
- `NAV_ICON_SIZE = 'h-5 w-5'` / `NAV_ICON_STROKE_WIDTH = 2.5` (nav items)
- `ACTION_ICON_SIZE = 'h-3 w-3'` / `ACTION_ICON_STROKE_WIDTH = 2.5` (edit, delete, plus, x)
- `BADGE_ICON_SIZE = 'h-4 w-4'` / `BADGE_ICON_STROKE_WIDTH = 2.5` (tags, small icons in cards)
- `OVERLAY_ICON_SIZE = 'h-2.5 w-2.5'` / `OVERLAY_ICON_STROKE_WIDTH = 3` (pencil on tag hover)
- `SMALL_ICON_SIZE = 'h-3 w-3'` (external links)
- `LABEL_ICON_SIZE = 'h-4.5 w-4.5'` / `LABEL_ICON_STROKE_WIDTH = 2.5` (badge labels on item cards)
- `DROPDOWN_ICON_SIZE = 'h-3.5 w-3.5'` / `DROPDOWN_ICON_STROKE_WIDTH = 2.5` (dropdown triggers)
- `LOADER_ICON_SIZE = 'h-8 w-8'` / `LOADER_ICON_STROKE_WIDTH = 2.5` (loading spinners)
- `LARGE_ICON_SIZE = 'h-10 w-10'` / `LARGE_ICON_STROKE_WIDTH = 2` (upload placeholders)
- `SUCCESS_ICON_SIZE = 'h-16 w-16'` / `SUCCESS_ICON_STROKE_WIDTH = 2.5` (auth success pages)

**Type Icons:** `all` (Inbox), `link` (Link2), `tweet` (Twitter), `image` (ImageIcon), `note` (FileText)

**Type Colors:** `all` (gray), `link` (green), `tweet` (sky), `image` (red), `note` (yellow)

**Type Constants:** `LINK_TYPE`, `TWEET_TYPE`, `IMAGE_TYPE`, `NOTE_TYPE`

```typescript
import { typeIcons, typeColors, BADGE_ICON_SIZE, BADGE_ICON_STROKE_WIDTH } from '@/lib/type-icons'
<Icon className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
```

---

## Tag Colors

**File:** `lib/tag-colors.ts`

**Constants:**
- `PRESET_TAG_COLORS` - Array of 17 hex colors for tag color picker
- `DEFAULT_TAG_COLOR = '#3b82f6'` - Default blue color for new tags
- `TAG_BG_OPACITY`, `TAG_BORDER_OPACITY`, `TAG_BADGE_OPACITY`, `TAG_OUTLINE_BORDER_OPACITY`

```typescript
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'
```

---

## Status Icons & Colors

**File:** `lib/status-icons.tsx`

**Icons:** `Inbox`, `CheckCircle` (done), `Archive` (archived)

**Colors:** `inbox` (neutral), `done` (green), `archived` (orange)

**Variants:** `statusColors` (nav, text only), `statusBadgeColors` (badges with bg)

**Status Constants (avoid magic strings):**
- `INBOX_STATUS = 'inbox'`
- `DONE_STATUS = 'done'`
- `ARCHIVED_STATUS = 'archived'`

**Badge Icon Size:** `STATUS_BADGE_ICON_SIZE = 'h-4.5 w-4.5'` / `STATUS_BADGE_STROKE_WIDTH = 2.5`

```typescript
import { StatusIcon } from '@/components/items/status-icon'
import { statusColors, DONE_STATUS } from '@/lib/status-icons'
<StatusIcon status={DONE_STATUS} />
```

---

## View System

**File:** `components/items/view-toggle.tsx`

**Modes:** `masonry` (default, Pinterest), `uniform` (grid), `list` (compact)

**Components:**
- `view-toggle.tsx` - Toggle button
- `list-view.tsx` - Container component
- `item-card.tsx` - Supports `variant: 'card' | 'list'`

**State:** Managed in `components/home-client.tsx`, passed to `ClientFeed` and `Header`. Fade/scale transition (250ms ease-in-out).

```typescript
type ViewMode = 'masonry' | 'uniform' | 'list'
```
