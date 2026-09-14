#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · the ONE authorized `--debug` re-read of an EXISTING calibration archive — the LAST documented read-level rung (founder ruling, 2026-09-14).
# Offline on the Mac: same device.logarchive · same T0/T1 window · `log show --debug` · separate DEBUG record · corrected reader.
# NEVER: a sample · `log collect` · sudo · any device act · `--debug` · `log config` · a batch. There is no rung beyond this one: if audiomxd is still absent from the interval, the ladder STOPS here (founder ruling); never a configuration change, never an invented level.
# AUTH-3: execution authority is an input — K00_EXEC_AUTHORITY must be supplied at invocation, is recorded verbatim, never read from the repo.
#   usage: K00_EXEC_AUTHORITY="<founder authorization, verbatim>" scripts/witness/k00-log-window-debug.sh <unifiedlog-cal-dir> <LOG-CAL-dir>
set -u
CAL="${1:?unifiedlog-cal dir}"; LC="${2:?LOG-CAL ledger dir}"; STAMP=$(date -u +%Y%m%dT%H%M%SZ)
REC="$CAL/WINDOW-DEBUG-$STAMP.md"; ARCH="$CAL/device.logarchive"; W="$CAL/window-debug.json"
say(){ echo "$*" | tee -a "$REC"; }
[ -n "${K00_EXEC_AUTHORITY:-}" ] || { echo "STOP — K00_EXEC_AUTHORITY unset: no execution authority supplied at invocation (AUTH-3); nothing read"; exit 4; }
[ -d "$ARCH" ] || { echo "STOP — $ARCH absent (the archive lives only on the Mac that collected it)"; exit 2; }
T0_LOCAL=$(grep -o -- '--start [0-9-]* [0-9:]*' "$CAL/CALIBRATION.md" | head -1 | cut -d' ' -f2-)
T1_ISO=$(grep -o '## T1 (after export): [0-9T:-]*Z' "$CAL/CALIBRATION.md" | head -1 | awk '{print $NF}')
[ -n "$T0_LOCAL" ] && [ -n "$T1_ISO" ] || { echo "STOP — CALIBRATION.md does not record the collect --start and T1; the window cannot be reproduced exactly"; exit 2; }
T1_EPOCH=$(date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "$T1_ISO" +%s 2>/dev/null) || { echo "STOP — cannot parse T1 $T1_ISO"; exit 2; }
T1_LOCAL="$(date -r $((T1_EPOCH+2)) "+%Y-%m-%d %H:%M:%S")"   # exactly what k00-log-calibrate.sh used: T1 + 2 s, Mac local clock
say "# unified-log --debug re-read — $STAMP · archive $ARCH · window (local) $T0_LOCAL → $T1_LOCAL (reproduced from CALIBRATION.md) · offline · no device act · no collect · no sudo · no --info"
say "## execution authority (verbatim, supplied at invocation): $K00_EXEC_AUTHORITY"
say "## question (founder ruling, last rung): does --debug expose audiomxd activity during the aligned session-activation → first-input-callback interval that neither default nor --info exposed?"
# Ruling 1 grammar: options first, archive last. Ladder: --debug ALONE (never combined with --info, by ruling); the reader labels absence DEBUG-LEVEL.
say "## command (verbatim): log show --debug --start \"$T0_LOCAL\" --end \"$T1_LOCAL\" --style json $ARCH > $W"
log show --debug --start "$T0_LOCAL" --end "$T1_LOCAL" --style json "$ARCH" > "$W" 2> "$CAL/show-debug-stderr.txt"; SRC=$?
say "## show rc=$SRC · window-debug.json $(du -sh "$W" | cut -f1) · sha256 $(shasum -a 256 "$W" | cut -d' ' -f1) · stderr $(wc -c < "$CAL/show-debug-stderr.txt") bytes"
[ $SRC -eq 0 ] || { say "## STOP — log show --debug failed; nothing read"; exit 6; }
J="$(ls "$LC"/journals/kernel00-*.jsonl 2>/dev/null | head -1)"
say "## reader (verbatim): python3 scripts/witness/k00-log-window-read.py $W ${J:--} $CAL --expect-archive $ARCH --suffix debug"
python3 scripts/witness/k00-log-window-read.py "$W" "${J:--}" "$CAL" --expect-archive "$ARCH" --suffix debug | tee -a "$REC"; RC=${PIPESTATUS[0]}
say "## reader rc=$RC · debug audio subset: $CAL/window-debug-audio.jsonl · default and info subsets untouched: $CAL/window-audio.jsonl · $CAL/window-info-audio.jsonl"
echo "debug record: $REC"; exit "$RC"
