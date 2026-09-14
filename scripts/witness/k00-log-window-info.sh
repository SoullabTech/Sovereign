#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · the ONE authorized `--info` re-read of an EXISTING calibration archive (founder ruling 2, 2026-09-14).
# Offline on the Mac: same device.logarchive · same T0/T1 window · `log show --info` · separate INFO record · corrected reader.
# NEVER: a sample · `log collect` · sudo · any device act · `--debug` · `log config` · a batch. Escalation beyond --info is a separate ruling.
# AUTH-3: execution authority is an input — K00_EXEC_AUTHORITY must be supplied at invocation, is recorded verbatim, never read from the repo.
#   usage: K00_EXEC_AUTHORITY="<founder authorization, verbatim>" scripts/witness/k00-log-window-info.sh <unifiedlog-cal-dir> <LOG-CAL-dir>
set -u
CAL="${1:?unifiedlog-cal dir}"; LC="${2:?LOG-CAL ledger dir}"; STAMP=$(date -u +%Y%m%dT%H%M%SZ)
REC="$CAL/WINDOW-INFO-$STAMP.md"; ARCH="$CAL/device.logarchive"; W="$CAL/window-info.json"
say(){ echo "$*" | tee -a "$REC"; }
[ -n "${K00_EXEC_AUTHORITY:-}" ] || { echo "STOP — K00_EXEC_AUTHORITY unset: no execution authority supplied at invocation (AUTH-3); nothing read"; exit 4; }
[ -d "$ARCH" ] || { echo "STOP — $ARCH absent (the archive lives only on the Mac that collected it)"; exit 2; }
T0_LOCAL=$(grep -o -- '--start [0-9-]* [0-9:]*' "$CAL/CALIBRATION.md" | head -1 | cut -d' ' -f2-)
T1_ISO=$(grep -o '## T1 (after export): [0-9T:-]*Z' "$CAL/CALIBRATION.md" | head -1 | awk '{print $NF}')
[ -n "$T0_LOCAL" ] && [ -n "$T1_ISO" ] || { echo "STOP — CALIBRATION.md does not record the collect --start and T1; the window cannot be reproduced exactly"; exit 2; }
T1_EPOCH=$(date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "$T1_ISO" +%s 2>/dev/null) || { echo "STOP — cannot parse T1 $T1_ISO"; exit 2; }
T1_LOCAL="$(date -r $((T1_EPOCH+2)) "+%Y-%m-%d %H:%M:%S")"   # exactly what k00-log-calibrate.sh used: T1 + 2 s, Mac local clock
say "# unified-log --info re-read — $STAMP · archive $ARCH · window (local) $T0_LOCAL → $T1_LOCAL (reproduced from CALIBRATION.md) · offline · no device act · no collect · no sudo · no --debug"
say "## execution authority (verbatim, supplied at invocation): $K00_EXEC_AUTHORITY"
say "## question (ruling 2): does --info expose audiomxd activity during the aligned session-activation → first-input-callback interval that default level did not?"
# Ruling 1 grammar: options first, archive last. Ruling 2 ladder: --info is this read; --debug is never issued here.
say "## command (verbatim): log show --info --start \"$T0_LOCAL\" --end \"$T1_LOCAL\" --style json $ARCH > $W"
log show --info --start "$T0_LOCAL" --end "$T1_LOCAL" --style json "$ARCH" > "$W" 2> "$CAL/show-info-stderr.txt"; SRC=$?
say "## show rc=$SRC · window-info.json $(du -sh "$W" | cut -f1) · sha256 $(shasum -a 256 "$W" | cut -d' ' -f1) · stderr $(wc -c < "$CAL/show-info-stderr.txt") bytes"
[ $SRC -eq 0 ] || { say "## STOP — log show --info failed; nothing read"; exit 6; }
J="$(ls "$LC"/journals/kernel00-*.jsonl 2>/dev/null | head -1)"
say "## reader (verbatim): python3 scripts/witness/k00-log-window-read.py $W ${J:--} $CAL --expect-archive $ARCH --suffix info"
python3 scripts/witness/k00-log-window-read.py "$W" "${J:--}" "$CAL" --expect-archive "$ARCH" --suffix info | tee -a "$REC"; RC=${PIPESTATUS[0]}
say "## reader rc=$RC · info audio subset: $CAL/window-info-audio.jsonl · default-level subset untouched: $CAL/window-audio.jsonl"
echo "info record: $REC"; exit "$RC"
