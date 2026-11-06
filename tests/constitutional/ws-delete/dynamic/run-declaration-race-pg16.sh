#!/usr/bin/env bash
# Runs the declaration-vs-erase interleaving probe against a LOCAL PostgreSQL 16 cluster provisioned just for this run.
# For container-class hosts that have the postgres server binaries but no docker daemon (run as root: the server must
# be started as the 'postgres' OS user). On a developer machine, provision any disposable loopback database whose name
# contains "fictional" and run the jest line at the bottom with DATABASE_URL set.
# Fictional data only. Nothing here reaches a network, a KMS, or a vault with content in it.
#
# Same shape as tests/constitutional/writer-source-intake/dynamic/run-local-pg16.sh. It is a SEPARATE script because the
# schema differs: that suite's stub flattens living_works / living_work_expressions, which is exactly what this probe
# must not do (see schema.fictional.sql).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SUITE="$ROOT/tests/constitutional/ws-delete/dynamic"
OUT="${WS_DELETE_OUT:-$(mktemp -d /tmp/ws-delete-out-XXXXXX)}"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
D=$(mktemp -d /tmp/wsdelpg16-XXXXXX); chown postgres:postgres "$D"; chmod 700 "$D"
SOCK=$(mktemp -d /tmp/wsdelpgsock-XXXXXX); chown postgres:postgres "$SOCK"
VAULT=$(mktemp -d /tmp/ws-delete-fictional-vault-XXXXXX); chmod 700 "$VAULT"
PORT=$(node -e "const s=require('net').createServer().listen(0,'127.0.0.1',()=>{console.log(s.address().port);s.close()})")
cleanup(){ su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$D" "$SOCK" "$VAULT"; }
trap cleanup EXIT
su postgres -s /bin/bash -c "$PGBIN/initdb -D $D -A trust -U fictional >/dev/null"
su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -o '-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCK' -w -l $D/log start >/dev/null"
PSQL="psql -X -v ON_ERROR_STOP=1 -q -h 127.0.0.1 -p $PORT -U fictional"
$PSQL -d postgres -c "CREATE DATABASE ws_delete_fictional" >/dev/null
$PSQL -d ws_delete_fictional -f "$SUITE/schema.fictional.sql" >/dev/null
# The REAL migrations, in dependency order. A migration that fails to apply is a failed run, not a skipped one.
# writer_source_landing_intents (20261026000001) is omitted on purpose: the erase only reads it for a manuscript that has
# source arrivals, this probe creates none, and the migration needs a tombstone-guard stub this schema does not carry.
for m in 20260801000001_living_works 20260824000001_manuscript_source_custody 20260907000001_vault_erasure_queue \
         20260907000004_living_work_visual; do
  $PSQL -d ws_delete_fictional -f "$ROOT/database/migrations/$m.sql" >/dev/null
done
echo "schema ready on loopback:$PORT ; results -> $OUT"
cd "$ROOT"
set +e
DATABASE_URL="postgresql://fictional@127.0.0.1:${PORT}/ws_delete_fictional" \
FILE_STORAGE_PATH="$VAULT" NODE_ENV=test WS_DELETE_DECLARATION_RACE=fictional-only \
WS_DELETE_OBSERVATIONS_OUT="$OUT/observations.json" \
./node_modules/.bin/jest --config jest.config.js --ci --runInBand --verbose --coverage=false \
  tests/constitutional/ws-delete/dynamic/declarationRace.probe.test.ts 2>&1 | tee "$OUT/jest.log"
RC=${PIPESTATUS[0]}
echo "jest exit=$RC ; log=$OUT/jest.log ; observations=$OUT/observations.json"
exit $RC
