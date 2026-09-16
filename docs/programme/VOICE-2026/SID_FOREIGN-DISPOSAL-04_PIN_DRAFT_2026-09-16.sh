set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"
BID_K00=life.soullab.voicekernel.k00
BID_V01=life.soullab.voicekernel.vpio01
BID_HIST=life.soullab.voicekernel.vpio02
BID=life.soullab.voicekernel.vpio02sid
K00_C=0B07D423-97E7-4196-BC1C-C69C96F994BE
V01_C=6A2E406B-D1B8-43A4-92F3-29D50333AF19
HIST_C=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
RUNNER_SRC=b198e2e37058f2e059d986b4b148e224215f3ee3
XR_SHA=3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=/private/tmp/sid-fd04-out-$STAMP
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
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-before.json"
test "$(grep -ci VoiceKernelHarness "$OUT/processes-before.json")" = 3
test "$(grep -c "$K00_C/VoiceKernelHarness.app" "$OUT/processes-before.json")" = 1
test "$(grep -c "$V01_C/VoiceKernelHarness.app" "$OUT/processes-before.json")" = 1
test "$(grep -c "$HIST_C/VoiceKernelHarness.app" "$OUT/processes-before.json")" = 1
grep -i VoiceKernelHarness "$OUT/processes-before.json" | tee "$OUT/harness-processes-before.txt"
cd "$WTB"
xcrun devicectl device info lockState --device "$DEV" --json-output "$OUT/lockState-before-1.json"
test "$(grep -c '"passcodeRequired" : false' "$OUT/lockState-before-1.json")" = 1
test "$(grep -c '"unlockedSinceBoot" : true' "$OUT/lockState-before-1.json")" = 1
xcrun devicectl device info displays --device "$DEV" --json-output "$OUT/displays-before-1.json"
test "$(grep -c '"backlightState" : "activeOn"' "$OUT/displays-before-1.json")" = 1
TEST_RUNNER_K00_SUBJECT=phase-a xcodebuild test-without-building -xctestrun "$XR" -destination "id=$XDEST" -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-phase-a.log" | grep -E "Test Case|TEST (SUCCEEDED|FAILED)|error" | tail -4
grep -q '\*\* TEST SUCCEEDED \*\*' "$OUT/terminate-phase-a.log"
grep -q "testTerminateOnly\]' passed" "$OUT/terminate-phase-a.log"
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-mid.json"
test "$(grep -c "$K00_C/VoiceKernelHarness.app" "$OUT/processes-mid.json")" = 0
test "$(grep -c "$HIST_C/VoiceKernelHarness.app" "$OUT/processes-mid.json")" = 1
xcrun devicectl device info lockState --device "$DEV" --json-output "$OUT/lockState-before-2.json"
test "$(grep -c '"passcodeRequired" : false' "$OUT/lockState-before-2.json")" = 1
test "$(grep -c '"unlockedSinceBoot" : true' "$OUT/lockState-before-2.json")" = 1
xcrun devicectl device info displays --device "$DEV" --json-output "$OUT/displays-before-2.json"
test "$(grep -c '"backlightState" : "activeOn"' "$OUT/displays-before-2.json")" = 1
TEST_RUNNER_K00_SUBJECT=vpio-01 xcodebuild test-without-building -xctestrun "$XR" -destination "id=$XDEST" -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-vpio-01.log" | grep -E "Test Case|TEST (SUCCEEDED|FAILED)|error" | tail -4
grep -q '\*\* TEST SUCCEEDED \*\*' "$OUT/terminate-vpio-01.log"
grep -q "testTerminateOnly\]' passed" "$OUT/terminate-vpio-01.log"
xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-after.json"
test "$(grep -c "$K00_C/VoiceKernelHarness.app" "$OUT/processes-after.json")" = 0
test "$(grep -c "$V01_C/VoiceKernelHarness.app" "$OUT/processes-after.json")" = 0
test "$(grep -c "$HIST_C/VoiceKernelHarness.app" "$OUT/processes-after.json")" = 1
test "$(grep -ci VoiceKernelHarness "$OUT/processes-after.json")" = 1
for b in "$BID_K00" "$BID_V01" "$BID_HIST" "$BID"; do xcrun devicectl device info apps --device "$DEV" --bundle-id "$b" --json-output "$OUT/apps-after-$b.json"; done
test "$(grep -c "\"bundleIdentifier\" : \"$BID_K00\"" "$OUT/apps-after-$BID_K00.json")" = 1
test "$(grep -c "\"bundleIdentifier\" : \"$BID_V01\"" "$OUT/apps-after-$BID_V01.json")" = 1
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-after-$BID_HIST.json")" = 1
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$OUT/apps-after-$BID.json")" = 0
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-fd04-$STAMP.SHA256SUMS.disposal"
mv "/private/tmp/sid-fd04-$STAMP.SHA256SUMS.disposal" "$OUT/SHA256SUMS.disposal"
echo "SID-FOREIGN-DISPOSAL-04 $STAMP runner $RUNNER_SRC targets $K00_C $V01_C preserved $HIST_C harness-after 1 out $OUT"
