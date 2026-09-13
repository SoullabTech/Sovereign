#!/usr/bin/env bash
# DRIVER-01 housekeeping steps D–H (founder ruling 2026-09-13). FAIL-CLOSED SKELETON.
#   D. require the latest container archive to say RECONCILED
#   E. require a devicectl probe (k00-devicectl-probe.sh) to have been captured
#   F. delete ONLY tmp/kernel00-*.jsonl  ← NOT IMPLEMENTED: no documented devicectl deletion verb has been read yet.
#      This step is written only after the probe output is in the repo and names one. Never a guessed subcommand.
#   G. re-list the container   H. record the remaining journal set (must be zero)
#   usage: scripts/witness/k00-container-purge.sh <archive-dir>
set -uo pipefail
ARCHIVE="${1:?container-archive dir (the one whose reconcile.txt says RECONCILED)}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LEDGER="$ROOT/docs/programme/VOICE-2026/driver-ledger"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$LEDGER/purge-$STAMP.txt"
refuse(){ { echo "# purge $STAMP — REFUSED"; echo "$*"; echo "nothing was deleted; the device is untouched"; } | tee "$OUT"; exit 4; }
# D
grep -q '^## verdict: RECONCILED' "$ARCHIVE/reconcile.txt" 2>/dev/null || refuse "step D: $ARCHIVE/reconcile.txt does not say RECONCILED (or is absent)"
# E
PROBE="$(ls -d "$LEDGER"/devicectl-probe-*/ 2>/dev/null | sort | tail -1)"
[ -n "$PROBE" ] && [ -s "$PROBE/device-help.txt" ] || refuse "step E: no devicectl probe captured under $LEDGER (run scripts/witness/k00-devicectl-probe.sh first)"
# F
refuse "step F: deletion verb NOT IMPLEMENTED — the captured probe ($PROBE) must be read and a documented verb implemented here before any deletion; this script deletes nothing"
