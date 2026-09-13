#!/usr/bin/env bash
# DRIVER-01 housekeeping step E — capture the installed devicectl's OWN documentation of its verbs, so that a
# container deletion (step F) is implemented only from a documented verb and never from a guess (the voided
# `device info crashes` query is the precedent). Reads only. Touches no device state.
#   usage: scripts/witness/k00-devicectl-probe.sh            → docs/programme/VOICE-2026/driver-ledger/devicectl-probe-<stamp>/
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$ROOT/docs/programme/VOICE-2026/driver-ledger/devicectl-probe-$STAMP"; mkdir -p "$OUT"
{ echo "# devicectl probe $STAMP"; xcrun devicectl --version 2>&1; xcodebuild -version 2>&1; } > "$OUT/versions.txt"
xcrun devicectl --help            > "$OUT/devicectl-help.txt" 2>&1
xcrun devicectl device --help     > "$OUT/device-help.txt" 2>&1
xcrun devicectl device info --help > "$OUT/device-info-help.txt" 2>&1
xcrun devicectl device copy --help > "$OUT/device-copy-help.txt" 2>&1
# every verb the top two help pages list is expanded one level, so a delete/remove verb — if the tool has one — is
# captured with its documented arguments rather than inferred.
grep -oE '^\s{2,}[a-z][a-z-]+' "$OUT/device-help.txt" | tr -d ' ' | sort -u | while read -r v; do
  xcrun devicectl device "$v" --help > "$OUT/device-$v-help.txt" 2>&1
done
{ echo "## verbs mentioning delete/remove/rm/unlink/erase (documentation text, not an implementation):"
  grep -rniE 'delete|remove|unlink|erase|\brm\b' "$OUT"/*.txt | sed 's#'"$OUT"'/##' || echo "(none found in the captured help pages)"; } | tee "$OUT/SUMMARY.txt"
echo "probe written: $OUT"
