#!/usr/bin/env bash
# DRIVER-01 — Mac orchestration and evidence custody. One command per declared batch.
#
#   usage: scripts/witness/k00-driver-batch.sh <stratum> <N> [--vp on|off] [--mode I|L] [--hold S] [--w4 MS] [--subject p5b0|phase-a] [--ledger DIR]
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
VP=on; MODE=I; HOLD=15; W4=""; SUBJECT=p5b0; LEDGER_DIR=""
while [ $# -gt 0 ]; do case "$1" in
  --vp) VP="$2"; shift 2;; --mode) MODE="$2"; shift 2;; --hold) HOLD="$2"; shift 2;;
  --w4) W4="$2"; shift 2;; --subject) SUBJECT="$2"; shift 2;; --ledger) LEDGER_DIR="$2"; shift 2;;
  *) echo "unknown arg $1" >&2; exit 2;; esac; done
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"          # devicectl id
XDEST="${K00_XCODE_DEST:-00008140-00163D9922E0801C}"                 # xcodebuild destination id (NOT the devicectl id)
BID="life.soullab.voicekernel.k00"
PROJ="$ROOT/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj"
DD="$ROOT/ios/VoiceKernelDriver/.derived"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LEDGER_DIR="${LEDGER_DIR:-$ROOT/docs/programme/VOICE-2026/driver-ledger/$STRATUM-$STAMP}"
mkdir -p "$LEDGER_DIR/journals"
LEDGER="$LEDGER_DIR/ledger.md"
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

log(){ echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LEDGER_DIR/batch.log"; }
harness_present(){ xcrun devicectl device info processes --device "$DEV" 2>/dev/null | grep -qi VoiceKernelHarness; }
list_journals(){ xcrun devicectl device info files --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --subdirectory tmp 2>/dev/null | grep -oE 'kernel00-[A-Za-z0-9-]+-[0-9]+\.jsonl' | sort -u; }
pull_journal(){ xcrun devicectl device copy from --device "$DEV" --domain-type appDataContainer --domain-identifier "$BID" --source "tmp/$1" --destination "$LEDGER_DIR/journals/$1" >/dev/null 2>&1; }
# xcodebuild (26.x) accepts exactly: -collect-test-diagnostics on-failure|never. CALIBRATION-02 died at
# argument parsing (rc=64, wall 0 s ×3) on the wrong value "off" — C-D3, an orchestration defect.
DIAG_FLAGS=""
if xcodebuild -help 2>&1 | grep -q -- '-collect-test-diagnostics'; then DIAG_FLAGS="-collect-test-diagnostics never"; fi
run_test(){ # $1 = test method
  TEST_RUNNER_K00_MODE="$MODE" TEST_RUNNER_K00_VP="$VP" TEST_RUNNER_K00_HOLD_S="$HOLD" TEST_RUNNER_K00_W4_MS="${W4:-500}" \
  xcodebuild test-without-building -xctestrun "$XCTESTRUN" -destination "id=$XDEST" $DIAG_FLAGS -only-testing:"DriverUITests/K00DriverTests/$1" 2>&1
}
# Name the failure the runner actually reported, so the ledger row carries the signature and not only rc.
failure_signature(){ # $1 = sample log
  if grep -q 'Timed out while enabling automation mode' "$1"; then echo "runner could not enable automation mode on the device (Settings → Developer → Enable UI Automation / device locked or passcode prompt)"; return; fi
  if grep -q 'DRIVER/INFRASTRUCTURE FAILURE: ' "$1"; then grep -o 'DRIVER/INFRASTRUCTURE FAILURE: [^"]*' "$1" | head -1 | sed 's/^DRIVER\/INFRASTRUCTURE FAILURE: //'; return; fi
  if grep -qE 'Failed to not hittable: Icon|none hittable' "$1"; then echo "Mode I: icon 'VoiceKernel K00' present in the SpringBoard hierarchy but not hittable (zero frame) — not on the visible Home Screen page"; return; fi
  if grep -q 'error: -\[DriverUITests' "$1"; then grep -o 'error: -\[DriverUITests[^\n]*' "$1" | head -1 | cut -c1-220; return; fi
  echo "no new journal in tmp/ after the invocation"
}

{
  echo "# DRIVER-01 batch — $STRATUM — $STAMP"
  echo
  echo "stratum=$LABEL · N=$N · vp=$VP · mode=$MODE · hold=${HOLD}s · w4=${W4:-off} · subject=$SUBJECT · device=$DEV · xcodeDest=$XDEST"
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

BEFORE="$(list_journals)"
for i in $(seq 1 "$N"); do
  log "sample $i/$N — precondition"
  if harness_present; then
    log "harness process present — attempting terminate-only via driver"
    run_test testTerminateOnly > "$LEDGER_DIR/sample-$i-terminate.log" || true
    if harness_present; then
      echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | harness process present before launch and could not be terminated by the driver; batch ABORTED as DRIVER/INFRASTRUCTURE FAILURE at sample $i |" >> "$LEDGER"
      log "ABORT: lingering harness process; infrastructure failure recorded"; exit 4
    fi
  fi
  log "sample $i/$N — driver ($TEST, mode $MODE)"
  T0=$(date +%s); run_test "$TEST" > "$LEDGER_DIR/sample-$i-xcodebuild.log"; RC=$?; T1=$(date +%s)
  if grep -q '^xcodebuild: error:' "$LEDGER_DIR/sample-$i-xcodebuild.log"; then
    # The invocation itself was refused (usage/destination/xctestrun) — nothing reached the device. Burning N rows
    # on the same refusal is not a batch; abort as infrastructure at the first one.
    WHY="$(grep -m1 '^xcodebuild: error:' "$LEDGER_DIR/sample-$i-xcodebuild.log" | cut -c1-200)"
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | invocation refused before the device was reached: $WHY (rc=$RC); batch ABORTED |" >> "$LEDGER"
    log "ABORT: xcodebuild refused the invocation ($WHY); infrastructure failure recorded"; exit 6
  fi
  grep -q 'Failure collecting diagnostics from devices: Timed out' "$LEDGER_DIR/sample-$i-xcodebuild.log" && log "sample $i: xcodebuild spent its 600 s diagnostics-collection timeout after the run (wall $((T1-T0)) s)"
  AFTER="$(list_journals)"; NEW="$(comm -13 <(echo "$BEFORE") <(echo "$AFTER"))"; BEFORE="$AFTER"
  if grep -q 'PRECONDITION-FAILED' "$LEDGER_DIR/sample-$i-xcodebuild.log"; then
    echo "| $LABEL | $i | $MODE | — | — | — | **PRECONDITION-FAILED** | in-test state check found the harness running; sample invalid, not repaired |" >> "$LEDGER"; continue
  fi
  if grep -q 'DRIVER/INFRASTRUCTURE FAILURE' "$LEDGER_DIR/sample-$i-xcodebuild.log" || [ -z "$NEW" ]; then
    WHY="$(failure_signature "$LEDGER_DIR/sample-$i-xcodebuild.log")"
    echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | $WHY (rc=$RC · wall $((T1-T0)) s) |" >> "$LEDGER"; continue
  fi
  for f in $NEW; do
    pull_journal "$f" || { echo "| $LABEL | $i | $MODE | — | — | — | **DRIVER/INFRASTRUCTURE FAILURE** | journal $f could not be copied from the container |" >> "$LEDGER"; continue; }
    python3 "$ROOT/scripts/witness/k00-ledger.py" --stratum "$LABEL" --index "$i" --mode "$MODE" --subject "$SUBJECT" $([ -n "$W4" ] && echo --w4) "$LEDGER_DIR/journals/$f" >> "$LEDGER"
    log "sample $i ledgered: $f"
  done
  if [ -n "$W4" ] && grep -q 'w4Qualified=True' "$LEDGER"; then log "W4 condition qualified from the journal; stopping per D4"; break; fi
done
log "batch complete — $LEDGER"
