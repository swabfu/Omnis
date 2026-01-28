#!/bin/bash
# SEQUENTIAL task processor for Omnis
# Each task gets its own branch and fresh Claude session
# Tasks are processed ONE AT A TIME - never parallel

set -euo pipefail

# Configuration
MAX_ITERATIONS="${1:-0}"  # 0 = unlimited (WARNING: set a limit!)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$PROJECT_ROOT/PROMPT.md"
PLAN_FILE="$PROJECT_ROOT/IMPLEMENTATION_PLAN.md"
SOURCE_BRANCH="main"
BACKUP_TAG="ralph-backup-$(date +%Y%m%d-%H%M%S)"
LOCK_FILE="$PROJECT_ROOT/.ralph-loop-lock"

# SAFETY: Ensure we're in the project directory
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "Error: Must run from project root: $PROJECT_ROOT"
    echo "Current directory: $(pwd)"
    exit 1
fi

# SAFETY: Prevent multiple loop instances
if [ -f "$LOCK_FILE" ]; then
    echo "Error: Another loop is already running!"
    echo "Lock file: $LOCK_FILE"
    echo "If this is incorrect, remove the lock file:"
    echo "  rm $LOCK_FILE"
    exit 1
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# SAFETY: Create restore point before starting
echo "Creating backup tag: $BACKUP_TAG"
git tag "$BACKUP_TAG"
echo "✓ To restore this state later: git reset --hard $BACKUP_TAG"

# Verify files exist
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

if [ ! -f "$PLAN_FILE" ]; then
    echo "Error: $PLAN_FILE not found. Run setup first."
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ralph Wiggum Loop for Omnis (AUTONOMOUS)"
echo "Source branch: $SOURCE_BRANCH"
echo "Backup tag: $BACKUP_TAG"
[ $MAX_ITERATIONS -gt 0 ] && echo "Max tasks: $MAX_ITERATIONS" || echo "⚠️  WARNING: Unlimited iterations!"
echo "Mode: Sequential, fully autonomous"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ITERATION=0

while true; do
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    # Check if plan has remaining tasks (file must exist)
    if [ ! -f "$PLAN_FILE" ]; then
        echo "✓ All tasks completed! (IMPLEMENTATION_PLAN.md no longer exists)"
        break
    fi
    if ! grep -q "^- \[ \]" "$PLAN_FILE"; then
        echo "✓ All tasks completed!"
        break
    fi

    ITERATION=$((ITERATION + 1))
    echo -e "\n======================== TASK $ITERATION (SEQUENTIAL) ========================"

    # Extract next uncompleted task
    NEXT_TASK=$(grep "^- \[ \]" "$PLAN_FILE" | head -n 1)
    TASK_DESC=$(echo "$NEXT_TASK" | sed 's/^- \[ \] //')

    # Create branch name from task description (slugify)
    BRANCH_NAME=$(echo "$TASK_DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--\+/-/g' | sed 's/^-\|-$//g' | cut -c1-50)
    BRANCH_NAME="task/$BRANCH_NAME"

    echo "Task: $TASK_DESC"
    echo "Branch: $BRANCH_NAME"

    # SAFETY: Verify we're still on main before creating branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$SOURCE_BRANCH" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        echo "⚠️  Warning: Not on main branch. Current: $CURRENT_BRANCH"
        git checkout "$SOURCE_BRANCH" 2>/dev/null || git checkout main
    fi

    # Create feature branch from main (NO PULL - user handles that)
    git checkout "$SOURCE_BRANCH" 2>/dev/null || git checkout main
    git checkout -b "$BRANCH_NAME"

    # SAFETY: Store current state for rollback if needed
    PRE_TASK_COMMIT=$(git rev-parse HEAD)

    # CRITICAL: Backup plan file before Claude runs (Claude might delete it!)
    echo "📋 Backing up IMPLEMENTATION_PLAN.md..."
    cp "$PLAN_FILE" "$PLAN_FILE.before-task"

    # Run Claude with the prompt
    # Each invocation is a FRESH session with zero memory
    # SEQUENTIAL: next task only starts after this completes
    if ! cat "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --model opus \
        --verbose; then
        echo "⚠️  Claude session failed!"
        echo "Rolling back task changes..."
        git reset --hard "$PRE_TASK_COMMIT"
        git checkout main
        git branch -D "$BRANCH_NAME" 2>/dev/null || true
        # Restore plan from backup
        cp "$PLAN_FILE.before-task" "$PLAN_FILE"
        continue
    fi

    # CRITICAL: Check if plan file still exists after Claude exits
    if [ ! -f "$PLAN_FILE" ]; then
        echo "⚠️  WARNING: IMPLEMENTATION_PLAN.md was deleted by Claude! Restoring from backup..."
        cp "$PLAN_FILE.before-task" "$PLAN_FILE"
    fi

    # ⚡ IMMEDIATE PUSH: Each task is pushed to remote RIGHT AFTER completion
    # This is NOT a batch push at the end - each task gets its own branch pushed immediately
    echo "📤 Pushing branch to remote IMMEDIATELY after task completion..."
    git push -u origin "$BRANCH_NAME"

    # Return to main for next task
    git checkout "$SOURCE_BRANCH"

    echo -e "\n✅ Task $ITERATION COMPLETE and pushed to remote: $BRANCH_NAME"
    echo "   Branch is on GitHub. Loop continues autonomously..."
done

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Loop complete! All tasks pushed to remote branches."
echo "User will now test and merge each branch individually."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💾 To restore original state: git reset --hard $BACKUP_TAG"
