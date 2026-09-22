#!/usr/bin/env bash
# Falsifiers for seam-preflight.mjs (I5-P0R3 §1 as amended). READ ONLY.
set -uo pipefail
T="scripts/witness/seam-preflight.mjs"
A="origin/claude/magical-dirac-6rcn5k"
FULL="b828400c7aaceafbbfcc66144018a6b0fe538dab1c806bbe3de635b2fc6ff6b4"
IMG="a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51"
WRONG="0000000000000000000000000000000000000000000000000000000000000000"
P=0; F=0
ok(){ printf 'PASS  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; P=$((P+1)); }
no(){ printf 'FAIL  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; F=$((F+1)); }

run(){ node "$T" --authority-branch "$A" "$@" 2>&1; }

# P1 — a wrong adjudicated FULL digest must fail, never pass
OUT="$(run --adjudicated-full "$WRONG" --adjudicated-image "$IMG")"; RC=$?
if [ "$RC" != "0" ] && printf '%s' "$OUT" | grep -q 'MISMATCH  full-scope'; then
  ok P1 "a wrong adjudicated full-scope digest is refused" "exit=$RC"; else
  no P1 "a wrong adjudicated full-scope digest is refused" "exit=$RC"; fi

# P2 — a wrong adjudicated IMAGE digest must fail independently
OUT="$(run --adjudicated-full "$FULL" --adjudicated-image "$WRONG")"; RC=$?
if [ "$RC" != "0" ] && printf '%s' "$OUT" | grep -q 'MISMATCH  image-scope'; then
  ok P2 "a wrong adjudicated image-scope digest is refused" "exit=$RC"; else
  no P2 "a wrong adjudicated image-scope digest is refused" "exit=$RC"; fi

# P3 — the adjudicated digests are never defaulted (inherited evidence)
node "$T" --authority-branch "$A" >/dev/null 2>&1; RC=$?
[ "$RC" = "2" ] && ok P3 "adjudicated digests are not defaulted" "REFUSED exit=2" \
  || no P3 "adjudicated digests are not defaulted" "exit=$RC"

# P4 ⭐ — a deployment tree with a DIFFERENT seam fails on full scope while image
#         scope still matches: SHA identity never substitutes for digest equality,
#         and the two scopes are reported independently.
OUT="$(run --adjudicated-full "$FULL" --adjudicated-image "$IMG" \
         --deploy-tree 4c097b4c81402c62e42613e83ae28180fef46f08)"; RC=$?
C_SECTION="$(printf '%s\n' "$OUT" | sed -n '/C · CHOSEN/,/PRODUCTION/p')"
if [ "$RC" != "0" ] \
  && printf '%s' "$C_SECTION" | grep -q 'MISMATCH  full-scope' \
  && printf '%s' "$C_SECTION" | grep -q 'EQUAL     image-scope'; then
  ok P4 "a stale deployment tree fails full scope while image scope still matches" \
       "the two scopes are independent; ancestry relationship: $(printf '%s' "$C_SECTION" | grep -o 'relationship to canonical.*' | head -1)"
else
  no P4 "a stale deployment tree fails full scope while image scope still matches" "exit=$RC"
fi

# P5 ⭐ — the production rows are NEVER populated
OUT="$(run --adjudicated-full "$FULL" --adjudicated-image "$IMG")"
PROD="$(printf '%s\n' "$OUT" | sed -n '/PRODUCTION · OWED/,$p')"
OWED="$(printf '%s\n' "$PROD" | grep -c 'OWED · not computable here')"
LEAK="$(printf '%s\n' "$PROD" | grep -cE '[0-9a-f]{40,64}')"
if [ "$OWED" = "5" ] && [ "$LEAK" = "0" ]; then
  ok P5 "every production row is OWED and carries no computed value" "5 rows, 0 digests"
else
  no P5 "every production row is OWED and carries no computed value" "owed=$OWED leaked=$LEAK"
fi

# P6 — tampered/older instrument custody is refused by name
OUT="$(node "$T" --authority-branch 429d0adf219113ea9a16e53d5544fe7d1265a92b \
        --adjudicated-full "$FULL" --adjudicated-image "$IMG" 2>&1)"; RC=$?
if [ "$RC" != "0" ] && printf '%s' "$OUT" | grep -q 'MISMATCH  i5-p0r2-remediation.sh'; then
  ok P6 "custody that does not match the adjudication is refused by name" "pre-repair blob rejected"
else
  no P6 "custody that does not match the adjudication is refused by name" "exit=$RC"
fi

printf '\n%s/%s preflight falsifiers passed\n' "$P" "$((P+F))"
[ "$F" = "0" ]
