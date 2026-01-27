# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omnis is a personal knowledge management system ("second brain") for capturing, organizing, and retrieving digital content. Users save links, tweets, images, and notes, then organize them with tags and move them through a status workflow (inbox → done → archived).

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Development Principles: Think Globally, Never Hardcode

**Critical Rule:** Always implement at a global level—UI constants, database queries, API logic, validation, config. Hardcoded values create technical debt.

**CLAUDE.md Sync:** Update this file when adding new constants, utilities, patterns, routes, or schema changes. This is the single source of truth.

### Workflow

1. **Search** the codebase for existing patterns before coding
2. **Refactor** hardcoded values to global constants first (don't add debt)
3. **Implement** using centralized patterns, follow naming conventions
4. **Verify** that changing the source of truth updates all consumers

| ❌ BAD | ✅ GOOD |
|-------|--------|
| `className="h-4 w-4"` | `import { BADGE_ICON_SIZE } from '@/lib/type-icons'` |
| `text-blue-500` everywhere | `import { typeColors } from '@/lib/type-icons'` |
| `if (status === 'inbox')` | `import type { ItemStatus } from '@/types/database'` |
| Fix in one place | Search all occurrences, fix globally |

### Quick Reference: Centralized Patterns

| Need | File | Import |
|------|------|--------|
| Icon sizes | `lib/type-icons.tsx` | `NAV_ICON_SIZE`, `ACTION_ICON_SIZE`, `BADGE_ICON_SIZE`, `OVERLAY_ICON_SIZE`, `SMALL_ICON_SIZE`, `LABEL_ICON_SIZE`, `DROPDOWN_ICON_SIZE`, `LOADER_ICON_SIZE`, `LARGE_ICON_SIZE`, `SUCCESS_ICON_SIZE` |
| Icon strokes | `lib/type-icons.tsx` | `NAV_ICON_STROKE_WIDTH`, `ACTION_ICON_STROKE_WIDTH`, etc. |
| Type icons/colors | `lib/type-icons.tsx` | `typeIcons.link`, `typeColors.link` |
| Status icons/colors | `lib/status-icons.tsx` | `statusIcons.inbox`, `statusColors.inbox`, `statusBadgeColors.done` |
| Status constants | `lib/status-icons.tsx` | `INBOX_STATUS`, `DONE_STATUS`, `ARCHIVED_STATUS` |
| Status component | `components/items/status-icon.tsx` | `<StatusIcon status="inbox" />` |
| Tag colors | `lib/tag-colors.ts` | `PRESET_TAG_COLORS`, `DEFAULT_TAG_COLOR` |
| View modes | `components/items/view-toggle.tsx` | `type ViewMode = 'masonry' \ 'uniform' \ 'list'` |
| Supabase (browser) | `lib/supabase/client.ts` | `createClient()` |
| Supabase (server) | `lib/supabase/server.ts` | `createClient()` |
| Database types | `types/database.ts` | `type Database`, `ItemStatus`, `ContentType` |
| Utils | `lib/utils.ts` | `cn()` |
| Auth middleware | `lib/supabase/middleware.ts` | `updateSession()` |
| Public routes | `middleware.ts` | `/login`, `/signup`, `/reset-password`, `/update-password`, `/auth/callback` |

### When Adding New Entities

1. Create `lib/{entity}.ts` with constants (icons, colors, sizes, labels)
2. Export TypeScript types
3. Export helper functions if needed
4. Document usage in CLAUDE.md

```typescript
// lib/your-entity.tsx
import { YourIcon } from 'lucide-react'

export const YOUR_ENTITY_ICON_SIZE = 'h-4 w-4'
export const YOUR_ENTITY_STROKE_WIDTH = 2

export const yourEntityIcons = { variant1: Icon1, variant2: Icon2 } as const
export const yourEntityColors = { variant1: 'text-blue-500', variant2: 'text-green-500' } as const
export type YourEntityType = keyof typeof yourEntityIcons
```

### Naming Conventions

- Single concept: `lib/{thing}.ts`
- Multiple utilities: `lib/{category}/` directory
- Supabase helpers: `lib/supabase/{purpose}.ts`

### Non-UI Guidelines

- **Database queries:** Reuse existing or extract to shared function
- **Validation:** Centralize, don't duplicate across forms
- **API endpoints:** Follow `app/api/` patterns
- **Error messages:** Consider constants file for user-facing strings

### Next.js: Server vs Client Components

| Server (default) | Client (`'use client'`) |
|------------------|------------------------|
| Data fetching, DB queries | Interactivity (onClick, useState) |
| No browser APIs | Browser APIs (localStorage) |
| Secure (server-side) | Code exposed to browser |

**Rule:** Default to Server. Only add `'use client'` for interactivity or browser APIs.

### Styling

- Tailwind CSS v4 with `@theme inline` in `app/globals.css`
- Colors use `oklch()` color space
- Add new colors to `@theme inline`, don't hardcode

## Architecture

### Stack
- **Next.js 16** (App Router, React 19)
- **Supabase** (PostgreSQL, auth, RLS)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (shadcn/ui New York)
- **PWA** (Web Share Target, browser extension)

### Database Schema

Located in `supabase/schema.sql`. Key tables: `profiles`, `items` (`link`, `tweet`, `image`, `note`), `tags` (id, user_id, name, color, sort_order), `item_tags`.

**Important:** When fetching items with tags, include color: `.select('*, tags (id, name, color)')`

Items have status workflow: `inbox` → `done` → `archived`. Items store 1536-dim vector embedding for pgvector semantic search.

### Authentication

Server-side Supabase SSR. Key files: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (session refresh), `middleware.ts` (Next.js wrapper).

**Public routes:** `/login`, `/signup`, `/reset-password`, `/update-password`, `/auth/callback`

All other routes require auth. Unauthenticated → `/login`. Authenticated on `/login` → `/`.

### App Router Structure

```
app/
├── api/              # API routes
├── auth/             # Auth callback pages
├── type/[type]       # Filter by content type
├── tags/             # Tag management
├── status/[status]   # Filter by status (inbox, done, archived)
├── login/            # Login page
├── signup/           # Sign-up page
├── reset-password/   # Password reset request
├── update-password/  # Password reset form
├── layout.tsx        # Root layout with AuthProvider
└── page.tsx          # Home page (requires auth)
```

### Type Safety

Database types auto-generated in `types/database.ts`. Use `Database` generic for type-safe queries:

```typescript
import { Database } from '@/types/database'
createServerClient<Database>(...)
```

## Browser Extension

`extension/` - Manifest V2 extension for quick content saving via Web Share Target API.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Tag System

**Components:** `components/layout/sidebar.tsx` (drag-drop reorder, inline edit, delete), `components/tags/tag-manager-dialog.tsx` (create with color picker), `components/items/tag-selector.tsx` (add to items), `components/items/item-card.tsx` (displays tags with colors).

**Event bus:** `dispatchTagsUpdated()` triggers `omnis:tags-updated` custom event to sync changes.

**Migrations:** New schema changes require manual migration in Supabase SQL Editor (files in `supabase/migrations/`).

## Type Icons & Colors

**File:** `lib/type-icons.tsx`

**Constants (never hardcode):**
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

**Icons:** `all` (Inbox), `link` (Link2), `tweet` (Twitter), `image` (ImageIcon), `note` (FileText)

**Colors:** `all` (gray), `link` (green), `tweet` (sky), `image` (red), `note` (yellow)

```typescript
import { typeIcons, typeColors, BADGE_ICON_SIZE, BADGE_ICON_STROKE_WIDTH } from '@/lib/type-icons'
<Icon className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
```

## Tag Colors

**File:** `lib/tag-colors.ts`

**Constants (never hardcode):**
- `PRESET_TAG_COLORS` - Array of 17 hex colors for tag color picker
- `DEFAULT_TAG_COLOR = '#3b82f6'` - Default blue color for new tags

```typescript
import { PRESET_TAG_COLORS, DEFAULT_TAG_COLOR } from '@/lib/tag-colors'
```

## Status Icons & Colors

**File:** `lib/status-icons.tsx`

**Icons:** `Inbox`, `CheckCircle` (done), `Archive` (archived)

**Colors:** `inbox` (neutral), `done` (green), `archived` (orange)

**Variants:** `statusColors` (nav, text only), `statusBadgeColors` (badges with bg)

**Status constants (avoid magic strings):**
- `INBOX_STATUS = 'inbox'`
- `DONE_STATUS = 'done'`
- `ARCHIVED_STATUS = 'archived'`

**Badge icon size:**
- `STATUS_BADGE_ICON_SIZE = 'h-4.5 w-4.5'` / `STATUS_BADGE_STROKE_WIDTH = 2.5`

```typescript
import { StatusIcon } from '@/components/items/status-icon'
import { statusColors, DONE_STATUS } from '@/lib/status-icons'
<StatusIcon status={DONE_STATUS} />
```

## View System

**File:** `components/items/view-toggle.tsx`

**Modes:** `masonry` (default, Pinterest), `uniform` (grid), `list` (compact)

**Components:** `view-toggle.tsx` (toggle), `list-view.tsx` (container), `item-card.tsx` (variant: 'card' | 'list')

**State:** Managed in `components/home-client.tsx`, passed to `ClientFeed` and `Header`. Fade/scale transition (250ms ease-in-out).

## Code Review Checklist

Before committing:

- [ ] Searched codebase for existing patterns
- [ ] No magic strings/numbers anywhere
- [ ] No duplicate icon sizes, colors, queries, or validation
- [ ] Server vs Client components used correctly (default Server)
- [ ] New colors in `@theme inline`, not hardcoded
- [ ] CLAUDE.md updated if patterns/constants/routes/schema changed
