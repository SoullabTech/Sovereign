#!/usr/bin/env bash
# Pinned launcher for the F-pass surface (PILOT-01). The launch command is part of the custody chain: it is
# committed here, echoed into a durable server log, and recorded again (paths + code identity) in the event log.
#
#   BACKUP_DIR=/Users/soullab/jev-label-pilot-backups/f-durability-20261007 ./run-f-ui.sh
#
# BACKUP_DIR is REQUIRED and must differ from the pilot root (ideally another volume): it holds the rolling copy,
# the write-once generation ledger, and the hash-chained content-free event log.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PILOT_ROOT="${PILOT_ROOT:-/Users/soullab/jev-label-pilot-01-real-20261002}"
DELEG_HOME="${DELEG_HOME:-$HOME/.claude/ain-delegation}"
BACKUP_DIR="${BACKUP_DIR:?BACKUP_DIR is required (a directory different from the pilot root)}"
PORT="${PORT:-3762}"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
LOG="$BACKUP_DIR/server-$(date +%Y%m%dT%H%M%S).log"
{
  echo "LAUNCH_SCRIPT=$HERE/run-f-ui.sh"
  echo "LAUNCH_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "PILOT_ROOT=$PILOT_ROOT DELEG_HOME=$DELEG_HOME BACKUP_DIR=$BACKUP_DIR PORT=$PORT"
} | tee -a "$LOG"
npx tsx "$HERE/human-f-ui-server.ts" \
  --home "$DELEG_HOME" \
  --manifest "$PILOT_ROOT/manifest.json" \
  --index "$PILOT_ROOT/local-index.json" \
  --sheet "$PILOT_ROOT/kelly-F-sheet.json" \
  --working "$PILOT_ROOT/kelly-F-sheet-working.json" \
  --backup-dir "$BACKUP_DIR" \
  --port "$PORT" 2>&1 | tee -a "$LOG"
