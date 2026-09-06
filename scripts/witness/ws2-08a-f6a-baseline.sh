#!/usr/bin/env bash
# WS2-08A · F6a — PRE-MIGRATION BASELINE of production manuscript_sections.
#
# RUN ON minisforum (production), BEFORE merging PR #1230 and before any
# migration. From the Mac Studio:
#
#   scp ws2-08a-f6a-baseline.sh soullab@minisforum:~/
#   ssh soullab@minisforum 'bash ~/ws2-08a-f6a-baseline.sh'
#
# WHAT IT BINDS (founder corrections 2026-09-06):
#   - ONE CONSISTENT SNAPSHOT: every read below runs inside a single
#     REPEATABLE READ transaction, so count, population, ledger and statistics
#     describe the same instant.
#   - THE WHOLE MIGRATION LEDGER, not its last row: every schema_migrations row
#     serialised as JSON, ordered deterministically, preserved raw and digested.
#     Independent of which historical column shape the ledger has.
#   - A WRITE-BOUNDARY WITNESS: pg_stat_user_tables counters for the table
#     (inserts / updates / deletes / hot updates) plus the stats reset time.
#     F6b compares them: zero update+delete delta across the interval is a
#     positive guarantee that no existing row was rewritten by anything,
#     migration or member. A maintenance window is still recommended; this
#     makes its absence detectable rather than assumed.
#
# Projection (deterministic, ORDER BY id):
#   id · manuscript_id · position · heading · sha256(convert_to(body,'UTF8'))
# heading_depth / heading_signal are deliberately ABSENT: they do not exist yet.
#
# The output directory is DIGEST-SEALED and read-only, not immutable: the
# recorded SHA-256s are the tamper evidence; the raw CSVs are preserved because
# a digest cannot reconstruct a baseline for field-by-field comparison.
set -euo pipefail

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${1:-$HOME/ws2-08a-witness/f6a-$STAMP}"
PSQL=(docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X -q -v ON_ERROR_STOP=1)
NULL_TOKEN='__NULL__'
CT=/tmp/ws2_08a_f6a   # scratch prefix INSIDE the postgres container

refuse() { echo "F6a REFUSED: $*" >&2; exit 2; }

# Guard 1 — this must be a pre-migration state.
if "${PSQL[@]}" -At -c "SELECT 1 FROM information_schema.columns
      WHERE table_name='manuscript_sections' AND column_name IN ('heading_depth','heading_signal')" | grep -q 1; then
  refuse "heading_depth / heading_signal already exist on manuscript_sections — not a pre-migration state"
fi
# Guard 2 — never overwrite a baseline.
[ -e "$OUT" ] && refuse "$OUT already exists"
mkdir -p "$OUT"

# One transaction, one snapshot. Files are written client-side, i.e. inside
# the container, then copied out.
"${PSQL[@]}" -At -F '|' <<SQL > "$OUT/snapshot.txt"
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT 'snapshot_txid', txid_current_if_assigned() IS NOT NULL, pg_current_snapshot()::text;
SELECT 'server_encoding', current_setting('server_encoding');
SELECT 'row_count', count(*) FROM manuscript_sections;
\\copy (SELECT id, manuscript_id, position, heading, encode(sha256(convert_to(body,'UTF8')),'hex') AS body_sha256 FROM manuscript_sections ORDER BY id) TO '$CT.population.csv' WITH (FORMAT csv, HEADER, NULL '$NULL_TOKEN')
SELECT 'ledger_count', count(*) FROM schema_migrations;
\\copy (SELECT row_to_json(m)::text FROM (SELECT * FROM schema_migrations ORDER BY applied_at, 1) m) TO '$CT.ledger.jsonl'
SELECT 'stats_reset', coalesce(stats_reset::text, 'never') FROM pg_stat_database WHERE datname = current_database();
SELECT 'stats', n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd, n_live_tup FROM pg_stat_user_tables WHERE relname = 'manuscript_sections';
COMMIT;
SQL
docker cp maia-postgres:$CT.population.csv "$OUT/manuscript_sections.baseline.csv"
docker cp maia-postgres:$CT.ledger.jsonl   "$OUT/schema_migrations.baseline.jsonl"
docker exec maia-postgres rm -f $CT.population.csv $CT.ledger.jsonl

get() { awk -F'|' -v k="$1" '$1==k{print $2}' "$OUT/snapshot.txt"; }
COUNT=$(get row_count); ENC=$(get server_encoding); LEDGER_N=$(get ledger_count); STATS_RESET=$(get stats_reset)
SNAP=$(awk -F'|' '$1=="snapshot_txid"{print $3}' "$OUT/snapshot.txt")
read -r INS UPD DEL HOT LIVE <<<"$(awk -F'|' '$1=="stats"{print $2,$3,$4,$5,$6}' "$OUT/snapshot.txt")"

ROWS=$(( $(wc -l < "$OUT/manuscript_sections.baseline.csv") - 1 ))
[ "$ROWS" = "$COUNT" ] || refuse "csv rows ($ROWS) != count(*) ($COUNT) inside one snapshot — export defect"
LEDGER_ROWS=$(wc -l < "$OUT/schema_migrations.baseline.jsonl")
[ "$LEDGER_ROWS" = "$LEDGER_N" ] || refuse "ledger rows ($LEDGER_ROWS) != count(*) ($LEDGER_N)"

CSV_SHA=$(sha256sum "$OUT/manuscript_sections.baseline.csv" | cut -d' ' -f1)
LEDGER_SHA=$(sha256sum "$OUT/schema_migrations.baseline.jsonl" | cut -d' ' -f1)
GIT_COMMIT=$(docker exec maia-sovereign printenv GIT_COMMIT 2>/dev/null || echo unknown)
SELF_SHA=$(sha256sum "$0" | cut -d' ' -f1)

cat > "$OUT/manifest.json" <<JSON
{
  "witness": "WS2-08A F6a pre-migration baseline",
  "pr": "SoullabTech/Sovereign#1230",
  "code_head": "685e205b",
  "script_sha256": "$SELF_SHA",
  "identity": {
    "host": "$(hostname)",
    "captured_at_utc": "$(date -u +%FT%TZ)",
    "git_commit": "$GIT_COMMIT",
    "server_encoding": "$ENC",
    "snapshot": "$SNAP",
    "isolation": "REPEATABLE READ READ ONLY, single transaction"
  },
  "migration_ledger": {
    "table": "schema_migrations",
    "row_count": $LEDGER_N,
    "projection": "row_to_json(row) ORDER BY applied_at, first column",
    "file": "schema_migrations.baseline.jsonl",
    "sha256": "$LEDGER_SHA"
  },
  "population": {
    "table": "manuscript_sections",
    "row_count": $COUNT,
    "projection": "id, manuscript_id, position, heading, encode(sha256(convert_to(body,'UTF8')),'hex') ORDER BY id",
    "csv_null_token": "$NULL_TOKEN",
    "excluded_by_design": ["heading_depth", "heading_signal"],
    "file": "manuscript_sections.baseline.csv",
    "sha256": "$CSV_SHA"
  },
  "write_boundary": {
    "source": "pg_stat_user_tables(manuscript_sections)",
    "stats_reset": "$STATS_RESET",
    "n_tup_ins": $INS, "n_tup_upd": $UPD, "n_tup_del": $DEL, "n_tup_hot_upd": $HOT, "n_live_tup": $LIVE,
    "rule": "F6b requires n_tup_upd, n_tup_del and n_tup_hot_upd unchanged and stats_reset unchanged; inserts are reported, not judged"
  }
}
JSON
sha256sum "$OUT/manifest.json" | cut -d' ' -f1 > "$OUT/manifest.sha256"
chmod -R a-w "$OUT"

echo "F6a CAPTURED (digest-sealed, read-only) → $OUT"
echo "  population rows   $COUNT        csv sha256      $CSV_SHA"
echo "  ledger rows       $LEDGER_N        ledger sha256   $LEDGER_SHA"
echo "  manifest sha256   $(cat "$OUT/manifest.sha256")"
echo "  git_commit $GIT_COMMIT · server_encoding $ENC · stats upd/del/hot $UPD/$DEL/$HOT (reset: $STATS_RESET)"
echo "  script sha256     $SELF_SHA"
echo
echo "Record csv / ledger / manifest digests in the lane record BEFORE merging #1230. Keep the directory; F6b needs the raw files."
