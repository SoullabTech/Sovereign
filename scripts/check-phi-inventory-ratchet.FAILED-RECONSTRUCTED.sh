#!/usr/bin/env bash
# =============================================================================
# PHI INVENTORY NO-REGRESSION RATCHET
# =============================================================================
# Founder ruling 2026-08-16 — docs/governance/FOUNDER_RULING_PHI_INVENTORY_GATE_2026-08-16.md
#
#   CONSISTENCY(HEAD)  →  CONSISTENCY(PROPOSED COMMIT)
#
#   NEW discrepancy         → FAIL
#   UNCHANGED discrepancy   → PASS pre-commit; REMAINS DEBT
#   REMOVED discrepancy     → PASS
#   one removed + one new   → FAIL   (set difference, never count difference)
#
# SECURITY JURISDICTION PRESERVED. This does not weaken the invariant: it
# changes only *whose debt a given commit is answerable for*. The full-repo
# audit (`npm run check:phi-inventory`) is retained and unchanged.
#
# ⛔ FAIL CLOSED. If a trustworthy HEAD→proposed comparison cannot be
# established, this exits non-zero with BLOCKED. It never degrades to "pass",
# and it never relocates the gate to CI — that is a separate governance
# decision, not an implementation fallback.
#
# WHY THIS IS TRUSTWORTHY HERE: every input the checker reads is a tracked
# file — docs/security/phi-columns.md, the accessor sources, and the
# ACCESSOR_SPECS / REQUIRED_ENCRYPTED_TABLES consts that live inside the
# checker itself. No database, no generated state, no environment dependence.
# Each tree is therefore measured with ITS OWN copy of the checker, so a commit
# that edits ACCESSOR_SPECS is judged by the version it actually ships.
# =============================================================================
set -uo pipefail

CHECKER="scripts/check-phi-columns-inventory.ts"
REPO_ROOT="$(git rev-parse --show-toplevel)"
TMP_ROOT="$(mktemp -d)"
WT_HEAD="$TMP_ROOT/head"
WT_PROPOSED="$TMP_ROOT/proposed"

cleanup() {
  git -C "$REPO_ROOT" worktree remove --force "$WT_HEAD"     >/dev/null 2>&1 || true
  git -C "$REPO_ROOT" worktree remove --force "$WT_PROPOSED" >/dev/null 2>&1 || true
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

blocked() {
  echo "⛔ BLOCKED — safe no-regression mechanism not established for PHI inventory." >&2
  echo "   Reason: $1" >&2
  echo "" >&2
  echo "   Per founder ruling: the gate is NOT weakened and is NOT relocated to CI." >&2
  echo "   Either repair the historical PHI debt so the full-repo gate is green," >&2
  echo "   or design a trustworthy comparator under separate bounded work." >&2
  echo "   Audit the current state: npm run check:phi-inventory" >&2
  exit 1
}

# --- Materialize the two trees ------------------------------------------------
# PROPOSED = the index (what this commit would actually contain), not the dirty
# working tree. Written as a real tree object so unstaged edits cannot leak in.
git -C "$REPO_ROOT" rev-parse --verify HEAD >/dev/null 2>&1 \
  || blocked "no HEAD to compare against (initial commit)"

PROPOSED_TREE="$(git -C "$REPO_ROOT" write-tree 2>/dev/null)" \
  || blocked "could not write the staged tree (git write-tree failed)"
PROPOSED_COMMIT="$(git -C "$REPO_ROOT" commit-tree "$PROPOSED_TREE" -p HEAD -m 'phi-ratchet: staged state' 2>/dev/null)" \
  || blocked "could not materialize the staged tree as a commit"

git -C "$REPO_ROOT" worktree add --detach --quiet "$WT_HEAD" HEAD 2>/dev/null \
  || blocked "could not create a worktree at HEAD"
git -C "$REPO_ROOT" worktree add --detach --quiet "$WT_PROPOSED" "$PROPOSED_COMMIT" 2>/dev/null \
  || blocked "could not create a worktree at the staged tree"

# tsx + deps come from the main checkout; each tree still runs its OWN checker.
for wt in "$WT_HEAD" "$WT_PROPOSED"; do
  [ -e "$wt/node_modules" ] || ln -s "$REPO_ROOT/node_modules" "$wt/node_modules"
done

# --- Measure both trees with their own checker --------------------------------
# ⛔ NEVER call this inside a pipeline. `blocked` exits, and an exit inside a
# pipeline subshell would abort only that subshell — leaving the comparator to
# continue with an EMPTY discrepancy set and report a false PASS. That is a
# fail-OPEN security defect; it was observed during verification, not theorized.
# Hence: write to a file, check status explicitly, no pipes.
measure() {
  local wt="$1" label="$2" dest="$3" raw

  [ -f "$wt/$CHECKER" ] || blocked "$label tree has no $CHECKER — cannot measure it"

  raw="$(cd "$wt" && npx tsx "$CHECKER" --emit-discrepancies 2>/dev/null | tail -n 1)" \
    || blocked "$label tree: checker could not be executed"

  [ -n "$raw" ] \
    || blocked "$label tree produced no discrepancy set — its checker predates --emit-discrepancies, or failed to run"

  printf '%s' "$raw" | node -e '
    let s = "";
    process.stdin.on("data", d => s += d).on("end", () => {
      let a;
      try { a = JSON.parse(s); } catch { process.exit(2); }
      if (!Array.isArray(a) || a.some(x => typeof x !== "string")) process.exit(2);
      a.forEach(x => console.log(x));
    });
  ' > "$dest"

  # shellcheck disable=SC2181 # status of the node call above, not of a pipeline
  if [ $? -ne 0 ]; then
    blocked "$label tree emitted output that is not a discrepancy array — refusing to guess its consistency state"
  fi

  sort -o "$dest" "$dest"
}

HEAD_SET="$TMP_ROOT/head.txt"
PROPOSED_SET="$TMP_ROOT/proposed.txt"
measure "$WT_HEAD" "HEAD" "$HEAD_SET"
measure "$WT_PROPOSED" "proposed" "$PROPOSED_SET"

# --- Set difference, never count difference -----------------------------------
NEW="$(comm -13 "$HEAD_SET" "$PROPOSED_SET")"
RESOLVED="$(comm -23 "$HEAD_SET" "$PROPOSED_SET")"
CARRIED="$(comm -12 "$HEAD_SET" "$PROPOSED_SET")"

n_new=$( [ -z "$NEW" ] && echo 0 || echo "$NEW" | wc -l | tr -d ' ')
n_res=$( [ -z "$RESOLVED" ] && echo 0 || echo "$RESOLVED" | wc -l | tr -d ' ')
n_car=$( [ -z "$CARRIED" ] && echo 0 || echo "$CARRIED" | wc -l | tr -d ' ')

echo "🔍 PHI inventory no-regression check (HEAD → proposed)..."
echo ""

if [ "$n_new" -gt 0 ]; then
  echo "❌ NEW PHI INVENTORY DISCREPANCY INTRODUCED BY THIS CHANGE:" >&2
  echo "" >&2
  echo "$NEW" | sed 's/^/   • /' >&2
  echo "" >&2
  [ "$n_res" -gt 0 ] && {
    echo "   ⚠️  This change also RESOLVED $n_res discrepancy(ies) — that does not offset a new one." >&2
    echo "       New debt may not hide behind an unchanged aggregate count." >&2
    echo "" >&2
  }
  echo "   📖 docs/security/security-constitution.md" >&2
  exit 1
fi

[ "$n_res" -gt 0 ] && { echo "   ↓ $n_res discrepancy(ies) resolved by this change."; echo "$RESOLVED" | sed 's/^/     - /'; }
if [ "$n_car" -gt 0 ]; then
  echo "   • $n_car pre-existing discrepancy(ies) carried forward — STILL UNRESOLVED PHI DEBT:"
  echo "$CARRIED" | sed 's/^/     - /'
  echo "     Not accepted, not absorbed into this commit. Audit: npm run check:phi-inventory"
elif [ "$n_res" -gt 0 ]; then
  echo "   ✅ All PHI inventory discrepancies now resolved."
fi

echo "✅ No new PHI inventory debt introduced."
exit 0
