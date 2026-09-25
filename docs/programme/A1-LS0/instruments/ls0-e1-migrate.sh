#!/usr/bin/env bash
# A1-LS0 · E1 migration-sufficiency instrument.
#
# Mirrors scripts/apply-migrations.sh semantics per file (psql \i in autocommit,
# ON_ERROR_STOP, ledger row written only after the file succeeds) with ONE
# difference required by the packet §3: a refused file does not stop the run;
# it is recorded (identity + exact error) and the next file is attempted.
# No migration file is edited, skipped by choice, or patched.
#
# Usage: ls0-e1-migrate.sh <canonical_root> <database_url> <out_dir>
set -uo pipefail
ROOT="$1"; DB="$2"; OUT="$3"
MIG_DIR="$ROOT/database/migrations"
mkdir -p "$OUT"
: > "$OUT/applied.tsv"; : > "$OUT/refused.tsv"
psql "$DB" -q -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, checksum text, applied_at timestamptz NOT NULL DEFAULT now())" >/dev/null

# Deterministic order: byte order (LC_ALL=C). Recorded in evidence.
mapfile -t FILES < <(cd "$MIG_DIR" && LC_ALL=C ls -1 -- *.sql)
i=0
for base in "${FILES[@]}"; do
  i=$((i+1))
  f="$MIG_DIR/$base"
  sum="$(sha256sum "$f" | awk '{print $1}')"
  err="$(psql "$DB" -q -X -v ON_ERROR_STOP=1 -f "$f" 2>&1 >/dev/null)"
  rc=$?
  if [ $rc -eq 0 ]; then
    printf "INSERT INTO schema_migrations(filename, checksum) VALUES (:'fn', :'cs') ON CONFLICT (filename) DO NOTHING;\n" \
      | psql "$DB" -q -X -v ON_ERROR_STOP=1 -v fn="$base" -v cs="$sum" >/dev/null
    printf '%d\t%s\t%s\n' "$i" "$base" "$sum" >> "$OUT/applied.tsv"
  else
    first="$(printf '%s' "$err" | grep -m1 -E 'ERROR:' | sed 's/^.*ERROR:[[:space:]]*//' | tr '\t' ' ')"
    [ -z "$first" ] && first="$(printf '%s' "$err" | head -1 | tr '\t' ' ')"
    printf '%d\t%s\t%s\trc=%d\t%s\n' "$i" "$base" "$sum" "$rc" "$first" >> "$OUT/refused.tsv"
  fi
done
echo "total=${#FILES[@]} applied=$(wc -l < "$OUT/applied.tsv") refused=$(wc -l < "$OUT/refused.tsv")"
