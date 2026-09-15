set -e
STAMP=20260915T214212Z
OUT=/private/tmp/sid-mac-compile-02-out-$STAMP
SEAL_EXPECT=d835bebc36a86be7d8640fdbdd68b36eca9b26cce1faaaec70b3a12c3c93e2d3
test -d "$OUT"
test -f "$OUT/SHA256SUMS.compile"
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-carrier-02b-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-mac-compile-02-evidence-b-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-02-$STAMP
test ! -e "$DEST"
mkdir -p "$DEST"
cp -R "$OUT"/. "$DEST"/
cp /private/tmp/sid-mac-compile-02.sh "$DEST"/sid-mac-compile-02.sh
for f in /private/tmp/sid-mac-compile-02-transcript-*.log; do cp "$f" "$DEST"/; done
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-mac-compile-02-transcript-*.log /private/tmp/sid-mac-compile-02.sh >> "$DEST"/OUT-listing.txt
SEAL_ACTUAL=$(shasum -a 256 "$DEST/SHA256SUMS.compile" | cut -d' ' -f1)
test "$SEAL_ACTUAL" = "$SEAL_EXPECT"
test "$(grep -c ' \./SHA256SUMS.compile$' "$DEST/SHA256SUMS.compile")" = 1
test "$(wc -l < "$DEST/SHA256SUMS.compile" | tr -d ' ')" = 17
( cd "$DEST" && grep -v ' \./SHA256SUMS.compile$' SHA256SUMS.compile | shasum -a 256 -c - > SHA256SUMS.compile.check 2>&1 )
test "$(grep -c ': OK$' "$DEST/SHA256SUMS.compile.check")" = 16
printf 'seal-file sha256 %s (expected %s)\nself-entry preserved: %s\nverified-excluding-self: 16 OK\n' "$SEAL_ACTUAL" "$SEAL_EXPECT" "$(grep ' \./SHA256SUMS.compile$' "$DEST/SHA256SUMS.compile")" >> "$DEST"/SHA256SUMS.compile.check
( cd "$DEST" && shasum -a 256 $(ls | grep -v '^SHA256SUMS.run$' | grep -v '^RETURN.txt$') > SHA256SUMS.run )
printf 'ACT SID-MAC-COMPILE-02\nSTAMP %s\nRESULT PASS final-echo-reached (founder ruling §10.13)\nSUBJECT faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8\nOUT %s\nCOMPILE_SEAL %s (17 entries; self-entry preserved; 16 verified)\nCARRIER_ATTEMPT_1 STOP checker-defect (self-entry) — worktree preserved as residue\nINSTALL 0\nLAUNCH 0\nSAMPLE 0\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" "$OUT" "$SEAL_ACTUAL" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID MAC-COMPILE-02 evidence (PASS on faf918b5c; $STAMP; carrier-B after checker STOP)"
git push -u origin feature/sid-mac-compile-02-evidence-b-$STAMP
git log -1 --format=%H
echo "SID-MAC-COMPILE-02 CARRIER-B PUSHED"
