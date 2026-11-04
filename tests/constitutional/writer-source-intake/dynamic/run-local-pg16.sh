#!/usr/bin/env bash
# Runs the dynamic observation probes against a LOCAL PostgreSQL 16 cluster provisioned just for this run.
# For container-class hosts that have the postgres server binaries but no docker daemon (run as root: the server
# must be started as the 'postgres' OS user). On a developer machine with docker, provision a disposable loopback
# database yourself and run the jest line at the bottom with DATABASE_URL set.
# Fictional data only. The vault directory name is required by the suite's own safety guard.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SUITE="$ROOT/tests/constitutional/writer-source-intake"
OUT="${WS_DYNAMIC_OUT:-$(mktemp -d /tmp/ws-dynamic-out-XXXXXX)}"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
D=$(mktemp -d /tmp/wspg16-XXXXXX); chown postgres:postgres "$D"; chmod 700 "$D"
SOCK=$(mktemp -d /tmp/wspgsock-XXXXXX); chown postgres:postgres "$SOCK"
VAULT=$(mktemp -d /tmp/ws-encrypted-source-fictional-XXXXXX); chmod 700 "$VAULT"
FIX=$(mktemp -d /tmp/ws-fixtures-XXXXXX); chmod 700 "$FIX"
PORT=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")
cleanup(){ su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$D" "$SOCK" "$VAULT" "$FIX"; }
trap cleanup EXIT
su postgres -s /bin/bash -c "$PGBIN/initdb -D $D -A trust -U fictional >/dev/null"
su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -o '-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCK' -w -l $D/log start >/dev/null"
PSQL="psql -X -v ON_ERROR_STOP=1 -q -h 127.0.0.1 -p $PORT -U fictional"
$PSQL -d postgres -c "CREATE DATABASE ws_source_fictional" >/dev/null
# The witness script's own stub schema (first heredoc), extracted verbatim, then the three real migrations in its order.
awk "/<<'SQL'/{f=1;next} /^SQL\$/{if(f){exit}} f" "$ROOT/scripts/witness/ws-encrypted-source-pg16.sh" | $PSQL -d ws_source_fictional >/dev/null
for m in 20260824000001_manuscript_source_custody 20260907000001_vault_erasure_queue 20261026000001_writer_source_encrypted_landing; do
  $PSQL -d ws_source_fictional -f "$ROOT/database/migrations/$m.sql" >/dev/null 2>&1
done
node "$SUITE/dynamic/gen-fixtures.mjs" "$FIX"
echo "schema ready on loopback:$PORT ; results -> $OUT"
cd "$ROOT"
# Never let this run reach AWS: drop ambient credentials/proxy, point the SDK at a dead loopback port.
for v in $(env | grep -i -E '^(AWS_|HTTPS?_PROXY=|ALL_PROXY=|NODE_USE_ENV_PROXY=)' | sed 's/=.*//'); do unset "$v"; done
set +e
AWS_ACCESS_KEY_ID=fictional-not-a-credential AWS_SECRET_ACCESS_KEY=fictional-not-a-credential \
AWS_ENDPOINT_URL=http://127.0.0.1:9 AWS_ENDPOINT_URL_KMS=http://127.0.0.1:9 NO_PROXY='*' \
DATABASE_URL="postgresql://fictional@127.0.0.1:${PORT}/ws_source_fictional" \
FILE_STORAGE_PATH="$VAULT" NODE_ENV=test WS_SOURCE_INTAKE_DYNAMIC=fictional-only \
WS_FIXTURE_DIR="$FIX" WS_OBSERVATIONS_OUT="$OUT/observations.json" \
./node_modules/.bin/jest --config jest.config.js --ci --runInBand --verbose --coverage=false \
  tests/constitutional/writer-source-intake/dynamic/observations.test.ts > "$OUT/jest.log" 2>&1
RC=$?
# PDFs cannot parse inside jest's sandbox; check them with tsx against the same manifest.
NODE_ENV=test ./node_modules/.bin/tsx "$SUITE/dynamic/parse-pdf-fixtures.mts" "$FIX" "$OUT/pdf-parse.json" >> "$OUT/jest.log" 2>&1
PDFRC=$?
if [ "$RC" -eq 0 ] && [ "$PDFRC" -ne 0 ]; then RC=$PDFRC; fi
echo "pdf check exit=$PDFRC"
echo "jest exit=$RC ; log=$OUT/jest.log ; observations=$OUT/observations.json"
exit $RC
