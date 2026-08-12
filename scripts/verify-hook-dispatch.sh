#!/usr/bin/env bash
# Proof harness for the revision-aware hook dispatcher (.githooks/dispatch).
#
# Builds a THROWAWAY repo with two revisions carrying DIFFERENT policies, adds a
# worktree at each, installs the dispatcher once into the SHARED hooks dir, and
# asserts each worktree executes its own revision's policy — the invariant the
# 2026-08-11 defect violated. Touches no real repository.
#
#   ./scripts/verify-hook-dispatch.sh
#
# See docs/ops/HOOK_DISPATCH_REVISION_AWARE_2026-08-11.md
set -u

DISPATCH_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.githooks/dispatch"
LAB="$(mktemp -d "${TMPDIR:-/tmp}/hookdispatch.XXXXXX")"
trap 'rm -rf "$LAB"' EXIT
cd "$LAB" || exit 1
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf "  PASS  %s\n" "$1"; }
no(){ FAIL=$((FAIL+1)); printf "  FAIL  %s  -- expected [%s] got [%s]\n" "$1" "$3" "$2"; }
chk(){ if [ "$2" = "$3" ]; then ok "$1"; else no "$1" "$2" "$3"; fi; }
# count whole-line matches only, so MSGPOLICY-A cannot satisfy a POLICY-A assertion
lines(){ printf '%s\n' "$1" | grep -cx "$2"; }
has(){ printf '%s\n' "$1" | grep -c "$2"; }

git init -q repo && cd repo
git config user.email t@t.t; git config user.name T; git config commit.gpgsign false
REPO_GITDIR="$(cd "$(git rev-parse --git-common-dir)" && pwd)"
HOOKS="$REPO_GITDIR/hooks"

mkdir -p .githooks
cp "$DISPATCH_SRC" .githooks/dispatch

# ---- revision A: OLD policy. Knows only check-old. ----
cat > .githooks/pre-commit <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "POLICY-A"
echo "ran:check-old"
EOF
cat > .githooks/commit-msg <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "MSGPOLICY-A argc=$# base=$(basename "$1")"
if grep -q FORBIDDEN "$1"; then echo "rejected-by-A"; exit 7; fi
exit 0
EOF
cat > .githooks/pre-push <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "PUSHPOLICY-A args=$*"
n=0; while read -r _l; do n=$((n+1)); done
echo "stdin-lines=$n"
EOF
chmod +x .githooks/*
git add -A && git commit -qm "revision A: old policy"
git branch old-rev

# ---- revision B: NEW policy. Adds check-new (the design-canon analogue). ----
cat > .githooks/pre-commit <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "POLICY-B"
echo "ran:check-old"
echo "ran:check-new"
EOF
git add -A && git commit -qm "revision B: new policy adds check-new"
git branch new-rev

# ---- two worktrees at different revisions, ONE shared hooks dir ----
git worktree add -q ../wtA old-rev
git worktree add -q ../wtB new-rev
for h in pre-commit commit-msg pre-push; do cp .githooks/dispatch "$HOOKS/$h"; chmod +x "$HOOKS/$h"; done

echo; echo "=== PROOFS ==="; echo
echo "-- P1/P2: each worktree runs ITS OWN revision's policy --"
cd ../wtA; echo a > f.txt; git add f.txt
A_OUT=$(git commit -m "commit in A" 2>&1)
chk "A invokes A's policy"           "$(lines "$A_OUT" 'POLICY-A')" "1"
chk "A does NOT run B's check-new"   "$(has   "$A_OUT" 'ran:check-new')" "0"

cd ../wtB; echo b > f.txt; git add f.txt
B_OUT=$(git commit -m "commit in B" 2>&1)
chk "B invokes B's policy"           "$(lines "$B_OUT" 'POLICY-B')" "1"
chk "B retains check-new"            "$(has   "$B_OUT" 'ran:check-new')" "1"
chk "B retains check-old"            "$(has   "$B_OUT" 'ran:check-old')" "1"

echo; echo "-- P3: installing FROM A cannot weaken B (the original defect) --"
cd ../wtA && cp .githooks/dispatch "$HOOKS/pre-commit" && chmod +x "$HOOKS/pre-commit"
cd ../wtB; echo b2 > f.txt; git add f.txt
B2=$(git commit -m "B after install-from-A" 2>&1)
chk "B still runs check-new after install from A" "$(has "$B2" 'ran:check-new')" "1"

echo; echo "-- P4: installing FROM B cannot block A --"
cd ../wtB && cp .githooks/dispatch "$HOOKS/pre-commit" && chmod +x "$HOOKS/pre-commit"
cd ../wtA; echo a2 > f.txt; git add f.txt
A2=$(git commit -m "A after install-from-B" 2>&1); A2RC=$?
chk "A still commits after install from B" "$A2RC" "0"
chk "A still runs only its own policy"     "$(has "$A2" 'ran:check-new')" "0"

echo; echo "-- P5: nested directory invocation resolves the right worktree --"
cd ../wtA && mkdir -p deep/nest && echo x > deep/nest/g.txt && git add deep/nest/g.txt
N_OUT=$(cd deep/nest && git commit -m "from nested dir" 2>&1)
chk "nested invocation still resolves A" "$(lines "$N_OUT" 'POLICY-A')" "1"

echo; echo "-- P6: exit codes propagate unchanged --"
cd ../wtB
cat > .githooks/pre-commit <<'EOF'
#!/usr/bin/env bash
echo "POLICY-B-FAILING"; exit 42
EOF
chmod +x .githooks/pre-commit; git add -A; git commit -qm "make B fail" --no-verify >/dev/null 2>&1
echo z > f.txt; git add f.txt
git commit -m "should be rejected" >/dev/null 2>&1; RC=$?
chk "hook exit 42 blocks the commit" "$([ "$RC" -ne 0 ] && echo blocked || echo allowed)" "blocked"
git reset -q --hard HEAD~1

echo; echo "-- P7: FAILS CLOSED when the revision has no policy --"
cd ../wtA && git rm -q .githooks/pre-commit && git commit -qm "remove policy" --no-verify >/dev/null 2>&1
echo y > f.txt; git add f.txt
FC=$(git commit -m "no policy present" 2>&1); FCRC=$?
chk "missing policy blocks the commit" "$([ "$FCRC" -ne 0 ] && echo blocked || echo allowed)" "blocked"
chk "failure is VISIBLE, not silent"   "$(has "$FC" 'no governance policy at this revision')" "1"
git reset -q --hard HEAD~1

echo; echo "-- P8: commit-msg receives its argument; policy exit honoured --"
cd ../wtA; echo m > f.txt; git add f.txt
M_OUT=$(git commit -m "ordinary message" 2>&1)
chk "commit-msg policy ran with argc=1" "$(has "$M_OUT" 'MSGPOLICY-A argc=1')" "1"
echo m2 > f.txt; git add f.txt
git commit -m "contains FORBIDDEN token" >/dev/null 2>&1; MRC=$?
chk "commit-msg rejection propagates" "$([ "$MRC" -ne 0 ] && echo blocked || echo allowed)" "blocked"

echo; echo "-- P9: pre-push stdin + args survive the exec --"
cd ../wtA
P_OUT=$(printf 'refs/heads/x aaa refs/heads/x bbb\nrefs/heads/y ccc refs/heads/y ddd\n' | "$HOOKS/pre-push" origin https://example.invalid 2>&1)
chk "pre-push args forwarded" "$(has "$P_OUT" 'args=origin https://example.invalid')" "1"
chk "pre-push stdin intact"   "$(has "$P_OUT" 'stdin-lines=2')" "1"

echo; echo "-- P10: non-executable policy still runs via its shebang --"
cd ../wtB && git checkout -q new-rev -- .githooks/pre-commit && chmod -x .githooks/pre-commit
echo nx > f.txt; git add f.txt
X_OUT=$(git commit -m "policy without exec bit" 2>&1)
chk "non-executable policy dispatched" "$(lines "$X_OUT" 'POLICY-B')" "1"

echo; echo "=== RESULT ==="
echo "  PASS=$PASS  FAIL=$FAIL"
if [ "$FAIL" -eq 0 ]; then echo "  ALL PROOFS GREEN"; else echo "  PROOFS FAILED"; fi
