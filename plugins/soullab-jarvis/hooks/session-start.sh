#!/usr/bin/env bash
# JARVIS SessionStart — bind the referent, then get out of the way.
#
# Emits a compact orientation block as additionalContext. Budget: keep this
# UNDER ~40 lines. Startup floor is already ~81k tokens (context audit §1);
# this hook is not a place to restate doctrine, only to bind identity:
#   which repo · which branch · which SHA · which worktree · what is dirty.
#
# Governing: names are not identity. 21 worktrees hold the same paths with
# different content (audit §3.3) — so the worktree root is part of the answer.
set -uo pipefail

emit() { python3 -c '
import json,sys
print(json.dumps({"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":sys.stdin.read()}}))
'; }

cwd="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$cwd" 2>/dev/null || exit 0

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  printf 'JARVIS: %s is not a git worktree. No referent bound.\n' "$cwd" | emit
  exit 0
fi

root="$(git rev-parse --show-toplevel 2>/dev/null)"
common="$(cd "$(git rev-parse --git-common-dir 2>/dev/null)" && pwd -P 2>/dev/null)"
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
sha="$(git rev-parse --short HEAD 2>/dev/null)"
subject="$(git log -1 --pretty=%s 2>/dev/null | cut -c1-72)"
dirty="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
upstream="$(git rev-parse --abbrev-ref '@{upstream}' 2>/dev/null || echo 'none')"
ahead_behind="n/a"
if [ "$upstream" != "none" ]; then
  ahead_behind="$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null | awk '{print "behind "$1", ahead "$2}')"
fi
is_worktree="primary"
[ "$common" != "$root/.git" ] && is_worktree="linked worktree (git dir: $common)"

hot="$root/.jarvis/memory/HOT.md"
hotline="none (create .jarvis/memory/HOT.md)"
[ -f "$hot" ] && hotline="$hot ($(wc -l < "$hot" | tr -d ' ') lines)"

{
  echo "JARVIS ORIENTATION (bound at session start — do not re-derive)"
  echo "  repo      : $root  [$is_worktree]"
  echo "  branch    : $branch"
  echo "  HEAD      : $sha  $subject"
  echo "  upstream  : $upstream ($ahead_behind)"
  echo "  worktree  : $dirty uncommitted path(s)"
  echo "  hot memory: $hotline"
  echo "  deep memory routing: .jarvis/memory/README.md (pull on demand, do not preload)"
  echo ""
  echo "Guards active this session (plugin soullab-jarvis):"
  echo "  PreToolUse — image-producing tools are denied in the main loop (subagent-only);"
  echo "               deploy-lockfile deletion, bare production compose builds,"
  echo "               @supabase installs and protected-branch force-pushes are denied."
  echo "  Stop       — emits changed paths + close-out checklist (advisory, non-blocking)."
} | emit
