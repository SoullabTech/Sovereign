#!/usr/bin/env bash
# A1-LS1 · authoritative additive run around ONE frozen LS1 instrument set.
# A1-LS1R1: segment markers are LS1R1_RUN_BEGIN/END_<label>, distinct from the frozen
# LS0 matrix markers, so a statement-log segment can never absorb an LS0 segment.
#
# Re-uses the frozen LS0 E1 instruments UNCHANGED for provisioning (fresh
# synthetic database + migration-sufficiency run + synthetic identity), the
# loopback provider stub, the env -i dev-server launcher, the schema/dependency
# manifest and the source-integrity proof. Per flag configuration:
#   fresh provision → stub → candidate server → statement log on →
#   A1–A5 acceptance → statement log off → schema/dependency manifest.
# Under C0 the mutant suite additionally runs against a second tree (a clean
# checkout of the same candidate HEAD) served by its own dev server.
# Candidate source integrity is recorded before and after the whole run.
#
# Usage: ls1-e1-auth.sh <ls0_frozen_instruments> <ls1_frozen_instruments> <candidate_root> <mutant_root> <out_dir>
set -euo pipefail
LS0="$1"; INS="$2"; ROOT="$3"; MUT="$4"; OUT="$5"
PORT=3210; MPORT=3211; STUB=3299
DB="postgresql://soullab@127.0.0.1:55432/maia_consciousness"
ADMIN="postgresql://postgres@127.0.0.1:55432/postgres"
PGLOG=/tmp/ls0-e1-pg/server.log
mkdir -p "$OUT"

bash "$LS0/ls0-e1-integrity.sh" "$ROOT" "$OUT/integrity-before.txt"
bash "$LS0/ls0-e1-integrity.sh" "$MUT" "$OUT/mutant-integrity-before.txt"

snap() {
  psql "$DB" -qtAX -c "SELECT json_build_object(
    'tables', (SELECT coalesce(json_agg(json_build_object('relname', relname, 'seq_scan', seq_scan, 'idx_scan', coalesce(idx_scan,0), 'n_tup_ins', n_tup_ins, 'n_tup_upd', n_tup_upd, 'n_tup_del', n_tup_del)), '[]') FROM pg_stat_user_tables),
    'functions', (SELECT coalesce(json_agg(json_build_object('funcname', funcname, 'calls', calls)), '[]') FROM pg_stat_user_functions))" > "$1"
}
ready() { for i in $(seq 1 180); do grep -q 'Ready in' "$1" 2>/dev/null && return 0; sleep 1; done; return 1; }

config() (
  L="$1"; F="$2"; WITH_MUTANTS="${3:-}"; D="$OUT/$L"
  mkdir -p "$D"; echo "$L" > "$D/config.label"; echo "$F" > "$D/config.flags"
  psql "$ADMIN" -qX -c "ALTER SYSTEM SET track_functions = 'all'" -c "SELECT pg_reload_conf()" >/dev/null
  bash "$LS0/ls0-e1-provision.sh" "$ROOT" "$D/provision" > "$D/provision.log" 2>&1
  node "$LS0/ls0-e1-provider-stub.mjs" "$STUB" "$D/stub.log" & SP=$!
  setsid bash "$LS0/ls0-e1-server.sh" "$ROOT" "$PORT" "$STUB" "$D/server.log" "$F" & VP=$!
  MP=""
  if [ -n "$WITH_MUTANTS" ]; then setsid bash "$LS0/ls0-e1-server.sh" "$MUT" "$MPORT" "$STUB" "$D/mutant-server.log" "$F" & MP=$!; fi
  trap 'kill -- -"$VP" 2>/dev/null || true; [ -n "$MP" ] && { kill -- -"$MP" 2>/dev/null || true; }; kill "$SP" 2>/dev/null || true' EXIT
  ready "$D/server.log"

  # Statement text only (bind parameters never logged), exactly as LS0.
  psql "$ADMIN" -qX -c "ALTER SYSTEM SET log_statement = 'all'" -c "ALTER SYSTEM SET log_parameter_max_length = 0" \
    -c "ALTER SYSTEM SET log_parameter_max_length_on_error = 0" -c "SELECT pg_reload_conf()" >/dev/null
  psql "$DB" -qX -c "SELECT pg_stat_reset()" >/dev/null
  sleep 1
  snap "$D/stats-before.json"
  psql "$DB" -qtAX -c "SELECT 'LS1R1_RUN_BEGIN_$L'" >/dev/null
  node "$INS/ls1-e1-acceptance.mjs" "$ROOT" "http://127.0.0.1:$PORT" "$D/provision/identity.env" "$D/acceptance.json" "$L" | tee "$D/acceptance.log"
  sleep 2
  psql "$DB" -qtAX -c "SELECT 'LS1R1_RUN_END_$L'" >/dev/null
  snap "$D/stats-after.json"
  psql "$ADMIN" -qX -c "ALTER SYSTEM RESET log_statement" -c "ALTER SYSTEM RESET log_parameter_max_length" \
    -c "ALTER SYSTEM RESET log_parameter_max_length_on_error" -c "SELECT pg_reload_conf()" >/dev/null
  RUNLOG=/tmp/ls0-e1-pg/run-ls1r1-$L.statements.log
  awk "/LS1R1_RUN_BEGIN_$L/{f=1} f{print} /LS1R1_RUN_END_$L/{f=0}" "$PGLOG" > "$RUNLOG"
  grep -E ' ERROR: ' "$RUNLOG" | sed -E 's/^.* ERROR: +//' | sort | uniq -c | sort -rn > "$D/pg-errors-during-run.txt" || true
  psql "$DB" -qtAX -c "SELECT json_build_object(
    'tables', (SELECT json_agg(table_name) FROM information_schema.tables WHERE table_schema='public'),
    'columns', (SELECT json_agg(table_name || '.' || column_name) FROM information_schema.columns WHERE table_schema='public'),
    'functions', (SELECT json_agg(DISTINCT p.proname) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'))" > "$D/e1-objects.json"
  psql "$DB" -qtAX -c "SELECT coalesce(json_agg(json_build_object('table', c.relname, 'trigger', t.tgname, 'function', p.proname)), '[]')
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace n ON n.oid = c.relnamespace WHERE NOT t.tgisinternal AND n.nspname = 'public'" > "$D/triggers.json"
  node "$LS0/ls0-e1-schema-manifest.mjs" "$ROOT" "$D/provision/migrations" "$D/stats-before.json" "$D/stats-after.json" "$D/triggers.json" "$D/schema-manifest.json" "$D/e1-objects.json" "$RUNLOG" | tee "$D/schema-manifest.log"

  if [ -n "$WITH_MUTANTS" ]; then
    ready "$D/mutant-server.log"
    node "$INS/ls1-e1-mutants.mjs" "$ROOT" "$MUT" "http://127.0.0.1:$MPORT" "$D/provision/identity.env" "$INS/ls1-mutants.json" "$INS/ls1-e1-acceptance.mjs" "$D/mutants" | tee "$D/mutants.log"
  fi
)

config C0-all-off      none with-mutants
config C1-editorial-on WRITERS_STUDIO_EDITORIAL_ENABLED=1
config C2-focus-on     WRITERS_STUDIO_FOCUS_ENABLED=1
config C3-discuss-on   WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1
config C4-standing-on  WS_STANDING_ENABLED=1
config C5-all-on       WRITERS_STUDIO_EDITORIAL_ENABLED=1,WRITERS_STUDIO_FOCUS_ENABLED=1,WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1,WS_STANDING_ENABLED=1

bash "$LS0/ls0-e1-integrity.sh" "$ROOT" "$OUT/integrity-after.txt"
bash "$LS0/ls0-e1-integrity.sh" "$MUT" "$OUT/mutant-integrity-after.txt"
