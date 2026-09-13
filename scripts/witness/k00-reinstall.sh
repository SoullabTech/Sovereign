#!/usr/bin/env bash
# DRIVER-01 — Stage-B boundary: reinstall the EXACT harness product and write the three identity
# artefacts the orchestrator requires before any post-reinstall sample may run.
#   usage: scripts/witness/k00-reinstall.sh <ledger-dir> [app-path]
#   env:   K00_EXPECT_UUID=<dylib UUID>  — Stage-C custody gate (founder ruling 2026-09-13): the product's
#          VoiceKernelHarness.debug.dylib UUID is read BEFORE install and must equal this value exactly;
#          on any other reading the script writes a REFUSED artefact and exits 3 with NOTHING installed.
#          A rebuild is never a substitute for the historical binary — it is a new subject needing its own ruling.
#          K00_EXPECT_DYLIB_SHA=<sha256>       — PHASE-A-REPRO-01 R1 custody (founder ruling 2026-09-13): the signed
#          K00_EXPECT_MANIFEST=<manifest.sha256>  dylib SHA-256 and the per-file manifest recorded at build time must
#          verify unchanged against the product BEFORE install; any mismatch → REFUSED artefact, exit 3, nothing installed.
set -euo pipefail
LEDGER="${1:?ledger dir}"; mkdir -p "$LEDGER"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID="life.soullab.voicekernel.k00"
APP="${2:-$HOME/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-afqjfcjktctgkjbejscivlpbxqtc/Build/Products/Debug-iphoneos/VoiceKernelHarness.app}"
EXPECT="${K00_EXPECT_UUID:-}"
EXPECT_SHA="${K00_EXPECT_DYLIB_SHA:-}"
EXPECT_MAN="${K00_EXPECT_MANIFEST:-}"
[ -d "$APP" ] || { echo "app product not found: $APP" >&2; exit 2; }
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DYL="$APP/VoiceKernelHarness.debug.dylib"
UUID_LINE="$(dwarfdump --uuid "$DYL" 2>&1)"
UUID="$(awk '/UUID:/{print $2; exit}' <<<"$UUID_LINE")"
DYL_SHA="$(shasum -a 256 "$DYL" 2>/dev/null | cut -d' ' -f1 || true)"
MAN_RESULT=""; MAN_FILES=""
if [ -n "$EXPECT_MAN" ]; then
  if [ ! -f "$EXPECT_MAN" ]; then MAN_RESULT="MANIFEST FILE MISSING: $EXPECT_MAN"
  else
    MAN_FILES="$(wc -l < "$EXPECT_MAN" | tr -d ' ')"
    # every listed file must hash identically AND the product must contain no file the manifest does not list
    MAN_CHECK="$(cd "$APP" && LC_ALL=C shasum -a 256 -c "$EXPECT_MAN" 2>&1 || true)"
    LIVE_LIST="$(cd "$APP" && find . -type f | LC_ALL=C sort)"
    MAN_LIST="$(awk '{print $2}' "$EXPECT_MAN" | LC_ALL=C sort)"
    if grep -qvE ': OK$' <<<"$MAN_CHECK"; then MAN_RESULT="MANIFEST MISMATCH"$'\n'"$MAN_CHECK"
    elif [ "$LIVE_LIST" != "$MAN_LIST" ]; then MAN_RESULT="MANIFEST FILE-SET MISMATCH"$'\n'"$(diff <(echo "$MAN_LIST") <(echo "$LIVE_LIST") || true)"
    else MAN_RESULT="OK"; fi
  fi
fi
REFUSE=""
[ -n "$EXPECT" ] && [ "$UUID" != "$EXPECT" ] && REFUSE="uuid"
[ -n "$EXPECT_SHA" ] && [ "$DYL_SHA" != "$EXPECT_SHA" ] && REFUSE="${REFUSE:+$REFUSE,}dylib-sha"
[ -n "$EXPECT_MAN" ] && [ "$MAN_RESULT" != "OK" ] && REFUSE="${REFUSE:+$REFUSE,}manifest"
if [ -n "$REFUSE" ]; then
  {
    echo "# reinstall $STAMP — REFUSED (custody gate: $REFUSE)"
    echo "expected dylib UUID: ${EXPECT:-<not required>}"
    echo "product dylib UUID:  ${UUID:-<unreadable>}"
    echo "expected dylib SHA-256: ${EXPECT_SHA:-<not required>}"
    echo "product dylib SHA-256:  ${DYL_SHA:-<unreadable>}"
    echo "manifest: ${EXPECT_MAN:-<not required>} → ${MAN_RESULT:-<not checked>}"
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
  [ -n "$EXPECT_SHA" ] && echo "## custody gate: dylib SHA-256 expected $EXPECT_SHA — product reads $DYL_SHA — MATCH"
  [ -n "$EXPECT_MAN" ] && echo "## custody gate: manifest $EXPECT_MAN ($MAN_FILES files) — every file hashes identically, file set identical — MATCH"
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
