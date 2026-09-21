set -e
set -o pipefail

SHA=89022e8f021b8fb8217eb09c9e7caef94ffce52f
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
BID=life.soullab.voicekernel.vpio02sid
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
VOICEKERNEL_TREE=df48584178c67ca0ac0daeab2918fd57c571c4e8
HARNESS_TREE=7a37892d2afdb56174ef367e99f2bc2f8e44c946
DRIVER_BATCH_BLOB=bd6fb211dc85c2352b27168c2d3516af54d15746
SOURCE_READER_BLOB=ff2924059de663a701f80b888e1611adad3c8159
OUTPUT_READER_BLOB=a87c56d0a6073b177e160f8c92dc95ec2673b3ca
ENTRY_READER_BLOB=abd26d05efd838cd87c93fcdb1d1706e2b671901
FIXTURE_GENERATOR_BLOB=7ea01b1b4413e0b1de23db73941b3a6b80829033
CAL_READER_BLOB=f4c71767aae7afe3f64a64cf95398bd7c358c128
CAL_BATCH_BLOB=a6605808799da65aaf42aa20c7c22fc841759bd2
CAL_TEST_BLOB=bae34223d1591f4aa96b393ba8032d430395ceb2
AFPLAY=/usr/bin/afplay
AFPLAY_SHA=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
DEV="$(printenv K00_DEVICE 2>/dev/null || true)"
[ -n "$DEV" ] || DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WT="/private/tmp/source-level-calibration-01-$SHA-$STAMP"
PTR=/private/tmp/source-level-calibration-01-preflight-current.txt
printf 'INCOMPLETE %s\n' "$STAMP" > "$PTR"

ORIENTATION="$(printenv K00_CAL_PHONE_ORIENTATION 2>/dev/null || true)"
MIC_EDGE="$(printenv K00_CAL_PHONE_MIC_EDGE 2>/dev/null || true)"
DISTANCE="$(printenv K00_CAL_DISTANCE_CM 2>/dev/null || true)"
SUPPORT="$(printenv K00_CAL_SUPPORT 2>/dev/null || true)"
ROOM_STATE="$(printenv K00_CAL_ROOM_STATE 2>/dev/null || true)"
NOTES="$(printenv K00_CAL_NOTES 2>/dev/null || true)"
[ -n "$ORIENTATION" ]
[ -n "$MIC_EDGE" ]
[ -n "$DISTANCE" ]
[ -n "$SUPPORT" ]
[ -n "$ROOM_STATE" ]
case "$DISTANCE" in *[!0-9.]*|'') echo "K00_CAL_DISTANCE_CM must be a positive numeric value" >&2; exit 2;; esac
python3 - "$DISTANCE" <<'PY'
import sys
v=float(sys.argv[1])
raise SystemExit(0 if v > 0 else 2)
PY

test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-closure-reconcile-20260921
git worktree add --detach "$WT" "$SHA"
cd "$WT"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain)"

test "$(git rev-parse "$SHA:ios/VoiceKernel")" = "$VOICEKERNEL_TREE"
test "$(git rev-parse "$SHA:ios/VoiceKernelHarness")" = "$HARNESS_TREE"
test "$(git rev-parse "$SHA:scripts/witness/k00-driver-batch.sh")" = "$DRIVER_BATCH_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-source-ledger.py")" = "$SOURCE_READER_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-output-ledger.py")" = "$OUTPUT_READER_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-ledger.py")" = "$ENTRY_READER_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-source-calibration-fixture.py")" = "$FIXTURE_GENERATOR_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-source-calibration.py")" = "$CAL_READER_BLOB"
test "$(git rev-parse "$SHA:scripts/witness/k00-source-calibration-batch.sh")" = "$CAL_BATCH_BLOB"
test "$(git rev-parse "$SHA:__tests__/voice-source-calibration-01.test.ts")" = "$CAL_TEST_BLOB"

PF="$WT/docs/programme/VOICE-2026/driver-ledger/SOURCE-LEVEL-CALIBRATION-01-preflight-$STAMP"
mkdir -p "$PF"
git rev-parse HEAD | tee "$PF/head.txt"
printf '%s\n' "$SUBJECT_SHA" > "$PF/sid-subject.txt"

python3 scripts/witness/k00-source-calibration-fixture.py --selftest > "$PF/fixture-selftest.txt"
grep -q '^selftest: 4/4$' "$PF/fixture-selftest.txt"
python3 scripts/witness/k00-source-calibration.py --selftest > "$PF/calibration-reader-selftest.txt"
grep -q '^selftest: 3/3$' "$PF/calibration-reader-selftest.txt"
bash -n scripts/witness/k00-source-calibration-batch.sh
npx jest __tests__/voice-source-calibration-01.test.ts --runInBand --silent > "$PF/jest.txt"

xcrun devicectl device info apps --device "$DEV" --bundle-id "$BID" --json-output "$PF/apps-vpio02sid.json"
python3 - "$PF/apps-vpio02sid.json" "$BID" "$SID_CONTAINER" > "$PF/app-check.txt" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
s=json.dumps(d)
ok=s.count(sys.argv[2]) >= 1 and sys.argv[3] in s
print("SID_APP_CONTAINER_MATCH",ok)
raise SystemExit(0 if ok else 1)
PY
xcrun devicectl device info processes --device "$DEV" --json-output "$PF/processes.json"
test "$(grep -ci VoiceKernelHarness "$PF/processes.json" || true)" = 0

system_profiler SPAudioDataType -json > "$PF/audio-output.json"
python3 - "$PF/audio-output.json" > "$PF/audio-output-check.txt" <<'PY'
import json,sys
raw=open(sys.argv[1],encoding='utf-8').read(); raw=raw[raw.find('{'):raw.rfind('}')+1]
items=[]
for g in json.loads(raw).get('SPAudioDataType',[]): items.extend(g.get('_items',[]))
defaults=[x for x in items if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
ok=len(defaults)==1 and defaults[0].get('_name')=='Mac Studio Speakers' and defaults[0].get('coreaudio_device_transport')=='coreaudio_device_type_builtin'
for x in defaults: print('DEFAULT_OUTPUT',x.get('_name'),x.get('coreaudio_device_transport'),x.get('coreaudio_device_srate'))
print('DEFAULT_OUTPUT_MATCH',ok)
raise SystemExit(0 if ok else 1)
PY
osascript -e 'get volume settings' > "$PF/volume.txt"
grep -q 'output volume:69,' "$PF/volume.txt"
grep -q 'output muted:false' "$PF/volume.txt"

test -x "$AFPLAY"
shasum -a 256 "$AFPLAY" > "$PF/afplay.sha256"
test "$(cut -d' ' -f1 "$PF/afplay.sha256")" = "$AFPLAY_SHA"

GEOMETRY="$PF/geometry-record.txt"
{
  printf 'phoneModel=iPhone 16 Pro Max\n'
  printf 'orientation=%s\n' "$ORIENTATION"
  printf 'microphoneEdgeTowardSpeaker=%s\n' "$MIC_EDGE"
  printf 'distanceCm=%s\n' "$DISTANCE"
  printf 'support=%s\n' "$SUPPORT"
  printf 'speaker=Mac Studio Speakers\n'
  printf 'systemVolume=69\n'
  printf 'roomState=%s\n' "$ROOM_STATE"
  printf 'notes=%s\n' "$NOTES"
  printf 'recordedAt=%s\n' "$STAMP"
} > "$GEOMETRY"
GEOMETRY_SHA="$(shasum -a 256 "$GEOMETRY" | awk '{print $1}')"
printf '%s\n' "$GEOMETRY_SHA" > "$PF/geometry-record.sha256"

FIXTURE="$PF/source-calibration-master-997hz-gated-2hz-070fs-180s.wav"
python3 scripts/witness/k00-source-calibration-fixture.py --out "$FIXTURE" > "$PF/fixture.json"
FIXTURE_SHA="$(shasum -a 256 "$FIXTURE" | awk '{print $1}')"
python3 scripts/witness/k00-source-calibration-fixture.py --verify "$FIXTURE" > "$PF/fixture-verify.json"
test "$(shasum -a 256 "$FIXTURE" | awk '{print $1}')" = "$FIXTURE_SHA"

printf 'SOURCE-LEVEL-CALIBRATION-01 PRELIGHT CLEAN %s implementation %s subject %s fixture %s geometry %s\n'   "$STAMP" "$SHA" "$SUBJECT_SHA" "$FIXTURE_SHA" "$GEOMETRY_SHA" | tee "$PF/PREFLIGHT-CLEAN"

SEAL="/private/tmp/source-level-calibration-01-$STAMP.SHA256SUMS.preflight"
( cd "$PF" && find . -type f ! -name SHA256SUMS.preflight | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$PF/SHA256SUMS.preflight"

{
  printf '%s\n' "$WT"
  printf '%s\n' "$PF"
  printf '%s\n' "$FIXTURE"
  printf '%s\n' "$FIXTURE_SHA"
  printf '%s\n' "$GEOMETRY"
  printf '%s\n' "$GEOMETRY_SHA"
} > "$PTR.tmp"
mv "$PTR.tmp" "$PTR"

echo "SOURCE-LEVEL-CALIBRATION-01 PRELIGHT CLEAN worktree $WT preflight $PF"
