set -e
STAMP=20260915T204348Z
OUT=/private/tmp/sid-mac-compile-01-out-$STAMP
test -d "$OUT"
test -f /Users/soullab/Desktop/SID-MAC-COMPILE-01-terminal-recovered.txt
test -f /Users/soullab/Desktop/SID-MAC-COMPILE-01-governed-run.log
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-carrier-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-mac-compile-01-evidence-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-01-$STAMP
mkdir -p "$DEST"
cp "$OUT"/gate.log "$OUT"/head.txt "$OUT"/status-before.txt "$OUT"/swift-build.log "$OUT"/swift-test.log "$OUT"/toolchain.txt "$DEST"/
cp /Users/soullab/Desktop/SID-MAC-COMPILE-01-terminal-recovered.txt "$DEST"/
cp /Users/soullab/Desktop/SID-MAC-COMPILE-01-governed-run.log "$DEST"/
cp /private/tmp/sid-mac-compile-01.sh "$DEST"/sid-mac-compile-01.sh
for f in /private/tmp/sid-mac-compile-01-transcript-*.log; do cp "$f" "$DEST"/; done
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-mac-compile-01-transcript-*.log /private/tmp/sid-mac-compile-01.sh >> "$DEST"/OUT-listing.txt
( cd "$DEST" && shasum -a 256 $(ls | grep -v '^SHA256SUMS.run$' | grep -v '^RETURN.txt$') > SHA256SUMS.run )
printf 'ACT SID-MAC-COMPILE-01\nSTAMP %s\nRESULT STOP swift-test-compile PureLogicTests.swift:485:13\nSUBJECT f0c6ae13b88db29cbd1537bec585d98376c8bc4f\nOUT %s\nXCODEBUILD never-entered\nDUPLICATE_INVOCATION not-established\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" "$OUT" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID MAC-COMPILE-01 STOP evidence (swift test compile, PureLogicTests.swift:485:13; $STAMP)"
git push -u origin feature/sid-mac-compile-01-evidence-$STAMP
git log -1 --format=%H
echo "SID-MAC-COMPILE-01 CARRIER PUSHED"
