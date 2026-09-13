#!/usr/bin/env bash
# DRIVER-01 — container housekeeping, ARCHIVE mode only (founder ruling 2026-09-13):
#   list tmp/ → copy every kernel00-*.jsonl to a local archive → SHA-256 manifest → reconcile remote names/count
#   against local names/count → DELETE NOTHING.
#   usage: scripts/witness/k00-container-archive.sh <label>      (e.g. pre-stage-c | post-stage-c)
# Output: docs/programme/VOICE-2026/driver-ledger/container-archive/<label>-<stamp>/{listing.txt,manifest.sha256,reconcile.txt,journals/}
# Deletion is a separate act, authorized only AFTER Stage C and only for tmp/kernel00-*.jsonl; no deletion verb is
# implemented here because none has been established for devicectl — probe `xcrun devicectl device --help` and
# record the output before any purge script is written. Never guess a subcommand.
set -uo pipefail
LABEL="${1:?label}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID="life.soullab.voicekernel.k00"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$ROOT/docs/programme/VOICE-2026/driver-ledger/container-archive/$LABEL-$STAMP"
mkdir -p "$OUT/journals"
log(){ echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$OUT/archive.log"; }
# listing with the C-D5 discipline: a failed listing is a failure, never an empty container
LISTING=""; RC=1
for n in 1 2 3; do
  LISTING="$(xcrun devicectl device info files --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --subdirectory tmp 2>&1)"; RC=$?
  if [ $RC -eq 0 ] && ! grep -q 'ERROR' <<<"$LISTING"; then break; fi
  log "listing attempt $n failed (rc=$RC); retrying"; sleep 3; RC=1
done
printf '%s\n' "$LISTING" > "$OUT/listing.txt"
[ $RC -eq 0 ] || { log "ABORT: the container listing failed three times; nothing archived, nothing deleted ($OUT/listing.txt)"; exit 7; }
grep -oE 'kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl' "$OUT/listing.txt" | sort -u > "$OUT/remote-names.txt"
REMOTE=$(wc -l < "$OUT/remote-names.txt" | tr -d ' ')
log "remote journals listed: $REMOTE"
OK=0; FAIL=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  if xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "tmp/$f" --destination "$OUT/journals/$f" >/dev/null 2>&1 && [ -s "$OUT/journals/$f" ]; then
    OK=$((OK+1))
  else
    FAIL=$((FAIL+1)); echo "$f" >> "$OUT/copy-failed.txt"; log "copy FAILED: $f"
  fi
done < "$OUT/remote-names.txt"
( cd "$OUT/journals" && ls -1 | sort | xargs -I{} shasum -a 256 "{}" ) > "$OUT/manifest.sha256"
LOCAL=$(wc -l < "$OUT/manifest.sha256" | tr -d ' ')
# reconcile: remote names vs local names; and which already live in a ledger (same name AND same hash)
{
  echo "# reconcile $LABEL $STAMP"
  echo "remote listed: $REMOTE · copied: $OK · copy failed: $FAIL · local manifest lines: $LOCAL"
  ( cd "$OUT/journals" && ls -1 | sort ) > "$OUT/local-names.txt"
  echo "## names in remote listing but not archived locally:"; comm -23 "$OUT/remote-names.txt" "$OUT/local-names.txt" | sed 's/^/  MISSING-LOCAL /' ; 
  echo "## names archived locally but not in remote listing (should be none):"; comm -13 "$OUT/remote-names.txt" "$OUT/local-names.txt" | sed 's/^/  EXTRA-LOCAL /'
  echo "## ledger cross-reference (name+hash already held under driver-ledger/*/journals):"
  ALREADY=0; NEWONLY=0
  while read -r h f; do
    hit="$(find "$ROOT/docs/programme/VOICE-2026/driver-ledger" -name "$f" -not -path '*/container-archive/*' 2>/dev/null | head -1)"
    if [ -n "$hit" ] && [ "$(shasum -a 256 "$hit" | cut -d' ' -f1)" = "$h" ]; then ALREADY=$((ALREADY+1)); echo "  ledgered   $f  $hit"; 
    elif [ -n "$hit" ]; then echo "  HASH-DIFFERS $f  $hit"; 
    else NEWONLY=$((NEWONLY+1)); echo "  archive-only $f"; fi
  done < "$OUT/manifest.sha256"
  echo "## already ledgered (name+hash): $ALREADY · archive-only: $NEWONLY"
  if [ "$REMOTE" -eq "$LOCAL" ] && [ "$FAIL" -eq 0 ] && [ -z "$(comm -3 "$OUT/remote-names.txt" "$OUT/local-names.txt")" ]; then
    echo "## verdict: RECONCILED — every remote journal has a local copy with a recorded hash. NOTHING DELETED."
  else
    echo "## verdict: NOT RECONCILED — do not delete anything until this is resolved. NOTHING DELETED."
  fi
} | tee "$OUT/reconcile.txt"
log "archive written: $OUT (nothing deleted on the device)"
