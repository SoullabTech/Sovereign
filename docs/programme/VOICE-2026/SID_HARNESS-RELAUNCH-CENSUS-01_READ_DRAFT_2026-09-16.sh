set -o pipefail
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
UDID="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"
K00_C=0B07D423-97E7-4196-BC1C-C69C96F994BE
V01_C=6A2E406B-D1B8-43A4-92F3-29D50333AF19
HIST_C=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
WSTART="2026-09-15 20:38:00"
WEND="2026-09-15 20:59:30"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
RAW=/private/tmp/sid-relaunch-census-$STAMP
test ! -e "$RAW" || exit 2
mkdir -p "$RAW"
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01 || exit 2
WT=/private/tmp/sid-relaunch-census-wt-$STAMP
test ! -e "$WT" || exit 2
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01 || exit 2
cd "$WT" || exit 2
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-harness-relaunch-census-$STAMP || exit 2
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-RELAUNCH-CENSUS-$STAMP
mkdir -p "$DEST"
echo "window (local, both hosts assumed -0400): $WSTART .. $WEND" | tee "$DEST/window.txt"
echo "read 1: devicectl capability (help text only; nothing invoked from it)"
xcrun devicectl --version > "$DEST/read1-devicectl-version.txt" 2>&1 || true
xcrun devicectl help device process > "$DEST/read1-help-device-process.txt" 2>&1 || true
xcrun devicectl help device info processes > "$DEST/read1-help-info-processes.txt" 2>&1 || true
echo "read 2: are 3617 / 3618 / 3347 still the live harness set? (observation only)"
date -u +%Y-%m-%dT%H:%M:%SZ | tee "$DEST/read2-taken-at-utc.txt"
xcrun devicectl device info processes --device "$DEV" --json-output "$DEST/read2-processes.json" > "$DEST/read2-processes.stdout" 2>&1 || true
grep -i VoiceKernelHarness "$DEST/read2-processes.json" > "$DEST/read2-harness-processes.txt" 2>&1 || true
echo "harness lines now: $(grep -ci VoiceKernelHarness "$DEST/read2-processes.json") · k00 $(grep -c "$K00_C/VoiceKernelHarness.app" "$DEST/read2-processes.json") · vpio01 $(grep -c "$V01_C/VoiceKernelHarness.app" "$DEST/read2-processes.json") · vpio02 $(grep -c "$HIST_C/VoiceKernelHarness.app" "$DEST/read2-processes.json")" | tee "$DEST/read2-harness-state.txt"
grep -n -B1 -E "(VoiceKernelHarness.app/VoiceKernelHarness|DriverUITests-Runner|SleepLockScreen)" "$DEST/read2-processes.json" | grep -o '"processIdentifier" : [0-9]*' >> "$DEST/read2-harness-state.txt" 2>&1 || true
echo "read 3: Mac-side unified log for the window (no root) — did anything on this Mac launch or touch the device apps?"
log show --start "$WSTART" --end "$WEND" --style compact --predicate 'process == "devicectl" OR process == "xcodebuild" OR process == "Xcode" OR subsystem CONTAINS[c] "CoreDevice" OR subsystem CONTAINS[c] "dt.xctest" OR eventMessage CONTAINS[c] "voicekernel"' > "$RAW/read3-mac-log-full.txt" 2> "$DEST/read3-mac-log.stderr" || true
wc -l "$RAW/read3-mac-log-full.txt" | tee "$DEST/read3-mac-log-linecount.txt"
shasum -a 256 "$RAW/read3-mac-log-full.txt" | tee "$DEST/read3-mac-log-full.sha256"
grep -i -E "launch|voicekernel|$K00_C|$V01_C|$HIST_C|prewarm|testmanagerd|install" "$RAW/read3-mac-log-full.txt" > "$DEST/read3-mac-log-extract.txt" 2>&1 || true
wc -l "$DEST/read3-mac-log-extract.txt" | tee -a "$DEST/read3-mac-log-linecount.txt"
echo "read 4: device unified log for the window — root jurisdiction (LOG-CAL precedent: K00_LOG_SUDO=1 grants root for log collect ONLY)"
if [ "${K00_LOG_SUDO:-0}" = "1" ]; then
  echo "read 4 OPEN: one log collect (archive stays on the Mac, never committed); replay only if collect rc=0 AND archive exists" | tee "$DEST/read4-status.txt"
  COLLECT_RC=0
  sudo log collect --device-udid "$UDID" --start "$WSTART" --output "$RAW/device.logarchive" > "$DEST/read4-collect.stdout" 2>&1 || COLLECT_RC=$?
  ARCHIVE_PRESENT=0
  [ -d "$RAW/device.logarchive" ] && ARCHIVE_PRESENT=1
  printf 'collect rc %s\narchive present %s\n' "$COLLECT_RC" "$ARCHIVE_PRESENT" | tee "$DEST/read4-collect-status.txt"
  if [ "$ARCHIVE_PRESENT" = "1" ]; then
    ls -la "$RAW/device.logarchive" > "$DEST/read4-archive-listing.txt" 2>&1 || true
    ( cd "$RAW" && find device.logarchive -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$DEST/read4-archive.sha256" 2>&1 || true
  fi
  if [ "$COLLECT_RC" -eq 0 ] && [ "$ARCHIVE_PRESENT" = "1" ]; then
    echo "read 4 replay OPEN: default-level archive reads, options first / archive last" | tee "$DEST/read4-replay-status.txt"
    log show --start "$WSTART" --end "$WEND" --style compact --predicate 'process == "VoiceKernelHarness" OR eventMessage CONTAINS[c] "voicekernel" OR eventMessage CONTAINS "'"$K00_C"'" OR eventMessage CONTAINS "'"$V01_C"'" OR eventMessage CONTAINS "'"$HIST_C"'"' "$RAW/device.logarchive" > "$DEST/read4a-device-log-harness.txt" 2> "$DEST/read4a.stderr" || true
    log show --start "$WSTART" --end "$WEND" --style compact --predicate '(process == "runningboardd" OR process == "SpringBoard" OR process == "dasd" OR process == "backboardd" OR process == "testmanagerd") AND (eventMessage CONTAINS[c] "launch" OR eventMessage CONTAINS[c] "prewarm" OR eventMessage CONTAINS[c] "voicekernel" OR eventMessage CONTAINS[c] "restor")' "$RAW/device.logarchive" > "$DEST/read4b-device-log-launch-mechanism.txt" 2> "$DEST/read4b.stderr" || true
    wc -l "$DEST/read4a-device-log-harness.txt" "$DEST/read4b-device-log-launch-mechanism.txt" | tee "$DEST/read4-linecounts.txt"
    echo "prewarm mentions: $(grep -ci prewarm "$DEST/read4b-device-log-launch-mechanism.txt") · harness launch mentions: $(grep -ci -E 'launch' "$DEST/read4a-device-log-harness.txt")" | tee -a "$DEST/read4-linecounts.txt"
  else
    echo "read 4 replay SKIPPED: collect did not produce an admissible archive; device launch times / initiators remain UNREAD" | tee "$DEST/read4-replay-status.txt"
  fi
else
  echo "read 4 SKIPPED: root not granted (K00_LOG_SUDO unset); the device's persisted log store was not collected; launch times / initiators for 3617 and 3618 remain UNREAD" | tee "$DEST/read4-status.txt"
fi
( cd "$DEST" && find . -type f ! -name SHA256SUMS.run | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-relaunch-census-$STAMP.SHA256SUMS.run"
mv "/private/tmp/sid-relaunch-census-$STAMP.SHA256SUMS.run" "$DEST/SHA256SUMS.run"
git add "$DEST"
git commit -m "witness(voice-2026): SID harness relaunch census (read-only; devicectl capability · current harness set · Mac-side log window · device log window under the root jurisdiction if granted; $STAMP)" || exit 2
git push -u origin feature/sid-harness-relaunch-census-$STAMP || exit 2
git log -1 --format=%H
echo "SID-HARNESS-RELAUNCH-CENSUS-01 $STAMP PUSHED $(head -1 "$DEST/read2-harness-state.txt") · $(head -1 "$DEST/read4-status.txt" | cut -c1-16)"
