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
