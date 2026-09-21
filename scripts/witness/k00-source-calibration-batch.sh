#!/usr/bin/env bash
# SOURCE LEVEL-CALIBRATION-01 population helper.
#
# Executes ONE predeclared at-rest level population by playing the sealed master
# outside the frozen historical SID entry batch. It never edits k00-driver-batch.sh.
set -euo pipefail

LEVEL="$1"
VP="$2"
N="$3"
FIXTURE="$4"
FIXTURE_SHA="$5"
GEOMETRY="$6"
GEOMETRY_SHA="$7"
VP_ON_RESULT=""
[ "$#" -ge 8 ] && VP_ON_RESULT="$8"

case "$LEVEL" in
  L1) GAIN="0.285714"; EFFECTIVE="0.20";;
  L2) GAIN="0.571429"; EFFECTIVE="0.40";;
  L3) GAIN="1.000000"; EFFECTIVE="0.70";;
  *) echo "unknown level $LEVEL" >&2; exit 2;;
esac
case "$VP" in on|off) ;; *) echo "vp must be on|off" >&2; exit 2;; esac
if [ "$VP" = on ]; then
  [ "$N" = 5 ] || { echo "VP-ON calibration is exactly N=5 per level" >&2; exit 2; }
  [ -z "$VP_ON_RESULT" ] || { echo "VP-ON level must not receive a comparison file" >&2; exit 2; }
else
  [ "$N" = 3 ] || { echo "VP-OFF characterization is exactly N=3" >&2; exit 2; }
  [ -f "$VP_ON_RESULT" ] || { echo "VP-OFF requires the selected VP-ON result JSON" >&2; exit 2; }
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="$(printenv K00_DEVICE 2>/dev/null || true)"
[ -n "$DEV" ] || DEV="A0736AC8-793B-516F-AC72-C076DB6CEE38"
AFPLAY=/usr/bin/afplay
AFPLAY_SHA=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
OUTPUT_VOLUME=69
OUTPUT_MUTED=false
OUTPUT_DEVICE="Mac Studio Speakers"
OUTPUT_TRANSPORT=coreaudio_device_type_builtin
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LEDGER="$ROOT/docs/programme/VOICE-2026/driver-ledger/SOURCE-LEVEL-CALIBRATION-01-$LEVEL-$VP-$STAMP"
mkdir -p "$LEDGER"

log(){ printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*" | tee -a "$LEDGER/calibration-batch.log"; }
sha(){ shasum -a 256 "$1" | awk '{print $1}'; }

[ -f "$FIXTURE" ]
[ "$(sha "$FIXTURE")" = "$FIXTURE_SHA" ]
python3 "$ROOT/scripts/witness/k00-source-calibration-fixture.py" --verify "$FIXTURE" > "$LEDGER/fixture-verification.json"
[ -f "$GEOMETRY" ]
[ "$(sha "$GEOMETRY")" = "$GEOMETRY_SHA" ]
cp "$GEOMETRY" "$LEDGER/geometry-record.txt"
printf '%s\n' "$GEOMETRY_SHA" > "$LEDGER/geometry-record.sha256"

test -x "$AFPLAY"
[ "$(sha "$AFPLAY")" = "$AFPLAY_SHA" ]
osascript -e 'get volume settings' > "$LEDGER/volume.txt"
grep -q "output volume:$OUTPUT_VOLUME," "$LEDGER/volume.txt"
grep -q "output muted:$OUTPUT_MUTED" "$LEDGER/volume.txt"

system_profiler SPAudioDataType -json > "$LEDGER/audio-output.json"
python3 - "$LEDGER/audio-output.json" "$OUTPUT_DEVICE" "$OUTPUT_TRANSPORT" > "$LEDGER/audio-output-check.txt" <<'PY'
import json,sys
raw=open(sys.argv[1],encoding='utf-8').read(); raw=raw[raw.find('{'):raw.rfind('}')+1]
items=[]
for g in json.loads(raw).get('SPAudioDataType',[]): items.extend(g.get('_items',[]))
defaults=[x for x in items if x.get('coreaudio_default_audio_output_device')=='spaudio_yes']
for x in defaults: print('DEFAULT_OUTPUT',x.get('_name'),x.get('coreaudio_device_transport'),x.get('coreaudio_device_srate'))
ok=len(defaults)==1 and defaults[0].get('_name')==sys.argv[2] and defaults[0].get('coreaudio_device_transport')==sys.argv[3]
print('DEFAULT_OUTPUT_MATCH',ok); raise SystemExit(0 if ok else 1)
PY

# Fail closed before playback. No terminate/normalization path exists here.
xcrun devicectl device info processes --device "$DEV" --json-output "$LEDGER/preplay-processes.json" > "$LEDGER/preplay-processes.stdout"
test "$(grep -ci VoiceKernelHarness "$LEDGER/preplay-processes.json" || true)" = 0

printf 'level=%s\nvp=%s\nN=%s\ngain=%s\neffectivePeakFS=%s\nfixtureSha256=%s\ngeometrySha256=%s\n'   "$LEVEL" "$VP" "$N" "$GAIN" "$EFFECTIVE" "$FIXTURE_SHA" "$GEOMETRY_SHA" > "$LEDGER/calibration-identity.txt"

PLAYER_LOG="$LEDGER/afplay.log"
PLAYER_LIVE="$LEDGER/afplay-liveness.tsv"
"$AFPLAY" -v "$GAIN" "$FIXTURE" </dev/null >"$PLAYER_LOG" 2>&1 &
PLAYER_PID=$!
MON_PID=""

player_state(){
  local st cm
  st="$(ps -o stat= -p "$PLAYER_PID" 2>/dev/null | tr -d ' ')"
  cm="$(ps -o comm= -p "$PLAYER_PID" 2>/dev/null || true)"
  [ -n "$st" ] || { echo gone; return; }
  case "$st" in *Z*) echo zombie; return;; esac
  case "$cm" in *afplay*) echo alive;; *) echo "not-afplay:$cm";; esac
}
stop_player(){
  if [ -n "$MON_PID" ]; then kill "$MON_PID" 2>/dev/null || true; wait "$MON_PID" 2>/dev/null || true; MON_PID=""; fi
  if kill -0 "$PLAYER_PID" 2>/dev/null; then kill -TERM "$PLAYER_PID" 2>/dev/null || true; fi
  wait "$PLAYER_PID" 2>/dev/null || true
}
trap 'stop_player' EXIT INT TERM

sleep 1
STATE="$(player_state)"
printf 'epoch\tstate\n%s\t%s\n' "$(date +%s)" "$STATE" > "$PLAYER_LIVE"
[ "$STATE" = alive ] || { log "fixture player not alive before phone batch"; exit 9; }
(
  while :; do
    sleep 1
    printf '%s\t%s\n' "$(date +%s)" "$(player_state)" >> "$PLAYER_LIVE"
  done
) &
MON_PID=$!

# JIT fail-closed read after source settle, before the frozen batch gets authority.
xcrun devicectl device info processes --device "$DEV" --json-output "$LEDGER/jit-processes.json" > "$LEDGER/jit-processes.stdout"
test "$(grep -ci VoiceKernelHarness "$LEDGER/jit-processes.json" || true)" = 0

log "running frozen SID entry batch level=$LEVEL vp=$VP N=$N gain=$GAIN"
set +e
"$ROOT/scripts/witness/k00-driver-batch.sh" "SOURCE-LEVEL-CAL-$LEVEL-$VP" "$N"   --act entry --vp "$VP" --mode L --hold 15 --subject vpio-02-sid --ledger "$LEDGER/entry-population"   > "$LEDGER/entry-batch.stdout" 2>&1
RC=$?
set -e

POST_STATE="$(player_state)"
printf '%s\t%s\n' "$(date +%s)" "$POST_STATE" >> "$PLAYER_LIVE"
stop_player
trap - EXIT INT TERM

[ "$RC" -eq 0 ] || { log "frozen entry batch returned rc=$RC; evidence preserved"; exit "$RC"; }
[ "$POST_STATE" = alive ] || { log "fixture player died before the governed population ended"; exit 9; }
if grep -Eq $'\t(gone|zombie|not-afplay:)' "$PLAYER_LIVE"; then
  log "fixture liveness failed during population"
  exit 9
fi

JOURNALS="$(find "$LEDGER/entry-population/journals" -maxdepth 1 -type f -name '*.jsonl' | LC_ALL=C sort)"
JOURNAL_COUNT="$(printf '%s\n' "$JOURNALS" | sed '/^$/d' | wc -l | tr -d ' ')"
[ "$JOURNAL_COUNT" -eq "$N" ] || { log "expected $N journals, found $JOURNAL_COUNT"; exit 7; }

RESULT="$LEDGER/calibration-result.json"
if [ "$VP" = off ]; then
  python3 "$ROOT/scripts/witness/k00-source-calibration.py" --label "$LEVEL-$VP" --json-out "$RESULT" --compare-vp-on "$VP_ON_RESULT" $JOURNALS > "$LEDGER/calibration-result.stdout"
else
  python3 "$ROOT/scripts/witness/k00-source-calibration.py" --label "$LEVEL-$VP" --json-out "$RESULT" $JOURNALS > "$LEDGER/calibration-result.stdout"
fi

( cd "$LEDGER" && find . -type f ! -name SHA256SUMS.calibration -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 ) > "$LEDGER/SHA256SUMS.calibration"

python3 - "$RESULT" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
print("CALIBRATION_LEVEL_RESULT=" + ("PASS" if r.get("populationPass") else "NO_PIN"))
print(f"rows={r.get('rowCount')} passing={r.get('passingRows')} medianDb={r.get('medianDb')}")
if 'vpComparison' in r: print("VP_CHARACTERIZATION=" + r['vpComparison']['characterization'])
PY

log "population complete: $LEDGER"
echo "$LEDGER"
