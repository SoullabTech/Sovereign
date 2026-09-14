#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · step A/B — DISCOVERY ONLY of the unified-log capture verb.
# Captures the INSTALLED tool's own help text verbatim; issues no capture, changes no configuration, touches no device
# logging level. `xcrun devicectl` was already probed two levels deep (2026-09-13): it has NO log verb (only
# `sysdiagnose`, which is separately ruled out unless ruled). The remaining candidate is macOS `log(1)`, whose
# `collect` / `show` / `stream` subcommands document device options — or do not; this probe records which.
#   usage: scripts/witness/k00-log-probe.sh [<ledger-root>]
set -uo pipefail
ROOT="${1:-docs/programme/VOICE-2026/driver-ledger}"; STAMP="$(date -u +%Y%m%dT%H%M%SZ)"; OUT="$ROOT/log-probe-$STAMP"; mkdir -p "$OUT"
{ sw_vers; xcodebuild -version 2>/dev/null; which log; } > "$OUT/versions.txt" 2>&1
capture(){ # $1 = file · rest = command; help pages only. C-D11: the filename is shifted off before executing —
  # the first run (20260914T021452Z) executed the filename itself and reported NONE FOUND about a tool it never invoked.
  local f="$1"; shift
  { echo "\$ $*"; "$@"; echo "[rc=$?]"; } > "$OUT/$f" 2>&1
}
capture log-help.txt log help
capture log-collect-help.txt log help collect
capture log-show-help.txt log help show
capture log-stream-help.txt log help stream
capture log-config-help.txt log help config          # captured to show it exists and that this instrument never invokes it
capture man-log.txt sh -c 'MANPAGER=cat man log 2>/dev/null | col -b'
capture devicectl-sysdiagnose-help.txt xcrun devicectl device sysdiagnose --help   # recorded, NOT used (separate ruling)
S="$OUT/SUMMARY.txt"
{ echo "# unified-log capture discovery — $STAMP (help pages only; nothing captured, nothing configured)"
  echo "## log collect documents a device option?"; grep -nE -- '--device[a-z-]*' "$OUT/log-collect-help.txt" "$OUT/man-log.txt" | head -20 || echo "NONE FOUND"
  echo "## log collect documents a time window?"; grep -nE -- '--(start|last)' "$OUT/log-collect-help.txt" | head -10 || echo "NONE FOUND"
  echo "## log show documents --archive / --start / --end / --style?"; grep -nE -- '--(archive|start|end|style|predicate)' "$OUT/log-show-help.txt" | head -20 || echo "NONE FOUND"
  echo "## log stream documents a device option?"; grep -nE -- '--device[a-z-]*' "$OUT/log-stream-help.txt" | head -10 || echo "NONE FOUND (stream is a live stream; collect is preferred as a bounded, after-the-fact read)"
  echo "## what log collect says it does (verbatim OVERVIEW/DESCRIPTION lines)"; grep -niE 'collect|archive|device' "$OUT/log-collect-help.txt" | head -30
  echo "## read-only assessment (documentation-based; the calibration records daemon identity before/after as the empirical check)"
  echo "log collect reads the device's persisted log store into a .logarchive on the Mac; the help text is the authority for whether any option alters device logging. Any option that changes levels/modes lives under 'log config', which this instrument never calls."
} > "$S"
cat "$S"; echo "probe written: $OUT"
