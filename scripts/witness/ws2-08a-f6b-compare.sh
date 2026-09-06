#!/usr/bin/env bash
# WS2-08A · F6b — POST-MIGRATION COMPARISON against a digest-sealed F6a directory.
#
# RUN ON minisforum (production), AFTER PR #1230 is merged AND migration
# 20260906000001 has executed through the supported deploy path, and BEFORE
# ordinary member writes resume. Usage:
#
#   bash ~/ws2-08a-f6b-compare.sh ~/ws2-08a-witness/f6a-<stamp>
#
# Proves, from the RAW F6a baseline (custody re-verified first), inside one
# REPEATABLE READ snapshot:
#   R1  every baseline id still exists
#   R2  old identity/content identical on every baseline id
#       (manuscript_id · position · heading · sha256(body)) — as a byte-identical
#       re-projection digest AND as a row-level difference count
#   R3  heading_depth IS NULL AND heading_signal IS NULL on every baseline id
#   R5  WRITE BOUNDARY: pg_stat_user_tables update/delete/hot-update counters for
#       manuscript_sections unchanged since F6a, stats not reset — a positive
#       guarantee that no existing row was rewritten in the interval by anything
#   R6  the migration ledger grew only by addition: every F6a ledger row is still
#       present verbatim, and 20260906000001 is now among the rows
#   R4  (informational) rows inserted after F6a — F1–F3 fixtures land here;
#       reported, not judged
set -euo pipefail

F6A="${1:?usage: ws2-08a-f6b-compare.sh <f6a-dir>}"
OUT="$(dirname "$F6A")/f6b-$(date -u +%Y%m%dT%H%M%SZ)"
PSQL=(docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X -q -v ON_ERROR_STOP=1)
NULL_TOKEN='__NULL__'
CT=/tmp/ws2_08a_f6b

fail() { echo "F6b FAIL: $*" >&2; exit 1; }
jget() { sed -n "s/.*\"$1\": *\"\{0,1\}\([^\",}]*\)\"\{0,1\}[,}].*/\1/p" "$F6A/manifest.json" | head -1; }

# Custody — the baseline must be exactly what F6a wrote.
[ "$(sha256sum "$F6A/manifest.json" | cut -d' ' -f1)" = "$(cat "$F6A/manifest.sha256")" ] \
  || fail "manifest.json digest != manifest.sha256 — baseline custody broken"
EXPECT_CSV_SHA=$(grep -A8 '"population"' "$F6A/manifest.json" | sed -n 's/.*"sha256": *"\([0-9a-f]\{64\}\)".*/\1/p' | head -1)
EXPECT_LEDGER_SHA=$(grep -A6 '"migration_ledger"' "$F6A/manifest.json" | sed -n 's/.*"sha256": *"\([0-9a-f]\{64\}\)".*/\1/p' | head -1)
[ "$(sha256sum "$F6A/manuscript_sections.baseline.csv" | cut -d' ' -f1)" = "$EXPECT_CSV_SHA" ] \
  || fail "baseline csv digest != manifest population.sha256 — baseline custody broken"
[ "$(sha256sum "$F6A/schema_migrations.baseline.jsonl" | cut -d' ' -f1)" = "$EXPECT_LEDGER_SHA" ] \
  || fail "baseline ledger digest != manifest migration_ledger.sha256 — baseline custody broken"
BASE_ROWS=$(( $(wc -l < "$F6A/manuscript_sections.baseline.csv") - 1 ))
BASE_LEDGER_ROWS=$(wc -l < "$F6A/schema_migrations.baseline.jsonl")
B_UPD=$(jget n_tup_upd); B_DEL=$(jget n_tup_del); B_HOT=$(jget n_tup_hot_upd); B_INS=$(jget n_tup_ins); B_RESET=$(jget stats_reset)

# Precondition — the migration has run.
NEWCOLS=$("${PSQL[@]}" -At -c "SELECT count(*) FROM information_schema.columns
  WHERE table_name='manuscript_sections' AND column_name IN ('heading_depth','heading_signal')")
[ "$NEWCOLS" = "2" ] || fail "heading_depth/heading_signal not both present — migration has not run"

mkdir -p "$OUT"
docker cp "$F6A/manuscript_sections.baseline.csv"   maia-postgres:$CT.baseline.csv
docker cp "$F6A/schema_migrations.baseline.jsonl"   maia-postgres:$CT.ledger.jsonl

# One transaction, one snapshot: load baseline into TEMP tables, adjudicate,
# and re-project the baseline ids with the identical projection and options.
"${PSQL[@]}" -At -F '|' <<SQL > "$OUT/results.txt"
BEGIN ISOLATION LEVEL REPEATABLE READ;
CREATE TEMP TABLE f6a (id uuid PRIMARY KEY, manuscript_id uuid, position int, heading text, body_sha256 text);
CREATE TEMP TABLE f6a_ledger (row jsonb);
\\copy f6a FROM '$CT.baseline.csv' WITH (FORMAT csv, HEADER, NULL '$NULL_TOKEN')
\\copy f6a_ledger FROM '$CT.ledger.jsonl'
SELECT 'snapshot', pg_current_snapshot()::text;
SELECT 'baseline_rows_loaded', count(*) FROM f6a;
SELECT 'R1_missing_baseline_ids', count(*) FROM f6a a LEFT JOIN manuscript_sections s ON s.id = a.id WHERE s.id IS NULL;
SELECT 'R2_old_field_differences', count(*) FROM f6a a JOIN manuscript_sections s ON s.id = a.id
  WHERE s.manuscript_id IS DISTINCT FROM a.manuscript_id
     OR s.position      IS DISTINCT FROM a.position
     OR s.heading       IS DISTINCT FROM a.heading
     OR encode(sha256(convert_to(s.body,'UTF8')),'hex') IS DISTINCT FROM a.body_sha256;
SELECT 'R3_new_columns_not_null_on_baseline', count(*) FROM f6a a JOIN manuscript_sections s ON s.id = a.id
  WHERE s.heading_depth IS NOT NULL OR s.heading_signal IS NOT NULL;
SELECT 'R4_rows_after_baseline_informational', count(*) FROM manuscript_sections s LEFT JOIN f6a a ON a.id = s.id WHERE a.id IS NULL;
SELECT 'stats_reset', coalesce(stats_reset::text, 'never') FROM pg_stat_database WHERE datname = current_database();
SELECT 'stats', n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd FROM pg_stat_user_tables WHERE relname = 'manuscript_sections';
SELECT 'R6_ledger_rows_missing', count(*) FROM f6a_ledger l WHERE NOT EXISTS (SELECT 1 FROM schema_migrations m WHERE to_jsonb(m) = l.row);
SELECT 'R6_migration_present', count(*) FROM schema_migrations m WHERE to_jsonb(m)::text LIKE '%20260906000001%';
SELECT 'ledger_count_now', count(*) FROM schema_migrations;
\\copy (SELECT s.id, s.manuscript_id, s.position, s.heading, encode(sha256(convert_to(s.body,'UTF8')),'hex') AS body_sha256 FROM manuscript_sections s JOIN f6a a ON a.id = s.id ORDER BY s.id) TO '$CT.reprojection.csv' WITH (FORMAT csv, HEADER, NULL '$NULL_TOKEN')
COMMIT;
SQL
docker cp maia-postgres:$CT.reprojection.csv "$OUT/manuscript_sections.reprojection.csv"
docker exec maia-postgres rm -f $CT.baseline.csv $CT.ledger.jsonl $CT.reprojection.csv

get() { awk -F'|' -v k="$1" '$1==k{print $2}' "$OUT/results.txt"; }
LOADED=$(get baseline_rows_loaded); R1=$(get R1_missing_baseline_ids); R2=$(get R2_old_field_differences)
R3=$(get R3_new_columns_not_null_on_baseline); R4=$(get R4_rows_after_baseline_informational)
R6_MISSING=$(get R6_ledger_rows_missing); R6_PRESENT=$(get R6_migration_present); LEDGER_NOW=$(get ledger_count_now)
N_RESET=$(get stats_reset); SNAP=$(get snapshot)
read -r N_INS N_UPD N_DEL N_HOT <<<"$(awk -F'|' '$1=="stats"{print $2,$3,$4,$5}' "$OUT/results.txt")"
REPROJ_SHA=$(sha256sum "$OUT/manuscript_sections.reprojection.csv" | cut -d' ' -f1)

R5=OK
[ "$N_RESET" = "$B_RESET" ] || R5="stats_reset changed ($B_RESET -> $N_RESET): boundary NOT ESTABLISHED"
[ "$N_UPD" = "$B_UPD" ] && [ "$N_DEL" = "$B_DEL" ] && [ "$N_HOT" = "$B_HOT" ] \
  || R5="rows were updated/deleted in the interval (upd $B_UPD->$N_UPD, del $B_DEL->$N_DEL, hot $B_HOT->$N_HOT)"

VERDICT=PASS
[ "$LOADED" = "$BASE_ROWS" ] || VERDICT=FAIL
[ "$R1" = "0" ] && [ "$R2" = "0" ] && [ "$R3" = "0" ] || VERDICT=FAIL
[ "$REPROJ_SHA" = "$EXPECT_CSV_SHA" ] || VERDICT=FAIL
[ "$R5" = "OK" ] || VERDICT=FAIL
[ "$R6_MISSING" = "0" ] && [ "$R6_PRESENT" -ge 1 ] || VERDICT=FAIL

cat > "$OUT/manifest.json" <<JSON
{
  "witness": "WS2-08A F6b post-migration comparison",
  "against_f6a": "$F6A",
  "script_sha256": "$(sha256sum "$0" | cut -d' ' -f1)",
  "identity": {
    "host": "$(hostname)",
    "compared_at_utc": "$(date -u +%FT%TZ)",
    "git_commit": "$(docker exec maia-sovereign printenv GIT_COMMIT 2>/dev/null || echo unknown)",
    "snapshot": "$SNAP",
    "isolation": "REPEATABLE READ, single transaction (TEMP tables forbid READ ONLY); writes touch only TEMP tables"
  },
  "baseline": { "rows_in_csv": $BASE_ROWS, "rows_loaded": $LOADED, "csv_sha256": "$EXPECT_CSV_SHA", "ledger_rows": $BASE_LEDGER_ROWS, "ledger_sha256": "$EXPECT_LEDGER_SHA" },
  "results": {
    "R1_missing_baseline_ids": $R1,
    "R2_old_field_differences": $R2,
    "R3_new_columns_not_null_on_baseline": $R3,
    "R4_rows_after_baseline_informational": $R4,
    "R5_write_boundary": "$R5",
    "R5_counters": { "before": { "ins": $B_INS, "upd": $B_UPD, "del": $B_DEL, "hot": $B_HOT }, "after": { "ins": $N_INS, "upd": $N_UPD, "del": $N_DEL, "hot": $N_HOT } },
    "R6_ledger_rows_missing": $R6_MISSING,
    "R6_migration_20260906000001_present": $R6_PRESENT,
    "ledger_count_before": $BASE_LEDGER_ROWS,
    "ledger_count_after": $LEDGER_NOW,
    "reprojection_sha256": "$REPROJ_SHA",
    "reprojection_matches_baseline": $( [ "$REPROJ_SHA" = "$EXPECT_CSV_SHA" ] && echo true || echo false )
  },
  "verdict": "$VERDICT"
}
JSON
sha256sum "$OUT/manifest.json" | cut -d' ' -f1 > "$OUT/manifest.sha256"
chmod -R a-w "$OUT"

echo "F6b $VERDICT → $OUT"
grep -E '^(baseline_rows_loaded|R[1-6]|ledger_count_now)' "$OUT/results.txt"
echo "R5_write_boundary|$R5"
echo "reprojection sha256: $REPROJ_SHA (baseline $EXPECT_CSV_SHA)"
[ "$VERDICT" = "PASS" ]
