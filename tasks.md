# Omnis Tasks

Prioritized backlog of improvements, bugs, and features.

**Protocol:** When marking a task as `[x]`, move it to `completed-tasks.md` via Bash (never Read/Write that file — it's in `.claudeignore`).

---

## Critical Bugs

*Core functionality that is broken or missing*

- [ ] **Image upload broken** - Cannot upload images; RLS error: `failed to upload image, new row violates row-level security policy` on localhost
- [ ] **Sign out broken** - Clicking sign out doesn't sign users out or redirect to launch screen
- [ ] **Password reset email error** - Forgot password email redirects to `localhost:3000/?error=access_denied&error_code=otp_expired`
- [ ] **Status page icon bug** - "Move to inbox" button in Done/Archived pages shows checkmark instead of inbox/tray icon; ensure global icon source
- [ ] **Status page titles wrong** - All status pages show "All Items" instead of correct title ("Inbox", "Done", "Archived")
- [ ] **Tag deletion not syncing** - When creating then deleting a new tag in the Add Item dialog, the tag visually disappears from the dialog but still appears elsewhere in the app (sidebar, tag pages)

---

## High Priority Features

*Important user-facing functionality*

- [ ] **Context-aware search** - Search within current context (type/status/tag) with special prefixes
  - **BUG:** Currently only works on "All Items" page; implement globally (follow CLAUDE.md — use shared components, no per-page config)
  - **Local search by default:** When on `/type/links`, search only links. When on `/status/inbox`, search only inbox items.
  - **Smart placeholder:** Search bar shows context (e.g., "Search links..." on links page, "Search inbox..." on inbox page, "Search all items..." on home)
  - **Auto-prefix with escape hatch:** Clicking search auto-fills context prefix (e.g., `type:link `, `status:inbox `, `tag:design `) but user can backspace to remove for global search
  - **Special prefixes for global search from anywhere:**
    - `#tagname` → search by tag (already works)
    - `@type` → search by content type (`@link`, `@tweet`, `@image`, `@note`)
    - `!status` → search by status (`!inbox`, `!done`, `!archived`)
- [ ] **Sort entries** - By date (ascending/descending) and custom sort
- [ ] **Item context menu** - Hamburger/three-dot menu on items to edit, delete, etc.
- [ ] **Note titles** - Notes currently show chunk of content as title; need explicit title field (let it be optional tho)
- [ ] **Recently deleted tab** - 7-day retention with restore/permanent delete options (individual or bulk)
- [ ] **Unified filter system** - All pages (type/status/tag) are same view with different filters applied; enable combining filters (e.g., filter by tag within archived, tag within content type)
  - Share global attributes/filters across pages; avoid per-page configuration
  - Essentially: one item list component that accepts filter params

---

## Nice-to-Have Features

*Polish, convenience, and UX improvements*

- [ ] **Expand long entries** - When content is too long, expand it and show details in right sidebar instead of having a very long item
- [ ] **Image captions** - Add ability to add captions to images
- [ ] **Drag and drop** - For images, links, and other content types
- [ ] **Timestamp toggle** - Switch between "about x time ago" and exact timestamp display
- [ ] **Timestamp hover tooltip** - Show alternate timestamp format on hover
- [ ] **Date format preferences** - User choice: just date, date+time, just time, etc.
- [ ] **Grid view item sizing** - Standardize sizes; items shouldn't expand to match largest item in row (wastes space, weird spacing)
- [ ] **Item spacing** - Reduce/standardize space above icons and below timestamp
- [ ] **Transition rendering bug** - Fix freeze during fade-out; make transition global across all pages
- [ ] **Page subtitles** - Match content type ("All your [type], saved in one place"). Status: "Everything in your [status], organized". Tags: already correct, don't change. **Note:** Status page *titles* (not subtitles) tracked separately in Critical Bugs
- [ ] **Sidebar resizing** - Allow user to resize sidebar width
- [ ] **Tags reload on navigation** - Investigate why tags unload/reload when switching pages; fix if feasible. **Note:** Brief "No tags yet" flicker now visible during page transitions
- [ ] **Add item button** - Fix cursor pointer behavior; improve color to match theme; ensure plus/text alignment follows global standards
- [ ] **Item count display** - Replace right "Add Item" button with count of items on current page (follow design standards, globalize)
- [ ] **Tag page title** - Remove blank space in "# [space] name" format
- [ ] **Password validation UX** - Show all password requirement errors simultaneously, not one at a time

---

## Technical Debt

*Refactoring, cleanup, and quality assurance*

- [ ] **Mobile touch targets** - Ensure all buttons are at least 44x44px on mobile
- [ ] **Input font-size fix** - Set minimum 16px on mobile inputs to prevent iOS auto-zoom
- [ ] **Middleware rework** - Address caution messages; future-proof implementation (investigate and make judgment call)

---

## Viability Questionable

*Don't work on these. They are just food for thought for the user; features requiring approval before implementation*

- [ ] **URL preview/metadata fetching** - When pasting URLs in the Add Item dialog, title/description/image previews don't appear due to CORS restrictions.
  - **Implications:** Requires server-side API route to bypass CORS, which introduces: server load/computational cost, need for rate limiting (to prevent abuse), caching infrastructure (to avoid re-fetching same URLs), timeout handling, security concerns (malicious URLs)
  - **Alternatives:** Use third-party metadata API (costs money), skip for MVP (users manually enter title/description), or implement simple server-side route and add caching/rate limiting later
