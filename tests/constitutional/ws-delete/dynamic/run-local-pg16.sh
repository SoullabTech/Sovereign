#!/usr/bin/env bash
# Runs the WS-DELETE-01 R-SHARED physical probes against a LOCAL PostgreSQL 16 cluster provisioned just for this run.
# Fictional data only; loopback only; no AWS, no network.
#
# Two ways to run it:
#   1. Container-class host with the postgres server binaries and no docker (run as root; the server must start as the
#      'postgres' OS user): just run this script.
#   2. Developer machine (the Mac Studio): provision a disposable LOOPBACK database yourself, apply the stub schema and the four
#      migrations below, then run the jest line at the bottom with DATABASE_URL set. The probe refuses a non-loopback database.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OUT="${WS_DELETE_OUT:-$(mktemp -d /tmp/ws-delete-out-XXXXXX)}"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
D=$(mktemp -d /tmp/wsdelpg16-XXXXXX); chown postgres:postgres "$D"; chmod 700 "$D"
SOCK=$(mktemp -d /tmp/wsdelpgsock-XXXXXX); chown postgres:postgres "$SOCK"
VAULT=$(mktemp -d /tmp/ws-delete-fictional-vault-XXXXXX); chmod 700 "$VAULT"
PORT=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")
cleanup(){ su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$D" "$SOCK" "$VAULT"; }
trap cleanup EXIT
su postgres -s /bin/bash -c "$PGBIN/initdb -D $D -A trust -U fictional >/dev/null"
su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -o '-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCK' -w -l $D/log start >/dev/null"
PSQL="psql -X -v ON_ERROR_STOP=1 -q -h 127.0.0.1 -p $PORT -U fictional"
$PSQL -d postgres -c "CREATE DATABASE ws_delete_fictional" >/dev/null
# The witness script's own stub schema (first heredoc), extracted verbatim, then the real migrations the delete path touches.
awk "/<<'SQL'/{f=1;next} /^SQL\$/{if(f){exit}} f" "$ROOT/scripts/witness/ws-encrypted-source-pg16.sh" | $PSQL -d ws_delete_fictional >/dev/null
for m in 20260824000001_manuscript_source_custody 20260907000001_vault_erasure_queue 20261026000001_writer_source_encrypted_landing 20260907000004_living_work_visual; do
  $PSQL -d ws_delete_fictional -f "$ROOT/database/migrations/$m.sql" >/dev/null
done
echo "schema ready on loopback:$PORT ; results -> $OUT"
cd "$ROOT"
# Never let this run reach AWS or the network: drop ambient credentials/proxy.
for v in $(env | grep -i -E '^(AWS_|HTTPS?_PROXY=|ALL_PROXY=|NODE_USE_ENV_PROXY=)' | sed 's/=.*//'); do unset "$v"; done
set +e
NO_PROXY='*' DATABASE_URL="postgresql://fictional@127.0.0.1:${PORT}/ws_delete_fictional" \
FILE_STORAGE_PATH="$VAULT" NODE_ENV=test WS_DELETE_DYNAMIC=fictional-only \
./node_modules/.bin/jest --config jest.config.js --ci --runInBand --verbose --coverage=false \
  tests/constitutional/ws-delete/dynamic/sharedWriting.probe.test.ts > "$OUT/jest.log" 2>&1
RC=$?
echo "jest exit=$RC ; log=$OUT/jest.log"
exit $RC
