#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · SEAM EXPERIMENT block runner (protocol: docs/programme/VOICE-2026/PASS2_SEAM_EXPERIMENT_PROTOCOL_2026-09-14.md).
# Two blocks, each ONE ordinary driver batch (Mode L · subject as declared · cold-launch law unchanged · N fixed):
#   --block control : the driver batch and nothing else — CONTROL = no log(1) invocation; a same-session block-drift/stability
#                     control, NOT an observer-effect control (D-L1: the collect happens after all sampling).
#   --block logged  : the driver batch, then — AFTER the last sample — ONE `log collect` of the block's window (root, founder-gated),
#                     then per-sample `log show` at DEFAULT level over each sample's recorded wall window (offline), the corrected
#                     reader per sample, and the seam ledger. The collect happens after sampling: nothing external runs on the device
#                     during a logged sample that does not also run during a control sample (protocol §3, D-L1).
# NEVER: --info/--debug (the seam lines are default-level; the ladder is closed) · log config · sysdiagnose · a debugger · a second
# collect · a reinstall · any organism change. Authority is an invocation input (AUTH-3). EXECUTION IS HELD until the protocol is ruled.
#   usage: K00_EXEC_AUTHORITY="…" [K00_LOG_SUDO=1] scripts/witness/k00-log-batch.sh <LABEL> --block control|logged [--n 30] [--subject p5b0|phase-a]
set -u
LABEL="${1:?label}"; shift; BLOCK=""; N=30; SUBJECT=phase-a
while [ $# -gt 0 ]; do case "$1" in --block) BLOCK="$2"; shift 2;; --n) N="$2"; shift 2;; --subject) SUBJECT="$2"; shift 2;; *) echo "unknown arg $1"; exit 64;; esac; done
[ "$BLOCK" = control ] || [ "$BLOCK" = logged ] || { echo "STOP — --block must be exactly control or logged"; exit 64; }
[ "$N" = 30 ] || { echo "STOP — N is predeclared as 30 (protocol §2); a different N is a new protocol, not an argument"; exit 64; }
[ -n "${K00_EXEC_AUTHORITY:-}" ] || { echo "STOP — K00_EXEC_AUTHORITY unset: no execution authority supplied at invocation (AUTH-3); nothing run"; exit 4; }
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; STAMP=$(date -u +%Y%m%dT%H%M%SZ)
LEDGER_ROOT="$ROOT/docs/programme/VOICE-2026/driver-ledger"; BL="$(echo "$BLOCK" | tr a-z A-Z)"
LD="$LEDGER_ROOT/$LABEL-$BL-$STAMP"; REC="$LEDGER_ROOT/$LABEL-$BL-$STAMP.block.md"
say(){ echo "$*" | tee -a "$REC"; }
say "# seam experiment block — $LABEL · $BL · $STAMP · N=$N · subject $SUBJECT · Mode L · execution authority (verbatim, supplied at invocation): $K00_EXEC_AUTHORITY"
if [ "$BLOCK" = logged ]; then
  [ "${K00_LOG_SUDO:-}" = 1 ] || { say "## STOP — root not granted for the one block collect (K00_LOG_SUDO=1 absent); the logged block is not started"; exit 4; }
  [ -n "${K00_LOG_PROBE:-}" ] || { say "## STOP — K00_LOG_PROBE must name the sealed probe explicitly (no newest-probe discovery, AUTH-3)"; exit 5; }
  [ -f "$K00_LOG_PROBE/SEAL.sha256" ] && (cd "$K00_LOG_PROBE" && shasum -a 256 -c SEAL.sha256 >/dev/null 2>&1) || { say "## STOP — named probe is unsealed or its manifest does not verify"; exit 5; }
  grep -q -- '--device-udid' "$K00_LOG_PROBE/log-collect-help.txt" 2>/dev/null && grep -q -- '--start' "$K00_LOG_PROBE/log-collect-help.txt" 2>/dev/null || { say "## STOP — named probe does not document --device-udid/--start on log collect"; exit 5; }
fi
T0_EPOCH=$(date +%s); T0_LOCAL="$(date -r $((T0_EPOCH-5)) "+%Y-%m-%d %H:%M:%S")"
say "## block T0: $(date -u -r $T0_EPOCH +%Y-%m-%dT%H:%M:%SZ) (local $T0_LOCAL used for the collect window on a logged block)"
say "## driver batch (verbatim): scripts/witness/k00-driver-batch.sh $LABEL-$BL $N --mode L --subject $SUBJECT --ledger $LD"
"$ROOT/scripts/witness/k00-driver-batch.sh" "$LABEL-$BL" "$N" --mode L --subject "$SUBJECT" --ledger "$LD" > "$LEDGER_ROOT/$LABEL-$BL-$STAMP.batch-stdout.txt" 2>&1; BRC=$?
T1_EPOCH=$(date +%s)
say "## driver batch rc=$BRC · ledger $LD/ledger.md · rows $(grep -c '^| ' "$LD/ledger.md" 2>/dev/null || echo 0) · block T1: $(date -u -r $T1_EPOCH +%Y-%m-%dT%H:%M:%SZ)"
[ -f "$LD/sample-timing.tsv" ] || { say "## STOP — no sample-timing.tsv: the batch recorded no per-sample windows; a logged block cannot be read (control block: rows stand)"; [ "$BLOCK" = control ] && exit 0 || exit 7; }
[ "$BLOCK" = control ] && { say "## CONTROL block complete — no log(1) invocation (block-drift control under D-L1, not an observer-effect control)"; echo "block record: $REC"; exit 0; }
UD="$LEDGER_ROOT/unifiedlog-$LABEL-$STAMP"; mkdir -p "$UD"
UDID="00008140-00163D9922E0801C"
say "## collect (ONE, after the last sample): sudo log collect --device-udid $UDID --start $T0_LOCAL --output $UD/device.logarchive"
sudo log collect --device-udid "$UDID" --start "$T0_LOCAL" --output "$UD/device.logarchive" > "$UD/collect-stdout.txt" 2>&1; CRC=$?
say "## collect rc=$CRC · archive $(du -sh "$UD/device.logarchive" 2>/dev/null | cut -f1 || echo none)"
[ $CRC -eq 0 ] && [ -d "$UD/device.logarchive" ] || { say "## collect FAILED — every seam row of this block is UNOBSERVABLE; the kernel ledger rows stand as audio samples (protocol §5)"; echo "block record: $REC"; exit 6; }
while IFS=$'\t' read -r i t0 t1; do
  S0="$(date -r $((t0-2)) "+%Y-%m-%d %H:%M:%S")"; S1="$(date -r $((t1+2)) "+%Y-%m-%d %H:%M:%S")"
  log show --start "$S0" --end "$S1" --style json "$UD/device.logarchive" > "$UD/window-s$i.json" 2> "$UD/show-s$i-stderr.txt"; SRC=$?
  J="$(grep -E "^\| [^|]+\| $i \|" "$LD/ledger.md" | grep -o 'kernel00-[^`]*\.jsonl' | head -1)"
  python3 "$ROOT/scripts/witness/k00-log-window-read.py" "$UD/window-s$i.json" "${J:+$LD/journals/$J}" "$UD" --expect-archive "$UD/device.logarchive" --suffix "s$i" > "$UD/sample-$i.md" 2>&1; RRC=$?
  say "## sample $i: show rc=$SRC · reader rc=$RRC · journal ${J:-none}"; rm -f "$UD/window-s$i.json"   # the per-sample raw window is regenerable from the archive; only the audio subset is kept
done < "$LD/sample-timing.tsv"
python3 "$ROOT/scripts/witness/k00-seam-ledger.py" "$LD" "$UD" | tail -1 | tee -a "$REC"
echo "block record: $REC"
