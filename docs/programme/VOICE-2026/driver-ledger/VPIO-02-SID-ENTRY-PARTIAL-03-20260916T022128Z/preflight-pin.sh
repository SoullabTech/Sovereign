set -e
set -o pipefail
SHA=36e412f8ed0136cf6ac22ee8dfb2cbd790a75a1c
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
BID=life.soullab.voicekernel.vpio02sid
BID_HIST=life.soullab.voicekernel.vpio02
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
UUID_PIN=4A6AD464-0A19-320F-980E-7446F6AA1440
APP=/private/tmp/sid-mac-compile-02-$SUBJECT_SHA-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app
case "$SID_CONTAINER" in __*) echo "REFUSED: SID container placeholder not replaced by the FIRST-INSTALL-SID record" >&2; exit 2;; esac
echo "$SID_CONTAINER" | grep -Eq '^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$'
test "$SID_CONTAINER" != "$HIST_CONTAINER"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-entry-03-$SHA-$STAMP
PTR=/private/tmp/sid-entry-preflight-03-current.txt
printf 'INCOMPLETE %s\n' "$STAMP" > "$PTR"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git worktree add --detach "$WT" "$SHA"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-reinstall.sh ios/VoiceKernelDriver)"
PF="$WT/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-preflight-$STAMP"
mkdir -p "$PF"
git rev-parse HEAD | tee "$PF/head.txt"
echo "$SID_CONTAINER" > "$PF/sid-container-expected.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$PF/apps-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$PF/apps-vpio02sid.json")" = 1
test "$(grep -c "$SID_CONTAINER" "$PF/apps-vpio02sid.json")" -ge 1
test "$(grep -c "$HIST_CONTAINER" "$PF/apps-vpio02sid.json")" = 0
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$PF/apps-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$PF/apps-vpio02.json")" = 1
test "$(grep -c "$HIST_CONTAINER" "$PF/apps-vpio02.json")" -ge 1
test "$(grep -c "$SID_CONTAINER" "$PF/apps-vpio02.json")" = 0
xcrun devicectl device info processes --device "$DEV" --json-output "$PF/processes.json"
test "$(grep -ci VoiceKernelHarness "$PF/processes.json")" = 0
if [ -d "$APP" ]; then echo "product-present $(dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib" | grep -c "$UUID_PIN")"; else echo "product-absent"; fi | tee "$PF/product-path-read.txt"
printf 'SID-ENTRY-PREFLIGHT-03 %s CLEAN subject %s instrument %s sid-container %s\n' "$STAMP" "$SUBJECT_SHA" "$SHA" "$SID_CONTAINER" | tee "$PF/PREFLIGHT-CLEAN"
SEAL="/private/tmp/sid-entry-preflight-03-$STAMP.SHA256SUMS.preflight"
( cd "$PF" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$PF/SHA256SUMS.preflight"
printf '%s\n%s\n' "$WT" "$PF" > "$PTR.tmp"
mv "$PTR.tmp" "$PTR"
echo "SID-ENTRY-PREFLIGHT-03 $STAMP CLEAN worktree $WT preflight $PF"
