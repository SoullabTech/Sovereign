set -e
set -o pipefail
SHA=1708d52119e173853e0ad8b7ca7f71ad95c63d8d
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
ENTRY_SHA=26116d4e42fdb7f25ffbbede7c20f4a98f226c18
BID=life.soullab.voicekernel.vpio02sid
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
DRIVER_SHA=7ecf3cdff65eec861a808973c6f666e366bca7a355098ec14ede5c71901656dd
BATCH_SHA=c8d984c3869ac879b8967299497cdf180a909b36a365c30d48c15d4cb0ec128b
OUTPUT_READER_SHA=977fe3d6b777dc3540948fac342bc7f14f1b43f19ce23ed18acc0843f567bbd8
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-duplex-02-$SHA-$STAMP
PTR=/private/tmp/sid-duplex-preflight-02-current.txt
printf 'INCOMPLETE %s
' "$STAMP" > "$PTR"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin feature/voice-2026-record-of-record-20260916
git cat-file -e "$SHA^{commit}"
git worktree add --detach "$WT" "$SHA"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$SHA"
git merge-base --is-ancestor "$ENTRY_SHA" "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-output-ledger.py scripts/witness/k00-source-ledger.py ios/VoiceKernelDriver __tests__/voice-kernel-00-source-gates.test.ts)"
PF="$WT/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-DUPLEX-preflight-$STAMP"
mkdir -p "$PF"
git rev-parse HEAD | tee "$PF/head.txt"
echo "$SUBJECT_SHA" > "$PF/subject-organism.txt"
echo "$ENTRY_SHA" > "$PF/entry-adjudication-ancestor.txt"
shasum -a 256 ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift > "$PF/driver.sha256"
shasum -a 256 scripts/witness/k00-driver-batch.sh > "$PF/batch.sha256"
shasum -a 256 scripts/witness/k00-output-ledger.py > "$PF/output-reader.sha256"
test "$(cut -d' ' -f1 "$PF/driver.sha256")" = "$DRIVER_SHA"
test "$(cut -d' ' -f1 "$PF/batch.sha256")" = "$BATCH_SHA"
test "$(cut -d' ' -f1 "$PF/output-reader.sha256")" = "$OUTPUT_READER_SHA"
bash -n scripts/witness/k00-driver-batch.sh
xcrun swiftc -parse ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift
npx jest __tests__/voice-kernel-00-source-gates.test.ts --runInBand > "$PF/source-gate.txt" 2>&1
grep -q 'Tests:       100 passed, 100 total' "$PF/source-gate.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$PF/apps-vpio02sid.json"
python3 - "$PF/apps-vpio02sid.json" "$BID" "$SID_CONTAINER" <<'PYAPP'
import json,sys
d=json.load(open(sys.argv[1], encoding='utf-8'))
apps=d.get('result',{}).get('apps',[])
hits=[a for a in apps if a.get('bundleIdentifier') == sys.argv[2]]
assert len(hits) == 1, f"expected exactly one {sys.argv[2]} app, got {len(hits)}"
assert sys.argv[3] in hits[0].get('url',''), f"witnessed container {sys.argv[3]} absent from app URL"
PYAPP
xcrun devicectl device info processes --device "$DEV" --json-output "$PF/processes.json"
test "$(grep -ci VoiceKernelHarness "$PF/processes.json")" = 0
printf 'SID-DUPLEX-PREFLIGHT-02 %s CLEAN subject %s instrument %s sid-container %s
' "$STAMP" "$SUBJECT_SHA" "$SHA" "$SID_CONTAINER" | tee "$PF/PREFLIGHT-CLEAN"
SEAL=/private/tmp/sid-duplex-preflight-02-$STAMP.SHA256SUMS.preflight
( cd "$PF" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$PF/SHA256SUMS.preflight"
printf '%s
%s
' "$WT" "$PF" > "$PTR.tmp"
mv "$PTR.tmp" "$PTR"
echo "SID-DUPLEX-PREFLIGHT-02 $STAMP CLEAN worktree $WT preflight $PF"
