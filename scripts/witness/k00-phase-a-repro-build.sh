#!/usr/bin/env bash
# PHASE-A-REPRO-01 — the pinned build of source 4596b9bdb as a NEW reproduction subject (founder ruling 2026-09-13).
# BUILD ONLY. This script never installs. Custody is written BEFORE any install is possible.
#
#   usage: scripts/witness/k00-phase-a-repro-build.sh [<worktree-dir>]      (default /private/tmp/phase-a-repro-01)
#
#   1. verify every environment pin (MAC-COMPILE-06 as pinned in the plan §2) — any MISMATCH → STOP before building (exit 5)
#   2. fresh detached worktree at exactly 4596b9bdb, clean tree, swift build + swift test recorded
#   3. xcodegen generate · build UNSIGNED · build SIGNED — into a FRESH, DEDICATED DerivedData under the worktree
#      (the shared product path that holds the P5-B0 build is never touched)
#   4. record dylib UUID (unsigned, then signed) · SHA-256 of the signed dylib · per-file SHA-256 manifest of the signed .app · codesign
#   5. UUID gate: == 11A057AA-4A3C-3CAE-8C28-E29792489459 → CONTINUE as PHASE-A-REPRO-01 (still a NEW subject; historical claim NONE)
#                 differs → STOP · NO INSTALL · founder ruling required (exit 3)
# Output: docs/programme/VOICE-2026/driver-ledger/phase-a-repro-01/build-<stamp>.txt + manifest-<stamp>.sha256
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WT="${1:-/private/tmp/phase-a-repro-01}"
SRC_SHA="4596b9bdb"; EXPECT_UUID="11A057AA-4A3C-3CAE-8C28-E29792489459"
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"; TEAM="ZVK2X646Z2"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$ROOT/docs/programme/VOICE-2026/driver-ledger/phase-a-repro-01"; mkdir -p "$OUT"
REC="$OUT/build-$STAMP.txt"; MAN="$OUT/manifest-$STAMP.sha256"
say(){ echo "$*" | tee -a "$REC"; }
stop(){ say "## STOP — $*"; say "nothing installed; the device is untouched"; exit "${2:-5}"; }
say "# PHASE-A-REPRO-01 build $STAMP · source $SRC_SHA · expected dylib UUID $EXPECT_UUID · historical claim NONE"
# 1. pins
say "## environment pins"
MIS=0
pin(){ local name="$1" want="$2" got="$3"; if [[ "$got" == *"$want"* ]]; then say "  MATCH     $name: $got"; else say "  MISMATCH  $name: want '$want' got '$got'"; MIS=$((MIS+1)); fi; }
pin "macOS" "15.7.8" "$(sw_vers -productVersion 2>/dev/null) ($(sw_vers -buildVersion 2>/dev/null))"
pin "macOS build" "24G806" "$(sw_vers -buildVersion 2>/dev/null)"
XV="$(xcodebuild -version 2>/dev/null | tr '\n' ' ')"; pin "Xcode" "Xcode 26.3" "$XV"; pin "Xcode build" "17C529" "$XV"
pin "xcode-select" "/Applications/Xcode.app" "$(xcode-select -p 2>/dev/null)"
SV="$(swift --version 2>&1 | head -1)"; pin "Swift" "swiftlang-6.2.4.1.4 clang-1700.6.4.2" "$SV"
pin "iOS SDK" "iphoneos26.2" "$(xcodebuild -showsdks 2>/dev/null | grep -oE 'iphoneos[0-9.]+' | sort -u | tr '\n' ' ')"
say "  RECORD    xcodegen: $(xcodegen --version 2>&1 | head -1)   (not pinned by the compile records; recorded)"
[ "$MIS" -eq 0 ] || stop "$MIS environment pin(s) MISMATCH — return the mismatch to the founder; not built" 5
# 2. worktree at the exact SHA
say "## source"
if [ -d "$WT/.git" ] || [ -f "$WT/.git" ]; then say "  worktree exists: $WT"; else git -C "$ROOT" worktree add --detach "$WT" "$SRC_SHA" >>"$REC" 2>&1 || stop "worktree add failed" 6; fi
HEAD="$(git -C "$WT" rev-parse --short=9 HEAD)"; say "  HEAD: $HEAD"
[[ "$HEAD" == "$SRC_SHA"* ]] || stop "worktree HEAD $HEAD is not $SRC_SHA" 6
DIRTY="$(git -C "$WT" status --porcelain | wc -l | tr -d ' ')"; say "  dirty entries: $DIRTY"; [ "$DIRTY" -eq 0 ] || stop "worktree not clean" 6
say "## swift build / swift test (ios/VoiceKernel at $SRC_SHA)"
( cd "$WT/ios/VoiceKernel" && swift build 2>&1 | tail -2 && swift test 2>&1 | grep -E "Executed|error" | tail -2 ) | tee -a "$REC"
# 3. builds into a dedicated DerivedData
DD="$WT/.derived-phase-a-repro-01"; APP="$DD/Build/Products/Debug-iphoneos/VoiceKernelHarness.app"; DYL="$APP/VoiceKernelHarness.debug.dylib"
say "## DerivedData (fresh, dedicated): $DD"
cd "$WT/ios/VoiceKernelHarness" || stop "harness dir missing" 6
say "## xcodegen generate"; xcodegen generate 2>&1 | tail -1 | tee -a "$REC"
say "## build UNSIGNED"
xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO -derivedDataPath "$DD" build > "$OUT/xcodebuild-unsigned-$STAMP.log" 2>&1
grep -E "\*\* BUILD (SUCCEEDED|FAILED) \*\*" "$OUT/xcodebuild-unsigned-$STAMP.log" | tee -a "$REC"
U1="$(dwarfdump --uuid "$DYL" 2>/dev/null | awk '/UUID:/{print $2; exit}')"; say "  unsigned dylib UUID: ${U1:-<none>}"
say "## build SIGNED (destination id=$XDEST · team $TEAM)"
xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination "id=$XDEST" DEVELOPMENT_TEAM=$TEAM CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates -derivedDataPath "$DD" build > "$OUT/xcodebuild-signed-$STAMP.log" 2>&1
grep -E "\*\* BUILD (SUCCEEDED|FAILED) \*\*" "$OUT/xcodebuild-signed-$STAMP.log" | tee -a "$REC"
grep -q "BUILD SUCCEEDED" "$OUT/xcodebuild-signed-$STAMP.log" || stop "signed build did not succeed (log $OUT/xcodebuild-signed-$STAMP.log)" 7
# 4. custody BEFORE any install
say "## custody (signed product, BEFORE any install)"
U2="$(dwarfdump --uuid "$DYL" 2>/dev/null | awk '/UUID:/{print $2; exit}')"; say "  signed dylib UUID:   ${U2:-<none>}"
say "  signed dylib SHA-256: $(shasum -a 256 "$DYL" | cut -d' ' -f1)"
( cd "$APP" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$MAN"; say "  app per-file manifest: $MAN ($(wc -l < "$MAN" | tr -d ' ') files)"
say "  manifest SHA-256: $(shasum -a 256 "$MAN" | cut -d' ' -f1)"
codesign -dv "$APP" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' | sed 's/^/  /' | tee -a "$REC"
say "  app path: $APP"
# 5. UUID gate
if [ "$U2" = "$EXPECT_UUID" ]; then
  say "## UUID GATE: MATCH — continue as PHASE-A-REPRO-01 (a NEW reproduction subject; UUID match = evidence of same source+toolchain, NOT custody identity)"
  say "next (founder, one reinstall, none inside the stage): K00_EXPECT_UUID=$EXPECT_UUID scripts/witness/k00-reinstall.sh docs/programme/VOICE-2026/driver-ledger $APP"
  say "then: scripts/witness/k00-driver-batch.sh PHASE-A-REPRO-01 30 --mode L --subject phase-a"
  exit 0
fi
stop "UUID GATE: signed dylib reads '${U2:-<none>}' ≠ expected $EXPECT_UUID — NO INSTALL; founder ruling required" 3
