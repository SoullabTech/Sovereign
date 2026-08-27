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

# `claude/*` added 2026-08-27. Claude Code on the web ASSIGNS its working branch
# under that prefix — the branch name is not a choice the session makes, so the
# allowlist and a sanctioned lane had simply drifted apart. A day's work on
# claude/writers-studio-organization-wxpb7q could be pushed from the remote
# container (which has no hooks installed) and then could not be committed on
# the founder's own machine, where the hook does run.
#
# This WIDENS a policy guard and nothing else. Every substantive gate in
# pre-commit — Supabase ban, provider governance, direct-SDK ban, PHI/logging,
# design canon, secret scan, 50MB cap — is untouched and still runs on every
# commit. The alternative on offer was `--no-verify`, which skips all of them.
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
