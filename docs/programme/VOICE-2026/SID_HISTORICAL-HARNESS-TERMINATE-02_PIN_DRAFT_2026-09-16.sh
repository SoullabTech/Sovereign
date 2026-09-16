set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"
BID_HIST=life.soullab.voicekernel.vpio02
BID_SID=life.soullab.voicekernel.vpio02sid
HIST_C=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
SID_C=85948DBD-BA8F-4679-950D-31767B1C24E5
RUNNER_SRC=b198e2e37058f2e059d986b4b148e224215f3ee3
XR_SHA=3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=/private/tmp/sid-hht-02-out-$STAMP
WTB=/private/tmp/k0506-disposal-b198e2e37
XR="$WTB/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun"
test ! -e "$OUT"
test -e "$WTB/.git"
test "$(git -C "$WTB" rev-parse HEAD)" = "$RUNNER_SRC"
git -C "$WTB" diff --quiet -- ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift
test -f "$XR"
test "$(shasum -a 256 "$XR" | cut -d' ' -f1)" = "$XR_SHA"
mkdir -p "$OUT"
echo "$STAMP" > "$OUT/stamp.txt"
( cd "$(dirname "$XR")" && shasum -a 256 "$(basename "$XR")" Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost ) | tee "$OUT/runner-custody.sha256"
test "$(wc -l < "$OUT/runner-custody.sha256" | tr -d ' ')" = 4
echo "REQUALIFICATION PASS runner $RUNNER_SRC xctestrun $XR_SHA" | tee "$OUT/requal.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-before-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-before-vpio02.json")" = 1
test "$(grep -c "$HIST_C" "$OUT/apps-before-vpio02.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_SID" --json-output "$OUT/apps-before-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_SID\"" "$OUT/apps-before-vpio02sid.json")" = 1
test "$(grep -c "$SID_C" "$OUT/apps-before-vpio02sid.json")" -ge 1
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-before.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-before.json")" = 1
test "$(grep -c "$HIST_C/VoiceKernelHarness.app" "$OUT/processes-before.json")" = 1
grep -i VoiceKernelHarness "$OUT/processes-before.json" | tee "$OUT/harness-processes-before.txt"
xcrun devicectl device info lockState --device "$DEV" --json-output "$OUT/lockState-before.json"
test "$(grep -c '"passcodeRequired" : false' "$OUT/lockState-before.json")" = 1
test "$(grep -c '"unlockedSinceBoot" : true' "$OUT/lockState-before.json")" = 1
xcrun devicectl device info displays --device "$DEV" --json-output "$OUT/displays-before.json"
test "$(grep -c '"backlightState" : "activeOn"' "$OUT/displays-before.json")" = 1
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-just-before.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-just-before.json")" = 1
test "$(grep -c "$HIST_C/VoiceKernelHarness.app" "$OUT/processes-just-before.json")" = 1
cd "$WTB"
TEST_RUNNER_K00_SUBJECT=vpio-02 xcodebuild test-without-building -xctestrun "$XR" -destination "id=$XDEST" -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-vpio02.log" | grep -E "Test Case|TEST (SUCCEEDED|FAILED)|error" | tail -4
grep -q '\*\* TEST SUCCEEDED \*\*' "$OUT/terminate-vpio02.log"
grep -q "testTerminateOnly\]' passed" "$OUT/terminate-vpio02.log"
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-after.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-after.json")" = 0
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-after-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-after-vpio02.json")" = 1
test "$(grep -c "$HIST_C" "$OUT/apps-after-vpio02.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_SID" --json-output "$OUT/apps-after-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_SID\"" "$OUT/apps-after-vpio02sid.json")" = 1
test "$(grep -c "$SID_C" "$OUT/apps-after-vpio02sid.json")" -ge 1
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-hht-02-$STAMP.SHA256SUMS.terminate"
mv "/private/tmp/sid-hht-02-$STAMP.SHA256SUMS.terminate" "$OUT/SHA256SUMS.terminate"
echo "SID-HISTORICAL-HARNESS-TERMINATE-02 $STAMP runner $RUNNER_SRC historical $HIST_C sid-preserved $SID_C harness-after 0 out $OUT"
