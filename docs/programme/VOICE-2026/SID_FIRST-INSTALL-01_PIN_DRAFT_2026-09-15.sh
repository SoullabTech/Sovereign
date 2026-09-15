set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
SHA=3035c02353b3cc0dab0b0ce1823116d6712b8eb1
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
BID=life.soullab.voicekernel.vpio02sid
BID_HIST=life.soullab.voicekernel.vpio02
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
UUID_PIN=4A6AD464-0A19-320F-980E-7446F6AA1440
DYLIB_PIN=a15b399d9a9a3c1071d12ba3c4fb24a56b3f6e51c708f8d3c5dd9cb811bdfc44
EXEC_PIN=db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17
MAN_PIN=699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4
APP=/private/tmp/sid-mac-compile-02-$SUBJECT_SHA-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-first-install-01-$SHA
OUT=/private/tmp/sid-first-install-01-out-$STAMP
test ! -e "$WT"
test ! -e "$OUT"
test -d "$APP"
test "$(shasum -a 256 "$APP/VoiceKernelHarness.debug.dylib" | cut -d' ' -f1)" = "$DYLIB_PIN"
test "$(shasum -a 256 "$APP/VoiceKernelHarness" | cut -d' ' -f1)" = "$EXEC_PIN"
dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib" | grep -q "$UUID_PIN"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git worktree add --detach "$WT" "$SHA"
cd "$WT"
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-reinstall.sh)"
MAN="$WT/docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-02-20260915T214212Z/SID-MAC-COMPILE-02.manifest.sha256"
test "$(shasum -a 256 "$MAN" | cut -d' ' -f1)" = "$MAN_PIN"
test "$(wc -l < "$MAN" | tr -d ' ')" = 7
( cd "$APP" && shasum -a 256 -c "$MAN" >/dev/null )
test "$(cd "$APP" && find . -type f | LC_ALL=C sort)" = "$(awk '{print $2}' "$MAN" | LC_ALL=C sort)"
mkdir -p "$OUT"
git rev-parse HEAD | tee "$OUT/head.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-before-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-before-vpio02.json")" = 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$OUT/apps-before-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$OUT/apps-before-vpio02sid.json")" = 0
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-before.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-before.json")" = 0
K00_SUBJECT=vpio-02-sid K00_DEVICE="$DEV" K00_EXPECT_UUID="$UUID_PIN" K00_EXPECT_DYLIB_SHA="$DYLIB_PIN" K00_EXPECT_MANIFEST="$MAN" scripts/witness/k00-reinstall.sh "$OUT" "$APP" 2>&1 | tee "$OUT/reinstall-invocation.log"
RSTAMP=$(cat "$OUT/.last-reinstall")
R="$OUT/reinstall-$RSTAMP.txt"
test -f "$R"
CONTAINER=$(grep -o '/Bundle/Application/[0-9A-F-]*/VoiceKernelHarness.app' "$R" | head -1 | cut -d/ -f4)
test -n "$CONTAINER"
echo "$CONTAINER" | tee "$OUT/container.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-after-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-after-vpio02.json")" = 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$OUT/apps-after-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$OUT/apps-after-vpio02sid.json")" = 1
test "$(grep -c "$CONTAINER" "$OUT/apps-after-vpio02sid.json")" -ge 1
test "$(grep -c "$CONTAINER" "$OUT/apps-after-vpio02.json")" = 0
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-after.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-after.json")" = 0
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-first-install-01-$STAMP.SHA256SUMS.install"
mv "/private/tmp/sid-first-install-01-$STAMP.SHA256SUMS.install" "$OUT/SHA256SUMS.install"
echo "SID-FIRST-INSTALL-01 $STAMP subject $SUBJECT_SHA instrument $SHA container $CONTAINER out $OUT"
