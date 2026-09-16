#!/usr/bin/env bash
# DRIVER-01 — Mac orchestration and evidence custody. One command per declared batch.
#
#   usage: scripts/witness/k00-driver-batch.sh <stratum> <N> [--vp on|off] [--mode I|L] [--hold S] [--w4 MS] [--subject p5b0|phase-a|vpio-01|vpio-02|vpio-02-sid] [--ledger DIR]
#                                              [--act entry|output|duplex] [--cancel-at MS] [--settle S]
#                                              [--stimulus s2-nearend]
#          S2 (founder ruling 2026-09-15, batch-only design): `--stimulus s2-nearend` is the ONE closed token; the batch resolves it
#          internally to the tracked, SHA-pinned fixture and plays it through /usr/bin/afplay (binary SHA-pinned) around the
#          run_test seam of every sample — started and proven alive BEFORE the phone invocation, monitored at 1 s throughout,
#          explicitly stopped and waited AFTER it. Lawful only with --act output --vp on --mode L --subject vpio-02; anything
#          else refuses before playback. A population preflight READS (never sets) the Mac default output device, transport,
#          output volume and mute state and STOPS on any mismatch. Stimulus custody lives in stimulus-sample-N.tsv and the
#          stimulus-preflight/ directory only; neither reader ever sees it. Without --stimulus the batch is byte-for-byte the
#          historical instrument.
#          K00-05/06 (founder ruling 2026-09-14, Option C): `--act output --cancel-at 1000 --settle 2` selects testOutputSample and
#          forwards the two values through the runner env only; every row is additionally read by k00-output-ledger.py into
#          output-ledger.md (evidence-only). Without `--act output` the batch behaves exactly as before (entry act, no extra env).
#   e.g.   scripts/witness/k00-driver-batch.sh CALIBRATION 3
#          scripts/witness/k00-driver-batch.sh STAGE-A 30
#          scripts/witness/k00-driver-batch.sh W4-AUTO 3 --w4 500
#
# Per sample:  Mac verifies the harness process is ABSENT (devicectl)  →  one xcodebuild
# test-without-building invocation of the XCUITest driver  →  the one new kernel00-*.jsonl is
# pulled from the app container tmp/  →  SHA-256  →  k00-ledger.py row appended to the ledger.
# A failed driver operation is ledgered as DRIVER/INFRASTRUCTURE FAILURE, never as a class.
# A precondition miss is ledgered as PRECONDITION-FAILED and the sample is not repaired.
# The declared N is always finished (no selection); the batch aborts only if the driver itself
# cannot terminate a lingering harness (an infrastructure abort, recorded as such).
set -uo pipefail
STRATUM="${1:?stratum label}"; N="${2:?N}"; shift 2
VP=on; MODE=I; HOLD=15; W4=""; SUBJECT=p5b0; LEDGER_DIR=""; ACT=entry; CANCEL_AT=1000; SETTLE=2
STIMULUS=""; S2_PID=""; S2_MON=""
while [ $# -gt 0 ]; do case "$1" in
  --vp) VP="$2"; shift 2;; --mode) MODE="$2"; shift 2;; --hold) HOLD="$2"; shift 2;;
  --w4) W4="$2"; shift 2;; --subject) SUBJECT="$2"; shift 2;; --ledger) LEDGER_DIR="$2"; shift 2;;
  --act) ACT="$2"; shift 2;; --cancel-at) CANCEL_AT="$2"; shift 2;; --settle) SETTLE="$2"; shift 2;;
  --stimulus) STIMULUS="$2"; shift 2;;
  *) echo "unknown arg $1" >&2; exit 2;; esac; done
if [ "$ACT" != duplex ]; then
case "$ACT" in entry|output) ;; *) echo "unknown act '$ACT' (entry|output); refusing" >&2; exit 2;; esac
fi
if [ "$ACT" = output ] && [ -n "$W4" ]; then echo "--act output and --w4 are separate acts; refusing to combine them" >&2; exit 2; fi
if [ "$ACT" = duplex ] && [ -n "$W4" ]; then echo "--act duplex and --w4 are separate acts; refusing to combine them" >&2; exit 2; fi
if [ "$ACT" = duplex ] && { [ "$SUBJECT" != vpio-02-sid ] || [ "$VP" != on ] || [ "$MODE" != L ] || [ -n "$STIMULUS" ] || [ "$N" != 10 ]; }; then
  echo "--act duplex is lawful only for N=10 --subject vpio-02-sid --vp on --mode L with no stimulus (got N=$N subject=$SUBJECT vp=$VP mode=$MODE stimulus=${STIMULUS:-none}); refusing" >&2; exit 2
fi
# SOURCE-ID-02A (founder ruling 2026-09-15): ONE closed stimulus dispatch. Exactly two lawful pairings; an admitted token can never sit behind
# an earlier catch-all refusal (the SOURCE-ID-02 draft rejected sid-nearend-gated as unknown before its own branch — defect 1, repaired here).
case "$STIMULUS" in "") ;;
  s2-nearend)        [ "$SUBJECT" = vpio-02 ]     || { echo "--stimulus s2-nearend is lawful only with --subject vpio-02 (the stationary S-a arm is NOT OPEN on the SID subject; got subject=$SUBJECT); refusing before playback" >&2; exit 2; };;
  sid-nearend-gated) [ "$SUBJECT" = vpio-02-sid ] || { echo "--stimulus sid-nearend-gated is lawful only with --subject vpio-02-sid (got subject=$SUBJECT); refusing before playback" >&2; exit 2; };;
  *) echo "unknown stimulus '$STIMULUS' (lawful pairings: s2-nearend with --subject vpio-02 · sid-nearend-gated with --subject vpio-02-sid; no path is accepted); refusing" >&2; exit 2;;
esac
if [ -n "$STIMULUS" ] && { [ "$ACT" != output ] || [ "$VP" != on ] || [ "$MODE" != L ] || { [ "$SUBJECT" != vpio-02 ] && [ "$SUBJECT" != vpio-02-sid ]; }; }; then
  echo "--stimulus $STIMULUS is lawful only with --act output --vp on --mode L --subject vpio-02 (got act=$ACT vp=$VP mode=$MODE subject=$SUBJECT); refusing before playback" >&2; exit 2
fi
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"          # devicectl id
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"                 # xcodebuild destination id (NOT the devicectl id)
# VPIO-01B (founder ruling 2026-09-14): the bundle identifier is DERIVED from the declared subject and used for every
# installed-app lookup, container listing, journal pull, custody reference, driver bundle selection and ledger invocation.
# There is no default bundle: an unknown subject is refused here, never resolved to .k00. Historical p5b0 / phase-a
# behaviour is unchanged (same bundle, same label, same driver env). The K00 (R1) container is never addressed by vpio-01.
# VPIO-02B (founder ruling 2026-09-14): a fourth subject row, vpio-02 → .vpio02 / "VoiceKernel VPIO-02"; the same $BID
# propagates through every installed-app lookup, container listing, journal pull, custody line, driver selection and
# ledger invocation. No reinstall is added to the batch. The .vpio01 container is never addressed by vpio-02.
case "$SUBJECT" in
  p5b0|phase-a) BID="life.soullab.voicekernel.k00";    ICON="VoiceKernel K00";;
  vpio-01)      BID="life.soullab.voicekernel.vpio01"; ICON="VoiceKernel VPIO-01";;
  vpio-02)      BID="life.soullab.voicekernel.vpio02"; ICON="VoiceKernel VPIO-02";;
  vpio-02-sid)  BID="life.soullab.voicekernel.vpio02sid"; ICON="VoiceKernel VPIO-02-SID";;   # SOURCE-ID-02: new subject by custody; trace-compatible with vpio-02
  *) echo "unknown subject '$SUBJECT' (p5b0|phase-a|vpio-01|vpio-02|vpio-02-sid); no default bundle — refusing" >&2; exit 2;;
esac
# S2 constants (founder ruling 2026-09-15). The fixture path is resolved HERE from the closed token, never from the command line.
# Every value below is read-only custody: the batch compares and records; it never sets a volume, selects a device or repairs state.
S2_STIMULUS="$ROOT/scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav"
S2_STIMULUS_SHA256="1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e"
S2_AFPLAY="/usr/bin/afplay"
S2_AFPLAY_SHA256="88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb"
S2_AFPLAY_VOLUME="0.50"
S2_AFPLAY_SECONDS="180"
S2_OUTPUT_DEVICE="Mac Studio Speakers"
S2_OUTPUT_TRANSPORT="coreaudio_device_type_builtin"
S2_OUTPUT_VOLUME="69"
S2_OUTPUT_MUTED="false"
# SOURCE-ID-02: the frozen entry/output readers know no SID subject; a SID journal is classified under vpio-02 (its trace
# signature is the same fourteen seams) while the ledger header declares custody vpio-02-sid. Declared custody + trace
# compatibility = subject identity (founder ruling 2026-09-14); the mapping is explicit here and in the header line.
CLASSIFIER_SUBJECT="$SUBJECT"; [ "$SUBJECT" = vpio-02-sid ] && CLASSIFIER_SUBJECT="vpio-02"
if [ "$STIMULUS" = sid-nearend-gated ]; then
  S2_STIMULUS="$ROOT/scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav"
  S2_STIMULUS_SHA256="30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb"
fi
PROJ="$ROOT/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj"
DD="$ROOT/ios/VoiceKernelDriver/.derived"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LEDGER_DIR="${LEDGER_DIR:-$ROOT/docs/programme/VOICE-2026/driver-ledger/$STRATUM-$STAMP}"
mkdir -p "$LEDGER_DIR/journals"
LEDGER="$LEDGER_DIR/ledger.md"
SOURCE_LEDGER=""; [ "$STIMULUS" = sid-nearend-gated ] && SOURCE_LEDGER="$LEDGER_DIR/source-ledger.md"   # SOURCE-ID-02: third evidence-only reader, gated-stimulus populations only
# One batch per device. CALIBRATION-01 (2026-09-12) had two batches driving the same iPhone at once
# (173320Z and 173603Z); a second batch is refused here rather than allowed to contend for the runner.
LOCK="$ROOT/docs/programme/VOICE-2026/driver-ledger/.device-$DEV.lock"
exec 9>"$LOCK"
if command -v flock >/dev/null 2>&1; then
  flock -n 9 || { echo "DRIVER/INFRASTRUCTURE FAILURE: another batch already holds device $DEV ($LOCK); refusing to run two batches against one device" >&2; exit 5; }
else
  # macOS ships no flock(1): mkdir is the atomic fallback; the directory is removed on exit.
  LOCKDIR="$LOCK.d"
  mkdir "$LOCKDIR" 2>/dev/null || { echo "DRIVER/INFRASTRUCTURE FAILURE: another batch already holds device $DEV ($LOCKDIR exists); refusing to run two batches against one device" >&2; exit 5; }
  trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT
fi
LABEL="AUTOMATED-COLD-$([ "$MODE" = "L" ] && echo LAUNCH || echo ICON)"
TEST="$([ -n "$W4" ] && echo testW4Sample || echo testOneSample)"
# K00-05/06 output act: historical --act output remains testOutputSample.
# C1 adds a distinct SID-only --act duplex selecting testK0006ValiditySample; both use the unchanged evidence reader.
OUTPUT_LEDGER=""; OUTPUT_ENV=""
if [ "$ACT" = output ]; then TEST=testOutputSample; OUTPUT_LEDGER="$LEDGER_DIR/output-ledger.md"; OUTPUT_ENV="TEST_RUNNER_K00_CANCEL_AT_MS=$CANCEL_AT TEST_RUNNER_K00_SETTLE_S=$SETTLE"; fi
if [ "$ACT" = duplex ]; then TEST=testK0006ValiditySample; OUTPUT_LEDGER="$LEDGER_DIR/output-ledger.md"; OUTPUT_ENV="TEST_RUNNER_K00_CANCEL_AT_MS=$CANCEL_AT TEST_RUNNER_K00_SETTLE_S=$SETTLE"; fi

log(){ echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LEDGER_DIR/batch.log"; }
# Cold precondition: NO VoiceKernelHarness process of ANY bundle may be alive before a sample (both harness bundles share the
# executable name; a K00 harness alive during a vpio-01 sample would be a second audio-session owner). Stricter than the
# subject, never looser; the subject-scoped custody references are the container/apps/ledger calls that carry $BID.
harness_present(){ xcrun devicectl device info processes --device "$DEV" 2>/dev/null | grep -qi VoiceKernelHarness; }
sid_entry_jit_guard(){ # $1 = sample index
  local idx="$1" js="$LEDGER_DIR/sample-$1-jit-processes.json" out="$LEDGER_DIR/sample-$1-jit-processes.stdout" state="$LEDGER_DIR/sample-$1-jit-harness-state.txt" rc=0 n=0
  xcrun devicectl device info processes --device "$DEV" --json-output "$js" >"$out" 2>&1 || rc=$?
  if [ $rc -ne 0 ] || [ ! -s "$js" ]; then
    printf 'SID ENTRY sample %s JIT process read UNREADABLE rc=%s\n' "$idx" "$rc" | tee "$state"
    return 1
  fi
  n="$(grep -ci VoiceKernelHarness "$js" || true)"
  { printf 'SID ENTRY sample %s JIT harnesses=%s\n' "$idx" "$n"; grep -i VoiceKernelHarness "$js" || true; } | tee "$state"
  [ "$n" -eq 0 ]
}
sid_duplex_harness_zero_guard(){ # $1 = sample index · $2 = preact|jit
  local idx="$1" phase="$2" js="$LEDGER_DIR/sample-$1-duplex-$2-processes.json" out="$LEDGER_DIR/sample-$1-duplex-$2-processes.stdout" state="$LEDGER_DIR/sample-$1-duplex-$2-harness-state.txt" rc=0 n=0
  xcrun devicectl device info processes --device "$DEV" --json-output "$js" >"$out" 2>&1 || rc=$?
  if [ $rc -ne 0 ] || [ ! -s "$js" ]; then
    printf 'SID DUPLEX sample %s %s process read UNREADABLE rc=%s\n' "$idx" "$phase" "$rc" | tee "$state"
    return 1
  fi
  n="$(grep -ci VoiceKernelHarness "$js" || true)"
  { printf 'SID DUPLEX sample %s %s harnesses=%s\n' "$idx" "$phase" "$n"; grep -i VoiceKernelHarness "$js" || true; } | tee "$state"
  [ "$n" -eq 0 ]
}
sid_source_harness_zero_guard(){ # $1 = sample index · $2 = preplay|jit
  local idx="$1" phase="$2" js="$LEDGER_DIR/sample-$1-source-$2-processes.json" out="$LEDGER_DIR/sample-$1-source-$2-processes.stdout" state="$LEDGER_DIR/sample-$1-source-$2-harness-state.txt" rc=0 n=0
  xcrun devicectl device info processes --device "$DEV" --json-output "$js" >"$out" 2>&1 || rc=$?
  if [ $rc -ne 0 ] || [ ! -s "$js" ]; then
    printf 'SID SOURCE sample %s %s process read UNREADABLE rc=%s\n' "$idx" "$phase" "$rc" | tee "$state"
    return 1
  fi
  n="$(grep -ci VoiceKernelHarness "$js" || true)"
  { printf 'SID SOURCE sample %s %s harnesses=%s\n' "$idx" "$phase" "$n"; grep -i VoiceKernelHarness "$js" || true; } | tee "$state"
  [ "$n" -eq 0 ]
}

# PASS-2 daemon identity witness (founder ruling 2026-09-14): Mac-side snapshot of the audio daemons' process rows, taken
# immediately BEFORE each sample and AFTER its export. External witness state only — this reads the same process
# listing the precondition already reads; it never launches, signals, terminates, attaches to or reconfigures any
# daemon. If the listing fails or shows neither daemon the snapshot records UNOBSERVABLE; no other mechanism is substituted.
daemon_snapshot(){ # $1 = sample index · $2 = before|after
  # Calibration 121709Z (founder-read JSON): the listing's documented JSON carries {executable: file:///…, processIdentifier: N} and NO
  # start time; the table text truncates paths. On this device (iOS 26) neither mediaserverd nor coreaudiod exists under those
  # names — the audio server role is carried by audiomxd (with audioclocksyncd / audioaccessoryd). Ruling A2 pending: the ruled names
  # are recorded NOT PRESENT every time (never silently dropped) and the observed daemons are recorded by PID. Identity = PID only.
  mkdir -p "$LEDGER_DIR/daemons"; local out="$LEDGER_DIR/daemons/sample-$1-$2.txt" js="$LEDGER_DIR/daemons/sample-$1-$2.json" rc
  xcrun devicectl device info processes --device "$DEV" --json-output "$js" >/dev/null 2>&1; rc=$?
  { echo "# daemon snapshot sample $1 $2 — $(date -u +%Y-%m-%dT%H:%M:%SZ) — listing rc=$rc"
    if [ $rc -ne 0 ] || [ ! -s "$js" ]; then echo "UNOBSERVABLE: listing failed (rc=$rc)"
    else python3 - "$js" <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); s=json.dumps(d)
import re
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
want=['mediaserverd','coreaudiod','audiomxd','audioclocksyncd','audioaccessoryd']
for w in want:
    hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]==w]
    # Ruling A2 wording: absence is scoped to the object of evidence — the documented JSON window — never to the machine.
    print(f"{w}: " + (" · ".join(f"PRESENT — witnessed by PID {pid} ({p})" for p,pid in hits) if hits else "NOT PRESENT IN THE DOCUMENTED JSON WINDOW"))
print(f"(processes listed: {len(rows)})")
PY
    fi
  } > "$out"
}
# C-D5 (Stage B attempt 2, 20260912T191955Z): the container listing can FAIL ("The system failed to get a list of files
# on the remote device"). The old list_journals swallowed that failure and returned an EMPTY listing, which the batch then
# read as "the container is empty": the failed sample was ledgered as "no new journal", BEFORE was overwritten with the
# empty set, and the NEXT sample ledgered every journal in the container (79..101 rows per row) — the flood that
# invalidated attempt 2. A failed listing is now distinguished from an empty one: it is retried, it never overwrites
# BEFORE, and on persistent failure the sample is an infrastructure row whose journal stays on the device by name.
LIST_RC=0
list_journals(){ local out rc n; for n in 1 2 3; do
  out="$(xcrun devicectl device info files --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --subdirectory tmp 2>&1)"; rc=$?
  if [ $rc -eq 0 ] && ! grep -q 'ERROR' <<<"$out"; then LIST_RC=0; grep -oE 'kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl' <<<"$out" | sort -u; return 0; fi
  sleep 3; done; LIST_RC=1; return 1; }
pull_journal(){ xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "tmp/$1" --destination "$LEDGER_DIR/journals/$1" >/dev/null 2>&1; }
# xcodebuild (26.x) accepts exactly: -collect-test-diagnostics on-failure|never. CALIBRATION-02 died at
# argument parsing (rc=64, wall 0 s ×3) on the wrong value "off" — C-D3, an orchestration defect.
DIAG_FLAGS=""
if xcodebuild -help 2>&1 | grep -q -- '-collect-test-diagnostics'; then DIAG_FLAGS="-collect-test-diagnostics never"; fi
run_test(){ # $1 = test method
  env $OUTPUT_ENV TEST_RUNNER_K00_MODE="$MODE" TEST_RUNNER_K00_VP="$VP" TEST_RUNNER_K00_HOLD_S="$HOLD" TEST_RUNNER_K00_W4_MS="${W4:-500}" TEST_RUNNER_K00_SUBJECT="$SUBJECT" \
  xcodebuild test-without-building -xctestrun "$XCTESTRUN" -destination "id=$XDEST" $DIAG_FLAGS -only-testing:"DriverUITests/K00DriverTests/$1" 2>&1
}
# ---- S2 stimulus orchestration (founder ruling 2026-09-15). Around the run_test seam only; never inside the driver or organism. ----
afplay_state(){ # $1 = pid → alive | zombie | gone | not-afplay:<comm>   (read-only: ps only)
  local st cm; st="$(ps -o stat= -p "$1" 2>/dev/null | tr -d ' ')"; cm="$(ps -o comm= -p "$1" 2>/dev/null)"
  if [ -z "$st" ]; then echo gone; return; fi
  case "$st" in *Z*) echo zombie; return;; esac
  case "$cm" in *afplay*) echo alive;; *) echo "not-afplay:$cm";; esac
}
stimulus_preflight(){ # population level, BEFORE sample 1: reads only; any mismatch → STOP before any playback
  local d="$LEDGER_DIR/stimulus-preflight"; mkdir -p "$d"
  [ -f "$S2_STIMULUS" ] || { log "STOP: stimulus fixture missing at $S2_STIMULUS"; return 1; }
  shasum -a 256 "$S2_STIMULUS" > "$d/stimulus.sha256"
  [ "$(cut -d' ' -f1 "$d/stimulus.sha256")" = "$S2_STIMULUS_SHA256" ] || { log "STOP: stimulus fixture SHA-256 does not match the pin $S2_STIMULUS_SHA256"; return 1; }
  python3 - "$S2_STIMULUS" > "$d/stimulus-wave-metadata.txt" <<'PY' || { log "STOP: stimulus fixture format is not the ruled 1 ch · 48000 Hz · 16-bit · 8640000 frames (see stimulus-preflight/stimulus-wave-metadata.txt)"; return 1; }
import sys, wave
w = wave.open(sys.argv[1], 'rb')
ch, sr, sw, n = w.getnchannels(), w.getframerate(), w.getsampwidth(), w.getnframes()
print(f"channels={ch} sampleRate={sr} sampleWidthBytes={sw} frames={n} seconds={n / sr:.3f}")
ok = (ch, sr, sw, n) == (1, 48000, 2, 8640000)
print("format=" + ("EXACT" if ok else "MISMATCH"))
sys.exit(0 if ok else 1)
PY
  system_profiler SPAudioDataType -json > "$d/audio-output.json" 2>/dev/null || { log "STOP: system_profiler SPAudioDataType read failed"; return 1; }
  python3 - "$d/audio-output.json" "$S2_OUTPUT_DEVICE" "$S2_OUTPUT_TRANSPORT" <<'PY' || { log "STOP: default output device is not exactly one $S2_OUTPUT_DEVICE ($S2_OUTPUT_TRANSPORT) — read-only precondition, nothing changed"; return 1; }
import json, sys
raw = open(sys.argv[1], encoding="utf-8").read(); raw = raw[raw.find("{"):raw.rfind("}") + 1]
items = []
for g in json.loads(raw).get("SPAudioDataType", []): items.extend(g.get("_items", []))
defaults = [x for x in items if x.get("coreaudio_default_audio_output_device") == "spaudio_yes"]
for x in defaults: print("DEFAULT_OUTPUT", x.get("_name"), x.get("coreaudio_device_transport"), x.get("coreaudio_device_srate"))
ok = len(defaults) == 1 and defaults[0].get("_name") == sys.argv[2] and defaults[0].get("coreaudio_device_transport") == sys.argv[3]
print("DEFAULT_OUTPUT_MATCH", ok); sys.exit(0 if ok else 1)
PY
  osascript -e 'get volume settings' > "$d/volume.txt" 2>&1 || { log "STOP: volume read failed"; return 1; }
  grep -q "output volume:$S2_OUTPUT_VOLUME," "$d/volume.txt" || { log "STOP: output volume is not $S2_OUTPUT_VOLUME ($(cat "$d/volume.txt")) — read-only precondition, nothing changed"; return 1; }
  grep -q "output muted:$S2_OUTPUT_MUTED" "$d/volume.txt" || { log "STOP: output muted is not $S2_OUTPUT_MUTED ($(cat "$d/volume.txt")) — read-only precondition, nothing changed"; return 1; }
  [ -x "$S2_AFPLAY" ] || { log "STOP: $S2_AFPLAY is not an executable file"; return 1; }
  shasum -a 256 "$S2_AFPLAY" > "$d/afplay.sha256"
  [ "$(cut -d' ' -f1 "$d/afplay.sha256")" = "$S2_AFPLAY_SHA256" ] || { log "STOP: $S2_AFPLAY SHA-256 differs from the census pin $S2_AFPLAY_SHA256 — a different player is never silently accepted"; return 1; }
  log "stimulus preflight PASS: fixture $S2_STIMULUS_SHA256 · afplay $S2_AFPLAY_SHA256 · default output $S2_OUTPUT_DEVICE ($S2_OUTPUT_TRANSPORT) · volume $S2_OUTPUT_VOLUME · muted $S2_OUTPUT_MUTED"
}
stimulus_start(){ # $1 = sample index. Exactly one afplay child; 1 s settle; proven alive+non-zombie; then a 1 s liveness monitor.
  local t="$LEDGER_DIR/stimulus-sample-$1.tsv" st
  { printf 'sample\t%s\n' "$1"; printf 'fixture\t%s\n' "$S2_STIMULUS"; printf 'fixtureSha256\t%s\n' "$S2_STIMULUS_SHA256"
    printf 'afplay\t%s\n' "$S2_AFPLAY"; printf 'afplaySha256\t%s\n' "$S2_AFPLAY_SHA256"; printf 'afplayVolume\t%s\n' "$S2_AFPLAY_VOLUME"; printf 'afplaySeconds\t%s\n' "$S2_AFPLAY_SECONDS"; } > "$t"
  /usr/bin/afplay -v 0.50 -t 180 "$S2_STIMULUS" </dev/null > "$LEDGER_DIR/stimulus-sample-$1-afplay.log" 2>&1 &
  S2_PID=$!
  printf 'pid\t%s\nstartEpoch\t%s\n' "$S2_PID" "$(date +%s)" >> "$t"
  sleep 1
  st="$(afplay_state "$S2_PID")"; printf 'preRunState\t%s\t%s\n' "$(date +%s)" "$st" >> "$t"
  if [ "$st" != alive ]; then
    printf 'custody\tINVALID\tplayer not alive/non-zombie before the phone invocation (%s)\n' "$st" >> "$t"
    kill -TERM "$S2_PID" 2>/dev/null; wait "$S2_PID" 2>/dev/null; S2_PID=""; return 1
  fi
  ( while :; do sleep 1; printf 'liveness\t%s\t%s\n' "$(date +%s)" "$(afplay_state "$S2_PID")" >> "$t"; done ) 2>/dev/null &
  S2_MON=$!
}
stimulus_stop(){ # $1 = sample index. Post-run state → explicit TERM → wait that exact child → exit status → custody verdict.
  local t="$LEDGER_DIR/stimulus-sample-$1.tsv" st died rc
  kill "$S2_MON" 2>/dev/null; wait "$S2_MON" 2>/dev/null; S2_MON=""
  st="$(afplay_state "$S2_PID")"; printf 'postRunState\t%s\t%s\n' "$(date +%s)" "$st" >> "$t"
  died="$(grep -c "^liveness	[0-9]*	\(gone\|zombie\|not-afplay\)" "$t")"
  printf 'stopRequestedEpoch\t%s\n' "$(date +%s)" >> "$t"
  kill -TERM "$S2_PID" 2>/dev/null; wait "$S2_PID" 2>/dev/null; rc=$?
  printf 'waitExitStatus\t%s\nstopEpoch\t%s\n' "$rc" "$(date +%s)" >> "$t"
  if [ "$st" = alive ] && [ "${died:-0}" -eq 0 ]; then printf 'custody\tVALID\n' >> "$t"; log "sample $1 stimulus custody VALID (pid $S2_PID alive through the governed interval; stopped by the batch, wait rc=$rc)"
  else printf 'custody\tINVALID\tplayer died or changed during the governed interval (postRun=%s, dead liveness observations=%s)\n' "$st" "${died:-0}" >> "$t"; log "sample $1 stimulus custody INVALID (postRun=$st, dead liveness observations=${died:-0}) — sample and journal preserved; UNMEASURED for the S2 discriminator"; fi
  S2_PID=""
}
# Name the failure the runner actually reported, so the ledger row carries the signature and not only rc.
failure_signature(){ # $1 = sample log
  if grep -q 'Timed out while enabling automation mode' "$1"; then echo "runner could not enable automation mode on the device (Settings → Developer → Enable UI Automation / device locked or passcode prompt)"; return; fi
  if grep -q 'DRIVER/INFRASTRUCTURE FAILURE: ' "$1"; then grep -o 'DRIVER/INFRASTRUCTURE FAILURE: [^"]*' "$1" | head -1 | sed 's/^DRIVER\/INFRASTRUCTURE FAILURE: //'; return; fi
  if grep -qE 'Failed to not hittable: Icon|none hittable' "$1"; then echo "Mode I: icon '$ICON' present in the SpringBoard hierarchy but not hittable (zero frame) — not on the visible Home Screen page"; return; fi
  if grep -q 'error: -\[DriverUITests' "$1"; then grep -o 'error: -\[DriverUITests[^\n]*' "$1" | head -1 | cut -c1-220; return; fi
  echo "no new journal in tmp/ after the invocation"
}

{
  echo "# DRIVER-01 batch — $STRATUM — $STAMP"
  echo
  echo "stratum=$LABEL · N=$N · vp=$VP · mode=$MODE · hold=${HOLD}s · w4=${W4:-off} · subject=$SUBJECT · bundle=$BID · device=$DEV · xcodeDest=$XDEST"
  [ "$CLASSIFIER_SUBJECT" != "$SUBJECT" ] && echo "classifierSubject=$CLASSIFIER_SUBJECT · declared custody $SUBJECT is trace-compatible with $CLASSIFIER_SUBJECT (SOURCE-ID-02: the frozen entry/output readers classify under it; source rows in source-ledger.md)"
  [ "$ACT" = output ] && echo "act=output · cancelAt=${CANCEL_AT}ms · settle=${SETTLE}s · driver=testOutputSample · reader=k00-output-ledger.py → output-ledger.md (K00-05 / K00-06 / coupling rows, evidence-only)"
  [ "$ACT" = duplex ] && echo "act=duplex · N=10 · cancelAt=${CANCEL_AT}ms · settle=${SETTLE}s · driver=testK0006ValiditySample · reader=k00-output-ledger.py unchanged → output-ledger.md · C1 built-in K00-06 validity witness only"
  [ -n "$STIMULUS" ] && echo "stimulus=$STIMULUS · fixture=$(basename "$S2_STIMULUS") · fixtureSha256=$S2_STIMULUS_SHA256 · player=$S2_AFPLAY -v $S2_AFPLAY_VOLUME -t $S2_AFPLAY_SECONDS · afplaySha256=$S2_AFPLAY_SHA256 · outputDevice=$S2_OUTPUT_DEVICE ($S2_OUTPUT_TRANSPORT) · outputVolume=$S2_OUTPUT_VOLUME · muted=$S2_OUTPUT_MUTED · custody=stimulus-preflight/ + stimulus-sample-N.tsv (never read by k00-ledger.py / k00-output-ledger.py)"
  echo "installed harness identity (the app under test is NOT rebuilt by this batch):"
  echo '```'
  xcrun devicectl device info apps --device "$DEV" 2>/dev/null | grep -i "$BID" || echo "(devicectl apps listing unavailable)"
  [ -f "$LEDGER_DIR/../.last-reinstall" ] && echo "last reinstall: $(cat "$LEDGER_DIR/../.last-reinstall")"
  echo '```'
  echo
  python3 "$ROOT/scripts/witness/k00-ledger.py" --header /dev/null 2>/dev/null | head -2
} > "$LEDGER"

log "xcodegen generate (driver project only; gitignored, regenerated per checkout)"
( cd "$ROOT/ios/VoiceKernelDriver" && xcodegen generate ) > "$LEDGER_DIR/xcodegen.log" 2>&1 || { log "DRIVER/INFRASTRUCTURE FAILURE: xcodegen generate failed (see xcodegen.log)"; exit 3; }
log "build-for-testing (driver only; the harness is untouched)"
xcodebuild build-for-testing -project "$PROJ" -scheme DriverUITests -destination "id=$XDEST" -derivedDataPath "$DD" DEVELOPMENT_TEAM="${K00_TEAM:-ZVK2X646Z2}" > "$LEDGER_DIR/build-for-testing.log" 2>&1 || { log "DRIVER/INFRASTRUCTURE FAILURE: build-for-testing failed (see build-for-testing.log)"; exit 3; }
XCTESTRUN="$(ls -t "$DD"/Build/Products/*.xctestrun | head -1)"; log "xctestrun: $XCTESTRUN"

if [ -n "$STIMULUS" ]; then
  stimulus_preflight || { log "STOP: stimulus preflight failed — nothing played, nothing sampled"; exit 8; }
  trap 'if [ -n "${S2_PID:-}" ]; then kill -TERM "$S2_PID" 2>/dev/null; fi; exit 130' INT TERM
fi
BEFORE="$(list_journals)" || { log "ABORT: the container listing failed three times before sample 1; nothing was sampled"; exit 7; }
for i in $(seq 1 "$N"); do
  log "sample $i/$N — precondition"
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = entry ]; then
    : # SID ENTRY has one authority: the adjacent JIT process-set guard below. No cleanup path is entered here.
  elif [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = output ] && [ "$STIMULUS" = sid-nearend-gated ]; then
    : # SID SOURCE population is fail-closed too: no testTerminateOnly normalization; PRE-PLAY + JIT guards below own custody.
  elif [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = duplex ]; then
    : # C1 SID DUPLEX is fail-closed: no testTerminateOnly normalization; PRE-ACT + JIT guards below own custody.
  elif harness_present; then
    log "harness process present — attempting terminate-only via driver"
    run_test testTerminateOnly > "$LEDGER_DIR/sample-$i-terminate.log" || true
    if harness_present; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | harness process present before launch and could not be terminated by the driver; batch ABORTED as DRIVER/INFRASTRUCTURE FAILURE at sample $i |" >> "$LEDGER"
      log "ABORT: lingering harness process; infrastructure failure recorded"; exit 4
    fi
  fi
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = duplex ]; then
    if ! sid_duplex_harness_zero_guard "$i" preact; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | SID DUPLEX sample $i PRE-ACT harness-zero guard refused; no terminate attempted; no phone sample launched; see sample-$i-duplex-preact-* evidence |" >> "$LEDGER"
      log "STOP: SID DUPLEX sample $i PRE-ACT harness-zero guard failed — no terminate attempted, no phone sample launched"; exit 12
    fi
  fi
  daemon_snapshot "$i" before
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = output ] && [ "$STIMULUS" = sid-nearend-gated ]; then
    if ! sid_source_harness_zero_guard "$i" preplay; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | SID SOURCE sample $i PRE-PLAY harness-zero guard refused; no terminate attempted; no stimulus started; no phone sample launched; see sample-$i-source-preplay-* evidence |" >> "$LEDGER"
      log "STOP: SID SOURCE sample $i PRE-PLAY harness-zero guard failed — no terminate attempted, no stimulus started, no phone sample launched"; exit 11
    fi
  fi
  if [ -n "$STIMULUS" ]; then
    stimulus_start "$i" || { echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | stimulus player not alive before the phone invocation (stimulus-sample-$i.tsv); batch ABORTED as orchestration failure, no identical rows spent |" >> "$LEDGER"; log "ABORT: stimulus player not alive before the phone invocation; orchestration failure recorded"; exit 9; }
  fi
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = output ] && [ "$STIMULUS" = sid-nearend-gated ]; then
    if ! sid_source_harness_zero_guard "$i" jit; then
      stimulus_stop "$i"
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | SID SOURCE sample $i JIT harness-zero guard refused after stimulus settle; stimulus stopped; no terminate attempted; no phone sample launched; see sample-$i-source-jit-* evidence |" >> "$LEDGER"
      log "STOP: SID SOURCE sample $i JIT harness-zero guard failed — stimulus stopped, no terminate attempted, no phone sample launched"; exit 11
    fi
  fi
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = duplex ]; then
    if ! sid_duplex_harness_zero_guard "$i" jit; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | SID DUPLEX sample $i JIT harness-zero guard refused; no terminate attempted; no phone sample launched; see sample-$i-duplex-jit-* evidence |" >> "$LEDGER"
      log "STOP: SID DUPLEX sample $i JIT harness-zero guard failed — no terminate attempted, no phone sample launched"; exit 12
    fi
  fi
  if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = entry ]; then
    if ! sid_entry_jit_guard "$i"; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | SID ENTRY sample $i just-in-time harness-zero guard refused; no terminate attempted; no sample launched; see sample-$i-jit-* evidence |" >> "$LEDGER"
      log "STOP: SID ENTRY sample $i JIT harness-zero guard failed — no terminate attempted, no sample launched"; exit 10
    fi
  fi
  log "sample $i/$N — driver ($TEST, mode $MODE)"
  T0=$(date +%s); run_test "$TEST" > "$LEDGER_DIR/sample-$i-xcodebuild.log"; RC=$?; T1=$(date +%s)
  printf "%s\t%s\t%s\n" "$i" "$T0" "$T1" >> "$LEDGER_DIR/sample-timing.tsv"   # PASS-2 seam experiment: the per-sample wall window, for offline log show only
  if [ -n "$STIMULUS" ]; then stimulus_stop "$i"; fi
  if grep -q '^xcodebuild: error:' "$LEDGER_DIR/sample-$i-xcodebuild.log"; then
    # The invocation itself was refused (usage/destination/xctestrun) — nothing reached the device. Burning N rows
    # on the same refusal is not a batch; abort as infrastructure at the first one.
    WHY="$(grep -m1 '^xcodebuild: error:' "$LEDGER_DIR/sample-$i-xcodebuild.log" | cut -c1-200)"
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | invocation refused before the device was reached: $WHY (rc=$RC); batch ABORTED |" >> "$LEDGER"
    log "ABORT: xcodebuild refused the invocation ($WHY); infrastructure failure recorded"; exit 6
  fi
  grep -q 'Failure collecting diagnostics from devices: Timed out' "$LEDGER_DIR/sample-$i-xcodebuild.log" && log "sample $i: xcodebuild spent its 600 s diagnostics-collection timeout after the run (wall $((T1-T0)) s)"
  daemon_snapshot "$i" after
  AFTER="$(list_journals)"
  if [ "$LIST_RC" -ne 0 ]; then   # C-D5: a failed listing is not an empty container; BEFORE is kept, the journal stays on the device
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | container listing failed three times after the invocation (rc=$RC · wall $((T1-T0)) s); the journal this invocation wrote, if any, remains on the device unpulled — custody by later listing, never counted |" >> "$LEDGER"
    log "sample $i: container listing failed ×3 — infrastructure row, BEFORE snapshot kept"; continue
  fi
  NEW="$(comm -13 <(echo "$BEFORE") <(echo "$AFTER"))"; BEFORE="$AFTER"
  if [ "$(wc -w <<<"$NEW")" -gt 1 ]; then   # C-D5: one invocation writes one journal; more than one is never ledgered as a sample
    KEPT=""; mkdir -p "$LEDGER_DIR/journals/not-a-sample"
    for f in $NEW; do xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "tmp/$f" --destination "$LEDGER_DIR/journals/not-a-sample/$f" >/dev/null 2>&1 && KEPT="$KEPT $f;"; done
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | $(wc -w <<<"$NEW") new journals after one invocation (rc=$RC · wall $((T1-T0)) s); preserved under journals/not-a-sample, none counted:$KEPT |" >> "$LEDGER"
    log "sample $i: $(wc -w <<<"$NEW") new journals after one invocation — infrastructure row"; continue
  fi
  if grep -q 'PRECONDITION-FAILED' "$LEDGER_DIR/sample-$i-xcodebuild.log"; then
    echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | in-test state check found the harness running; sample invalid, not repaired |" >> "$LEDGER"; continue
  fi
  if grep -q 'DRIVER/INFRASTRUCTURE FAILURE' "$LEDGER_DIR/sample-$i-xcodebuild.log" || [ -z "$NEW" ]; then
    WHY="$(failure_signature "$LEDGER_DIR/sample-$i-xcodebuild.log" | tr -d '\r')"   # xcodebuild emits CR inside XCTest failure lines
    # Stage A sample 9: the harness had exported before the driver failed on terminate, and this branch
    # abandoned that journal on the device. An infrastructure row is never a sample, but evidence the
    # organism wrote is pulled and kept beside the row, hashed, under journals/not-a-sample/.
    KEPT=""
    for f in $NEW; do
      mkdir -p "$LEDGER_DIR/journals/not-a-sample"
      if xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "tmp/$f" --destination "$LEDGER_DIR/journals/not-a-sample/$f" >/dev/null 2>&1; then
        KEPT="$KEPT journal preserved, not a sample: $f sha256=$(shasum -a 256 "$LEDGER_DIR/journals/not-a-sample/$f" | cut -c1-16)…;"
      else KEPT="$KEPT journal $f could not be copied;"; fi
    done
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | $WHY (rc=$RC · wall $((T1-T0)) s)${KEPT:+ ·$KEPT} |" >> "$LEDGER"; continue
  fi
  for f in $NEW; do
    pull_journal "$f" || { echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | journal $f could not be copied from the container |" >> "$LEDGER"; continue; }
    python3 "$ROOT/scripts/witness/k00-ledger.py" --stratum "$LABEL" --index "$i" --mode "$MODE" --subject "$CLASSIFIER_SUBJECT" $([ -n "$W4" ] && echo --w4) "$LEDGER_DIR/journals/$f" >> "$LEDGER"
    log "sample $i ledgered: $f"
    if [ -n "$OUTPUT_LEDGER" ]; then   # K00-05/06: the same journal, a second evidence-only reader; the entry row above is untouched
      [ -s "$OUTPUT_LEDGER" ] || python3 "$ROOT/scripts/witness/k00-output-ledger.py" --header > "$OUTPUT_LEDGER"
      python3 "$ROOT/scripts/witness/k00-output-ledger.py" --stratum "$LABEL" --index "$i" --subject "$SUBJECT" "$LEDGER_DIR/journals/$f" >> "$OUTPUT_LEDGER"
      if [ -n "$SOURCE_LEDGER" ]; then   # SOURCE-ID-02: the same journal, the evidence-only source reader; entry and output rows untouched
        [ -s "$SOURCE_LEDGER" ] || python3 "$ROOT/scripts/witness/k00-source-ledger.py" --header > "$SOURCE_LEDGER"
        python3 "$ROOT/scripts/witness/k00-source-ledger.py" --stratum "$LABEL" --index "$i" --subject "$SUBJECT" "$LEDGER_DIR/journals/$f" >> "$SOURCE_LEDGER"
        log "sample $i source rows read: $f"
      fi
      grep -o 'K00-OUTPUT: [^"]*' "$LEDGER_DIR/sample-$i-xcodebuild.log" | sed "s/^/| $LABEL | $i | DRIVER-MARKER | — | /; s/\$/ |/" | tr -d '\r' >> "$OUTPUT_LEDGER"
      log "sample $i output rows read: $f"
    fi
  done
  if [ -n "$W4" ] && grep -q 'w4Qualified=True' "$LEDGER"; then log "W4 condition qualified from the journal; stopping per D4"; break; fi
done
log "batch complete — $LEDGER"
