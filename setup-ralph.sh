#!/bin/bash
# Convert tasks.md to Ralph format and create necessary files

echo "Setting up Ralph Wiggum loop..."

# Create IMPLEMENTATION_PLAN.md from tasks.md (excluding completed tasks)
grep -E "^- \[ \]" tasks.md > IMPLEMENTATION_PLAN.md || true

if [ ! -s IMPLEMENTATION_PLAN.md ]; then
    echo "No pending tasks found in tasks.md"
    exit 1
fi

echo "✓ Created IMPLEMENTATION_PLAN.md"

# Make loop script executable
chmod +x loop.sh
chmod +x restore.sh

echo "✓ Made loop.sh and restore.sh executable"
echo ""
echo "Setup complete! Run with: ./loop.sh [max_iterations]"
echo "Example: ./loop.sh 5  (process 5 tasks)"
