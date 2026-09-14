#!/usr/bin/env bash
# JOP-04 · D6 evidence — repo.locate_symbol.symbol is a LITERAL SYMBOL (ratified),
# and the current runtime violates that contract.
#
# READ-ONLY. Reproduces the handler's derived shape `\b${symbol}\b` (deterministic.mjs)
# with `git grep` only. Asserts RELATIONSHIPS, never counts.
# Custody: every probe names the bound root via `git -C`.
#
# Usage: scripts/jop04/d6-symbol-language-evidence.sh [root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel)}"
G() { git -C "$ROOT" "$@"; }
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  PASS  $1"; }
bad() { FAIL=$((FAIL+1)); echo "  FAIL  $1"; }

# The handler builds: git grep -r --line-number --null "\b<symbol>\b" .
derived() { G grep -l -r --line-number --null "\\b$1\\b" . 2>/dev/null | tr '\0' '\n' | sed '/^$/d'; }
n_derived() { derived "$1" | wc -l | tr -d ' '; }
n_literal() { G grep -l --fixed-strings "$1" . 2>/dev/null | wc -l | tr -d ' '; }

SYM='declareRoutingEligibility'
META='declare.*Eligibility'                  # caller text containing BRE metacharacters
BREAKER='Eligibility\).*('                   # caller text that unbalances the composed pattern

echo "JOP-04 D6 · symbol language — evidence"
echo "root: $ROOT   HEAD: $(G rev-parse --short HEAD)   git: $(git --version)"
echo "subject: scripts/builder/deterministic.mjs · repo.locate_symbol derives \\b\${symbol}\\b UNESCAPED"
echo

echo "CONTROL · a genuine literal symbol"
C=$(n_derived "$SYM"); echo "      symbol='$SYM'  files=$C"
[ "$C" -gt 0 ] && ok "the control symbol is found — the probe reproduces the handler shape" \
                || bad "control symbol not found; probe does not reproduce the handler"
echo

echo "D6-F1 · metacharacter authority — caller punctuation becomes a match PROGRAM"
# ⭐ SOURCE MEMBERSHIP, NOT GLOBAL ZERO (the D5 witness correction, applied here after this
#    probe failed at its own sealed commit — see the ruling record §"Fourth occurrence").
#    The first version asserted the tree contained ZERO literal occurrences of '$META'. Committing
#    a document that discusses the probe put the literal in the tree and broke the assertion. The
#    relationship that actually carries the finding is contamination-proof:
#      the DEFINING SOURCE does not contain the caller string literally,
#      yet the DERIVED search reaches it — so the caller's '.*' ran as a program.
DEFINING_SOURCE="scripts/builder/routing-eligibility.mjs"
SRC_LITERAL=$(G grep -c --fixed-strings "$META" -- "$DEFINING_SOURCE" 2>/dev/null | wc -l | tr -d ' ')
M=$(n_derived "$META"); L=$(n_literal "$META")
DERIVED_HITS_SRC=$(derived "$META" | grep -cx "$DEFINING_SOURCE" || true)
printf "      symbol='%s'\n" "$META"
printf "      derived search reaches %s ? %s\n" "$DEFINING_SOURCE" \
  "$( [ "$DERIVED_HITS_SRC" -gt 0 ] && echo yes || echo no )"
printf "      that file contains the caller string LITERALLY ? %s\n" \
  "$( [ "$SRC_LITERAL" -gt 0 ] && echo yes || echo no )"
printf "      (tree-wide, for context only: derived_files=%s  literal_files=%s — either MAY grow\n" "$M" "$L"
printf "       as documentation discusses the probe; neither is asserted)\n"
[ "$DERIVED_HITS_SRC" -gt 0 ] && [ "$SRC_LITERAL" -eq 0 ] \
  && ok "the derived search reaches a file that does NOT contain that text — '.*' was executed, not sought" \
  || bad "metacharacter did not demonstrate program authority against the defining source"
echo

echo "D6-F3 / D6-F2 · caller text escapes the host's boundary policy"
ERR="$(G grep -c -r --line-number --null "\\b${BREAKER}\\b" . 2>&1 >/dev/null)"; RC=$?
printf "      symbol='%s'  rc=%s\n      git says: %s\n" "$BREAKER" "$RC" "$ERR"
case "$ERR" in
  *Unmatched*|*nmatched*|*invalid*|*Invalid*)
    ok "caller text INVALIDATED the composed pattern — host boundary policy is manipulable (D6-F3)"
    ok "and the rejection comes from a REGEX PARSER acting as validator (D6-F2 shape)" ;;
  *) bad "caller text did not reach the composed pattern in this git build" ;;
esac
echo

echo "⛔ These are the CURRENT RUNTIME (F-C), not predictions. D6 authorizes NO handler repair."
echo "---- $PASS passed · $FAIL failed ----"
[ "$FAIL" -eq 0 ] || exit 1
