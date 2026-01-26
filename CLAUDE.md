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
