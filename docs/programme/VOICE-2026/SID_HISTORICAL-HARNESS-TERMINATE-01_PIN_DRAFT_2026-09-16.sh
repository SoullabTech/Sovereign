set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
SHA=3035c02353b3cc0dab0b0ce1823116d6712b8eb1
BID_HIST=life.soullab.voicekernel.vpio02
BID=life.soullab.voicekernel.vpio02sid
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-hht-01-$SHA
OUT=/private/tmp/sid-hht-01-out-$STAMP
test ! -e "$WT"
test ! -e "$OUT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git worktree add --detach "$WT" "$SHA"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-reinstall.sh ios/VoiceKernelDriver)"
mkdir -p "$OUT"
git rev-parse HEAD | tee "$OUT/head.txt"
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-before.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-before.json")" -ge 1
grep -i VoiceKernelHarness "$OUT/processes-before.json" | tee "$OUT/harness-processes-before.txt"
test "$(grep -c "$HIST_CONTAINER/VoiceKernelHarness.app" "$OUT/processes-before.json")" -ge 1
test "$(grep -ic VoiceKernelHarness "$OUT/processes-before.json")" = "$(grep -c "$HIST_CONTAINER/VoiceKernelHarness.app" "$OUT/processes-before.json")"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$OUT/apps-before-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$OUT/apps-before-vpio02sid.json")" = 0
( cd ios/VoiceKernelDriver && xcodegen generate ) > "$OUT/xcodegen.log" 2>&1
PROJ="$WT/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj"
DD="$WT/ios/VoiceKernelDriver/.derived"
xcodebuild build-for-testing -project "$PROJ" -scheme DriverUITests -destination "id=$XDEST" -derivedDataPath "$DD" DEVELOPMENT_TEAM="${K00_TEAM:-ZVK2X646Z2}" > "$OUT/build-for-testing.log" 2>&1
XCTESTRUN="$(ls -t "$DD"/Build/Products/*.xctestrun | head -1)"
echo "$XCTESTRUN" | tee "$OUT/xctestrun.txt"
DIAG_FLAGS=""
if xcodebuild -help 2>&1 | grep -q -- '-collect-test-diagnostics'; then DIAG_FLAGS="-collect-test-diagnostics never"; fi
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-just-before-terminate.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-just-before-terminate.json")" -ge 1
test "$(grep -ic VoiceKernelHarness "$OUT/processes-just-before-terminate.json")" = "$(grep -c "$HIST_CONTAINER/VoiceKernelHarness.app" "$OUT/processes-just-before-terminate.json")"
grep -i VoiceKernelHarness "$OUT/processes-just-before-terminate.json" | tee "$OUT/harness-processes-just-before-terminate.txt"
env TEST_RUNNER_K00_MODE=L TEST_RUNNER_K00_VP=on TEST_RUNNER_K00_HOLD_S=15 TEST_RUNNER_K00_W4_MS=500 TEST_RUNNER_K00_SUBJECT=vpio-02 xcodebuild test-without-building -xctestrun "$XCTESTRUN" -destination "id=$XDEST" $DIAG_FLAGS -only-testing:"DriverUITests/K00DriverTests/testTerminateOnly" 2>&1 | tee "$OUT/terminate-only.log" | grep -E "Test Case|TEST (SUCCEEDED|FAILED)|error" | tail -4
grep -q '\*\* TEST SUCCEEDED \*\*' "$OUT/terminate-only.log"
grep -q "testTerminateOnly\]' passed" "$OUT/terminate-only.log"
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-after.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-after.json")" = 0
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-after-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-after-vpio02.json")" = 1
test "$(grep -c "$HIST_CONTAINER" "$OUT/apps-after-vpio02.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$OUT/apps-after-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$OUT/apps-after-vpio02sid.json")" = 0
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-hht-01-$STAMP.SHA256SUMS.terminate"
mv "/private/tmp/sid-hht-01-$STAMP.SHA256SUMS.terminate" "$OUT/SHA256SUMS.terminate"
echo "SID-HISTORICAL-HARNESS-TERMINATE-01 $STAMP instrument $SHA historical $BID_HIST container $HIST_CONTAINER harness-after 0 out $OUT"
