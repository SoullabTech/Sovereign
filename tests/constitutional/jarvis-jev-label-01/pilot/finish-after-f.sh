#!/usr/bin/env bash
# Pinned finish gate for PILOT-01 F: verify → immutable pre-seal backup → seal F against sealed P → report.
# STOPS at the first refusal; nothing after a refusal runs. Replaces the unversioned script that lived only on the Mac.
#
#   BACKUP_DIR=<the SAME dir the F server was launched with> ./finish-after-f.sh
#
# The expected values below are the frozen pilot facts (manifest embedded SHA-256, and the SHA-256 digest of the sealed
# P seal that the F sheet is bound to). Every input file is checked AGAINST them, never the other way round.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PILOT_ROOT="${PILOT_ROOT:-/Users/soullab/jev-label-pilot-01-real-20261002}"
DELEG_HOME="${DELEG_HOME:-$HOME/.claude/ain-delegation}"
BACKUP_DIR="${BACKUP_DIR:?BACKUP_DIR is required (the --backup-dir the F server was started with)}"
PRESEAL_DIR="${PRESEAL_DIR:-/Users/soullab/jev-label-pilot-backups/preseal-$(date +%Y%m%d)}"
EXPECT_MANIFEST="12758958be8c3eec4a3054491ddfb92efe8b89aa92c3393a88649b7513d8a009"
EXPECT_P_SEAL="f308d2153a12f3001d0ec01deefa6ae7e02e8d25e2865a3092e78fe31f1e331f"
exec npx tsx "$HERE/human-f-finish.ts" \
  --home "$DELEG_HOME" \
  --manifest "$PILOT_ROOT/manifest.json" \
  --index "$PILOT_ROOT/local-index.json" \
  --sealed-p "$PILOT_ROOT/kelly-P-sealed.json" \
  --working "$PILOT_ROOT/kelly-F-sheet-working.json" \
  --backup-dir "$BACKUP_DIR" \
  --preseal-dir "$PRESEAL_DIR" \
  --out-dir "$PILOT_ROOT" \
  --expect-manifest "$EXPECT_MANIFEST" \
  --expect-p-seal "$EXPECT_P_SEAL"
