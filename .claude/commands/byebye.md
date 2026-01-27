# Session Close: Sync & Commit

Properly closes the current session by syncing documentation and committing changes.

## Steps

### 1. Review Session Changes

Check what was modified this session:
```bash
git status
git diff --stat
```

### 2. Update CLAUDE.md

**Ask yourself:** Were any of these added/modified this session?
- New shared constants, utilities, or modules
- New component patterns
- Architectural decisions
- New routes, API endpoints, or database schema changes
- Changes to existing documented patterns

If YES → Update the relevant section in `CLAUDE.md`

**Common sections to update:**
- `Development Principles` - New patterns or workflows
- `Quick Reference: Centralized Patterns` - New constants/utilities
- `Architecture` - New routes, schema changes
- `Type Icons & Colors` - New type/status additions
- Component-specific sections

### 3. Update tasks.md

**For completed work:** Check `[x]` and add completion notes if needed
**For in-progress work:** Add/update with current state
**For new bugs found:** Add to appropriate section
**For new ideas:** Add to `Nice-to-Have` or `Viability Questionable`

**Session summary template** (append to bottom if needed):
```markdown
---
## Session Notes (YYYY-MM-DD)

Completed:
- [x] What was done

In Progress:
- [ ] What's pending

Blockers:
- Any issues encountered
```

### 4. Stage & Commit

**Stage files:**
```bash
git add CLAUDE.md tasks.md
git add -A  # Stage all other changes
```

**Review staged changes:**
```bash
git diff --staged
```

**Create commit:**
```bash
git commit -m "$(cat <<'EOF'
Docs: [brief description of changes]

- What changed in CLAUDE.md
- What changed in tasks.md
- Any other significant changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 5. Push to GitHub

```bash
git push
```

## Edge Cases

### No changes to commit
If `git status` shows nothing (except untracked files you don't want):
- **Action:** Skip commit, just confirm no documentation updates needed

### Only documentation changes
If only CLAUDE.md or tasks.md changed:
- **Action:** Commit with `Docs:` prefix, no code changes needed

### Merge conflicts on push
If `git push` fails:
1. `git pull --rebase`
2. Resolve conflicts if any
3. `git push`

### Pre-commit hook fails
If commit fails due to hooks:
1. Read the error message
2. Fix the issue (lint errors, etc.)
3. Try commit again

### CLAUDE.md has conflicting updates
If you're unsure what to update in CLAUDE.md:
1. Ask the user: "What documentation updates are needed for this session?"
2. Only add/update what the user confirms

### Session was only conversation
If no code was written, only discussion:
- **Action:** Update tasks.md if any decisions were made, skip otherwise

## Pre-Exit Checklist

Before confirming session close, verify:
- [ ] `git status` reviewed
- [ ] CLAUDE.md updated if new patterns/constants/routes/schema added
- [ ] tasks.md updated with completed/in-progress work
- [ ] `git diff --staged` reviewed
- [ ] Commit message is clear and descriptive
- [ ] `git push` succeeded (or intentionally skipped)

## Usage

Call this command at the end of every session:
```
/byebye
```

Then confirm:
- "All changes committed and pushed. Session ready to close."
- OR "No changes to commit. Session ready to close."
- OR "Issue: [describe]. Awaiting resolution."
