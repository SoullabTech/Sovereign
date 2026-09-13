#!/usr/bin/env bash
# DRIVER-01 — Stage-C custody gate, step 1: LOCATE the exact historical binary by its debug-dylib UUID.
#   usage: scripts/witness/k00-locate-binding.sh <expected-uuid> [<ledger-dir>] [extra search roots...]
# Walks the default roots (Xcode DerivedData, Archives, the repo's ios/ tree, the ledger worktree) for every
# VoiceKernelHarness.debug.dylib and VoiceKernelHarness.app, prints each one's UUID, and names the MATCHES.
# Reads only. Installs nothing, builds nothing. Writes locate-<stamp>.txt into the ledger dir when one is given.
# If no match is found the answer is STOP (founder ruling 2026-09-13): the Phase-A subject cannot be reproduced by
# rebuilding; a rebuild would be a new subject needing its own ruling.
set -uo pipefail
EXPECT="${1:?expected dylib UUID}"; LEDGER="${2:-}"; shift; [ $# -gt 0 ] && shift
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ROOTS=("$HOME/Library/Developer/Xcode/DerivedData" "$HOME/Library/Developer/Xcode/Archives" "$ROOT/ios" "/private/tmp/voice-driver-01/ios" "$@")
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${LEDGER:+$LEDGER/locate-$STAMP.txt}"; [ -n "$LEDGER" ] && mkdir -p "$LEDGER"
{
  echo "# locate $STAMP — expected dylib UUID $EXPECT"
  MATCH=0; SEEN=0
  for r in "${ROOTS[@]}"; do
    [ -d "$r" ] || { echo "(root absent: $r)"; continue; }
    while IFS= read -r f; do
      SEEN=$((SEEN+1))
      U="$(dwarfdump --uuid "$f" 2>/dev/null | awk '/UUID:/{print $2; exit}')"
      M="$(stat -f '%Sm' -t '%Y-%m-%dT%H:%M:%S' "$f" 2>/dev/null || echo '?')"
      if [ "$U" = "$EXPECT" ]; then MATCH=$((MATCH+1)); echo "MATCH   $U  mtime $M  $f"; else echo "other   ${U:-<no uuid>}  mtime $M  $f"; fi
    done < <(find "$r" -name 'VoiceKernelHarness.debug.dylib' -type f 2>/dev/null)
  done
  echo "## summary: $SEEN dylib(s) inspected, $MATCH matching $EXPECT"
  if [ "$MATCH" -eq 0 ]; then
    echo "## verdict: NOT FOUND — STOP. The exact historical binary is not on this Mac under the searched roots. Do not rebuild."
  else
    echo "## verdict: FOUND — the .app containing a MATCH line is the only lawful Stage-C install source (pass its .app path to k00-reinstall.sh with K00_EXPECT_UUID=$EXPECT)."
  fi
} | if [ -n "$OUT" ]; then tee "$OUT"; else cat; fi
