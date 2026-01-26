# Omnis Tasks

Prioritized backlog of improvements, bugs, and features.

---

## Critical Bugs

*Core functionality that is broken or missing*

- [x] **Search doesn't work** - Search functionality is non-functional
- [x] **Cannot edit entries** - No way to add tags or edit existing items after saving
- [x] **Cannot tag entries before auto-save** - Some items automatically save before user can add tags
- [x] **Tag management** - Create, edit, delete tags from sidebar
  - [x] Replace "tag counter" in sidebar with a plus button that opens a dialog
  - [x] Tag creation dialog includes: name input, color picker
  - [x] Ability to delete tags from the sidebar (add a small X on each tag which brings up a dialog - deleting tags doesn't delete the items, just the tag)
  - [x] Drag and drop to reorder tags in sidebar
- [ ] **Top-right buttons broken** - View toggle buttons in top right don't do anything

---

## High Priority Features

*Important user-facing functionality*

- [ ] **Context-aware search** - Search within current context (type/status/tag) with special prefixes
  - **Local search by default:** When on `/type/links`, search only links. When on `/status/inbox`, search only inbox items.
  - **Smart placeholder:** Search bar shows context (e.g., "Search links..." on links page, "Search inbox..." on inbox page, "Search all items..." on home)
  - **Auto-prefix with escape hatch:** Clicking search auto-fills context prefix (e.g., `type:link `, `status:inbox `, `tag:design `) but user can backspace to remove for global search
  - **Special prefixes for global search from anywhere:**
    - `#tagname` → search by tag (already works)
    - `@type` → search by content type (`@link`, `@tweet`, `@image`, `@note`)
    - `!status` → search by status (`!inbox`, `!done`, `!archived`)
- [ ] **Mobile adaptive shell** - Single app, two UI shells based on screen size (CSS media queries)
  - Desktop (`md:`+): Keep existing Sidebar (left rail)
  - Mobile (default): BottomNav with Home, Search, Content Types, Add (+), Tags, Status
  - Fixed position, glassmorphism effect, iOS safe area support
  - **Note:** Same codebase, same routes — just different navigation shells
- [ ] **Add Item: Drawer on mobile** - Use shadcn/ui Drawer (vaul) for bottom sheet on mobile vs Dialog on desktop
- [ ] **Image upload** - Currently cannot upload images
- [ ] **Sort entries** - By date (ascending/descending) and custom sort
- [ ] **Item context menu** - Hamburger/three-dot menu on items to edit, delete, etc.
- [ ] **Note titles** - Notes currently show chunk of content as title; need explicit title field (let it be optional tho)
- [ ] **Recently deleted tab** - 7-day retention with restore/permanent delete options (individual or bulk)
- [ ] **PWA Share Target** - Register `/share-target` endpoint to accept shared data from other apps

---

## Nice-to-Have Features

*Polish, convenience, and UX improvements*

- [ ] **Expand long entries** - When content is too long, expand it and show details in right sidebar instead of having a very long item
- [ ] **Image captions** - Add ability to add captions to images
- [ ] **Drag and drop** - For images, links, and other content types
- [ ] **Timestamp toggle** - Switch between "about x time ago" and exact timestamp display
- [ ] **Timestamp hover tooltip** - Show alternate timestamp format on hover
- [ ] **Date format preferences** - User choice: just date, date+time, just time, etc.

---

## Technical Debt

*Refactoring, cleanup, and quality assurance*

- [ ] **Code review & simplification** - Debug, test, verify, and simplify codebase before delivery. ENSURE EDGE CASES ARE HANDLED ALWAYS
- [ ] **Mobile touch targets** - Ensure all buttons are at least 44x44px on mobile
- [ ] **Input font-size fix** - Set minimum 16px on mobile inputs to prevent iOS auto-zoom

---

## Adaptive Shell Specifications

**Single app, two navigation shells** — CSS media queries determine which shell renders. No separate mobile version.

| Aspect | Desktop (`md:`+) | Mobile (default) |
|--------|------------------|------------------|
| Nav | Sidebar (left rail) | BottomNav (fixed bar) |
| Add Item | Dialog (centered modal) | Drawer (bottom sheet) |
| Touch targets | Standard | Min 44x44px |
| Input font-size | Standard | Min 16px |

**PWA Config:**
- Display mode: `standalone`
- Status bar: `black-translucent`
- Icons: `apple-touch-icon` (180x180), `maskable` for Android

---

## Viability Questionable

*Features requiring approval before implementation*

- [ ] **URL preview/metadata fetching** - When pasting URLs in the Add Item dialog, title/description/image previews don't appear due to CORS restrictions.
  - **Implications:** Requires server-side API route to bypass CORS, which introduces: server load/computational cost, need for rate limiting (to prevent abuse), caching infrastructure (to avoid re-fetching same URLs), timeout handling, security concerns (malicious URLs)
  - **Alternatives:** Use third-party metadata API (costs money), skip for MVP (users manually enter title/description), or implement simple server-side route and add caching/rate limiting later
