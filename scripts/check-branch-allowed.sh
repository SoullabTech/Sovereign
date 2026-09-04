#!/usr/bin/env bash
# Single source of truth for the branch-name allowlist.
#
# Read by BOTH the pre-commit branch guard and the pre-push branch guard
# (installed by scripts/setup-githooks.sh) so the two gates can never drift.
# An invalid branch name must be impossible to commit on AND impossible to
# push — not merely discouraged.
#
# Usage: check-branch-allowed.sh <ACTION> <branch>
#   ACTION  word printed in the refusal message ("COMMIT" | "PUSH")
#   branch  branch name to validate (no refs/heads/ prefix)
set -euo pipefail

ACTION="${1:?usage: check-branch-allowed.sh <ACTION> <branch>}"
BRANCH="${2:?usage: check-branch-allowed.sh <ACTION> <branch>}"

case "$BRANCH" in
  main|clean-main-no-secrets|phase4.6-reflective-agentics|feature/*|fix/*|chore/*|claude/*)
    exit 0
    ;;
  *)
    echo ""
    echo "🚫 ${ACTION} BLOCKED: branch '$BRANCH' not allowed"
    echo "   Allowed: main | clean-main-no-secrets | phase4.6-reflective-agentics |"
    echo "            feature/* | fix/* | chore/* | claude/*"
    echo ""
    exit 1
    ;;
esac
