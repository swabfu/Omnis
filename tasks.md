# Omnis Tasks

Prioritized backlog of improvements, bugs, and features.

**Protocol:** When marking a task as `[x]`, move it to `.completed-tasks.md` via Bash (never Read/Write that file — it's hidden with dot prefix).

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CRITICAL: CLAUDE.md THREE LAWS ARE MANDATORY FOR EVERY TASK
# Law 1: Global First - Every repeatable concept has ONE source of truth
# Law 2: Easy Discovery - Global patterns must be easy to find, easy to use
# Law 3: Token Efficient - Documentation and structure minimize redundant reads
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: Critical Bugs

*Core functionality that is broken or missing. Fix these first — they block core functionality.*

- [ ] **Password reset system investigation** - Deep investigation needed; entire auth flow may need rework
  - Current symptom: Forgot password email redirects to `localhost:3000/?error=access_denied&error_code=otp_expired`
  - Investigate: Supabase auth settings, email templates, callback handling, redirect URLs
  - May need: Complete password reset system rework
- [ ] **Tag deletion not syncing** - When creating then deleting a new tag in the Add Item dialog, the tag visually disappears from the dialog but still appears elsewhere in the app (sidebar, tag pages)
- [ ] **Status page icon bug** - "Move to inbox" button in Done/Archived pages shows checkmark instead of inbox/tray icon; ensure global icon source
- [ ] **Can't create new tags via Add Item** - Can add new tags via Edit Item but not via New Item; dialog auto-submits instead of letting user create tag (old bug that has regressed)
- [ ] **Icon colors gone in items** - Type icons not showing their colors in item cards (regression)

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
  - **BUG:** Currently only works on "All Items" page; implement globally (follow CLAUDE.md — use shared components, no per-page config)
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

- [ ] **Password validation UX** - Show all password requirement errors simultaneously, not one at a time
- [ ] **Mobile touch targets** - Ensure all buttons are at least 44x44px on mobile
- [ ] **Input font-size fix** - Set minimum 16px on mobile inputs to prevent iOS auto-zoom
- [ ] **Middleware rework** - Address caution messages; future-proof implementation (investigate and make judgment call)

---

## Viability Questionable

*Don't work on these without explicit approval. Features requiring careful consideration before implementation.*

- [ ] **Image compression** - Compress images client-side before upload to handle files >10MB (depends on feasibility)
- [ ] **URL preview/metadata fetching** - When pasting URLs in the Add Item dialog, title/description/image previews don't appear due to CORS restrictions.
  - **Implications:** Requires server-side API route to bypass CORS, which introduces: server load/computational cost, need for rate limiting (to prevent abuse), caching infrastructure (to avoid re-fetching same URLs), timeout handling, security concerns (malicious URLs)
  - **Alternatives:** Use third-party metadata API (costs money), skip for MVP (users manually enter title/description), or implement simple server-side route and add caching/rate limiting later
