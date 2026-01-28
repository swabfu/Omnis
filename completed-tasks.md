
## Critical Bugs (Completed)
- [x] **Search doesn't work** - Search functionality is non-functional (merged into context-aware search)
- [x] **Cannot edit entries** - No way to add tags or edit existing items after saving
- [x] **Cannot tag entries before auto-save** - Some items automatically save before user can add tags
- [x] **Tag management** - Create, edit, delete tags from sidebar
  - [x] Replace "tag counter" in sidebar with a plus button that opens a dialog
  - [x] Tag creation dialog includes: name input, color picker
  - [x] Ability to delete tags from the sidebar (add a small X on each tag which brings up a dialog - deleting tags doesn't delete the items, just the tag)
  - [x] Drag and drop to reorder tags in sidebar
- [x] **Top-right buttons broken** - View toggle buttons in top right don't do anything
  - [x] Added masonry/uniform/list view modes
  - [x] Smooth transitions between views (fade/scale animation)
  - [x] List view shows compact horizontal rows

## Technical Debt (Completed)
- [x] **Global icon/color framework** - Centralized all icon sizes, colors, and styling constants
  - [x] Created `lib/type-icons.tsx` with NAV/ACTION/BADGE/OVERLAY icon constants
  - [x] Created `lib/status-icons.tsx` with global status colors
  - [x] Type colors: green (links), sky blue (tweets), red (images), yellow (notes), neutral (all)
  - [x] Status colors: neutral (inbox), green (done), orange (archived)
  - [x] All icons maintain colors on active nav state
- [x] **Development principles documentation** - Added "Think Globally, Never Hardcode" section to CLAUDE.md
  - [x] 4-phase workflow (Search → Refactor → Implement → Verify)
  - [x] Quick reference table for centralized patterns
  - [x] Bad vs Good examples
  - [x] Code review checklist
  - [x] CLAUDE.md sync requirement for every session
- [x] **Session close command** - Created `/byebye` command for proper session cleanup
  - [x] Auto-sync CLAUDE.md and tasks.md
  - [x] Commit and push workflow
  - [x] Edge case handling
