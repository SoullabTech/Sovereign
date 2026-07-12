#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Installing git hooks..."

# Worktree-safe hooks dir. --git-common-dir points at the REAL .git even from a
# worktree, where .git is a FILE, not a directory. A relative ".git/hooks" path
# there resolves to nothing — and a hook that can't be found means EVERY
# sovereignty check is silently skipped. This was the worktree-bypass hole.
HOOKS_DIR="$(git rev-parse --git-common-dir)/hooks"
mkdir -p "$HOOKS_DIR"

# ── Sovereignty pre-commit checks (branch guard + supabase + provider governance)
# NOTE: check:no-direct-anthropic is intentionally NOT here — it is currently RED
# on pre-existing debt and would block every commit; it runs in CI (ci:sovereignty)
# instead. These three are green and must pass to commit.
write_sovereignty_checks() {
  cat > "$1" << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail
echo "🔒 Sovereignty pre-commit check..."

# Branch guard — only commit on approved branches.
# Allowlist is the shared single source of truth (also read by pre-push).
BRANCH="$(git branch --show-current)"
scripts/check-branch-allowed.sh COMMIT "$BRANCH"
echo "✅ Branch guard: committing to '$BRANCH' (allowed)"

export GIT_PRE_COMMIT=1

# Supabase ban
npm run check:no-supabase

# Provider governance — no NEW OpenAI surfaces (docs/canon/PROVIDER_GOVERNANCE.md)
npm run check:no-openai

echo "✅ Pre-commit checks passed"
HOOK
  chmod +x "$1"
}

WRAPPER="$HOOKS_DIR/pre-commit"
if [ -f "$WRAPPER" ] && grep -q 'pre-commit.old' "$WRAPPER"; then
  # A chaining wrapper (e.g. bd/beads) owns pre-commit: it runs pre-commit.old,
  # then its own logic (the beads flush). Install our checks into that chained
  # target so the wrapper is PRESERVED, never clobbered.
  write_sovereignty_checks "$HOOKS_DIR/pre-commit.old"
  echo "✅ sovereignty checks installed → pre-commit.old (chaining wrapper preserved)"

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
  write_sovereignty_checks "$WRAPPER"
  echo "✅ sovereignty checks installed → pre-commit"
fi

# ── Pre-push: branch guard + secrets + large files ──────────────────────────
# Body is versioned at .githooks/pre-push (branch allowlist shared with
# pre-commit via scripts/check-branch-allowed.sh) — installed verbatim so
# there is exactly one copy to maintain.
cp "$(git rev-parse --show-toplevel)/.githooks/pre-push" "$HOOKS_DIR/pre-push"
chmod +x "$HOOKS_DIR/pre-push"
echo "✅ pre-push hook installed (branch guard + secrets + large files)"

echo "✅ git hooks installed (worktree-safe, beads-compatible)"
