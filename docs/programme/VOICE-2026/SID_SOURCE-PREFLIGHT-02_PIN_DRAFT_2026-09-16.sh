set -e
set -o pipefail
SHA=f67575797353bf7e97ffb319a45357997c8d564d
ENTRY_SHA=26116d4e42fdb7f25ffbbede7c20f4a98f226c18
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
BID=life.soullab.voicekernel.vpio02sid
BID_HIST=life.soullab.voicekernel.vpio02
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
FIXTURE_SHA=30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb
AFPLAY=/usr/bin/afplay
AFPLAY_SHA=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
OUTPUT_DEVICE="Mac Studio Speakers"
OUTPUT_TRANSPORT=coreaudio_device_type_builtin
OUTPUT_VOLUME=69
OUTPUT_MUTED=false
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-source-02-$SHA-$STAMP
PTR=/private/tmp/sid-source-preflight-02-current.txt
printf 'INCOMPLETE %s\n' "$STAMP" > "$PTR"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin fix/sid-source-population-jit-guard-20260916
git worktree add --detach "$WT" "$SHA"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$SHA"
git merge-base --is-ancestor "$ENTRY_SHA" "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-output-ledger.py scripts/witness/k00-source-ledger.py ios/VoiceKernelDriver)"
PF="$WT/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-SOURCE-preflight-$STAMP"
mkdir -p "$PF"
git rev-parse HEAD | tee "$PF/head.txt"
echo "$ENTRY_SHA" > "$PF/entry-adjudication-ancestor.txt"
python3 scripts/witness/k00-source-ledger.py --selftest > "$PF/source-reader-selftest.txt"
grep -q '^selftest: 24/24$' "$PF/source-reader-selftest.txt"
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$PF/apps-vpio02sid.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID\"" "$PF/apps-vpio02sid.json")" = 1
test "$(grep -c "$SID_CONTAINER" "$PF/apps-vpio02sid.json")" -ge 1
xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID_HIST" --json-output "$PF/apps-vpio02.json"
test "$(grep -c "\"bundleIdentifier\" : \"$BID_HIST\"" "$PF/apps-vpio02.json")" = 1
test "$(grep -c "$HIST_CONTAINER" "$PF/apps-vpio02.json")" -ge 1
xcrun devicectl device info processes --device "$DEV" --json-output "$PF/processes.json"
test "$(grep -ci VoiceKernelHarness "$PF/processes.json")" = 0
FIXTURE="$WT/scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav"
shasum -a 256 "$FIXTURE" > "$PF/stimulus.sha256"
test "$(cut -d' ' -f1 "$PF/stimulus.sha256")" = "$FIXTURE_SHA"
python3 - "$FIXTURE" > "$PF/stimulus-wave-metadata.txt" <<'PY'
import sys,wave
w=wave.open(sys.argv[1],'rb'); ch,sr,sw,n=w.getnchannels(),w.getframerate(),w.getsampwidth(),w.getnframes()
print(f"channels={ch} sampleRate={sr} sampleWidthBytes={sw} frames={n} seconds={n/sr:.3f}")
print("format=" + ("EXACT" if (ch,sr,sw,n)==(1,48000,2,8640000) else "MISMATCH"))
sys.exit(0 if (ch,sr,sw,n)==(1,48000,2,8640000) else 1)
PY
system_profiler SPAudioDataType -json > "$PF/audio-output.json"
python3 - "$PF/audio-output.json" "$OUTPUT_DEVICE" "$OUTPUT_TRANSPORT" > "$PF/audio-output-check.txt" <<'PY'
import json,sys
raw=open(sys.argv[1],encoding='utf-8').read(); raw=raw[raw.find('{'):raw.rfind('}')+1]
items=[]
for g in json.loads(raw).get('SPAudioDataType',[]): items.extend(g.get('_items',[]))
defaults=[x for x in items if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
for x in defaults: print('DEFAULT_OUTPUT',x.get('_name'),x.get('coreaudio_device_transport'),x.get('coreaudio_device_srate'))
ok=len(defaults)==1 and defaults[0].get('_name')==sys.argv[2] and defaults[0].get('coreaudio_device_transport')==sys.argv[3]
print('DEFAULT_OUTPUT_MATCH',ok); sys.exit(0 if ok else 1)
PY
osascript -e 'get volume settings' > "$PF/volume.txt"
grep -q "output volume:$OUTPUT_VOLUME," "$PF/volume.txt"
grep -q "output muted:$OUTPUT_MUTED" "$PF/volume.txt"
test -x "$AFPLAY"
shasum -a 256 "$AFPLAY" > "$PF/afplay.sha256"
test "$(cut -d' ' -f1 "$PF/afplay.sha256")" = "$AFPLAY_SHA"
printf 'SID-SOURCE-PREFLIGHT-02 %s CLEAN subject %s instrument %s entry %s sid-container %s\n' "$STAMP" "$SUBJECT_SHA" "$SHA" "$ENTRY_SHA" "$SID_CONTAINER" | tee "$PF/PREFLIGHT-CLEAN"
SEAL=/private/tmp/sid-source-preflight-02-$STAMP.SHA256SUMS.preflight
( cd "$PF" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$PF/SHA256SUMS.preflight"
printf '%s\n%s\n' "$WT" "$PF" > "$PTR.tmp"
mv "$PTR.tmp" "$PTR"
echo "SID-SOURCE-PREFLIGHT-02 $STAMP CLEAN worktree $WT preflight $PF"
