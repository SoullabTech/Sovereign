#!/usr/bin/env bash
# FOCUS-ASSEMBLER-CONTRACT-01A — the single named pre-human-witness gate.
#
#   ⭐⭐ A database-dependent disclosure boundary cannot be licensed solely by a
#       mocked database.
#
# Constructs a disposable database FROM REPOSITORY TRUTH (canonical baseline +
# migration ledger), then executes the REAL assembler SQL against it.
#
#   DATABASE_URL=postgres://…/<disposable> bash scripts/witness/gate-focus-assembler.sh
#
# ⛔ Fails if the schema cannot be constructed OR any contract check fails. There
# is no "fall back to the local production schema" path: that would trade one
# uncontrolled second truth for another.
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL must be set — point it at a DISPOSABLE database}"

echo "── schema from repository truth"
npm run --silent db:bootstrap
npm run --silent db:migrate

echo "── real assembler SQL against that schema"
npx tsx scripts/witness/focus-assembler-contract.ts

echo "✅ focus assembler contract gate PASSED"
