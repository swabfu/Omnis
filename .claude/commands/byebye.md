# Session Close: Sync & Commit

Properly closes the current session by syncing documentation and committing changes.

**Goal:** After running this command, the user can close the session knowing everything is properly finished.

## Modes

- `/byebye` - Runs automatically (tools are auto-approved in settings.local.json)
- `/byebye ask` - Asks for permission before each major step

## Steps

### 1. Review Changes

```bash
git status
git diff --stat
```

### 1.5. Deep Analysis (Compare with Last Commit)

**CRITICAL:** Work often spans multiple sessions and files. Memory alone is NOT sufficient. Before committing, perform a deep analysis comparing the most recent commit with the current state to understand EVERYTHING that changed at the code level.

```bash
# Get the last commit for reference
git log -1 --oneline

# Full diff with context - shows actual code changes
git diff HEAD

# Summary of changes (files added/modified/deleted)
git diff --name-status HEAD
```

**Deep Analysis Checklist - Examine the actual code changes:**

1. **New files** - Read each new file to understand:
   - What functionality/pattern does it add?
   - How does it integrate with existing code?

2. **Deleted files** - Understand:
   - What functionality was removed?
   - Was it replaced or is it gone?

3. **Modified files** - For each file changed:
   - What specific code changed (functions, components, logic)?
   - Why was this change necessary?

4. **Architectural patterns** - Look for:
   - New patterns introduced (contexts, route groups, utilities)
   - Refactoring (DRY improvements, consolidating duplicates)
   - Breaking changes

5. **Cross-file relationships** - Understand:
   - How do changes in one file affect others?
   - Are there related changes that should be mentioned together?

**Commit message must describe:**
- Main change summary
- All new files and their purpose
- All deleted files and reason
- Key refactoring patterns used
- Architectural decisions made
- Any breaking changes

### 2. Sync CLAUDE.md (add/change/delete)

Update `CLAUDE.md` to reflect this session's changes:
- **Add:** New patterns, constants, utilities, modules, routes, schema
- **Change:** Modifications to existing documented patterns
- **Delete:** Remove docs for removed/obsolete patterns

**Checklist:**
- New shared constants or utilities?
- New component patterns?
- Architectural decisions?
- New routes, API endpoints, or database schema changes?
- Any patterns removed from codebase?

### 3. Sync tasks.md (add/change/delete)

Update `tasks.md` to track progress:
- **Add:** New bugs, ideas, in-progress work
- **Change:** Update status of existing tasks, add completion notes
- **Delete:** Remove completed tasks if desired (optional)

### 4. Stage & Commit

```bash
git add CLAUDE.md tasks.md
git add -A
git diff --staged
git commit -m "..."
```

### 5. Push

```bash
git push
```

## Ask Mode Permission Points

When `/byebye ask` is used, prompt before:

1. **Updating CLAUDE.md** - "Update CLAUDE.md: [summary]?"
2. **Updating tasks.md** - "Update tasks.md: [summary]?"
3. **Staging files** - "Stage [files]?"
4. **Committing** - "Commit: [message]?"
5. **Pushing** - "Push to GitHub?"

## Edge Cases & Resolutions

| Situation | Resolution | Session State |
|-----------|------------|---------------|
| No changes to commit | Confirm and close | ✅ Ready |
| Only docs changed | Commit with `Docs:` prefix | ✅ Ready |
| Push fails (conflict) | Notify: "Resolve manually, then run `/byebye` again" | ⏸️ NOT ready - user must resolve first |
| Pre-commit hook fails | Show error, wait for fix | ⏸️ NOT ready - user must fix first |
| Unsure what to update | Ask user what changes are needed | ⏸️ Awaiting input |
| Only conversation | Update tasks.md if decisions made | ✅ Ready |

**Important:** Only confirm session close when state is ✅ Ready. If ⏸️, user must take action first.

## Pre-Exit Checklist

Before confirming session is ready to close:
- [ ] `git status` reviewed
- [ ] CLAUDE.md synced (add/change/delete as needed)
- [ ] tasks.md synced (add/change/delete as needed)
- [ ] `git diff --staged` reviewed
- [ ] Commit message is clear
- [ ] `git push` succeeded
- [ ] No blockers (conflicts, hook failures, etc.)

## Final Output

End with one of:

- ✅ "All changes committed and pushed. **Session ready to close.**"
- ✅ "No changes to commit. **Session ready to close.**"
- ⏸️ "Issue: [describe]. **Session NOT ready** - please resolve, then run `/byebye` again."
