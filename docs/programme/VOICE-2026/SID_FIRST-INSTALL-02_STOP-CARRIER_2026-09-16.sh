set -e
set -o pipefail
STAMP=20260916T001215Z
case "$STAMP" in __*) echo "REFUSED: FIRST-INSTALL-02 stamp placeholder not replaced from the 02 transcript/\$OUT name" >&2; exit 2;; esac
echo "$STAMP" | grep -Eq '^[0-9]{8}T[0-9]{6}Z$'
OUT=/private/tmp/sid-first-install-02-out-$STAMP
test -d "$OUT"
test -f "$OUT/head.txt"
test -f "$OUT/apps-before-vpio02.json"
test -f "$OUT/apps-before-vpio02sid.json"
test -f "$OUT/processes-before.json"
test ! -e "$OUT/SHA256SUMS.install"
test ! -e "$OUT/container.txt"
test ! -e "$OUT/.last-reinstall"
test "$(cat "$OUT/head.txt")" = 3035c02353b3cc0dab0b0ce1823116d6712b8eb1
test "$(grep -ci VoiceKernelHarness "$OUT/processes-before.json")" -ge 1
test -f /private/tmp/sid-first-install-02.sh
test "$(shasum -a 256 /private/tmp/sid-first-install-02.sh | cut -d' ' -f1)" = c4b37e696e7b6936b8b4c592407a6c0bcecefa2a5b7dc65324940ea2d1858fdb
test -s /private/tmp/sid-fi02-authority.txt
PRIOR01=/private/tmp/sid-first-install-01-transcript-20260915T235951Z.log
test -f "$PRIOR01"
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-first-install-02-stop-carrier-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-first-install-02-stop-evidence-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-FIRST-INSTALL-02-STOP-$STAMP
test ! -e "$DEST"
mkdir -p "$DEST"
cp -R "$OUT"/. "$DEST"/
cp /private/tmp/sid-first-install-02.sh "$DEST"/sid-first-install-02.sh
for f in /private/tmp/sid-first-install-02-transcript-*.log; do cp "$f" "$DEST"/; done
mkdir -p "$DEST/prior-attempts"
cp "$PRIOR01" "$DEST/prior-attempts/SID-FIRST-INSTALL-01-STOP-transcript-20260915T235951Z.log"
printf 'authority file /private/tmp/sid-fi02-authority.txt (contents NOT carried)\nlines %s\nbytes %s\nsha256 %s\n' "$(wc -l < /private/tmp/sid-fi02-authority.txt | tr -d ' ')" "$(wc -c < /private/tmp/sid-fi02-authority.txt | tr -d ' ')" "$(shasum -a 256 /private/tmp/sid-fi02-authority.txt | cut -d' ' -f1)" > "$DEST/authority-metadata.txt"
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-first-install-02-transcript-*.log /private/tmp/sid-first-install-02.sh "$PRIOR01" >> "$DEST"/OUT-listing.txt
grep -i VoiceKernelHarness "$OUT/processes-before.json" > "$DEST/harness-processes-observed.txt"
( cd "$DEST" && find . -type f ! -name SHA256SUMS.run ! -name RETURN.txt | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-first-install-02-stop-carrier-$STAMP.SHA256SUMS.run"
mv "/private/tmp/sid-first-install-02-stop-carrier-$STAMP.SHA256SUMS.run" "$DEST/SHA256SUMS.run"
printf 'ACT SID-FIRST-INSTALL-02\nSTAMP %s\nRESULT STOP · pre-install harness-process precondition\nOBSERVED VoiceKernelHarness process present (see harness-processes-observed.txt; PID 3347 at the time of the act)\nINSTRUMENT-INVOCATION not reached\nJUST-IN-TIME-ABSENCE-READ not reached\nINSTALL 0\nCONTAINER none\nLAUNCH-BY-THIS-ACT 0\nSAMPLE 0\nDEVICE-READS 3\nDEVICE-WRITES 0\nINSTALL-SEAL none (never reached sealing; none fabricated)\nAUTHORITY SPENT\nPRIOR FIRST-INSTALL-01\n  STOP · authority-precondition refusal · SPENT\n  device-verbs 0 · install 0 · container none\n  transcript prior-attempts/SID-FIRST-INSTALL-01-STOP-transcript-20260915T235951Z.log (separate act, not 02 evidence)\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID FIRST-INSTALL-02 STOP evidence (harness-process precondition; $STAMP)"
git push -u origin feature/sid-first-install-02-stop-evidence-$STAMP
git log -1 --format=%H
echo "SID-FIRST-INSTALL-02 STOP CARRIER PUSHED"
