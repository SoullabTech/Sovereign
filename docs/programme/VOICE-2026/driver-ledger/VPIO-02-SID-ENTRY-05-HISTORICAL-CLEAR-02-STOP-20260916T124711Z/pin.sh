set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
BID_HIST=life.soullab.voicekernel.vpio02
BID_SID=life.soullab.voicekernel.vpio02sid
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=/private/tmp/sid-entry-05-historical-clear-02-out-$STAMP
test ! -e "$OUT"
mkdir -p "$OUT"
printf '%s\n' "$K00_EXEC_AUTHORITY" | shasum -a 256 | awk '{print $1}' > "$OUT/authority.sha256"
printf '%s\n' "$(printf '%s\n' "$K00_EXEC_AUTHORITY" | wc -l | tr -d ' ')" > "$OUT/authority.lines"

xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-before-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-before-vpio02.json")" = 1
test "$(grep -c "$HIST_CONTAINER" "$OUT/apps-before-vpio02.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_SID" --json-output "$OUT/apps-before-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_SID\"" "$OUT/apps-before-vpio02sid.json")" = 1
test "$(grep -c "$SID_CONTAINER" "$OUT/apps-before-vpio02sid.json")" -ge 1

xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-before.json" | tee "$OUT/processes-before.txt"
grep -F "$HIST_CONTAINER/VoiceKernelHarness.app/VoiceKernelHarness" "$OUT/processes-before.txt" | tee "$OUT/harness-before.txt"
test "$(grep -c 'VoiceKernelHarness.app/VoiceKernelHarness' "$OUT/processes-before.txt")" = 1
test "$(wc -l < "$OUT/harness-before.txt" | tr -d ' ')" = 1
PID="$(awk '{print $1}' "$OUT/harness-before.txt")"
echo "$PID" | grep -Eq '^[0-9]+$'
echo "$PID" > "$OUT/pid.txt"

xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-just-before.json" | tee "$OUT/processes-just-before.txt"
grep -F "$HIST_CONTAINER/VoiceKernelHarness.app/VoiceKernelHarness" "$OUT/processes-just-before.txt" | tee "$OUT/harness-just-before.txt"
test "$(grep -c 'VoiceKernelHarness.app/VoiceKernelHarness' "$OUT/processes-just-before.txt")" = 1
test "$(wc -l < "$OUT/harness-just-before.txt" | tr -d ' ')" = 1
test "$(awk '{print $1}' "$OUT/harness-just-before.txt")" = "$PID"

xcrun devicectl device process terminate --device "$DEV" --pid "$PID" --json-output "$OUT/terminate.json" | tee "$OUT/terminate.txt"

xcrun devicectl device info processes --device "$DEV" --json-output "$OUT/processes-after.json" | tee "$OUT/processes-after.txt"
test "$(grep -c 'VoiceKernelHarness.app/VoiceKernelHarness' "$OUT/processes-after.txt" || true)" = 0
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$OUT/apps-after-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$OUT/apps-after-vpio02.json")" = 1
test "$(grep -c "$HIST_CONTAINER" "$OUT/apps-after-vpio02.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_SID" --json-output "$OUT/apps-after-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_SID\"" "$OUT/apps-after-vpio02sid.json")" = 1
test "$(grep -c "$SID_CONTAINER" "$OUT/apps-after-vpio02sid.json")" -ge 1

SEAL=/private/tmp/sid-entry-05-historical-clear-02-$STAMP.SHA256SUMS
( cd "$OUT" && find . -type f ! -name SHA256SUMS.clearance | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$OUT/SHA256SUMS.clearance"
echo "SID-ENTRY-05-HISTORICAL-HARNESS-CLEAR-02 $STAMP PASS pid $PID historical $HIST_CONTAINER sid-preserved $SID_CONTAINER harness-after 0 out $OUT"
