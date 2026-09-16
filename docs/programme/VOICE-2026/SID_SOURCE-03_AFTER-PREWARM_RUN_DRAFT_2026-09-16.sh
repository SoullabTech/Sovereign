#!/bin/bash
set -euo pipefail

DEV="A0736AC8-793B-516F-AC72-C076DB6CEE38"
UDID="00008140-00163D9922E0801C"
CLEAR_AUTH=/private/tmp/sid-source-harness-clear-02-authority.txt
BATCH_AUTH=/private/tmp/sid-source-batch-03-authority.txt

CLEAR=/private/tmp/sid-source-harness-clear-02.sh
PRE=/private/tmp/sid-source-preflight-03.sh
BATCH=/private/tmp/sid-source-batch-03.sh

for f in "$CLEAR_AUTH" "$BATCH_AUTH" "$CLEAR" "$PRE" "$BATCH"; do test -s "$f"; done
test ! -e /private/tmp/sid-source-batch-03-invoked.txt

shasum -a 256 "$CLEAR" "$PRE" "$BATCH"

echo "=== VERIFY MAC OUTPUT ==="
system_profiler SPAudioDataType -json > /private/tmp/source03-audio.json
python3 - /private/tmp/source03-audio.json <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); rows=[]
for g in d.get('SPAudioDataType',[]): rows += g.get('_items',[])
defs=[x for x in rows if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
print([(x.get('_name'),x.get('coreaudio_device_transport'),x.get('coreaudio_device_srate')) for x in defs])
assert len(defs)==1 and defs[0].get('_name')=='Mac Studio Speakers' and defs[0].get('coreaudio_device_transport')=='coreaudio_device_type_builtin'
PY
VOL="$(osascript -e 'get volume settings')"; echo "$VOL"
echo "$VOL" | grep -q 'output volume:69,'
echo "$VOL" | grep -q 'output muted:false'
echo "=== OBSERVE NEXT DAS PREWARM COMPLETION ==="
TRIG=/private/tmp/source03-dasd-trigger-$(date -u +%Y%m%dT%H%M%SZ).log
idevicesyslog -u "$UDID" -p dasd --no-colors > "$TRIG" 2>&1 &
SPID=$!
trap 'kill "$SPID" 2>/dev/null || true' EXIT
until grep -q 'Rescheduling repeating task com.apple.appResume.prewarm' "$TRIG"; do sleep 1; done
kill "$SPID" 2>/dev/null || true
wait "$SPID" 2>/dev/null || true
trap - EXIT
grep 'Rescheduling repeating task com.apple.appResume.prewarm' "$TRIG" | tail -1

echo "=== REQUIRE EXACT HISTORICAL THREE ==="
PROC=/private/tmp/source03-post-prewarm-processes-$(date -u +%Y%m%dT%H%M%SZ).json
xcrun devicectl device info processes --device "$DEV" --json-output "$PROC" >/dev/null
python3 - "$PROC" <<'PY'
import json,sys
exp=sorted(['0B07D423-97E7-4196-BC1C-C69C96F994BE','6A2E406B-D1B8-43A4-92F3-29D50333AF19','E3B88028-A10F-46B1-AB27-CF0A1F83FB78'])
d=json.load(open(sys.argv[1])); got=[]
for r in d.get('result',{}).get('runningProcesses',[]):
 e=str(r.get('executable',''))
 if 'VoiceKernelHarness.app/VoiceKernelHarness' in e:
  c=e.split('/Bundle/Application/',1)[1].split('/',1)[0] if '/Bundle/Application/' in e else ''
  got.append(c); print('HARNESS',r.get('processIdentifier'),c,e)
assert sorted(got)==exp and len(got)==3 and len(set(got))==3, f'expected exact historical three, got {got}'
PY

echo "=== CLEAR-02 ==="
export K00_EXEC_AUTHORITY="$(cat "$CLEAR_AUTH")"
CLEARLOG=/private/tmp/sid-source-harness-clear-02-terminal-$(date -u +%Y%m%dT%H%M%SZ).log
bash "$CLEAR" 2>&1 | tee "$CLEARLOG"
unset K00_EXEC_AUTHORITY
echo "=== PRELIGHT-03 ==="
PRELOG=/private/tmp/sid-source-preflight-03-terminal-$(date -u +%Y%m%dT%H%M%SZ).log
bash "$PRE" 2>&1 | tee "$PRELOG"
PTR=/private/tmp/sid-source-preflight-03-current.txt
test -f "$PTR"
PF="$(sed -n '2p' "$PTR")"
test -n "$PF"
test -f "$PF/PREFLIGHT-CLEAN"
test -f "$PF/SHA256SUMS.preflight"
cat "$PF/PREFLIGHT-CLEAN"

echo "=== BATCH-03 ==="
export K00_EXEC_AUTHORITY="$(cat "$BATCH_AUTH")"
BATCHLOG=/private/tmp/sid-source-batch-03-terminal-$(date -u +%Y%m%dT%H%M%SZ).log
bash "$BATCH" 2>&1 | tee "$BATCHLOG"
unset K00_EXEC_AUTHORITY

echo "clear_log=$CLEARLOG"
echo "preflight_log=$PRELOG"
echo "batch_log=$BATCHLOG"
echo "SOURCE-03 terminal chain complete"
