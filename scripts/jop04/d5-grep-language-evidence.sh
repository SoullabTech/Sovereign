#!/usr/bin/env bash
# JOP-04 · D5 evidence — the grep pattern language of the two GREP_PATTERN capabilities.
#
# READ-ONLY. Exercises only the registered read capability `git grep` in the shapes
# `repo.grep` and `repo.locate_symbol` actually issue (scripts/builder/deterministic.mjs).
# Asserts RELATIONSHIPS, never counts — counts drift with the tree, relationships are the law.
#
# Usage: scripts/jop04/d5-grep-language-evidence.sh [root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel)}"
cd "$ROOT" || exit 2

# A symbol that exists in the tree and is a pure identifier (no regex metacharacters).
SYM="declareRoutingEligibility"
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  PASS  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL  $1"; }

# repo.grep shape: git grep -r --line-number --null <pattern> .
g() { git grep -c ${1:+$1} -r --line-number --null "$2" . 2>/dev/null | wc -l | tr -d ' '; }

echo "JOP-04 D5 · grep pattern language — evidence"
echo "root: $ROOT"
echo "git:  $(git --version)"
echo

echo "E0 · ambient grep.patternType, with origin"
ORIGIN="$(git config --show-origin --get grep.patternType 2>/dev/null)"
if [ -z "$ORIGIN" ]; then
  echo "      grep.patternType is UNSET at every scope → git built-in default applies"
else
  echo "      $ORIGIN"
fi
echo "      (environment-specific: this is what the language resolves to HERE, not everywhere)"
echo

echo "E1 · flavour discriminator — BRE alternation 'zzzznope\\|SYM'"
AMB=$(g ""                  'zzzznope\|'"$SYM")
BRE=$(g "--basic-regexp"    'zzzznope\|'"$SYM")
ERE=$(g "--extended-regexp" 'zzzznope\|'"$SYM")
FIX=$(g "--fixed-strings"   'zzzznope\|'"$SYM")
printf '      ambient=%s  BRE=%s  ERE=%s  fixed=%s\n' "$AMB" "$BRE" "$ERE" "$FIX"
[ "$BRE" -gt 0 ] && [ "$ERE" -eq 0 ] && [ "$FIX" -eq 0 ] \
  && ok "the probe discriminates flavours (BRE alternates; ERE/fixed take '\\|' literally)" \
  || bad "probe is not discriminating in this git build — D5 evidence INCONCLUSIVE here"
[ "$AMB" = "$BRE" ] \
  && ok "ambient language ≡ BRE in THIS environment" \
  || bad "ambient language is NOT BRE here (ambient=$AMB, BRE=$BRE) — read E0 origin"
echo

echo "E2 · repo.locate_symbol substrate — the handler-derived '\\b<symbol>\\b'"
B_AMB=$(g ""                  '\b'"$SYM"'\b')
B_BRE=$(g "--basic-regexp"    '\b'"$SYM"'\b')
B_ERE=$(g "--extended-regexp" '\b'"$SYM"'\b')
B_FIX=$(g "--fixed-strings"   '\b'"$SYM"'\b')
printf '      ambient=%s  BRE=%s  ERE=%s  fixed=%s\n' "$B_AMB" "$B_BRE" "$B_ERE" "$B_FIX"
[ "$B_BRE" -gt 0 ] && [ "$B_ERE" -gt 0 ] && [ "$B_FIX" -eq 0 ] \
  && ok "\\b survives BRE and ERE and DIES under fixed-strings — the derived word boundary is language-dependent" \
  || bad "word-boundary behaviour differs from the recorded observation"
echo

echo "E3 · zero-result exit code, exact handler command shapes"
git grep -r --line-number --null '\bZZ_NO_SUCH_SYMBOL_ZZ\b' . >/dev/null 2>&1; RC_SYM=$?
git grep -r --line-number --null 'ZZ_NO_SUCH_PATTERN_ZZ'    . >/dev/null 2>&1; RC_PAT=$?
printf '      locate_symbol shape rc=%s   repo.grep shape rc=%s\n' "$RC_SYM" "$RC_PAT"
[ "$RC_SYM" -eq 1 ] && [ "$RC_PAT" -eq 1 ] \
  && ok "both shapes exit 1 on no-match — only repo.grep's handler catches status===1 (F-D asymmetry)" \
  || bad "no-match exit code is not 1 — the F-D reasoning does not apply in this git build"
echo

echo "E4 · fixed-strings consequence for a symbol that DOES exist"
git grep -c --fixed-strings -r --line-number --null '\b'"$SYM"'\b' . >/dev/null 2>&1; RC_FIX=$?
printf '      -F, existing symbol → rc=%s\n' "$RC_FIX"
[ "$RC_FIX" -eq 1 ] \
  && ok "under fixed-strings a PRESENT symbol is indistinguishable from an ABSENT one" \
  || bad "fixed-strings did not produce the not-found exit code"
echo

echo "---- $PASS passed · $FAIL failed ----"
[ "$FAIL" -eq 0 ] || exit 1
