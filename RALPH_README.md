# Ralph Wiggum Loop - Autonomous Task Automation

**AUTONOMOUS OPERATION:** Start the loop, walk away, come back later to completed tasks. The loop runs fully independently - each task is implemented, tested, verified, and pushed to its own branch without any human intervention.

## Quick Start

### Windows (Git Bash required - included with Git for Windows)
```cmd
# One-time setup
setup-ralph.bat

# Run 5 tasks autonomously
loop.bat 5
```

### macOS/Linux (or Git Bash/WSL)
```bash
# One-time setup
chmod +x loop.sh setup-ralph.sh restore.sh
./setup-ralph.sh

# Run 5 tasks autonomously
./loop.sh 5
```

## How It Works

```
tasks.md → IMPLEMENTATION_PLAN.md → loop.sh → Branches pushed to GitHub
```

1. **Setup**: Converts tasks.md to IMPLEMENTATION_PLAN.md (checkbox format)
2. **Loop**: For each unchecked task:
   - Creates feature branch `task/description` from main
   - Spawns fresh Claude CLI session (zero memory of previous tasks)
   - Claude implements task completely
   - Self-tests with subagents
   - Commits and pushes to remote **immediately**
   - Returns to main
   - Continues to next task (sequential, never parallel)
3. **After loop**: All branches on GitHub, ready for you to test and merge

## Safety Features

| Feature | Description |
|---------|-------------|
| **Lock file** | Prevents multiple loop instances |
| **Backup tag** | `ralph-backup-YYYYMMDD-HHMMSS` before starting |
| **Per-task rollback** | Failed tasks are automatically rolled back |
| **Branch isolation** | Each task in its own branch; main never touched |
| **Immediate push** | Each branch pushed as it completes |

## Files Created

| File | Purpose |
|------|---------|
| `loop.sh` / `loop.bat` | Main automation script |
| `PROMPT.md` | Instructions for each Claude session |
| `IMPLEMENTATION_PLAN.md` | Task list with checkboxes |
| `AGENTS.md` | Build/test commands reference |
| `setup-ralph.sh` / `.bat` | One-time setup |
| `restore.sh` / `.bat` | Restore to backup state |

## Restoration

If something goes wrong:

```cmd
# Windows
restore.bat

# Or specific backup
restore.bat ralph-backup-20250128-143000
```

```bash
# macOS/Linux
./restore.sh

# Or specific backup
./restore.sh ralph-backup-20250128-143000
```

## After Loop Completes

1. **Check branches**: `git branch -a | grep task/`
2. **Test each branch**: Checkout locally and verify
3. **Merge working ones**: `git merge task/feature-name`
4. **Iterate on failures**: Fix issues, commit again

## Task Execution Order

Tasks are processed in dependency order:

1. **Phase 1**: Critical bugs (block core functionality)
2. **Phase 2**: Foundation & Architecture
3. **Phase 3**: High Priority Features
4. **Phase 4**: UI/UX Polish
5. **Phase 5**: Technical Debt & Quality

## Important Notes

- **NO merging** - The loop never merges to main
- **NO PRs** - User creates PRs if desired
- **Sequential only** - Tasks processed one at a time
- **Fresh sessions** - Each task gets zero memory of previous tasks
- **Progress persists** - Via git and IMPLEMENTATION_PLAN.md checkboxes
