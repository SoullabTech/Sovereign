set -e
set -o pipefail
INSTRUMENT=9ed72a38cce6fb55e909e747898f4d452dcfdf3d
ENTRY_SHA=26116d4e42fdb7f25ffbbede7c20f4a98f226c18
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
BID=life.soullab.voicekernel.vpio02sid
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-source-sb-01-$INSTRUMENT-$STAMP
PTR=/private/tmp/sid-source-sb-01-preflight-current.txt
printf 'INCOMPLETE %s\n' "$STAMP" > "$PTR"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin feature/voice-2026-record-of-record-20260916
git merge-base --is-ancestor "$ENTRY_SHA" FETCH_HEAD
git show "$ENTRY_SHA":docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-05-ADJUDICATION-20260916T125437Z/ADJUDICATION.txt | grep -q '^RESULT ENTRY-UNPERTURBED$'
git fetch origin fix/chatgpt-voice-jit-install-guard
git worktree add --detach "$WT" "$INSTRUMENT"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$INSTRUMENT"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-output-ledger.py scripts/witness/k00-source-ledger.py scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav ios/VoiceKernelDriver)"
P="$WT/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-SOURCE-SB-preflight-$STAMP"; mkdir -p "$P"
printf '%s\n' "$ENTRY_SHA" > "$P/entry-adjudication-sha.txt"
printf 'RESULT ENTRY-UNPERTURBED\n' > "$P/entry-prerequisite.txt"
python3 scripts/witness/k00-source-ledger.py --selftest > "$P/source-reader-selftest.txt"
grep -q 'selftest: 24/24' "$P/source-reader-selftest.txt"
FIX=scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav
shasum -a 256 "$FIX" > "$P/fixture.sha256"
test "$(cut -d' ' -f1 "$P/fixture.sha256")" = 30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb
shasum -a 256 /usr/bin/afplay > "$P/afplay.sha256"
test "$(cut -d' ' -f1 "$P/afplay.sha256")" = 88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
system_profiler SPAudioDataType -json > "$P/audio-output.json"
python3 - "$P/audio-output.json" <<'PY'
import json,sys
raw=open(sys.argv[1]).read(); raw=raw[raw.find('{'):raw.rfind('}')+1]
items=[]
for g in json.loads(raw).get('SPAudioDataType',[]): items.extend(g.get('_items',[]))
d=[x for x in items if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
assert len(d)==1 and d[0].get('_name')=='Mac Studio Speakers' and d[0].get('coreaudio_device_transport')=='coreaudio_device_type_builtin'
PY
osascript -e 'get volume settings' > "$P/volume.txt"
grep -q 'output volume:69,' "$P/volume.txt"
grep -q 'output muted:false' "$P/volume.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$P/apps-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$P/apps-vpio02sid.json")" = 1
test "$(grep -c "$SID_CONTAINER" "$P/apps-vpio02sid.json")" -ge 1
xcrun devicectl device info processes --device "$DEV" --json-output "$P/processes.json"
test "$(grep -ci VoiceKernelHarness "$P/processes.json")" = 0
printf 'SID-SOURCE-SB-01-PREFLIGHT %s CLEAN entry %s instrument %s subject %s\n' "$STAMP" "$ENTRY_SHA" "$INSTRUMENT" "$SUBJECT_SHA" | tee "$P/PREFLIGHT-CLEAN"
SEAL=/private/tmp/sid-source-sb-01-preflight-$STAMP.SHA256SUMS
( cd "$P" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$P/SHA256SUMS.preflight"
printf '%s\n%s\n' "$WT" "$P" > "$PTR.tmp"; mv "$PTR.tmp" "$PTR"
echo "SID-SOURCE-SB-01-PREFLIGHT $STAMP CLEAN worktree $WT preflight $P"
