set -o pipefail
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID_HIST=life.soullab.voicekernel.vpio02
BID=life.soullab.voicekernel.vpio02sid
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
T01OUT=/private/tmp/sid-hht-01-out-20260916T002922Z
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
test -d "$T01OUT" || { echo "REFUSED: terminate-01 \$OUT missing"; exit 2; }
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01 || exit 2
WT=/private/tmp/sid-step2-diag-$STAMP
test ! -e "$WT" || exit 2
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01 || exit 2
cd "$WT" || exit 2
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-step2-diagnostics-$STAMP || exit 2
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-STEP2-DIAG-$STAMP
mkdir -p "$DEST"
echo "read 1: full terminate-only.log (copy; the STOP carrier carries the original)"
cp "$T01OUT/terminate-only.log" "$DEST/terminate-only.log"
wc -l "$DEST/terminate-only.log" | tee "$DEST/read1-terminate-only-linecount.txt"
grep -n -i "error\|fail\|timed out\|automation\|Test Case\|TEST " "$DEST/terminate-only.log" > "$DEST/read1-terminate-only-signals.txt" 2>&1 || true
echo "read 2: xcresult bundle (read-only; path as the runner named it)"
XCR=$(ls -dt /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelDriver-*/Logs/Test/Test-DriverUITests-2026.09.15_20-29-32--0400.xcresult 2>/dev/null | head -1)
echo "${XCR:-<not found>}" | tee "$DEST/read2-xcresult-path.txt"
if [ -n "$XCR" ]; then
  ls -la "$XCR" >> "$DEST/read2-xcresult-path.txt" 2>&1
  xcrun xcresulttool version > "$DEST/read2-xcresulttool-version.txt" 2>&1 || true
  xcrun xcresulttool get test-results summary --path "$XCR" > "$DEST/read2-xcresult-summary.json" 2> "$DEST/read2-xcresult-summary.stderr" || true
  xcrun xcresulttool get log --type action --path "$XCR" > "$DEST/read2-xcresult-action-log.txt" 2> "$DEST/read2-xcresult-action-log.stderr" || true
  xcrun xcresulttool get object --legacy --format json --path "$XCR" > "$DEST/read2-xcresult-object-legacy.json" 2> "$DEST/read2-xcresult-object-legacy.stderr" || true
  wc -c "$DEST"/read2-xcresult-*.json "$DEST"/read2-xcresult-action-log.txt 2>/dev/null | tee -a "$DEST/read2-xcresult-path.txt"
fi
echo "read 3: devicectl capability discovery (help text only; nothing invoked from it)"
xcrun devicectl --version > "$DEST/read3-devicectl-version.txt" 2>&1 || true
xcrun devicectl device info --help > "$DEST/read3-devicectl-device-info-help.txt" 2>&1 || true
xcrun devicectl device --help > "$DEST/read3-devicectl-device-help.txt" 2>&1 || true
grep -n -i "lock\|screen\|wake\|sleep\|display" "$DEST"/read3-devicectl-*-help.txt > "$DEST/read3-lock-screen-signals.txt" 2>&1 || true
echo "read 4: current device state (observation only)"
xcrun devicectl device info processes --device "$DEV" --json-output "$DEST/read4-processes.json" > "$DEST/read4-processes.stdout" 2>&1 || true
grep -i VoiceKernelHarness "$DEST/read4-processes.json" > "$DEST/read4-harness-processes.txt" 2>&1 || true
echo "harness lines now: $(grep -ci VoiceKernelHarness "$DEST/read4-processes.json") · historical-container lines: $(grep -c "$HIST_CONTAINER/VoiceKernelHarness.app" "$DEST/read4-processes.json")" | tee "$DEST/read4-harness-state.txt"
grep -n -A2 "$HIST_CONTAINER/VoiceKernelHarness.app" "$DEST/read4-processes.json" | grep -o '"processIdentifier" : [0-9]*' >> "$DEST/read4-harness-state.txt" 2>&1 || true
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$DEST/read4-apps-vpio02.json" > "$DEST/read4-apps-vpio02.stdout" 2>&1 || true
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$DEST/read4-apps-vpio02sid.json" > "$DEST/read4-apps-vpio02sid.stdout" 2>&1 || true
echo "vpio02 installed entries: $(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$DEST/read4-apps-vpio02.json") · vpio02sid installed entries: $(grep -c "\"bundleIdentifier\" : \"$BID\"" "$DEST/read4-apps-vpio02sid.json")" | tee "$DEST/read4-apps-state.txt"
( cd "$DEST" && find . -type f ! -name SHA256SUMS.run | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-step2-diag-$STAMP.SHA256SUMS.run"
mv "/private/tmp/sid-step2-diag-$STAMP.SHA256SUMS.run" "$DEST/SHA256SUMS.run"
git add "$DEST"
git commit -m "witness(voice-2026): SID step-2 read-only diagnostics (terminate-01 log · xcresult · devicectl capability · current device state; $STAMP)" || exit 2
git push -u origin feature/sid-step2-diagnostics-$STAMP || exit 2
git log -1 --format=%H
echo "SID-STEP2-DIAGNOSTICS-01 $STAMP PUSHED harness-now $(cat "$DEST/read4-harness-state.txt" | head -1)"
