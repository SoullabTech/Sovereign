#!/usr/bin/env bash
# JOP-04 · D5 evidence — the grep pattern language of repo.grep.
#
# READ-ONLY. Exercises only the registered read capability `git grep` in the shape
# `repo.grep` actually issues (scripts/builder/deterministic.mjs).
#
# ⭐ ASSERTS SOURCE MEMBERSHIP, NEVER GLOBAL ZERO — founder witness correction 2026-09-14.
#    The first version of this script required the whole-repository fixed-string search to
#    return zero. That assertion CANNOT SURVIVE ITS OWN DOCUMENTATION: once the D5 packet
#    records the probe pattern, the literal characters `\b<symbol>\b` exist in the tree and a
#    fixed-string search legitimately matches the prose describing the probe. Same species as
#    the C21 false positive — an instrument that scans prose can fail on a file precisely
#    because that file documents the thing being tested.
#
#    The invariant is therefore NOT "fixed-strings matches nothing". It is:
#      under fixed-string semantics the derived query stops meaning
#      "this identifier at word boundaries" — it LOSES THE DEFINING SOURCE
#      and may instead match literal representations of the pattern elsewhere.
#
# Custody: every probe names the bound root explicitly via `git -C` (D1 custody correction).
#
# Usage: scripts/jop04/d5-grep-language-evidence.sh [root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel)}"
G() { git -C "$ROOT" "$@"; }

SYM="declareRoutingEligibility"
DEFINING_SOURCE="scripts/builder/routing-eligibility.mjs"   # where the identifier is DECLARED
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  PASS  $1"; }
bad() { FAIL=$((FAIL+1)); echo "  FAIL  $1"; }

# repo.grep shape: git grep -r --line-number --null <pattern> .   → file list
# NOTE: the handler shape carries --null, so `-l` emits NUL-separated names on a single
# line. Split them before any membership or count test — keep the shape, parse it correctly.
files() { G grep -l ${1:+$1} -r --line-number --null "$2" . 2>/dev/null | tr '\0' '\n' | sed '/^$/d'; }
has_src() { files "$1" "$2" | grep -qx "$DEFINING_SOURCE" && echo yes || echo no; }
count()  { files "$1" "$2" | wc -l | tr -d ' '; }

echo "JOP-04 D5 · grep pattern language — evidence"
echo "root:   $ROOT"
echo "HEAD:   $(G rev-parse --short HEAD)"
echo "git:    $(git --version)"
echo "anchor: $DEFINING_SOURCE declares $SYM"
G grep -n "^export function ${SYM}" -- "$DEFINING_SOURCE" | sed 's/^/        /' \
  || bad "anchor invalid — $SYM is not declared in $DEFINING_SOURCE"
echo

echo "E0 · ambient grep.patternType, with origin"
ORIGIN="$(G config --show-origin --get grep.patternType 2>/dev/null)"
if [ -z "$ORIGIN" ]; then
  echo "      UNSET at every scope → git built-in default applies"
else
  echo "      $ORIGIN"
fi
echo "      (environment-specific: what it resolves to HERE. The ambientness is what generalizes.)"
echo

echo "E1 · flavour discriminator — BRE alternation 'zzzznope\\|<SYM>'"
P1='zzzznope\|'"$SYM"
printf '      defining source present?   BRE=%s  ERE=%s  fixed=%s  ambient=%s\n' \
  "$(has_src --basic-regexp "$P1")" "$(has_src --extended-regexp "$P1")" \
  "$(has_src --fixed-strings "$P1")" "$(has_src "" "$P1")"
[ "$(has_src --basic-regexp "$P1")" = yes ] \
  && [ "$(has_src --extended-regexp "$P1")" = no ] \
  && [ "$(has_src --fixed-strings "$P1")" = no ] \
  && ok "probe discriminates: BRE alternates; ERE and fixed take '\\|' literally" \
  || bad "probe is not discriminating in this git build — D5 evidence INCONCLUSIVE here"
[ "$(has_src "" "$P1")" = "$(has_src --basic-regexp "$P1")" ] \
  && ok "ambient language behaves as BRE in THIS environment" \
  || bad "ambient language is NOT BRE here — read the E0 origin"
echo

echo "E2 · the handler-derived '\\b<symbol>\\b' — source membership, not global zero"
P2='\b'"$SYM"'\b'
for f in "--basic-regexp" "--extended-regexp" "--perl-regexp" "--fixed-strings"; do
  printf '      %-18s defining_source=%-3s  total_files=%s\n' "$f" "$(has_src "$f" "$P2")" "$(count "$f" "$P2")"
done
[ "$(has_src --basic-regexp "$P2")" = yes ] && [ "$(has_src --extended-regexp "$P2")" = yes ] \
  && ok "BRE and ERE find the DEFINING SOURCE — \\b is a word boundary" \
  || bad "word-boundary dialects did not reach the defining source"
[ "$(has_src --fixed-strings "$P2")" = no ] \
  && ok "fixed-strings LOSES the defining source — the derived query stopped meaning 'identifier at word boundaries'" \
  || bad "fixed-strings reached the defining source — the F-B exposure does not hold here"
FIXN=$(count --fixed-strings "$P2")
echo "      note: fixed-strings total_files=$FIXN — MAY be non-zero and that is CORRECT;"
echo "            documentation legitimately contains the literal characters \\b<symbol>\\b."
echo

echo "E3 · zero-result exit code, exact handler command shapes (F-D substrate)"
# The sentinels are ASSEMBLED, never written contiguously: a literal sentinel in this file
# would be found by the very search that is supposed to find nothing (self-contamination).
MISS="ZZ""$(printf '_ABSENT_')""ZZ"
G grep -r --line-number --null "\\b${MISS}\\b" . >/dev/null 2>&1; RC_SYM=$?
G grep -r --line-number --null "${MISS}"          . >/dev/null 2>&1; RC_PAT=$?
printf '      locate_symbol shape rc=%s   repo.grep shape rc=%s\n' "$RC_SYM" "$RC_PAT"
[ "$RC_SYM" -eq 1 ] && [ "$RC_PAT" -eq 1 ] \
  && ok "both shapes exit 1 on no-match — only repo.grep's handler catches status===1 (F-D)" \
  || bad "no-match exit code is not 1 — the F-D reasoning does not apply in this git build"
echo

echo "E4 · PRESENT IDENTIFIER + WRONG DIALECT → the defining-source occurrence is LOST"
lines() { G grep -n ${1:+$1} "$2" -- "$DEFINING_SOURCE" 2>/dev/null | wc -l | tr -d ' '; }
BSRC=$(lines --basic-regexp "$P2"); FSRC=$(lines --fixed-strings "$P2")
printf '      %s · matching lines for %s   BRE=%s  fixed=%s\n' \
  "$DEFINING_SOURCE" "$SYM" "$BSRC" "$FSRC"
[ "$BSRC" -gt 0 ] && [ "$FSRC" -eq 0 ] \
  && ok "the identifier IS present and the wrong dialect misses it — not 'zero results', a WRONG ANSWER" \
  || bad "dialect change did not lose the defining-source occurrence"
echo

echo "---- $PASS passed · $FAIL failed ----"
[ "$FAIL" -eq 0 ] || exit 1
