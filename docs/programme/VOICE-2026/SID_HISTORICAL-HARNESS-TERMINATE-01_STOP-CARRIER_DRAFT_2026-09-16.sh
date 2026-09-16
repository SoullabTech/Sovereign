set -e
set -o pipefail
STAMP=__TERMINATE_01_STAMP__
case "$STAMP" in __*) echo "REFUSED: TERMINATE-01 stamp placeholder not replaced from the act's \$OUT name" >&2; exit 2;; esac
echo "$STAMP" | grep -Eq '^[0-9]{8}T[0-9]{6}Z$'
OUT=/private/tmp/sid-hht-01-out-$STAMP
test -d "$OUT"
for f in head.txt processes-before.json harness-processes-before.txt apps-before-vpio02sid.json xcodegen.log build-for-testing.log xctestrun.txt processes-just-before-terminate.json harness-processes-just-before-terminate.txt terminate-only.log; do test -f "$OUT/$f"; done
test ! -e "$OUT/processes-after.json"
test ! -e "$OUT/apps-after-vpio02.json"
test ! -e "$OUT/SHA256SUMS.terminate"
test "$(cat "$OUT/head.txt")" = 3035c02353b3cc0dab0b0ce1823116d6712b8eb1
test "$(grep -ci VoiceKernelHarness "$OUT/processes-just-before-terminate.json")" -ge 1
grep -q "failed to initialize for UI testing" "$OUT/terminate-only.log"
test "$(grep -c "testTerminateOnly\]' passed" "$OUT/terminate-only.log")" = 0
test -f /private/tmp/sid-hht-01.sh
test "$(shasum -a 256 /private/tmp/sid-hht-01.sh | cut -d' ' -f1)" = 576fd2b2bc0eca0cb15f1791a92bc2dcd76b6aeb659a0b638a2b4a4335ee8957
test -s /private/tmp/sid-hht01-authority.txt
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-hht-01-stop-carrier-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-hht-01-stop-evidence-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-HHT-01-STOP-$STAMP
test ! -e "$DEST"
mkdir -p "$DEST"
cp -R "$OUT"/. "$DEST"/
cp /private/tmp/sid-hht-01.sh "$DEST"/sid-hht-01.sh
for f in /private/tmp/sid-hht-01-transcript-*.log; do cp "$f" "$DEST"/; done
printf 'authority file /private/tmp/sid-hht01-authority.txt (contents NOT carried)\nlines %s\nbytes %s\nsha256 %s\n' "$(wc -l < /private/tmp/sid-hht01-authority.txt | tr -d ' ')" "$(wc -c < /private/tmp/sid-hht01-authority.txt | tr -d ' ')" "$(shasum -a 256 /private/tmp/sid-hht01-authority.txt | cut -d' ' -f1)" > "$DEST/authority-metadata.txt"
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-hht-01-transcript-*.log /private/tmp/sid-hht-01.sh >> "$DEST"/OUT-listing.txt
XCR=$(ls -dt /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelDriver-*/Logs/Test/Test-DriverUITests-*.xcresult 2>/dev/null | head -1 || true)
if [ -n "$XCR" ]; then echo "$XCR" > "$DEST/xcresult-path.txt"; ls -la "$XCR" >> "$DEST/xcresult-path.txt"; fi
( cd "$DEST" && find . -type f ! -name SHA256SUMS.run ! -name RETURN.txt | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-hht-01-stop-carrier-$STAMP.SHA256SUMS.run"
mv "/private/tmp/sid-hht-01-stop-carrier-$STAMP.SHA256SUMS.run" "$DEST/SHA256SUMS.run"
printf 'ACT SID-HISTORICAL-HARNESS-TERMINATE-01\nSTAMP %s\nRESULT STOP · UI-test runner initialization failure (Timed out while enabling automation mode)\nPRE historical harness present PASS · historical-container binding PASS · SID bundle absent PASS\nDRIVER build-for-testing reached\nJUST-IN-TIME harness present PASS · historical binding PASS\nXCODEBUILD-TEST-INVOCATION attempted once\nUI-AUTOMATION-INITIALIZATION FAIL · timeout\nTESTTERMINATEONLY-BODY not executed\nXCUIAPPLICATION-TERMINATE not reached\nPOST-PROCESS-READ not reached (none fabricated)\nPOST-HARNESS-ABSENT not established\nSEAL not reached (none fabricated)\nINSTALL 0 · UNINSTALL 0 · SAMPLE 0 · INTENTIONAL-LAUNCH-OR-TERMINATE 0\nDEVICE-EFFECT xcodebuild attempted to establish UI automation on the device; the governed test body was never entered\nHARNESS-STATE-AFTER unknown (alive at the just-before read; no read since)\nAUTHORITY SPENT\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID HISTORICAL-HARNESS-TERMINATE-01 STOP evidence (UI-test runner initialization failure; $STAMP)"
git push -u origin feature/sid-hht-01-stop-evidence-$STAMP
git log -1 --format=%H
echo "SID-HHT-01 STOP CARRIER PUSHED"
