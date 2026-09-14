#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · C-D13 offline re-read of an EXISTING calibration window on the Mac.
# No device act, no root, no `log collect`, no `log show`: it reads the window.json the calibration already produced,
# verifies it against the sha256 the calibration recorded in its own CALIBRATION.md, and writes a NEW record file
# beside it (WINDOW-READ-<stamp>.md). CALIBRATION.md is a produced record and is never edited.
#   usage: scripts/witness/k00-log-window-reread.sh <unifiedlog-cal-dir> <LOG-CAL-dir>
set -u
CAL="${1:?unifiedlog-cal dir}"; LC="${2:?LOG-CAL ledger dir}"; STAMP=$(date -u +%Y%m%dT%H%M%SZ)
REC="$CAL/WINDOW-READ-$STAMP.md"; W="$CAL/window.json"
say(){ echo "$*" | tee -a "$REC"; }
[ -f "$W" ] || { echo "STOP — $W absent (not committed by design; it lives on the Mac that ran the calibration)"; exit 2; }
EXP=$(grep -o 'window.json sha256 [0-9a-f]\{64\}' "$CAL/CALIBRATION.md" | head -1 | awk '{print $3}')
[ -n "$EXP" ] || { echo "STOP — CALIBRATION.md records no window.json sha256; custody not establishable"; exit 2; }
J="$(ls "$LC"/journals/kernel00-*.jsonl 2>/dev/null | head -1)"
say "# window re-read — $STAMP · C-D13 offline read of $W · journal ${J:-none} · no device act · no log(1) invocation"
say "## command (verbatim): python3 scripts/witness/k00-log-window-read.py $W ${J:--} $CAL --expect-sha $EXP --expect-archive $CAL/device.logarchive"
python3 scripts/witness/k00-log-window-read.py "$W" "${J:--}" "$CAL" --expect-sha "$EXP" --expect-archive "$CAL/device.logarchive" | tee -a "$REC"; RC=${PIPESTATUS[0]}
say "## reader rc=$RC · trailer: $CAL/window-trailer.txt · audio subset: $CAL/window-audio.jsonl"
echo "re-read record: $REC"; exit "$RC"
