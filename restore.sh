#!/bin/bash
# Restore the codebase to the state before the loop started
# Usage: ./restore.sh [backup-tag-name]

# Find most recent backup tag if none specified
BACKUP_TAG="${1:-$(git tag -l "ralph-backup-*" | sort -r | head -n 1)}"

if [ -z "$BACKUP_TAG" ]; then
    echo "Error: No backup tag found!"
    echo "Usage: ./restore.sh [backup-tag-name]"
    exit 1
fi

echo "This will RESTORE your codebase to: $BACKUP_TAG"
echo ""
echo "⚠️  WARNING: This will discard ALL uncommitted changes!"
echo ""
read -p "Continue? Type 'yes' to confirm: " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Resetting main branch to $BACKUP_TAG..."

# Stash current changes just in case
git stash push -m "ralph-restore-stash"

# Reset main
git checkout main 2>/dev/null || git checkout master
git reset --hard "$BACKUP_TAG"

echo ""
echo "✓ Restored to $BACKUP_TAG"
echo ""
echo "To undo this restore:"
echo "  git stash pop"
echo ""
echo "To force push to remote (if you pushed changes):"
echo "  git push origin main --force"
