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
BRANCH="$(git branch --show-current)"
case "$BRANCH" in
  main|clean-main-no-secrets|phase4.6-reflective-agentics|feature/*|fix/*|chore/*) ;;
  *)
    echo ""
    echo "🚫 COMMIT BLOCKED: branch '$BRANCH' not allowed"
    echo "   Allowed: main | clean-main-no-secrets | feature/* | fix/* | chore/*"
    echo ""
    exit 1
    ;;
esac
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

# ── Pre-push: secrets + large files ─────────────────────────────────────────
cat > "$HOOKS_DIR/pre-push" << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail
scripts/check-no-secrets.sh
scripts/check-no-large-staged-files.sh
HOOK
chmod +x "$HOOKS_DIR/pre-push"
echo "✅ pre-push hook installed"

echo "✅ git hooks installed (worktree-safe, beads-compatible)"
