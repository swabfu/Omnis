# Lessons Learned - Omnis (Second Brain)

## Current Status
**Phase**: v1 Complete ✅
**Date**: 2025-01-26
**Working Directory**: `C:\Users\Mateo Cajiao\Documents\omnis`
**Deployed**: https://omnis-swabfu.vercel.app (or similar)
**Repo**: https://github.com/swabfu/Omnis

---

## Project Summary

**Omnis** is a personal "Second Brain" web application for capturing, organizing, and retrieving digital content (links, tweets, screenshots, notes).

---

## Tech Stack (Final)
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Password-based, NOT magic link)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

---

## Implementation Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scaffold Next.js + shadcn/ui | ✅ Complete |
| 2 | Supabase setup + SQL migrations | ✅ Complete |
| 3 | Auth flow (Password-based) | ✅ Complete |
| 4 | Add Item flow (server actions + UI) | ✅ Complete |
| 5 | Feed UI (grid + item cards) | ✅ Complete |
| 6 | Sidebar with filters + tags | ✅ Complete |
| 7 | Tags management | ✅ Complete |
| 8 | PWA manifest + service worker | ✅ Complete |
| 9 | Firefox extension MVP | ✅ Complete |
| 10 | Vercel deployment | ✅ Complete |

---

## Critical Bugs Fixed (Must Remember)

### 1. Middleware Blocking Public Routes
**Problem**: Middleware redirected ALL unauthenticated users to `/login`, blocking `/signup`, `/reset-password`
**Solution**: Added `publicRoutes` array to exclude auth pages from auth check
**File**: `lib/supabase/middleware.ts`

```typescript
const publicRoutes = ['/login', '/signup', '/reset-password', '/update-password', '/auth/callback']
const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
if (!user && !isPublicRoute) { /* redirect */ }
```

### 2. Auth Callback URL Issues
**Problem**: Callback redirected to `localhost:3000` instead of Vercel URL
**Solution**: Use `headers()` from `next/headers` to get actual host
**File**: `app/auth/callback/route.ts`

```typescript
const headersList = await headers()
const host = headersList.get('host') || headersList.get('x-forwarded-host')
const protocol = headersList.get('x-forwarded-proto') || 'https'
const baseUrl = `${protocol}://${host}`
```

### 3. useSearchParams Build Error
**Problem**: `useSearchParams` causes build error during static generation
**Solution**: Wrap component in `<Suspense>` boundary
**File**: `app/login/page.tsx`

### 4. Magic Link Rate Limits
**Problem**: Email rate limiting (3-6 per hour) blocked testing
**Solution**: Switched to password-based auth (no rate limit issues)

### 5. vercel.json Secret References
**Problem**: `@supabase-url` references caused build errors
**Solution**: Removed `env` section from `vercel.json`, use actual values in Vercel dashboard

---

## File Structure

```
omnis/
├── app/
│   ├── api/items/route.ts       # API endpoint for extensions
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── globals.css              # Global styles + masonry CSS
│   ├── layout.tsx               # Root layout with SW registration
│   ├── viewport.ts              # Viewport config
│   ├── login/
│   │   ├── page.tsx            # Login page (Suspense wrapper)
│   │   └── login-form.tsx      # Actual login form component
│   ├── signup/page.tsx          # Sign up page
│   ├── reset-password/page.tsx  # Password reset request
│   ├── update-password/page.tsx # Set new password (after reset email)
│   ├── manifest.json            # PWA manifest
│   ├── page.tsx                 # Main feed page
│   ├── status/[status]/page.tsx # Filter by status
│   ├── tag/[id]/page.tsx        # Filter by tag
│   │   └── tag-feed.tsx        # Client-side tag feed component
│   └── type/[type]/page.tsx     # Filter by content type
├── components/
│   ├── auth/
│   │   └── auth-provider.tsx    # Auth context provider
│   ├── items/
│   │   ├── add-item-dialog.tsx  # Add Link/Note/Image dialog with tags
│   │   ├── client-feed.tsx      # Client-side feed wrapper
│   │   ├── feed.tsx             # Items feed with search
│   │   ├── item-card.tsx        # Individual item card component
│   │   ├── masonry-grid.tsx     # Masonry layout
│   │   ├── search-input.tsx     # Search input component
│   │   ├── tag-selector.tsx     # Tag selection component
│   │   └── uniform-grid.tsx     # Uniform grid layout
│   ├── layout/
│   │   ├── sidebar.tsx          # Navigation sidebar with tags
│   │   └── header.tsx           # Search + view toggle
│   └── ui/                      # shadcn/ui components (12 components)
├── extension/
│   ├── manifest.json            # Firefox extension manifest
│   ├── popup.html               # Extension popup UI
│   ├── popup.js                 # Extension logic
│   └── background.js
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Auth middleware (PUBLIC ROUTES!)
│   ├── metadata.ts              # OpenGraph fetcher
│   └── utils.ts
├── public/
│   ├── icon.svg                 # PWA icon
│   └── sw.js                    # Service worker
├── supabase/
│   └── schema.sql               # Database schema + RLS policies
├── types/
│   └── database.ts              # TypeScript types
├── middleware.ts                # Next.js middleware (uses updateSession)
├── vercel.json                  # Vercel configuration (NO env section!)
└── .env.local                  # Local environment file (gitignored)
```

---

## Database Schema

### Tables
- **profiles**: User profiles (id, email, created_at)
- **items**: Main content (link, tweet, image, note) with RLS
- **tags**: User-defined tags
- **item_tags**: Many-to-many junction table

### Security (RLS)
All tables have Row Level Security enabled with policies:
- `user_id = auth.uid()` for all operations
- Auto-profile creation via trigger on user signup

---

## Environment Variables (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Supabase Configuration (Auth)

**Email Provider Settings:**
- ✅ Enable Email provider
- ✅ Enable email signup
- ❌ Confirm email (OFF - to avoid rate limits)
- ✅ Secure email change

**Password Requirements:**
- Minimum 8 characters
- Must contain a number (enforced in code)

---

## Features Implemented

### Core Features
- ✅ **Password Authentication**: Sign up / Sign in / Password reset
- ✅ **Add Items**: Links (with auto-metadata fetch), Notes, Images
- ✅ **Tweet Embedding**: Auto-detects tweets and embeds with `react-tweet`
- ✅ **Tags**: Create and assign tags to items
- ✅ **Status**: Inbox, Done, Archived workflow
- ✅ **Search**: Full-text search (client-side filtering)
- ✅ **Masonry Grid**: Pinterest-style layout
- ✅ **Filters**: By type, status, and tag
- ✅ **Delete/Status Change**: Inline actions on cards

### PWA
- ✅ **Manifest**: Installable as PWA
- ✅ **Service Worker**: Offline caching
- ✅ **Share Target**: Configured for mobile sharing

### Extension
- ✅ **Firefox Extension**: Save links from any tab
- ✅ Files in `/extension` folder
- ✅ Needs API URL configured to deployed app

---

## Remaining Work / Future Enhancements

### Nice to Have
- [ ] Edit item functionality
- [ ] Bulk actions (select multiple items)
- [ ] Export to markdown/JSON
- [ ] Import from Pocket/Instapaper
- [ ] Vector embeddings for semantic search (pgvector ready in schema)
- [ ] Mobile app (React Native or Capacitor)
- [ ] Better search (server-side with Postgres full-text search)

### Bug Fixes Needed
- [ ] Tweets may not embed if account is private/suspended
- [ ] Metadata fetch may timeout on slow sites (10s limit in `lib/metadata.ts`)

---

## Deployment Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
git push         # Deploy to Vercel (auto-deploys)
```

---

## Vercel Deployment URL

Check your actual deployed URL at: https://vercel.com/swabfu/omnis

---

## Firefox Extension Setup

1. Open Firefox → `about:debugging`
2. "This Firefox" → "Load Temporary Add-on"
3. Select `extension/manifest.json`
4. Configure API URL to: `https://your-app.vercel.app/api/items`

---

## Development Notes

### When Working on Auth
- **ALWAYS** update `publicRoutes` in `lib/supabase/middleware.ts` when adding new public pages
- Test auth flow in production environment, not just localhost

### When Working with Supabase
- Run SQL from `supabase/schema.sql` in Supabase SQL Editor
- Storage bucket must be named `items` and be public
- RLS policies use `auth.uid()` which is automatically set by Supabase

### When Working with Next.js
- `useSearchParams` requires `<Suspense>` wrapper in parent component
- Server components can use `createClient()` from `@/lib/supabase/server`
- Client components use `createClient()` from `@/lib/supabase/client`
- Middleware runs on ALL routes unless excluded in matcher

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't access /signup or /reset-password | Add to `publicRoutes` in `lib/supabase/middleware.ts` |
| Build fails with useSearchParams error | Wrap in `<Suspense>` |
| Auth redirects to localhost | Check `app/auth/callback/route.ts` uses `headers()` |
| Environment variable references Secret | Remove `env` from `vercel.json` |
| Can't insert to items table | Check `user_id` is being passed, check RLS policies |
| Images not uploading | Check Storage bucket named `items` exists and is public |

---

## Git History Summary

Recent commits (for reference):
- `e6a0b14` - Fix: Allow public routes and improve auth flow
- `1ce018a` - Debug: Add error logging to reset password
- `9429aff` - Debug: Add error logging to signup
- `862cf5a` - Fix: Wrap login form in Suspense for SSR
- `41195f0` - Feature: Add password-based authentication
- `62fdea4` - Fix: Use correct host URL for auth callback
- `329f04e` - Fix: Remove secret references from vercel.json

---

## Contact / Resources

- Supabase Docs: https://supabase.com/docs
- Next.js App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com
- react-tweet: https://react-tweet.vercel.app

---

**End of v1 documentation. Ready for v2 development!**
