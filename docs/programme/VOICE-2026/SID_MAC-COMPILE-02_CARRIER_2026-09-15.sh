set -e
STAMP=20260915T214212Z
OUT=/private/tmp/sid-mac-compile-02-out-$STAMP
test -d "$OUT"
test -f "$OUT/SHA256SUMS.compile"
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-carrier-02-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-mac-compile-02-evidence-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-02-$STAMP
mkdir -p "$DEST"
cp -R "$OUT"/. "$DEST"/
cp /private/tmp/sid-mac-compile-02.sh "$DEST"/sid-mac-compile-02.sh
for f in /private/tmp/sid-mac-compile-02-transcript-*.log; do cp "$f" "$DEST"/; done
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-mac-compile-02-transcript-*.log /private/tmp/sid-mac-compile-02.sh >> "$DEST"/OUT-listing.txt
( cd "$DEST" && shasum -a 256 -c SHA256SUMS.compile > SHA256SUMS.compile.check 2>&1 )
( cd "$DEST" && shasum -a 256 $(ls | grep -v '^SHA256SUMS.run$' | grep -v '^RETURN.txt$') > SHA256SUMS.run )
printf 'ACT SID-MAC-COMPILE-02\nSTAMP %s\nRESULT PASS final-echo-reached\nSUBJECT faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8\nOUT %s\nINSTALL 0\nLAUNCH 0\nSAMPLE 0\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" "$OUT" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID MAC-COMPILE-02 evidence (PASS on faf918b5c; $STAMP)"
git push -u origin feature/sid-mac-compile-02-evidence-$STAMP
git log -1 --format=%H
echo "SID-MAC-COMPILE-02 CARRIER PUSHED"
