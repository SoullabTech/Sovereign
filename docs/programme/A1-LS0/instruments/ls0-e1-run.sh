#!/usr/bin/env bash
# A1-LS0 · one flag configuration, end to end:
#   fresh synthetic DB (provision) → loopback provider stub → canonical dev
#   server under env -i with the given flags → activity snapshot → S1–S9
#   witness → activity snapshot → schema/dependency manifest → stop server+stub.
# Usage: ls0-e1-run.sh <instruments_dir> <canonical_root> <out_dir> <config_label> <flag-config|none>
set -euo pipefail
INS="$1"; ROOT="$2"; OUT="$3"; LABEL="$4"; FLAGS="$5"
PORT=3210; STUB=3299
DB="postgresql://soullab@127.0.0.1:55432/maia_consciousness"
ADMIN="postgresql://postgres@127.0.0.1:55432/postgres"
mkdir -p "$OUT"
echo "$LABEL" > "$OUT/config.label"; echo "$FLAGS" > "$OUT/config.flags"

psql "$ADMIN" -qX -c "ALTER SYSTEM SET track_functions = 'all'" -c "SELECT pg_reload_conf()" >/dev/null

bash "$INS/ls0-e1-provision.sh" "$ROOT" "$OUT/provision" > "$OUT/provision.log" 2>&1

node "$INS/ls0-e1-provider-stub.mjs" "$STUB" "$OUT/stub.log" & STUB_PID=$!
setsid bash "$INS/ls0-e1-server.sh" "$ROOT" "$PORT" "$STUB" "$OUT/server.log" "$FLAGS" & SRV_PID=$!
cleanup() { kill -- -"$SRV_PID" 2>/dev/null || kill "$SRV_PID" 2>/dev/null || true; kill "$STUB_PID" 2>/dev/null || true; }
trap cleanup EXIT
for i in $(seq 1 120); do grep -q 'Ready in' "$OUT/server.log" 2>/dev/null && break; sleep 1; done
grep -q 'Ready in' "$OUT/server.log"

snap() {
  psql "$DB" -qtAX -c "SELECT json_build_object(
    'tables', (SELECT coalesce(json_agg(json_build_object('relname', relname, 'seq_scan', seq_scan, 'idx_scan', coalesce(idx_scan,0), 'n_tup_ins', n_tup_ins, 'n_tup_upd', n_tup_upd, 'n_tup_del', n_tup_del)), '[]') FROM pg_stat_user_tables),
    'functions', (SELECT coalesce(json_agg(json_build_object('funcname', funcname, 'calls', calls)), '[]') FROM pg_stat_user_functions))" > "$1"
}
# Statement text only: bind parameters are never logged, so no synthetic text
# enters the server log. The log stays inside E1 and is deleted at teardown;
# evidence carries only facts derived from it.
PGLOG=/tmp/ls0-e1-pg/server.log
psql "$ADMIN" -qX -c "ALTER SYSTEM SET log_statement = 'all'" -c "ALTER SYSTEM SET log_parameter_max_length = 0" \
  -c "ALTER SYSTEM SET log_parameter_max_length_on_error = 0" -c "SELECT pg_reload_conf()" >/dev/null
psql "$DB" -qX -c "SELECT pg_stat_reset()" >/dev/null
sleep 1
snap "$OUT/stats-before.json"
psql "$DB" -qtAX -c "SELECT 'LS0_RUN_BEGIN_$LABEL'" >/dev/null
node "$INS/ls0-e1-witness.mjs" "$ROOT" "http://127.0.0.1:$PORT" "$OUT/provision/identity.env" "$OUT/stub.log" "$OUT/results.json" "$LABEL" | tee "$OUT/witness.log"
sleep 2
psql "$DB" -qtAX -c "SELECT 'LS0_RUN_END_$LABEL'" >/dev/null
snap "$OUT/stats-after.json"
psql "$ADMIN" -qX -c "ALTER SYSTEM RESET log_statement" -c "ALTER SYSTEM RESET log_parameter_max_length" \
  -c "ALTER SYSTEM RESET log_parameter_max_length_on_error" -c "SELECT pg_reload_conf()" >/dev/null
RUNLOG=/tmp/ls0-e1-pg/run-$LABEL.statements.log
awk "/LS0_RUN_BEGIN_$LABEL/{f=1} f{print} /LS0_RUN_END_$LABEL/{f=0}" "$PGLOG" > "$RUNLOG"
grep -E ' ERROR: ' "$RUNLOG" | sed -E 's/^.* ERROR: +//' | sort | uniq -c | sort -rn > "$OUT/pg-errors-during-run.txt" || true
psql "$DB" -qtAX -c "SELECT json_build_object(
  'tables', (SELECT json_agg(table_name) FROM information_schema.tables WHERE table_schema='public'),
  'columns', (SELECT json_agg(table_name || '.' || column_name) FROM information_schema.columns WHERE table_schema='public'),
  'functions', (SELECT json_agg(DISTINCT p.proname) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'))" > "$OUT/e1-objects.json"
psql "$DB" -qtAX -c "SELECT coalesce(json_agg(json_build_object('table', c.relname, 'trigger', t.tgname, 'function', p.proname)), '[]')
  FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_namespace n ON n.oid = c.relnamespace WHERE NOT t.tgisinternal AND n.nspname = 'public'" > "$OUT/triggers.json"
node "$INS/ls0-e1-schema-manifest.mjs" "$ROOT" "$OUT/provision/migrations" "$OUT/stats-before.json" "$OUT/stats-after.json" "$OUT/triggers.json" "$OUT/schema-manifest.json" "$OUT/e1-objects.json" "$RUNLOG" | tee "$OUT/schema-manifest.log"
