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

## Architecture

### Stack
- **Next.js 16** with App Router (React 19)
- **Supabase** for PostgreSQL database, authentication, and Row Level Security (RLS)
- **TypeScript** with strict mode
- **Tailwind CSS v4** with shadcn/ui components (New York style)
- **PWA** with Web Share Target API and browser extension

### Database Schema

Located in `supabase/schema.sql`. Key tables:

- **profiles**: User profiles (linked to auth.users via trigger)
- **items**: Core content storage with types: `link`, `tweet`, `image`, `note`
- **tags**: User-defined tags for organization. Columns: `id`, `user_id`, `name`, `color` (default '#3b82f6'), `sort_order` (default 0)
- **item_tags**: Many-to-many junction table

**Important:** When fetching items with tags, always include `color` in the tag query:
```typescript
.select('*, tags (id, name, color)')
```

Items have status workflow: `inbox` → `done` → `archived`. Items also store a 1536-dimensional vector embedding for semantic search (pgvector extension).

### Authentication

Server-side auth with Supabase SSR. Key files:

- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/middleware.ts` - Session refresh and route protection
- `middleware.ts` - Next.js middleware wrapper

**Public routes** (no auth required): `/login`, `/signup`, `/reset-password`, `/update-password`, `/auth/callback`

All other routes require authentication. Unauthenticated users are redirected to `/login`. Authenticated users visiting `/login` are redirected to `/`.

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

Database types are auto-generated in `types/database.ts`. Use the `Database` generic when creating Supabase clients for type-safe queries.

```typescript
import { Database } from '@/types/database'
createServerClient<Database>(...)
```

## Browser Extension

Located in `extension/` - Manifest V2 extension for quick content saving. Integrates with the web app via the Web Share Target API.

## Environment Variables

Required for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Tag System Components

Key tag-related components (all display tag colors):

- **`components/layout/sidebar.tsx`** - Drag-and-drop tag reordering with @dnd-kit, inline edit (name/color), delete confirmation
- **`components/tags/tag-manager-dialog.tsx`** - Dialog for creating new tags with color picker
- **`components/items/tag-selector.tsx`** - Tag selector for adding tags to items
- **`components/items/item-card.tsx`** - Displays tags with colors on items

**Tag event bus:** `dispatchTagsUpdated()` function triggers `omnis:tags-updated` custom event to sync tag changes across components.

**Migrations:** New schema changes require manual migration in Supabase SQL Editor (files in `supabase/migrations/`).

## Type Icons & Colors

Centralized type icons and colors for consistent styling across the app:

**File:** `lib/type-icons.tsx`

**Global icon sizing constants (use these, never hardcode):**
- `NAV_ICON_SIZE = 'h-5 w-5'` / `NAV_ICON_STROKE_WIDTH = 2.5` - Sidebar navigation icons
- `ACTION_ICON_SIZE = 'h-3 w-3'` / `ACTION_ICON_STROKE_WIDTH = 2.5` - Edit/delete/plus buttons
- `BADGE_ICON_SIZE = 'h-4 w-4'` / `BADGE_ICON_STROKE_WIDTH = 2.5` - Tag badges on items
- `OVERLAY_ICON_SIZE = 'h-2.5 w-2.5'` / `OVERLAY_ICON_STROKE_WIDTH = 3` - Overlay icons
- `SMALL_ICON_SIZE = 'h-3 w-3'` - Small inline icons (external links, etc.)

**Icons:**
- `all`: Inbox icon (All Items)
- `link`: Link2 icon
- `tweet`: Twitter icon (bird logo)
- `image`: ImageIcon
- `note`: FileText icon

**Colors (no background, text only):**
- `all`: Neutral (gray)
- `link`: Green
- `tweet`: Sky blue
- `image`: Red
- `note`: Yellow

**Usage:**
```typescript
import { typeIcons, typeColors, allItemsIcon, NAV_ICON_SIZE, NAV_ICON_STROKE_WIDTH } from '@/lib/type-icons'

const Icon = typeIcons.link
const colorClass = typeColors.link

// In nav items:
<span className="flex items-center justify-center">
  <Icon className={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE_WIDTH} />
</span>
```

## Status Icons & Colors

Centralized status icons and colors:

**File:** `lib/status-icons.tsx`

**Icons:** `Inbox`, `CheckCircle` (done), `Archive` (archived)

**Colors:**
- `inbox`: Neutral/black
- `done`: Green
- `archived`: Orange

**Two color variants:**
- `statusColors` - For navigation (text only, no background)
- `statusBadgeColors` - For item badges (with semi-transparent background)

**Usage:**
```typescript
import { StatusIcon } from '@/components/items/status-icon'
import { statusColors, statusBadgeColors } from '@/lib/status-icons'

// In item cards:
<StatusIcon status="inbox" />

// In sidebar nav:
import { statusColors } from '@/lib/status-icons'
const color = statusColors.inbox
```

## View System

**File:** `components/items/view-toggle.tsx`

Three view modes for item feed:
- `masonry` - Masonry grid (default, Pinterest-style)
- `uniform` - Uniform grid columns
- `list` - Compact list view

**Components:**
- `components/items/view-toggle.tsx` - Toggle buttons in header
- `components/items/list-view.tsx` - List view container
- `components/items/item-card.tsx` - Supports `variant` prop ('card' | 'list')

**Usage:** View state managed in `components/home-client.tsx`, passed to `ClientFeed` and `Header`. Transitions use fade/scale animation (250ms ease-in-out).

```typescript
type ViewMode = 'masonry' | 'uniform' | 'list'
```
