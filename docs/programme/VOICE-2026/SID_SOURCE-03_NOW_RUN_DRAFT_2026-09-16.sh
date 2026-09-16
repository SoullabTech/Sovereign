#!/bin/bash
set -euo pipefail

DEV="A0736AC8-793B-516F-AC72-C076DB6CEE38"
PRE=/private/tmp/sid-source-preflight-03.sh
BATCH=/private/tmp/sid-source-batch-03.sh
BATCH_AUTH=/private/tmp/sid-source-batch-03-authority.txt

for f in "$PRE" "$BATCH" "$BATCH_AUTH"; do test -s "$f"; done
test ! -e /private/tmp/sid-source-batch-03-invoked.txt

echo "=== PIN CUSTODY ==="
test "$(shasum -a 256 "$PRE" | awk '{print $1}')" = "f806e92ae877e08f076b3ec88e8c1087e2ac6f77d6c78c0d60058c325f6cefa6"
test "$(shasum -a 256 "$BATCH" | awk '{print $1}')" = "c2c33b557971e46efd7ea44188eaf2b6b586869e918b360861aec22e63446ba4"

echo "=== MAC OUTPUT ==="
system_profiler SPAudioDataType -json > /private/tmp/source03-now-audio.json
python3 - /private/tmp/source03-now-audio.json <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); rows=[]
for g in d.get('SPAudioDataType',[]): rows += g.get('_items',[])
defs=[x for x in rows if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
print([(x.get('_name'),x.get('coreaudio_device_transport'),x.get('coreaudio_device_srate')) for x in defs])
assert len(defs)==1 and defs[0].get('_name')=='Mac Studio Speakers' and defs[0].get('coreaudio_device_transport')=='coreaudio_device_type_builtin'
PY
VOL="$(osascript -e 'get volume settings')"
echo "$VOL"
echo "$VOL" | grep -q 'output volume:69,'
echo "$VOL" | grep -q 'output muted:false'

echo "=== HARNESS ZERO ==="
PROC=/private/tmp/source03-now-processes-$(date -u +%Y%m%dT%H%M%SZ).json
xcrun devicectl device info processes --device "$DEV" --json-output "$PROC" >/dev/null
N="$(grep -ci VoiceKernelHarness "$PROC" || true)"
echo "VoiceKernelHarness=$N"
test "$N" = 0

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

echo "preflight_log=$PRELOG"
echo "batch_log=$BATCHLOG"
echo "SOURCE-03 NOW terminal chain complete"
