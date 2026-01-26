# Lessons Learned - Omnis (Second Brain)

## Current Status
**Phase**: Implementation Complete
**Date**: 2025-01-26
**Working Directory**: `C:\Users\Mateo Cajiao\Documents\omnis`
**Ready for**: Vercel Deployment

---

## Project Summary

**Omnis** is a personal "Second Brain" web application for capturing, organizing, and retrieving digital content (links, tweets, screenshots, notes).

---

## Implementation Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scaffold Next.js + shadcn/ui | ✅ Complete |
| 2 | Supabase setup + SQL migrations | 🟡 Schema ready, needs Supabase project |
| 3 | Auth flow (Magic Link) | ✅ Complete |
| 4 | Add Item flow (server actions + UI) | ✅ Complete |
| 5 | Feed UI (grid + item cards) | ✅ Complete |
| 6 | Sidebar with filters | ✅ Complete |
| 7 | Tags management | ✅ Complete |
| 8 | PWA manifest + service worker | ✅ Complete |
| 9 | Firefox extension MVP | ✅ Complete |
| 10 | Search functionality | ✅ Complete |
| 11 | Status change/deletion | ✅ Complete |
| 12 | Vercel configuration | ✅ Complete |

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

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
│   ├── login/page.tsx           # Magic link login page
│   ├── manifest.json            # PWA manifest
│   ├── page.tsx                 # Main feed page
│   ├── status/[status]/page.tsx # Filter by status
│   ├── tag/[id]/page.tsx        # Filter by tag
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
│   │   └── middleware.ts        # Auth middleware
│   ├── metadata.ts              # OpenGraph fetcher
│   └── utils.ts
├── public/
│   ├── icon.svg                 # PWA icon
│   └── sw.js                    # Service worker
├── supabase/
│   └── schema.sql               # Database schema + RLS policies
├── types/
│   └── database.ts              # TypeScript types
├── middleware.ts                # Next.js middleware
├── vercel.json                  # Vercel configuration
└── .env.local.example           # Environment template
```

---

## Features Implemented

### Core Features
- ✅ **Authentication**: Magic link login via Supabase Auth
- ✅ **Add Items**: Links (with auto-metadata fetch), Notes, Images
- ✅ **Tweet Detection**: Auto-detects tweets and embeds them
- ✅ **Tags**: Create and assign tags to items
- ✅ **Status**: Inbox, Done, Archived
- ✅ **Search**: Full-text search across items
- ✅ **Masonry Grid**: Pinterest-style layout for cards
- ✅ **Filters**: By type, status, and tag
- ✅ **Delete/Status Change**: Inline actions on cards

### PWA Features
- ✅ **Manifest**: Installable as PWA
- ✅ **Service Worker**: Offline caching
- ✅ **Share Target**: Receive URLs from native share sheets

### Extension
- ✅ **Firefox Extension**: Save links from any tab
- ✅ **Configurable API URL**: Works with local or deployed app

---

## Environment Variables Required

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment Steps

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Copy project URL and anon key

### 2. Run Database Migration
1. In Supabase dashboard, open SQL Editor
2. Run the contents of `supabase/schema.sql`

### 3. Create Storage Bucket
1. In Supabase, go to Storage
2. Create a new bucket named `items`
3. Make it public

### 4. Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 5. Test Firefox Extension
1. Open Firefox, go to `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `extension/manifest.json`
4. Configure API URL to point to your deployed app

---

## Known Issues / Future Enhancements

### Nice to Have
- [ ] Edit item functionality
- [ ] Bulk actions (select multiple items)
- [ ] Export to markdown/JSON
- [ ] Import from Pocket/Instapaper
- [ ] Vector embeddings for semantic search
- [ ] Mobile app (React Native or Capacitor)

### Bug Fixes Needed
- [ ] Tweets may not embed if the user's account is private/suspended
- [ ] Metadata fetch may timeout on slow sites

---

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```
