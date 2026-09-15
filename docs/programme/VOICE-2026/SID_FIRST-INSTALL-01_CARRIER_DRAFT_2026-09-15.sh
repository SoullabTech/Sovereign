set -e
set -o pipefail
STAMP=__FIRST_INSTALL_STAMP__
SID_CONTAINER=__SID_CONTAINER_FROM_FIRST_INSTALL__
case "$STAMP" in __*) echo "REFUSED: first-install stamp placeholder not replaced by the FIRST-INSTALL-SID record" >&2; exit 2;; esac
case "$SID_CONTAINER" in __*) echo "REFUSED: SID container placeholder not replaced by the FIRST-INSTALL-SID record" >&2; exit 2;; esac
echo "$STAMP" | grep -Eq '^[0-9]{8}T[0-9]{6}Z$'
echo "$SID_CONTAINER" | grep -Eq '^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$'
OUT=/private/tmp/sid-first-install-01-out-$STAMP
test -d "$OUT"
test -f "$OUT/SHA256SUMS.install"
test -f "$OUT/container.txt"
test "$(cat "$OUT/container.txt")" = "$SID_CONTAINER"
test -f "$OUT/.last-reinstall"
test -f "$OUT/reinstall-$(cat "$OUT/.last-reinstall").txt"
( cd "$OUT" && grep -v ' \./SHA256SUMS.install$' SHA256SUMS.install | shasum -a 256 -c - >/dev/null )
test -f /private/tmp/sid-first-install-01.sh
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
WT=/private/tmp/sid-first-install-carrier-$STAMP
test ! -e "$WT"
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach "$WT" origin/claude/voice-2026-census-01
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git checkout -b feature/sid-first-install-01-evidence-$STAMP
DEST=docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-FIRST-INSTALL-01-$STAMP
test ! -e "$DEST"
mkdir -p "$DEST"
cp -R "$OUT"/. "$DEST"/
cp "$OUT/.last-reinstall" "$DEST/last-reinstall.txt"
cp /private/tmp/sid-first-install-01.sh "$DEST"/sid-first-install-01.sh
for f in /private/tmp/sid-first-install-01-transcript-*.log; do cp "$f" "$DEST"/; done
ls -la "$OUT" > "$DEST"/OUT-listing.txt
ls -la /private/tmp/sid-first-install-01-transcript-*.log /private/tmp/sid-first-install-01.sh >> "$DEST"/OUT-listing.txt
( cd "$DEST" && grep -v ' \./SHA256SUMS.install$' SHA256SUMS.install | shasum -a 256 -c - > SHA256SUMS.install.check 2>&1 )
( cd "$DEST" && shasum -a 256 $(ls -A | grep -v '^SHA256SUMS.run$' | grep -v '^RETURN.txt$') > SHA256SUMS.run )
printf 'ACT SID-FIRST-INSTALL-01\nSTAMP %s\nSUBJECT faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8\nINSTRUMENT 3035c02353b3cc0dab0b0ce1823116d6712b8eb1\nBUNDLE life.soullab.voicekernel.vpio02sid\nCONTAINER %s (from container.txt = the install result line)\nOUT %s\nLAUNCH 0\nSAMPLE 0\nTRANSPORT Mac Studio terminal directly\n' "$STAMP" "$SID_CONTAINER" "$OUT" > "$DEST"/RETURN.txt
shasum -a 256 "$DEST"/SHA256SUMS.run
git add "$DEST"
git commit -m "witness(voice-2026): return SID FIRST-INSTALL-01 evidence ($STAMP; container $SID_CONTAINER)"
git push -u origin feature/sid-first-install-01-evidence-$STAMP
git log -1 --format=%H
echo "SID-FIRST-INSTALL-01 CARRIER PUSHED"
