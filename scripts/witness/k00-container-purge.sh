#!/usr/bin/env bash
# DRIVER-01 housekeeping steps D–H — founder ruling 2026-09-13 ("purge mechanism authorized, fail-closed").
#
#   usage: scripts/witness/k00-container-purge.sh <archive-dir> --expect-count N [--dry-run | --selftest]
#          --selftest parses the ARCHIVED listing.txt offline (no device) through the exact preimage parser — proves the
#          parser on the real format before anything is armed (the C-D5 lesson).
#
#   D. the archive's reconcile.txt MUST say RECONCILED
#   E. a devicectl probe (k00-devicectl-probe.sh) MUST have been captured
#   PRE-PURGE (exact preimage gate, every clause refuses with NO WRITE):
#      1. list app-container tmp/ with the C-D5 retry discipline · 2. listing MUST succeed
#      3. the listing's reported file count MUST equal the parsed journal rows
#      4. EVERY file row MUST be kernel00-*.jsonl (follows from 3: total == journal rows leaves no room for another file)
#      5. the exact filename set MUST equal the reconciled archive set · 6. the count MUST equal --expect-count
#   F. the ONLY documented mechanism the installed tool exposes (probe: no delete/remove verb exists):
#        devicectl device copy to --domain-type appDataContainer --domain-identifier <bid> --source <EMPTY dir> --destination tmp --remove-existing-content true
#      — directory-wide mechanically; lawful only because the preimage just proved tmp/ holds exactly the archived journal set.
#      Calibrated by the founder in an isolated CoreDevice temporary domain (a.txt/b.txt removed) before this was written.
#   G. re-list with retries · H. MUST succeed and MUST report zero files, else PURGE UNVERIFIED → STOP (exit 9).
#   Never `uninstall`. Never any other app-data location. --dry-run runs D, E and the whole preimage gate, prints the parse, writes nothing.
set -uo pipefail
ARCHIVE="${1:?container-archive dir whose reconcile.txt says RECONCILED}"; shift
EXPECT=""; DRY=0; SELFTEST=0
while [ $# -gt 0 ]; do case "$1" in --expect-count) EXPECT="$2"; shift 2;; --dry-run) DRY=1; shift;; --selftest) SELFTEST=1; DRY=1; shift;; *) echo "unknown arg $1" >&2; exit 2;; esac; done
[ -n "$EXPECT" ] || { echo "--expect-count N is required (the reconciled count, 154 on 2026-09-13)" >&2; exit 2; }
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID="life.soullab.voicekernel.k00"
LEDGER="$ROOT/docs/programme/VOICE-2026/driver-ledger"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$LEDGER/purge-$STAMP$([ $SELFTEST = 1 ] && echo .SELFTEST || { [ $DRY = 1 ] && echo .DRY-RUN; }).txt"
say(){ echo "$*" | tee -a "$OUT"; }
refuse(){ say "## REFUSED — $*"; say "nothing was written; the device is untouched"; exit 4; }
say "# purge $STAMP $([ $SELFTEST = 1 ] && echo '(SELFTEST — archived listing, no device, no write)' || { [ $DRY = 1 ] && echo '(DRY RUN — no write)'; })"
say "archive: $ARCHIVE · expect-count: $EXPECT · device: $DEV · bundle: $BID"
# D
grep -q '^## verdict: RECONCILED' "$ARCHIVE/reconcile.txt" 2>/dev/null || refuse "step D: $ARCHIVE/reconcile.txt does not say RECONCILED (or is absent)"
say "D: archive RECONCILED"
# E (skipped under --selftest: the selftest proves the parser, not the tool)
if [ $SELFTEST = 1 ]; then PROBE="(selftest)"; else
PROBE="$(ls -d "$LEDGER"/devicectl-probe-*/ 2>/dev/null | sort | tail -1)"
[ -n "$PROBE" ] && [ -s "$PROBE/device-help.txt" ] || refuse "step E: no devicectl probe captured under $LEDGER"
grep -q -- '--remove-existing-content' "$PROBE/device-copy-help.txt" 2>/dev/null || grep -rq -- '--remove-existing-content' "$PROBE" || refuse "step E: the captured probe does not document --remove-existing-content; the mechanism is not proven on this tool"
say "E: probe $PROBE documents --remove-existing-content"
fi
# PRE-PURGE 1–2: list with retries; a failed listing is never an empty container
list_raw(){ local out rc n; for n in 1 2 3; do
  out="$(xcrun devicectl device info files --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --subdirectory tmp 2>&1)"; rc=$?
  if [ $rc -eq 0 ] && ! grep -q 'ERROR' <<<"$out"; then printf '%s\n' "$out"; return 0; fi; sleep 3; done; return 1; }
if [ $SELFTEST = 1 ]; then LISTING="$(cat "$ARCHIVE/listing.txt")"; say "preimage 1–2: (selftest) listing taken from $ARCHIVE/listing.txt"; else
LISTING="$(list_raw)" || refuse "preimage 2: the container listing failed three times"; fi
printf '%s\n' "$LISTING" > "${OUT%.txt}.listing-before.txt"
# PRE-PURGE 3–4: the listing's own reported total vs parsed journal rows
TOTAL="$(grep -oiE '\b[0-9]+ files?\b' <<<"$LISTING" | head -1 | grep -oE '[0-9]+')"
[ -n "$TOTAL" ] || refuse "preimage 3: no reported file count found in the listing (parser cannot establish the preimage; see ${OUT%.txt}.listing-before.txt)"
# file rows = every non-empty line after the dashed rule (format proven on the archived listing of 2026-09-13)
FILEROWS="$(awk 'f && NF {print} /^-{10,}/ {f=1}' <<<"$LISTING")"
NROWS="$( [ -n "$FILEROWS" ] && wc -l <<<"$FILEROWS" | tr -d ' ' || echo 0)"
NONJOURNAL="$(grep -vE '^kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl([[:space:]]|$)' <<<"$FILEROWS" | grep -c . || true)"
JOURNALS="$(grep -oE '^kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl' <<<"$FILEROWS" | sort -u)"
ROWS="$( [ -n "$JOURNALS" ] && wc -l <<<"$JOURNALS" | tr -d ' ' || echo 0)"
say "preimage: reported total=$TOTAL · file rows=$NROWS · non-journal rows=$NONJOURNAL · distinct journal rows=$ROWS"
[ "$TOTAL" -eq "$NROWS" ] || refuse "preimage 3: reported total $TOTAL ≠ parsed file rows $NROWS"
[ "$NONJOURNAL" -eq 0 ] || refuse "preimage 4: $NONJOURNAL file row(s) are not kernel00-*.jsonl — tmp/ holds something that is not an archived journal"
[ "$ROWS" -eq "$NROWS" ] || refuse "preimage 4: duplicate journal names in the listing ($ROWS distinct of $NROWS rows)"
# PRE-PURGE 5–6: exact set equality with the reconciled archive, and the declared count
sort -u "$ARCHIVE/local-names.txt" > "${OUT%.txt}.archive-set.txt"
printf '%s\n' "$JOURNALS" > "${OUT%.txt}.live-set.txt"
DIFF="$(comm -3 "${OUT%.txt}.archive-set.txt" "${OUT%.txt}.live-set.txt")"
[ -z "$DIFF" ] || { say "$DIFF"; refuse "preimage 5: live set ≠ reconciled archive set (lines above: left = archive-only, right = live-only)"; }
ARCHN="$(wc -l < "${OUT%.txt}.archive-set.txt" | tr -d ' ')"
[ "$ROWS" -eq "$EXPECT" ] && [ "$ARCHN" -eq "$EXPECT" ] || refuse "preimage 6: count $ROWS (archive $ARCHN) ≠ expected $EXPECT"
say "preimage: PASS — tmp/ holds exactly the $EXPECT reconciled journals and nothing else"
if [ $SELFTEST = 1 ]; then say "## SELFTEST COMPLETE — the preimage parser reproduces the reconciled archive from the real listing format; nothing written"; exit 0; fi
if [ $DRY = 1 ]; then say "## DRY RUN COMPLETE — preimage gate would admit the purge; nothing written"; exit 0; fi
# F
EMPTY="$(mktemp -d "${TMPDIR:-/tmp}/k00-empty.XXXXXX")"
say "F: devicectl device copy to --source $EMPTY (empty) --destination tmp --remove-existing-content true"
xcrun devicectl device copy to --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "$EMPTY" --destination tmp --remove-existing-content true 2>&1 | tee -a "$OUT"
RC=${PIPESTATUS[0]}; rmdir "$EMPTY" 2>/dev/null
say "F: rc=$RC"
# G–H
AFTER="$(list_raw)" || { say "## PURGE UNVERIFIED — the post-purge listing failed three times; STOP the programme sequence"; exit 9; }
printf '%s\n' "$AFTER" > "${OUT%.txt}.listing-after.txt"
AT="$(grep -oiE '\b[0-9]+ files?\b' <<<"$AFTER" | head -1 | grep -oE '[0-9]+')"
AJ="$(awk 'f && NF {print} /^-{10,}/ {f=1}' <<<"$AFTER" | grep -c . || true)"
say "H: post-purge reported total=${AT:-<none>} · journal rows=$AJ"
if [ "${AT:-x}" = "0" ] && [ "$AJ" -eq 0 ]; then say "## PURGE VERIFIED — tmp/ reports zero files; $EXPECT journals removed, all held in $ARCHIVE"; exit 0; fi
say "## PURGE UNVERIFIED — zero not established; STOP the programme sequence"; exit 9
