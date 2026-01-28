# CLAUDE.md PRINCIPLES ARE MANDATORY - THE THREE LAWS ARE NON-NEGOTIABLE

# Law 1: Global First - Every repeatable concept has ONE source of truth
# Law 2: Easy Discovery - Global patterns must be easy to find, easy to use
# Law 3: Token Efficient - Documentation and structure minimize redundant reads

# SEARCH FIRST (Law 1): 5 seconds of search saves hours of refactoring
# Use Haiku Explore agents to find existing patterns BEFORE creating anything

0a. Study @CLAUDE.md to understand project patterns and principles.
0b. Study @IMPLEMENTATION_PLAN.md to see all tasks.
0c. Find the FIRST unchecked task (beginning with `- [ ]`).
0d. Before implementing, search the codebase to confirm it's not already done.

1. Your task is to implement ONE item from @IMPLEMENTATION_PLAN.md. Find the first unchecked task and implement it completely. No placeholders, no "TODO" comments.

2. Search first using up to 500 parallel Haiku subagents. Use Explore agents to understand existing patterns. DO NOT assume functionality is missing.

3. Follow CLAUDE.md principles - THESE ARE MANDATORY:
   - Search before creating (5 seconds saves hours) - ALWAYS use Haiku agents first
   - Use existing global patterns - NEVER duplicate
   - No magic strings or numbers - ALWAYS use constants
   - Server vs Client components correctly (default Server)
   - Check lib/ for existing utilities before creating new ones

4. Before writing ANY code, verify:
   - Does a global pattern exist? (lib/type-icons.tsx, lib/status-icons.tsx, lib/tag-colors.ts, lib/ui-constants.ts)
   - Is there an existing component I can extend?
   - Has someone solved this problem already?

5. When implementing is complete, SELF-TEST before committing:
   - Spawn subagents to verify the implementation works correctly
   - Run `npm run build` to ensure no build errors
   - Check for edge cases and handle them
   - Only commit when you're confident the implementation is complete and working

6. After testing passes:
   - `git add` the files you changed for your task implementation
   - DO NOT use `git add -A` - only add specific files you modified
   - DO NOT stage IMPLEMENTATION_PLAN.md, loop.sh, PROMPT.md, or any loop files
   - `git commit` with descriptive message
   - Exit (the loop will continue with next task)

999. CRITICAL: Implement COMPLETELY. Placeholders waste more time than doing it right.

99999. The loop will update IMPLEMENTATION_PLAN.md automatically - DO NOT touch it.

999999. When you discover bugs or issues unrelated to your task, add them to the end of IMPLEMENTATION_PLAN.md as new tasks.

9999999. 🚨 MANDATORY: Every single line of code you write MUST follow the Three Laws from CLAUDE.md. If you're about to hardcode a value, use an existing pattern, or duplicate code - STOP and search for the global pattern first.
