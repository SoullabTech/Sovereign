#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Installing git hooks..."

# Worktree-safe hooks dir. --git-common-dir points at the REAL .git even from a
# worktree, where .git is a FILE, not a directory. A relative ".git/hooks" path
# there resolves to nothing — and a hook that can't be found means EVERY
# sovereignty check is silently skipped. This was the worktree-bypass hole.
HOOKS_DIR="$(git rev-parse --git-common-dir)/hooks"
mkdir -p "$HOOKS_DIR"

# ── The dispatcher: MECHANISM into the shared dir, POLICY left in the revision ──
# The hooks dir above is COMMON to every linked worktree, but .githooks/ is tracked
# and therefore differs per revision. Copying a revision's policy here (what this
# installer did until 2026-08-11, via `cp .../.githooks/pre-commit`) makes one
# worktree's contract govern all the others — proven that day to BOTH block a
# worktree at an older revision (`Missing script: "check:design-canon"`) AND to
# silently run a stale, weaker policy in worktrees at newer revisions.
#
# #1013's no-drift property is preserved, not reverted: installed == committed
# still holds — the installed file is .githooks/dispatch verbatim. What changes is
# that the shared file now carries no policy to drift from. Policy is resolved at
# hook time from the invoking worktree's own revision.
#
# ⛔ Never reintroduce a `cp .githooks/<hook>` into HOOKS_DIR. See .githooks/dispatch.
DISPATCH_SRC="$(git rev-parse --show-toplevel)/.githooks/dispatch"

if [ ! -f "$DISPATCH_SRC" ]; then
  echo "❌ Cannot install hooks: $DISPATCH_SRC is missing from this revision." >&2
  exit 1
fi

install_dispatcher() {
  cp "$DISPATCH_SRC" "$1"
  chmod +x "$1"
}

WRAPPER="$HOOKS_DIR/pre-commit"
if [ -f "$WRAPPER" ] && grep -q 'pre-commit.old' "$WRAPPER"; then
  # A chaining wrapper (e.g. bd/beads) owns pre-commit: it runs pre-commit.old,
  # then its own logic (the beads flush). Install our checks into that chained
  # target so the wrapper is PRESERVED, never clobbered.
  install_dispatcher "$HOOKS_DIR/pre-commit.old"
  echo "✅ dispatcher installed → pre-commit.old (chaining wrapper preserved)"

  # The wrapper must resolve pre-commit.old worktree-safely. The bd default uses a
  # relative ".git/hooks/pre-commit.old", which FAILS from worktrees and silently
  # skips every check. Repair it in place (idempotent, surgical — beads logic is
  # untouched) so worktree commits cannot bypass the gate.
  # The relative literal ".git/hooks/pre-commit.old" IS the bug — repair whenever
  # it appears (perl is idempotent; unrelated git-common-dir use in the beads
  # section must NOT suppress this).
  if grep -q '"\.git/hooks/pre-commit\.old"' "$WRAPPER"; then
    perl -0pi -e 's{"\.git/hooks/pre-commit\.old"}{"\$(git rev-parse --git-common-dir)/hooks/pre-commit.old"}g' "$WRAPPER"
    echo "🔧 repaired chaining wrapper: pre-commit.old resolved via --git-common-dir (worktree-safe)"
  fi
else
  # No chaining wrapper — we own pre-commit directly (already worktree-safe path).
  install_dispatcher "$WRAPPER"
  echo "✅ dispatcher installed → pre-commit"
fi

# ── Pre-push: branch guard + secrets + large files ──────────────────────────
# Policy versioned at .githooks/pre-push (branch allowlist shared with pre-commit
# via scripts/check-branch-allowed.sh); dispatched per-revision like pre-commit.
# The dispatcher execs, so the ref list on stdin reaches the policy untouched.
install_dispatcher "$HOOKS_DIR/pre-push"
echo "✅ dispatcher installed → pre-push (branch guard + secrets + large files)"

# ── Commit-msg: message policy ──────────────────────────────────────────────
# Body is versioned at .githooks/commit-msg — installed verbatim, same one-copy
# rule as pre-commit and pre-push.
#
# This install was MISSING until 2026-08-10. The hook was committed but no
# documented bootstrap step ever placed it, so a fresh clone silently enforced
# nothing from commit-msg while this machine happened to have a copy from some
# other route. A control that exists only on one developer machine is an
# environmental condition, not governance — see
# docs/ops/GIT_HOOK_CUSTODY_AUDIT_2026-08-10.md.
# The dispatcher forwards "$@", so the policy still receives the message-file path
# as $1 exactly as Git passed it.
install_dispatcher "$HOOKS_DIR/commit-msg"
echo "✅ dispatcher installed → commit-msg (message policy)"

echo "✅ git hooks installed (worktree-safe, beads-compatible, revision-aware)"
echo "   Policy is resolved per-worktree from that worktree's .githooks/ — see .githooks/dispatch"
