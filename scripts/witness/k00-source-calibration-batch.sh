#!/usr/bin/env bash
# SOURCE LEVEL-CALIBRATION-01 population helper.
#
# Executes ONE predeclared at-rest level population with a dedicated external
# XCUITest orchestration path. The driver is built ONCE before any acoustic
# playback. Each row gets its own source-player lifetime:
#
#   harness-zero → source start/settle → JIT harness-zero → testOneSample
#   → source stop/wait → exactly-one-journal custody → next row
#
# Historical k00-driver-batch.sh and all historical readers remain untouched.
set -euo pipefail

LEVEL="${1:?L1|L2|L3}"
VP="${2:?on|off}"
N="${3:?population N}"
FIXTURE="${4:?sealed fixture path}"
FIXTURE_SHA="${5:?sealed fixture sha256}"
GEOMETRY="${6:?geometry record path}"
GEOMETRY_SHA="${7:?geometry record sha256}"
VP_ON_RESULT="${8:-}"

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

# Defense in depth: this helper is not a standalone authority surface.
[ "${K00_CAL_BATCH_AUTHORITY:-}" = BOUND ] || { echo "K00_CAL_BATCH_AUTHORITY=BOUND required" >&2; exit 2; }

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"
TEAM="${K00_TEAM:-ZVK2X646Z2}"
BID=life.soullab.voicekernel.vpio02sid
AFPLAY=/usr/bin/afplay
AFPLAY_SHA=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
OUTPUT_VOLUME=69
OUTPUT_MUTED=false
OUTPUT_DEVICE="Mac Studio Speakers"
OUTPUT_TRANSPORT=coreaudio_device_type_builtin
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LEDGER="$ROOT/docs/programme/VOICE-2026/driver-ledger/SOURCE-LEVEL-CALIBRATION-01-$LEVEL-$VP-$STAMP"
PROJ="$ROOT/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj"
DD="$ROOT/ios/VoiceKernelDriver/.derived-calibration"
mkdir -p "$LEDGER/journals"

log(){ printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*" | tee -a "$LEDGER/calibration-batch.log"; }
sha(){ shasum -a 256 "$1" | awk '{print $1}'; }

# One governed population against one device at a time.
LOCKDIR="$ROOT/docs/programme/VOICE-2026/driver-ledger/.source-calibration-$DEV.lock.d"
mkdir "$LOCKDIR" 2>/dev/null || { echo "another source calibration population already owns device $DEV" >&2; exit 5; }
PLAYER_PID=""
MON_PID=""
cleanup(){
  if [ -n "$MON_PID" ]; then kill "$MON_PID" 2>/dev/null || true; wait "$MON_PID" 2>/dev/null || true; MON_PID=""; fi
  if [ -n "$PLAYER_PID" ] && kill -0 "$PLAYER_PID" 2>/dev/null; then kill -TERM "$PLAYER_PID" 2>/dev/null || true; fi
  if [ -n "$PLAYER_PID" ]; then wait "$PLAYER_PID" 2>/dev/null || true; PLAYER_PID=""; fi
  rmdir "$LOCKDIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

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

printf 'level=%s\nvp=%s\nN=%s\ngain=%s\neffectivePeakFS=%s\nfixtureSha256=%s\ngeometrySha256=%s\n' \
  "$LEVEL" "$VP" "$N" "$GAIN" "$EFFECTIVE" "$FIXTURE_SHA" "$GEOMETRY_SHA" > "$LEDGER/calibration-identity.txt"

# Build the external driver before any source playback.
log "xcodegen generate (driver only; no phone sample, no source playback)"
( cd "$ROOT/ios/VoiceKernelDriver" && xcodegen generate ) > "$LEDGER/xcodegen.log" 2>&1 || {
  log "DRIVER/INFRASTRUCTURE FAILURE: xcodegen failed"; exit 3;
}
log "build-for-testing (driver only; no source playback)"
xcodebuild build-for-testing -project "$PROJ" -scheme DriverUITests -destination "id=$XDEST" \
  -derivedDataPath "$DD" DEVELOPMENT_TEAM="$TEAM" > "$LEDGER/build-for-testing.log" 2>&1 || {
  log "DRIVER/INFRASTRUCTURE FAILURE: build-for-testing failed"; exit 3;
}
XCTESTRUN="$(ls -t "$DD"/Build/Products/*.xctestrun | head -1)"
[ -f "$XCTESTRUN" ]
printf '%s\n' "$XCTESTRUN" > "$LEDGER/xctestrun.txt"

DIAG_FLAGS=""
if xcodebuild -help 2>&1 | grep -q -- '-collect-test-diagnostics'; then DIAG_FLAGS="-collect-test-diagnostics never"; fi

run_test(){
  env TEST_RUNNER_K00_MODE=L TEST_RUNNER_K00_VP="$VP" TEST_RUNNER_K00_HOLD_S=15 TEST_RUNNER_K00_SUBJECT=vpio-02-sid \
    xcodebuild test-without-building -xctestrun "$XCTESTRUN" -destination "id=$XDEST" $DIAG_FLAGS \
      -only-testing:"DriverUITests/K00DriverTests/testOneSample"
}

process_guard(){
  local idx="$1"
  local phase="$2"
  local js="$LEDGER/sample-$idx-$phase-processes.json"
  local out="$LEDGER/sample-$idx-$phase-processes.stdout"
  xcrun devicectl device info processes --device "$DEV" --json-output "$js" >"$out" 2>&1 || return 1
  [ -s "$js" ] || return 1
  local n
  n="$(grep -ci VoiceKernelHarness "$js" || true)"
  printf 'sample=%s phase=%s harnesses=%s\n' "$idx" "$phase" "$n" > "$LEDGER/sample-$idx-$phase-harness-state.txt"
  [ "$n" -eq 0 ]
}

LIST_RC=0
list_journals(){
  local out rc n
  for n in 1 2 3; do
    out="$(xcrun devicectl device info files --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --subdirectory tmp 2>&1)"
    rc=$?
    if [ "$rc" -eq 0 ] && ! grep -q 'ERROR' <<<"$out"; then
      LIST_RC=0
      grep -oE 'kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl' <<<"$out" | sort -u
      return 0
    fi
    sleep 3
  done
  LIST_RC=1
  return 1
}

pull_journal(){
  local name="$1" dest="$2"
  xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" \
    --source "tmp/$name" --destination "$dest" >/dev/null 2>&1
}

player_state(){
  local st cm
  st="$(ps -o stat= -p "$PLAYER_PID" 2>/dev/null | tr -d ' ')"
  cm="$(ps -o comm= -p "$PLAYER_PID" 2>/dev/null || true)"
  [ -n "$st" ] || { echo gone; return; }
  case "$st" in *Z*) echo zombie; return;; esac
  case "$cm" in *afplay*) echo alive;; *) echo "not-afplay:$cm";; esac
}

start_player(){
  local idx="$1"
  local live="$LEDGER/sample-$idx-afplay-liveness.tsv"
  "$AFPLAY" -v "$GAIN" "$FIXTURE" </dev/null > "$LEDGER/sample-$idx-afplay.log" 2>&1 &
  PLAYER_PID=$!
  sleep 1
  local state
  state="$(player_state)"
  printf 'epoch\tstate\n%s\t%s\n' "$(date +%s)" "$state" > "$live"
  [ "$state" = alive ] || return 1
  (
    while :; do
      sleep 1
      printf '%s\t%s\n' "$(date +%s)" "$(player_state)" >> "$live"
    done
  ) &
  MON_PID=$!
}

stop_player(){
  local idx="$1"
  local live="$LEDGER/sample-$idx-afplay-liveness.tsv"
  if [ -n "$MON_PID" ]; then kill "$MON_PID" 2>/dev/null || true; wait "$MON_PID" 2>/dev/null || true; MON_PID=""; fi
  local state
  state="$(player_state)"
  printf '%s\t%s\n' "$(date +%s)" "$state" >> "$live"
  if kill -0 "$PLAYER_PID" 2>/dev/null; then kill -TERM "$PLAYER_PID" 2>/dev/null || true; fi
  wait "$PLAYER_PID" 2>/dev/null || true
  PLAYER_PID=""
  [ "$state" = alive ] || return 1
  if grep -Eq $'\t(gone|zombie|not-afplay:)' "$live"; then return 1; fi
}

BEFORE="$(list_journals)" || { log "container listing failed before sample 1"; exit 7; }

for i in $(seq 1 "$N"); do
  log "sample $i/$N — PRE-PLAY harness-zero"
  if ! process_guard "$i" preplay; then
    log "STOP: sample $i PRE-PLAY process set unreadable or harness nonzero; no source started, no sample launched"
    exit 11
  fi

  start_player "$i" || {
    log "STOP: sample $i source player not alive after settle; no phone sample launched"
    exit 9
  }

  log "sample $i/$N — JIT harness-zero after source settle"
  if ! process_guard "$i" jit; then
    stop_player "$i" || true
    log "STOP: sample $i JIT process set unreadable or harness nonzero; source stopped, no sample launched"
    exit 11
  fi

  log "sample $i/$N — testOneSample"
  T0="$(date +%s)"
  set +e
  run_test > "$LEDGER/sample-$i-xcodebuild.log" 2>&1
  RC=$?
  set -e
  T1="$(date +%s)"
  printf '%s\t%s\t%s\t%s\n' "$i" "$T0" "$T1" "$RC" >> "$LEDGER/sample-timing.tsv"

  if ! stop_player "$i"; then
    log "STOP: sample $i source player did not remain alive for the full phone invocation"
    exit 9
  fi

  [ "$RC" -eq 0 ] || {
    log "STOP: sample $i driver rc=$RC; no outcome-conditioned retry"
    exit 6
  }

  AFTER="$(list_journals)"
  if [ "$LIST_RC" -ne 0 ]; then
    log "STOP: sample $i post-run container listing failed; no custody inference"
    exit 7
  fi
  NEW="$(comm -13 <(printf '%s\n' "$BEFORE") <(printf '%s\n' "$AFTER"))"
  BEFORE="$AFTER"
  COUNT="$(printf '%s\n' "$NEW" | sed '/^$/d' | wc -l | tr -d ' ')"
  [ "$COUNT" -eq 1 ] || {
    printf '%s\n' "$NEW" > "$LEDGER/sample-$i-new-journals.txt"
    log "STOP: sample $i produced $COUNT new journals, expected exactly one"
    exit 7
  }

  NAME="$(printf '%s\n' "$NEW" | sed '/^$/d')"
  DEST="$LEDGER/journals/$NAME"
  pull_journal "$NAME" "$DEST" || {
    log "STOP: sample $i journal could not be copied"
    exit 7
  }
  shasum -a 256 "$DEST" > "$LEDGER/sample-$i-journal.sha256"
  log "sample $i custody complete: $NAME"
done

JOURNALS="$(find "$LEDGER/journals" -maxdepth 1 -type f -name '*.jsonl' | LC_ALL=C sort)"
JOURNAL_COUNT="$(printf '%s\n' "$JOURNALS" | sed '/^$/d' | wc -l | tr -d ' ')"
[ "$JOURNAL_COUNT" -eq "$N" ] || { log "expected $N journals, found $JOURNAL_COUNT"; exit 7; }

RESULT="$LEDGER/calibration-result.json"
if [ "$VP" = off ]; then
  python3 "$ROOT/scripts/witness/k00-source-calibration.py" --label "$LEVEL-$VP" --json-out "$RESULT" \
    --compare-vp-on "$VP_ON_RESULT" $JOURNALS > "$LEDGER/calibration-result.stdout"
else
  python3 "$ROOT/scripts/witness/k00-source-calibration.py" --label "$LEVEL-$VP" --json-out "$RESULT" \
    $JOURNALS > "$LEDGER/calibration-result.stdout"
fi

( cd "$LEDGER" && find . -type f ! -name SHA256SUMS.calibration | LC_ALL=C sort | xargs shasum -a 256 ) > "$LEDGER/SHA256SUMS.calibration"

python3 - "$RESULT" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
print("CALIBRATION_LEVEL_RESULT=" + ("PASS" if r.get("populationPass") else "NO_PIN"))
print(f"rows={r.get('rowCount')} passing={r.get('passingRows')} medianDb={r.get('medianDb')}")
if 'vpComparison' in r: print("VP_CHARACTERIZATION=" + r['vpComparison']['characterization'])
PY

log "population complete: $LEDGER"
echo "$LEDGER"
