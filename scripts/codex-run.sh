#!/usr/bin/env bash
# codex-run.sh — Run Codex CLI in an isolated worktree
#
# Usage:
#   ./scripts/codex-run.sh <prompt>
#   ./scripts/codex-run.sh --contract path/to/handoff.json
#   ./scripts/codex-run.sh --mode auto-edit <prompt>
#
# Modes:
#   suggest    — Codex proposes, you approve (default)
#   auto-edit  — Codex edits files, asks before commands
#   full-auto  — Codex runs autonomously (worktree-isolated)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE_BASE="${REPO_ROOT}/.claude/worktrees"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH_NAME="codex/${TIMESTAMP}"
MODE="suggest"
CONTRACT=""
PROMPT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --contract)
      CONTRACT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: codex-run.sh [--mode suggest|auto-edit|full-auto] [--contract file.json] <prompt>"
      echo ""
      echo "Runs Codex CLI in an isolated git worktree."
      echo "Changes stay on a branch until reviewed and merged."
      exit 0
      ;;
    *)
      PROMPT="$*"
      break
      ;;
  esac
done

# Build prompt from contract if provided
if [[ -n "$CONTRACT" ]]; then
  if [[ ! -f "$CONTRACT" ]]; then
    echo "Error: Contract file not found: $CONTRACT" >&2
    exit 1
  fi
  # Extract goal, scope, and constraints from JSON contract
  GOAL=$(jq -r '.goal // empty' "$CONTRACT")
  SCOPE=$(jq -r '(.scope // []) | join(", ")' "$CONTRACT")
  CONSTRAINTS=$(jq -r '(.constraints // []) | map("- " + .) | join("\n")' "$CONTRACT")
  EXPECTED=$(jq -r '(.expected_output // []) | map("- " + .) | join("\n")' "$CONTRACT")

  PROMPT="Goal: ${GOAL}

Files in scope: ${SCOPE}

Constraints:
${CONSTRAINTS}

Expected output:
${EXPECTED}"
fi

if [[ -z "$PROMPT" ]]; then
  echo "Error: No prompt or contract provided." >&2
  echo "Usage: codex-run.sh [--mode suggest|auto-edit|full-auto] [--contract file.json] <prompt>" >&2
  exit 1
fi

# Create isolated worktree
WORKTREE_DIR="${WORKTREE_BASE}/codex-${TIMESTAMP}"
echo "Creating worktree: ${WORKTREE_DIR}"
echo "Branch: ${BRANCH_NAME}"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" HEAD 2>/dev/null

# Ensure cleanup on exit
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo ""
    echo "Codex exited with code ${exit_code}."
  fi
  echo ""
  echo "Worktree: ${WORKTREE_DIR}"
  echo "Branch:   ${BRANCH_NAME}"
  echo ""
  # Check if there are changes (staged, unstaged, or untracked)
  if [[ ! -d "$WORKTREE_DIR" ]]; then
    echo "Worktree directory already removed."
    return
  fi

  cd "$WORKTREE_DIR"
  local has_changes=false

  # Check for any modifications or untracked files
  if ! git diff --quiet HEAD 2>/dev/null; then
    has_changes=true
  fi
  if ! git diff --cached --quiet 2>/dev/null; then
    has_changes=true
  fi
  if [[ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]]; then
    has_changes=true
  fi

  if [[ "$has_changes" == "false" ]]; then
    echo "No changes made. Cleaning up worktree."
    cd "$REPO_ROOT"
    git worktree remove "$WORKTREE_DIR" 2>/dev/null || true
    git branch -D "$BRANCH_NAME" 2>/dev/null || true
  else
    # Auto-commit so changes survive worktree cleanup
    git add -A
    git commit -m "codex: auto-save changes from Codex CLI run" --no-verify 2>/dev/null || true
    cd "$REPO_ROOT"
    echo ""
    echo "Changes committed on branch: ${BRANCH_NAME}"
    echo "Worktree: ${WORKTREE_DIR}"
    echo ""
    echo "To review:"
    echo "  git log ${BRANCH_NAME} --oneline -5"
    echo "  git diff main...${BRANCH_NAME}"
    echo ""
    echo "To merge:"
    echo "  git merge ${BRANCH_NAME}"
    echo ""
    echo "To discard:"
    echo "  git worktree remove ${WORKTREE_DIR} && git branch -D ${BRANCH_NAME}"
  fi
}
trap cleanup EXIT

# Run Codex in the worktree
echo "Running Codex (mode: ${MODE})..."
echo "---"
cd "$WORKTREE_DIR"

# Map mode to Codex CLI flags
# -a / --ask-for-approval: unless-no-op | trusted | on-request | never
# --full-auto: convenience alias for -a on-request + workspace-write sandbox
case "$MODE" in
  suggest)
    npx codex -a "untrusted" "$PROMPT"
    ;;
  auto-edit)
    npx codex -a "on-request" "$PROMPT"
    ;;
  full-auto)
    npx codex --full-auto "$PROMPT"
    ;;
  *)
    echo "Error: Unknown mode '${MODE}'. Use: suggest, auto-edit, full-auto" >&2
    exit 1
    ;;
esac
