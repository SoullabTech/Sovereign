#!/usr/bin/env bash
# Runs the WS-DELETE-01 "retained editorial threads after Remove" probe (retainedEditorial.probe.test.ts) against a LOCAL
# PostgreSQL 16 cluster provisioned just for this run. Fictional data only; loopback only; no AWS, no network.
#
# Why a separate runner and not run-local-pg16.sh: the editorial paths read columns the delete harness's stub schema does not
# have (living_work_expressions.id / declared_by, the editorial relationship, the proposal chain and the thread-origin tables).
# This runner keeps the stub for the governance tables (deletion manifests, tombstones; the R20 stub function is replaced by the real one, below) and replaces the two
# living-work stub tables with the REAL DDL, then applies the real editorial migrations in dependency order. It does not touch
# run-local-pg16.sh, so the two cannot disturb each other.
#
# Needs a container-class host with the postgres server binaries (run as root; the server must start as the 'postgres' OS user).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OUT="${WS_DELETE_OUT:-$(mktemp -d /tmp/ws-delete-retained-out-XXXXXX)}"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
D=$(mktemp -d /tmp/wsdelretpg16-XXXXXX); chown postgres:postgres "$D"; chmod 700 "$D"
SOCK=$(mktemp -d /tmp/wsdelretpgsock-XXXXXX); chown postgres:postgres "$SOCK"
VAULT=$(mktemp -d /tmp/ws-delete-retained-fictional-vault-XXXXXX); chmod 700 "$VAULT"
PORT=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")
cleanup(){ su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$D" "$SOCK" "$VAULT"; }
trap cleanup EXIT
su postgres -s /bin/bash -c "$PGBIN/initdb -D $D -A trust -U fictional >/dev/null"
su postgres -s /bin/bash -c "$PGBIN/pg_ctl -D $D -o '-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCK' -w -l $D/log start >/dev/null"
PSQL="psql -X -v ON_ERROR_STOP=1 -q -h 127.0.0.1 -p $PORT -U fictional"
$PSQL -d postgres -c "CREATE DATABASE ws_delete_fictional" >/dev/null
# The delete harness's stub schema (first heredoc of the witness script), verbatim.
awk "/<<'SQL'/{f=1;next} /^SQL\$/{if(f){exit}} f" "$ROOT/scripts/witness/ws-encrypted-source-pg16.sh" | $PSQL -d ws_delete_fictional >/dev/null
# Replace the two stub living-work tables with the real DDL (nothing references them yet, so the drop is clean).
$PSQL -d ws_delete_fictional -c "DROP TABLE living_work_expressions; DROP TABLE living_works" >/dev/null
# Likewise the stub of the R20 editorial-history erase function (it returns void and does nothing): the real one is applied below,
# because the writing's Delete is the only way a member can remove retained editorial history today and the probe must exercise it.
$PSQL -d ws_delete_fictional -c "DROP FUNCTION r20_erase_writer_editorial_history(uuid, uuid, uuid)" >/dev/null
# Real migrations, in the dependency order established on PostgreSQL 16 (each applies with ON_ERROR_STOP, so a missing
# predecessor fails loudly here rather than as a confusing probe failure).
MIGRATIONS=(
  20260801000001_living_works
  20260721000003_press_manuscript_room
  20260824000001_manuscript_source_custody
  20260907000001_vault_erasure_queue
  20261026000001_writer_source_encrypted_landing
  20260907000004_living_work_visual
  20260727000001_manuscript_working_drafts
  20260731000001_draft_concurrency
  20260830000001_manuscript_draft_sections
  20260830000002_manuscript_structure
  20260901000001_ask_threads
  20260902000002_working_draft_revision_partition
  20260914000001_proposal_succession
  20260914000002_manuscript_revision_offers
  20260914000003_proposal_chains_member_identity
  20260914000004_manuscript_revision_authorizations
  20260914000005_editorial_ontology
  20260915000001_ask_threads_subject_preparation
  20260915000002_editorial_turn_bindings
  20260918000006_editorial_application_recovery
  20260925000005_writer_editorial_relationship_custody
  20260925000006_writer_editorial_scope_identity_successor
  20260926000004_writer_studio_return_state
  20260929000003_ask_threads_living_work_subject
  20261020000001_writer_editorial_thread_origins
  20261021000001_writer_r20_restore_refusal
  20261021000002_writer_r20_editorial_erasure
  20261025000001_r20_writer_editorial_constitutional_erasure
)
for m in "${MIGRATIONS[@]}"; do
  $PSQL -d ws_delete_fictional -f "$ROOT/database/migrations/$m.sql" >/dev/null 2>"$OUT/migration-$m.err" || { echo "migration $m FAILED:"; head -5 "$OUT/migration-$m.err"; exit 2; }
done
echo "schema ready on loopback:$PORT ; ${#MIGRATIONS[@]} real migrations ; results -> $OUT"
cd "$ROOT"
# Never let this run reach AWS or the network: drop ambient credentials/proxy.
for v in $(env | grep -i -E '^(AWS_|HTTPS?_PROXY=|ALL_PROXY=|NODE_USE_ENV_PROXY=)' | sed 's/=.*//'); do unset "$v"; done
set +e
NO_PROXY='*' DATABASE_URL="postgresql://fictional@127.0.0.1:${PORT}/ws_delete_fictional" \
FILE_STORAGE_PATH="$VAULT" NODE_ENV=test WS_DELETE_DYNAMIC=fictional-only \
./node_modules/.bin/jest --config jest.config.js --ci --runInBand --verbose --coverage=false \
  tests/constitutional/ws-delete/dynamic/retainedEditorial.probe.test.ts > "$OUT/jest.log" 2>&1
RC=$?
echo "jest exit=$RC ; log=$OUT/jest.log"
exit $RC
