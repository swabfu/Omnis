# Omnis Implementation Plan

Generated from tasks.md and new-tasks-to-add.
Tasks are ordered to avoid duplicate work and respect dependencies.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CRITICAL: CLAUDE.md THREE LAWS ARE MANDATORY FOR EVERY TASK
# Law 1: Global First - Every repeatable concept has ONE source of truth
# Law 2: Easy Discovery - Global patterns must be easy to find, easy to use
# Law 3: Token Efficient - Documentation and structure minimize redundant reads
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: Critical Bugs (fix these first - they block core functionality)

- [x] **Image upload broken** - RLS error on localhost; fix Supabase policy or storage config
- [ ] **Sign out broken** - Sign out button doesn't work; fix auth flow
- [ ] **Password reset email error** - OTP expired redirect; fix reset flow
- [ ] **Tag deletion not syncing** - Deleted tags still appear; fix event bus/dispatch
- [ ] **Status page icon bug** - Wrong icon on "Move to inbox"; use global icon source
- [ ] **Status page titles wrong** - All show "All Items"; fix page titles

## PHASE 2: Foundation & Architecture (do these before feature work)

- [ ] **Unified filter system** - One item list component accepting filter params (foundation for search, sorting, views)
  - This enables: context-aware search, combining filters, consistent UI across pages
  - MUST use global filter patterns - no per-page config
- [ ] **Transition rendering bug** - Fix freeze during fade-out; make transition global

## PHASE 3: High Priority Features (build on foundation)

- [ ] **Context-aware search** - Local search by default with special prefixes (#tag, @type, !status)
  - DEPENDS ON: Unified filter system
  - Smart placeholder shows context ("Search links...", "Search inbox...")
- [ ] **Sort entries** - By date (ascending/descending) and custom sort
  - DEPENDS ON: Unified filter system
- [ ] **Item context menu** - Hamburger menu on items (edit, delete, etc.)
- [ ] **Note titles** - Explicit title field (optional)
- [ ] **Recently deleted tab** - 7-day retention with restore/permanent delete
- [ ] **Folder and subfolder system** - Hierarchical organization in sidebar
  - This affects sidebar layout - do before Sidebar resizing task
  - MUST use existing tag/sidebar patterns
- [ ] **Item pin feature** - Pin important items to top
- [ ] **Account deletion** - Multi-step user account deletion (like GitHub/Vercel)
  - Must delete ALL user data from Supabase
  - Multi-step confirmation required

## PHASE 4: UI/UX Polish (timestamp-related tasks grouped together)

- [ ] **Edit history on items** - Show "last modified at X time" (not just created at)
- [ ] **Timestamp toggle** - Switch between "about x time ago" and exact timestamp
- [ ] **Timestamp hover tooltip** - Show alternate format on hover
- [ ] **Date format preferences** - User choice: just date, date+time, just time
- [ ] **Page subtitles** - Match content type ("All your [type]...", "Everything in your [status]...")
- [ ] **Tag page title** - Remove blank space in "# [space] name" format
- [ ] **Add item button** - Fix cursor, color, alignment (use global constants)
- [ ] **Item count display** - Replace "Add Item" button with item count
- [ ] **Expand long entries** - Show details in right sidebar instead of long card
- [ ] **Image captions** - Add ability to add captions to images
- [ ] **Grid view item sizing** - Standardize sizes; prevent expansion to match largest
- [ ] **Item spacing** - Reduce/standardize space above icons and below timestamp
- [ ] **Sidebar resizing** - Allow user to resize sidebar width
  - Do AFTER folder/subfolder system
- [ ] **Tags reload on navigation** - Fix "No tags yet" flicker
- [ ] **Drag and drop** - For images, links, content

## PHASE 5: Technical Debt & Quality

- [ ] **Password validation UX** - Show all password errors simultaneously
- [ ] **Input font-size fix** - Min 16px on mobile to prevent iOS auto-zoom
- [ ] **Middleware rework** - Address caution messages; future-proof implementation
