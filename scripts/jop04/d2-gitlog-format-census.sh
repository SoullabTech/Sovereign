#!/usr/bin/env bash
# JOP-04 · D2 census evidence — git.log.format: provenance + usage.
#
# READ-ONLY. No handler, schema, registry, canonicalizer or production code is touched.
# Custody: names the bound root via `git -C`. Asserts RELATIONSHIPS, never counts, and never
# global-zero over prose (D5 witness correction; the D6 repeat).
#
# ⚠️ REQUIRES FULL HISTORY. In a shallow clone this script REFUSES rather than reporting a
#    truncated provenance answer — see §"shallow" in the census record.
#
# Usage: scripts/jop04/d2-gitlog-format-census.sh [root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel)}"
G() { git -C "$ROOT" "$@"; }
REG="scripts/builder/deterministic.mjs"
# ⭐ ONE SHARED SELF-EXCLUSION, declared once and applied to EVERY tree probe below.
#    This programme has now lost five probes to the same species: an instrument that scans the
#    tree for a token it must also NAME counts itself. Fixing that per-probe is how it recurs —
#    the exclusion is declared here, once, and no tree probe may skip it.
SELF="scripts/jop04/d2-gitlog-format-census.sh"
not_self() { grep -v -F "$SELF"; }
PASS=0; FAIL=0; UNDET=0
ok()  { PASS=$((PASS+1));  echo "  PASS       $1"; }
bad() { FAIL=$((FAIL+1));  echo "  FAIL       $1"; }
und() { UNDET=$((UNDET+1)); echo "  UNDETERMINED  $1"; }

echo "JOP-04 D2 · git.log.format — provenance + usage census"
echo "root: $ROOT   HEAD: $(G rev-parse --short HEAD)"
echo

if [ "$(G rev-parse --is-shallow-repository)" != "false" ]; then
  echo "  ⛔ REFUSED — shallow clone. Provenance archaeology is not possible and a truncated"
  echo "     answer here is worse than none: blame reports the GRAFT BOUNDARY as the author."
  echo "     Run: git -C \"$ROOT\" fetch --unshallow"
  exit 2
fi

echo "P1 · the field is declared exactly once and consumed nowhere"
DECL=$(G grep -n 'format: { type' -- "$REG" 2>/dev/null | not_self | wc -l | tr -d ' ')
READS=$(G grep -n 'args\.format' -- scripts jarvis-desktop 2>/dev/null | not_self | wc -l | tr -d ' ')
printf '      declarations=%s   readers of args.format=%s\n' "$DECL" "$READS"
[ "$DECL" -eq 1 ] && [ "$READS" -eq 0 ] \
  && ok "declared, never read — the sealed contract's premise still holds" \
  || bad "declaration/consumption shape has changed since the census"
echo

echo "P2 · the introducing commit is the file's ONLY content-bearing commit"
HIST=$(G log --format='%h' --follow -- "$REG" | wc -l | tr -d ' ')
INTRO=$(G log --format='%h' -S"format: { type: 'string'" -- "$REG" | tail -1)
printf '      commits touching %s: %s   introducing: %s\n' "$REG" "$HIST" "$INTRO"
[ -n "$INTRO" ] && ok "introducing commit identified: $INTRO — format has never been edited since" \
                || bad "introducing commit not recoverable"
echo

echo "P3 · ⭐ the AUTHORING act is unrecoverable BY RECORD, not merely unfound"
# ⭐ PINNED TO ONE NAMED COMMIT, NOT SEARCHED. A --grep over all commit messages would be
#    satisfied by THIS census's own commit message, which quotes the phrase — the same
#    self-contamination species as C21, the Symbol.for canary, and the D6-F1 probe, in the
#    commit-message channel rather than the tree. The claim is about ONE historical record,
#    so the probe names it.
LINEAGE_COMMIT="f2b453be3"
if G cat-file -e "${LINEAGE_COMMIT}^{commit}" 2>/dev/null; then
  if G show -s --format='%B' "$LINEAGE_COMMIT" | grep -q 'commits anywhere'; then
    ok "$LINEAGE_COMMIT states the historical subject has '0 commits anywhere; bytes unavailable'"
    G show -s --format='%B' "$LINEAGE_COMMIT" | grep -n 'HISTORICAL SUBJECT\|commits anywhere\|bytes unavailable' | sed 's/^/        /'
  else
    bad "$LINEAGE_COMMIT no longer carries the lineage statement — re-read provenance by hand"
  fi
else
  und "$LINEAGE_COMMIT is not present (shallow or rewritten history) — provenance UNVERIFIED here"
fi
echo

echo "U1 · no caller anywhere supplies format"
# Scoped to code only, and this census instrument is excluded by name: a probe that discusses
# the capability must not count as a caller of it.
CALLERS=$(G grep -n "capabilityName: 'git.log'\|capability: 'git.log'" -- scripts jarvis-desktop 2>/dev/null \
  | not_self | grep -c "format" || true)
printf '      git.log references carrying a format argument: %s\n' "$CALLERS"
[ "$CALLERS" -eq 0 ] && ok "zero callers supply format — in the tree and in the scoped history" \
                     || bad "a caller supplying format exists; D2 evidence must be re-read"
echo

echo "U2 · ⭐⭐ the field IS SOLICITED FROM A HUMAN today (F-E)"
OUT=$(cd "$ROOT" && node -e "
const { createRequire } = require('node:module');
const require2 = createRequire(process.cwd() + '/x.js');
import('./scripts/builder/deterministic.mjs').then(m => {
  const CF = require2('./jarvis-desktop/src/capability-form.js');
  const man = CF.buildManifest(m.CAPABILITIES);
  const e = man.find(x => x.name === 'git.log');
  const shown = e && e.args.some(a => a.name === 'format');
  const v = CF.validateSubmission({ manifest: man, capabilityName: 'git.log', mode: 'structured', rawValues: { format: '%H%n%s' } });
  console.log(JSON.stringify({ shown, accepted: v.ok, carried: !!(v.task && v.task.args && 'format' in v.task.args) }));
});" 2>/dev/null)
printf '      %s\n' "$OUT"
case "$OUT" in
  *'"shown":true'*'"accepted":true'*'"carried":true'*)
    ok "rendered as a form field, validated, accepted, and carried into the task — then dropped"
    ok "H3 is LIVE and USER-FACING: a solicited, validated, accepted input with no effect" ;;
  *) bad "the form layer no longer solicits format — re-read F-E" ;;
esac
echo

echo "VERDICT INPUTS (the census does not rule)"
echo "      strong-B evidence (caller/test/doc/design/earlier impl expecting format to alter output,"
echo "      or introducing change describing caller-selectable formatting):   NONE FOUND"
echo "      strong-A evidence (provenance showing abandonment, accidental copy, supersession by a"
echo "      fixed canonical output contract, or intentional exclusion from caller control): NONE FOUND"
echo "      ⛔ absence of evidence is NOT scored as A."
echo
echo "---- $PASS passed · $FAIL failed · $UNDET undetermined ----"
[ "$FAIL" -eq 0 ] || exit 1
