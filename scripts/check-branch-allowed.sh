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

# claude/* admitted by founder ruling 2026-10-01 (Q1 of
# docs/programme/BRANCH_POLICY_AUTHORITY_FINDING_2026-09-13.md): agent sessions
# work on claude/* branches, and a rule everyone routinely breaks teaches that
# rules are optional. Canonical is protected server-side, not by this list.

ACTION="${1:?usage: check-branch-allowed.sh <ACTION> <branch>}"
BRANCH="${2:?usage: check-branch-allowed.sh <ACTION> <branch>}"

case "$BRANCH" in
  main|clean-main-no-secrets|phase4.6-reflective-agentics|feature/*|fix/*|chore/*|claude/*)
    exit 0
    ;;
  *)
    echo ""
    echo "🚫 ${ACTION} BLOCKED: branch '$BRANCH' not allowed"
    echo "   Allowed: main | clean-main-no-secrets | feature/* | fix/* | chore/* | claude/*"
    echo ""
    exit 1
    ;;
esac
