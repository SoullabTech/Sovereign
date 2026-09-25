#!/usr/bin/env bash
# A1-LS0 · authoritative flag matrix (packet §6) around one frozen instrument set.
# Source integrity is recorded before and after (packet §11).
# Usage: ls0-e1-matrix.sh <instruments_dir> <canonical_root> <out_dir>
set -euo pipefail
INS="$1"; ROOT="$2"; OUT="$3"
mkdir -p "$OUT"
bash "$INS/ls0-e1-integrity.sh" "$ROOT" "$OUT/integrity-before.txt"
run() { bash "$INS/ls0-e1-run.sh" "$INS" "$ROOT" "$OUT/$1" "$1" "$2"; }
run C0-all-off      none
run C1-editorial-on WRITERS_STUDIO_EDITORIAL_ENABLED=1
run C2-focus-on     WRITERS_STUDIO_FOCUS_ENABLED=1
run C3-discuss-on   WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1
run C4-standing-on  WS_STANDING_ENABLED=1
run C5-all-on       WRITERS_STUDIO_EDITORIAL_ENABLED=1,WRITERS_STUDIO_FOCUS_ENABLED=1,WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1,WS_STANDING_ENABLED=1
bash "$INS/ls0-e1-integrity.sh" "$ROOT" "$OUT/integrity-after.txt"
node "$INS/ls0-e1-aggregate.mjs" "$OUT" "$OUT/matrix.json" | tee "$OUT/matrix.log"
