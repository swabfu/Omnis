#!/bin/bash
set -euo pipefail

MAX_ITERATIONS="${1:-0}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$PROJECT_ROOT/PROMPT.md"
PLAN_FILE="$PROJECT_ROOT/IMPLEMENTATION_PLAN.md"
SOURCE_BRANCH="main"
BACKUP_TAG="ralph-backup-$(date +%Y%m%d-%H%M%S)"
LOCK_FILE="$PROJECT_ROOT/.ralph-loop-lock"

if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "Error: Must run from project root: $PROJECT_ROOT"
    exit 1
fi

if [ -f "$LOCK_FILE" ]; then
    echo "Error: Loop already running! Remove $LOCK_FILE to continue."
    exit 1
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

echo "Creating backup tag: $BACKUP_TAG"
git tag "$BACKUP_TAG"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

if [ ! -f "$PLAN_FILE" ]; then
    echo "Error: $PLAN_FILE not found."
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ralph Wiggum Loop"
echo "Max tasks: $MAX_ITERATIONS (0 = unlimited)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ITERATION=0

while true; do
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    if [ ! -f "$PLAN_FILE" ]; then
        echo "✓ All tasks completed!"
        break
    fi
    if ! grep -q "^- \[ \]" "$PLAN_FILE"; then
        echo "✓ All tasks completed!"
        break
    fi

    ITERATION=$((ITERATION + 1))
    echo -e "\n======================== TASK $ITERATION ========================"

    NEXT_TASK=$(grep "^- \[ \]" "$PLAN_FILE" | head -n 1)
    TASK_DESC=$(echo "$NEXT_TASK" | sed 's/^- \[ \] //')
    BRANCH_NAME=$(echo "$TASK_DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--\+/-/g' | sed 's/^-\|-$//g' | cut -c1-50)
    BRANCH_NAME="task/$BRANCH_NAME"

    echo "Task: $TASK_DESC"
    echo "Branch: $BRANCH_NAME"

    git checkout "$SOURCE_BRANCH" 2>/dev/null || git checkout main
    git checkout -b "$BRANCH_NAME"

    # Store the exact line to update
    TASK_LINE=$(grep -n "^- \[ \]" "$PLAN_FILE" | head -n 1 | cut -d: -f1)

    cat "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --model opus \
        --verbose || {
        echo "⚠️  Claude failed! Skipping to next task..."
        git checkout main
        git branch -D "$BRANCH_NAME" 2>/dev/null || true
        continue
    }

    echo "📤 Pushing to remote..."
    git push -u origin "$BRANCH_NAME" 2>/dev/null || echo "Push failed, branch exists locally"

    git checkout "$SOURCE_BRANCH"

    # Update the checkbox - LOOP does it, not Claude
    if [ -n "$TASK_LINE" ]; then
        sed -i "${TASK_LINE}s/- \[ \]/- [x]/" "$PLAN_FILE"
        echo "✅ Marked task $ITERATION as complete"
    fi

    echo "✅ Task $ITERATION COMPLETE: $BRANCH_NAME"
    echo "   Remaining tasks: $(grep "^- \[ \]" "$PLAN_FILE" | wc -l | tr -d ' ')"
done

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Loop complete!"
echo "Restore: git reset --hard $BACKUP_TAG"
