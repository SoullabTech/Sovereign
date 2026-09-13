#!/usr/bin/env bash
# DRIVER-01 — Stage-B boundary: reinstall the EXACT harness product and write the three identity
# artefacts the orchestrator requires before any post-reinstall sample may run.
#   usage: scripts/witness/k00-reinstall.sh <ledger-dir> [app-path]
#   env:   K00_EXPECT_UUID=<dylib UUID>  — Stage-C custody gate (founder ruling 2026-09-13): the product's
#          VoiceKernelHarness.debug.dylib UUID is read BEFORE install and must equal this value exactly;
#          on any other reading the script writes a REFUSED artefact and exits 3 with NOTHING installed.
#          A rebuild is never a substitute for the historical binary — it is a new subject needing its own ruling.
set -euo pipefail
LEDGER="${1:?ledger dir}"; mkdir -p "$LEDGER"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID="life.soullab.voicekernel.k00"
APP="${2:-$HOME/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-afqjfcjktctgkjbejscivlpbxqtc/Build/Products/Debug-iphoneos/VoiceKernelHarness.app}"
EXPECT="${K00_EXPECT_UUID:-}"
[ -d "$APP" ] || { echo "app product not found: $APP" >&2; exit 2; }
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
UUID_LINE="$(dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib" 2>&1)"
UUID="$(awk '/UUID:/{print $2; exit}' <<<"$UUID_LINE")"
if [ -n "$EXPECT" ] && [ "$UUID" != "$EXPECT" ]; then
  {
    echo "# reinstall $STAMP — REFUSED (custody gate)"
    echo "expected dylib UUID: $EXPECT"
    echo "product dylib UUID:  ${UUID:-<unreadable>}"
    echo "product: $APP"
    echo "$UUID_LINE"
    echo "verdict: the product at this path is NOT the expected binary; nothing was installed; the device is untouched."
    echo "rule (founder, 2026-09-13): if that exact binary no longer exists, STOP. Do not rebuild and call the result the historical subject."
  } | tee "$LEDGER/reinstall-$STAMP.REFUSED.txt"
  exit 3
fi
{
  echo "# reinstall $STAMP"
  [ -n "$EXPECT" ] && echo "## custody gate: expected $EXPECT — product reads $UUID — MATCH"
  echo "## dylib uuid (local product, BEFORE install)"
  echo "$UUID_LINE"
  echo "## codesign"
  codesign -dv "$APP" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' || true
  echo "## install"
  xcrun devicectl device install app --device "$DEV" "$APP" 2>&1
  echo "## post-install processes (harness must be absent)"
  xcrun devicectl device info processes --device "$DEV" 2>&1 | grep -i VoiceKernelHarness || echo "(no VoiceKernelHarness process)"
} | tee "$LEDGER/reinstall-$STAMP.txt"
echo "$STAMP" > "$LEDGER/.last-reinstall"
echo "reinstall artefacts written: $LEDGER/reinstall-$STAMP.txt"
