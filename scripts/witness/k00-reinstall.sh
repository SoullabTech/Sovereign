#!/usr/bin/env bash
# DRIVER-01 — Stage-B boundary: reinstall the EXACT harness product and write the three identity
# artefacts the orchestrator requires before any post-reinstall sample may run.
#   usage: scripts/witness/k00-reinstall.sh <ledger-dir> [app-path]
set -euo pipefail
LEDGER="${1:?ledger dir}"; mkdir -p "$LEDGER"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID="life.soullab.voicekernel.k00"
APP="${2:-$HOME/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-afqjfcjktctgkjbejscivlpbxqtc/Build/Products/Debug-iphoneos/VoiceKernelHarness.app}"
[ -d "$APP" ] || { echo "app product not found: $APP" >&2; exit 2; }
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
{
  echo "# reinstall $STAMP"
  echo "## dylib uuid (local product, BEFORE install)"
  dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib"
  echo "## codesign"
  codesign -dv "$APP" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' || true
  echo "## install"
  xcrun devicectl device install app --device "$DEV" "$APP" 2>&1
  echo "## post-install processes (harness must be absent)"
  xcrun devicectl device info processes --device "$DEV" 2>&1 | grep -i VoiceKernelHarness || echo "(no VoiceKernelHarness process)"
} | tee "$LEDGER/reinstall-$STAMP.txt"
echo "$STAMP" > "$LEDGER/.last-reinstall"
echo "reinstall artefacts written: $LEDGER/reinstall-$STAMP.txt"
