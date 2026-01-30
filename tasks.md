# Omnis Tasks

Prioritized backlog of improvements, bugs, and features.

**Protocol:** When marking a task as `[x]`, move it to `.completed-tasks.md` via Bash (never Read/Write that file — it's hidden with dot prefix).

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEVELOPMENT PRINCIPLES (from CLAUDE.md)
# Core: DRY - One source of truth for every repeatable concept
# Workflow: Search → Use existing → Create only if needed → Document once
# Route groups for layouts, React Context for state, global patterns easy to find
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: Critical Bugs

*Core functionality that is broken or missing. Fix these first — they block core functionality.*

- [ ] **Password reset system investigation** - Deep investigation needed; entire auth flow may need rework
  - Current symptom: Forgot password email redirects to `localhost:3000/?error=access_denied&error_code=otp_expired`
  - Investigate: Supabase auth settings, email templates, callback handling, redirect URLs
  - May need: Complete password reset system rework

## PHASE 2: Foundation & Architecture

*Do these before feature work. These enable multiple features and prevent duplicate work.*

- [ ] **Unified filter system (part 2)** - Enable combining filters (e.g., filter by tag within archived, tag within content type)
  - Part 1 done: all pages use unified ClientFeed
  - **Progress (Jan 2025):** Route groups + React Context foundation complete. SearchContext and ViewModeProvider now enable global state without prop drilling.
  - **Remaining:** Share global attributes/filters across pages, avoid per-page configuration
  - **This enables:** context-aware search, combining filters, consistent UI across pages, sort entries
  - MUST use global filter patterns - no per-page config
- [ ] **Transition rendering bug** - Fix freeze during fade-out; make transition global across all pages

## PHASE 3: High Priority Features

*Important user-facing functionality. Build on foundation from Phase 2.*

- [ ] **Context-aware search** - Search within current context (type/status/tag) with special prefixes
  - **DEPENDS ON:** Unified filter system
  - **BUG:** Search currently only works on "All Items" page; implement globally/DRY/shared layouts/etc (follow CLAUDE.md principles and architecture — use shared components, no per-page config)
  - **Local search by default:** When on `/type/links`, search only links. When on `/status/inbox`, search only inbox items.
  - **Smart placeholder:** Search bar shows context (e.g., "Search links..." on links page, "Search inbox..." on inbox page, "Search all items..." on home)
  - **Auto-prefix with escape hatch:** Clicking search auto-fills context prefix (e.g., `type:link `, `status:inbox `, `tag:design `) but user can backspace to remove for global search
  - **Special prefixes for global search from anywhere:**
    - `#tagname` → search by tag (already works)
    - `@type` → search by content type (`@link`, `@tweet`, `@image`, `@note`)
    - `!status` → search by status (`!inbox`, `!done`, `!archived`)
- [ ] **Sort entries** - By date (ascending/descending) and custom sort
  - **DEPENDS ON:** Unified filter system
- [ ] **Item context menu** - Hamburger/three-dot menu on items to edit, delete, etc.
- [ ] **Expand images in-place** - Click to expand images to full view (lightbox/modal), not just open in new tab
- [ ] **Note titles** - Notes currently show chunk of content as title; need explicit title field (let it be optional tho)
- [ ] **Recently deleted tab** - 7-day retention with restore/permanent delete options (individual or bulk)
- [ ] **Folder and subfolder system** - Hierarchical organization in sidebar
  - This affects sidebar layout - do before Sidebar resizing task
  - MUST use existing tag/sidebar patterns
- [ ] **Item pin feature** - Pin important items to top
- [ ] **Reminders on items** - Set reminders on notes/items for future dates (e.g., document for a flight in 2 months)
  - At minimum: in-app counters and reminder badges
  - To be determined: push notifications, email, SMS
- [ ] **Account deletion** - Multi-step user account deletion (like GitHub/Vercel)
  - Must delete ALL user data from Supabase
  - Multi-step confirmation required

## PHASE 4: UI/UX Polish

*Polish, convenience, and UX improvements. Timestamp-related tasks grouped together.*

- [ ] **Cancel new tag creation** - No way to cancel creating a new tag from Add/Edit dialogs; must cancel entire item creation
- [ ] **Edit history on items** - Show "last modified at X time" (not just created at)
- [ ] **Timestamp toggle** - Switch between "about x time ago" and exact timestamp display
- [ ] **Timestamp hover tooltip** - Show alternate timestamp format on hover
- [ ] **Date format preferences** - User choice: just date, date+time, just time, etc.
- [ ] **Page subtitles** - Match content type ("All your [type], saved in one place"). Status: "Everything in your [status], organized". Tags: already correct, don't change. **Note:** Status page *titles* (not subtitles) tracked separately in Critical Bugs
- [ ] **Expand long entries** - When content is too long, expand it and show details in right sidebar instead of having a very long item
- [ ] **Image captions** - Add ability to add captions to images
- [ ] **Rich markdown editor** - Visually friendly markdown editing/rendering for notes (Notion-like); investigate if there's an easy solution/API
- [ ] **Drag and drop** - For images, links, and other content types
- [ ] **Grid view item sizing** - Standardize sizes; items shouldn't expand to match largest item in row (wastes space, weird spacing)
- [ ] **Item spacing** - Reduce/standardize space above icons and below timestamp
- [ ] **Sidebar resizing** - Allow user to resize sidebar width
  - Do AFTER folder/subfolder system
- [ ] **Tags reload on navigation** - Investigate why tags unload/reload when switching pages; fix if feasible. **Note:** Brief "No tags yet" flicker now visible during page transitions
- [ ] **Add item button** - Fix cursor pointer behavior; improve color to match theme; ensure plus/text alignment follows global standards
- [ ] **Item count display** - Replace right "Add Item" button with count of items on current page (follow design standards, globalize)
- [ ] **Tag page title** - Remove blank space in "# [space] name" format

## PHASE 5: Technical Debt & Quality

*Refactoring, cleanup, and quality assurance.*

- [x] **N+1 Query on Tag Reorder** - Created `bulk_update_tag_sort_order` RPC function; replaced loop with single bulk update
- [x] **Duplicated Tag Fetching** - Created shared `lib/hooks/use-tags.ts` hook; removed duplicate fetchTags from sidebar, tag-selector, tag-manager
- [x] **Duplicated Type Definitions** - Created `types/items.ts` with shared Tag/ItemWithTags types; removed duplicates from 5+ files
- [x] **Tag sync across Feed** - Feed now listens to TAGS_UPDATED_EVENT; items refresh when tags are deleted/modified
- [ ] **Password validation UX** - Show all password requirement errors simultaneously, not one at a time
- [ ] **Middleware rework** - Address caution messages; future-proof implementation (investigate and make judgment call)

---

## Viability Questionable

*Don't work on these without explicit approval. Features requiring careful consideration before implementation.*

- [ ] **Image compression** - Compress images client-side before upload to handle files >10MB (depends on feasibility)
- [ ] **URL preview/metadata fetching** - When pasting URLs in the Add Item dialog, title/description/image previews don't appear due to CORS restrictions.
  - **Implications:** Requires server-side API route to bypass CORS, which introduces: server load/computational cost, need for rate limiting (to prevent abuse), caching infrastructure (to avoid re-fetching same URLs), timeout handling, security concerns (malicious URLs)
  - **Alternatives:** Use third-party metadata API (costs money), skip for MVP (users manually enter title/description), or implement simple server-side route and add caching/rate limiting later
