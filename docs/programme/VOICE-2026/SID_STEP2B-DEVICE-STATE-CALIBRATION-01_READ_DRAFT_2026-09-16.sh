set -o pipefail
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID_HIST=life.soullab.voicekernel.vpio02
BID=life.soullab.voicekernel.vpio02sid
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
ATT=/private/tmp/sid-2b-attestation.txt
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
test -s "$ATT" || { echo "REFUSED: founder attestation file missing or empty ($ATT)"; exit 2; }
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01 || exit 2
WT=/private/tmp/sid-step2b-$STAMP
test ! -e "$WT" || exit 2
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01 || exit 2
cd "$WT" || exit 2
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-step2b-device-state-$STAMP || exit 2
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-STEP2B-DEVICE-STATE-$STAMP
mkdir -p "$DEST"
echo "attestation: founder's contemporaneous physical-state statement, copied verbatim (evidence, not authority)"
{ echo "attested-at-utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo "attested-at-local: $(date +%Y-%m-%dT%H:%M:%S%z)"; echo "---"; cat "$ATT"; } > "$DEST/attestation.txt"
wc -l "$ATT" | tee "$DEST/attestation-linecount.txt"
echo "read 1+2: per-subcommand help (text only; nothing invoked from it)"
xcrun devicectl --version > "$DEST/read0-devicectl-version.txt" 2>&1 || true
xcrun devicectl help device info lockState > "$DEST/read1-help-lockState.txt" 2>&1 || true
xcrun devicectl help device info displays > "$DEST/read2-help-displays.txt" 2>&1 || true
echo "read 3+4: raw device-state JSON, taken immediately after the attestation (no key is parsed here)"
date -u +%Y-%m-%dT%H:%M:%SZ | tee "$DEST/read3-lockState.taken-at-utc.txt"
xcrun devicectl device info lockState --device "$DEV" --json-output "$DEST/read3-lockState.json" > "$DEST/read3-lockState.stdout" 2>&1 || true
date -u +%Y-%m-%dT%H:%M:%SZ | tee "$DEST/read4-displays.taken-at-utc.txt"
xcrun devicectl device info displays --device "$DEV" --json-output "$DEST/read4-displays.json" > "$DEST/read4-displays.stdout" 2>&1 || true
wc -c "$DEST/read3-lockState.json" "$DEST/read4-displays.json" 2>&1 | tee "$DEST/read34-bytecounts.txt"
echo "read 5: current process table (observation only)"
xcrun devicectl device info processes --device "$DEV" --json-output "$DEST/read5-processes.json" > "$DEST/read5-processes.stdout" 2>&1 || true
grep -i VoiceKernelHarness "$DEST/read5-processes.json" > "$DEST/read5-harness-processes.txt" 2>&1 || true
echo "harness lines now: $(grep -ci VoiceKernelHarness "$DEST/read5-processes.json") · historical-container lines: $(grep -c "$HIST_CONTAINER/VoiceKernelHarness.app" "$DEST/read5-processes.json")" | tee "$DEST/read5-harness-state.txt"
grep -n -A2 "$HIST_CONTAINER/VoiceKernelHarness.app" "$DEST/read5-processes.json" | grep -o '"processIdentifier" : [0-9]*' >> "$DEST/read5-harness-state.txt" 2>&1 || true
echo "read 6+7: installed-app reads (observation only)"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$DEST/read6-apps-vpio02.json" > "$DEST/read6-apps-vpio02.stdout" 2>&1 || true
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$DEST/read7-apps-vpio02sid.json" > "$DEST/read7-apps-vpio02sid.stdout" 2>&1 || true
echo "vpio02 installed entries: $(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$DEST/read6-apps-vpio02.json") · vpio02sid installed entries: $(grep -c "\"bundleIdentifier\" : \"$BID\"" "$DEST/read7-apps-vpio02sid.json")" | tee "$DEST/read67-apps-state.txt"
( cd "$DEST" && find . -type f ! -name SHA256SUMS.run | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-step2b-$STAMP.SHA256SUMS.run"
mv "/private/tmp/sid-step2b-$STAMP.SHA256SUMS.run" "$DEST/SHA256SUMS.run"
git add "$DEST"
git commit -m "witness(voice-2026): SID step-2b device-state calibration (lockState/displays help + raw JSON beside a founder attestation · process table · app reads; $STAMP)" || exit 2
git push -u origin feature/sid-step2b-device-state-$STAMP || exit 2
git log -1 --format=%H
echo "SID-STEP2B-DEVICE-STATE-CALIBRATION-01 $STAMP PUSHED harness-now $(head -1 "$DEST/read5-harness-state.txt") · $(cat "$DEST/read67-apps-state.txt")"
