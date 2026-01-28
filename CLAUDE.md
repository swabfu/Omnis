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

## Development Principles: Think Globally, Act Globally, Save Tokens

**The Three Laws:**
1. **Global First** - Every repeatable concept has ONE source of truth
2. **Easy Discovery** - Global patterns must be easy to find, easy to use
3. **Token Efficient** - Documentation and structure minimize redundant reads

**This applies to EVERYTHING:** UI constants, database queries, API logic, validation, types, error handling, file organization, naming conventions.

### Workflow

1. **Search** before creating (5 seconds of search saves hours of refactoring)
2. **Use existing** global patterns (don't reinvent)
3. **Only then** create new global patterns if truly needed
4. **Document** in ONE place (CLAUDE.md or inline)

| ❌ BAD | ✅ GOOD |
|-------|--------|
| `className="h-4 w-4"` | `import { BADGE_ICON_SIZE } from '@/lib/type-icons'` |
| `if (status === 'inbox')` | `import { INBOX_STATUS } from '@/lib/status-icons'` |
| `fetch('/api/items')` | `import { fetchItems } from '@/lib/api/items'` |
| Duplicate error handling | `import { handleError } from '@/lib/errors'` |
| Fix in one place, leave duplicates | Search all, fix at source |
| Long documentation | Concise, reference by need |

### Global Patterns Must Be Easy

**If it's not easy, it won't be used.** When creating global patterns:
- Use obvious naming (`BADGE_ICON_SIZE` not `BS`)
- Group related things (one file, not eight)
- Export from a central location when possible
- Document inline where it's used

### Token Efficiency Rules

1. **Don't duplicate documentation** - Document once, reference elsewhere
2. **Break large files into focused pieces** - Read what you need, not everything
3. **Consolidate tiny files** - 8 files of 10 lines each = 8 file operations
4. **Keep CLAUDE.md lean** - Reference tables in separate files, link to them
5. **Code should document itself** - Types and names > comments

### Quick Reference: Where Things Live

| Need | File |
|------|------|
| Icon sizes/strokes, type icons | `lib/type-icons.tsx` |
| Status icons/colors/constants | `lib/status-icons.tsx` |
| Tag colors, opacity values | `lib/tag-colors.ts` |
| UI constants (dialog, sidebar, etc.) | `lib/ui-constants.ts` |
| Interaction constants | `lib/interaction-constants.ts` |
| Supabase client (browser/server) | `lib/supabase/{client|server}.ts` |
| Database types | `types/database.ts` |
| Utilities (cn, etc.) | `lib/utils.ts` |

### When Adding New Global Patterns

1. Check if it already exists (SEARCH FIRST)
2. Add to existing file if related
3. Create new file only if truly distinct
4. Export from a central location if multiple files
5. Update CLAUDE.md Quick Reference

### Naming Conventions

- Single concept: `lib/{thing}.ts`
- Multiple utilities: `lib/{category}/` directory
- Supabase helpers: `lib/supabase/{purpose}.ts`

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

### Storage

**Items bucket:** `supabase/migrations/20250128_create_items_storage_bucket.sql`
- Public bucket for image uploads (`items` bucket)
- Path format: `{user_id}/images/{timestamp}.{ext}`
- 10MB file size limit, image MIME types only
- RLS policies restrict users to their own folder (upload/view/delete)
- Use `getPublicUrl()` after upload to get display URL
- Migration is idempotent (uses `ON CONFLICT DO UPDATE` and `DROP POLICY IF EXISTS`)

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

## Detailed References

See `docs/REFERENCES.md` for detailed documentation on:
- Type icons & colors
- Tag colors & opacity
- Status icons & colors
- View system modes

### Agent Model Selection

**Reference:** `.claude/agent-models.md`

Before spawning agents via Task tool, check the recommended model. Default to `sonnet` for most work. Use `haiku` for pattern matching, `opus` for complex architecture/unfamiliar codebases.

**Protocol:**
1. Check `.claude/agent-models.md`
2. Assess task complexity
3. Specify `model: "haiku|sonnet|opus"` in Task call

## Code Review Checklist

Before committing:

- [ ] Searched codebase for existing patterns
- [ ] No magic strings/numbers anywhere
- [ ] No duplicate icon sizes, colors, queries, or validation
- [ ] Server vs Client components used correctly (default Server)
- [ ] New colors in `@theme inline`, not hardcoded
- [ ] CLAUDE.md updated if patterns/constants/routes/schema changed
