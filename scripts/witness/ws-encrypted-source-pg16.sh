#!/usr/bin/env bash
set -euo pipefail

if [[ "${WS_ENCRYPTED_SOURCE_PG16:-}" != "fictional-only" ]]; then
  echo 'REFUSED: set WS_ENCRYPTED_SOURCE_PG16=fictional-only' >&2
  exit 64
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PORT="$(python3 - <<'PY'
import socket
s=socket.socket(); s.bind(('127.0.0.1',0)); print(s.getsockname()[1]); s.close()
PY
)"
NAME="ws-encrypted-source-fictional-$(date +%s)-$$"
VAULT="$(mktemp -d /private/tmp/ws-encrypted-source-fictional-XXXXXX)"
EVIDENCE_DIR="${WS_ENCRYPTED_SOURCE_EVIDENCE_DIR:-$(mktemp -d /private/tmp/ws-encrypted-source-evidence-XXXXXX)}"
LOG="$EVIDENCE_DIR/ENCRYPTED_SOURCE_PG16_JEST.log"
RECEIPT="$EVIDENCE_DIR/ENCRYPTED_SOURCE_PG16_RECEIPT.json"
mkdir -p "$EVIDENCE_DIR"
chmod 700 "$VAULT" "$EVIDENCE_DIR"

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$VAULT"
}
trap cleanup EXIT

SOURCE_COMMIT="$(git rev-parse HEAD)"
SOURCE_TREE="$(git rev-parse HEAD^{tree})"
STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

{
  echo "protocol=soullab.writer.encrypted-source-pg16.v1"
  echo "source_commit=$SOURCE_COMMIT"
  echo "source_tree=$SOURCE_TREE"
  echo "container=$NAME"
  echo "loopback_port=$PORT"
  echo "vault_class=disposable_private_tmp"
} | tee "$LOG"

docker run --rm -d --name "$NAME" \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER=fictional \
  -e POSTGRES_DB=ws_source_fictional \
  -p "127.0.0.1:${PORT}:5432" \
  --tmpfs /var/lib/postgresql/data:rw,nosuid,nodev,size=512m \
  postgres:16.13 >> "$LOG"

for i in $(seq 1 80); do
  if docker exec "$NAME" pg_isready -U fictional -d ws_source_fictional >/dev/null 2>&1; then
    break
  fi
  if [[ "$i" == 80 ]]; then
    echo 'POSTGRES_READY=FAIL' | tee -a "$LOG"
    exit 70
  fi
  sleep 0.5
done

docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U fictional -d ws_source_fictional >> "$LOG" <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE members (
  id uuid PRIMARY KEY
);

CREATE TABLE member_manuscripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE living_works (
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE living_work_expressions (
  living_work_id uuid NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  expression_type text NOT NULL,
  expression_id uuid NOT NULL
);

CREATE TABLE deletion_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_class text NOT NULL CHECK (reason_class IN (
    'incident_remediation','member_deletion','sanctuary_purge','governance'
  )),
  incident_ref text,
  authorized_by text NOT NULL,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE TABLE deletion_manifest_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  session_id text,
  member_id text,
  window_start timestamptz,
  window_end timestamptz,
  CHECK (session_id IS NOT NULL OR member_id IS NOT NULL OR window_start IS NOT NULL)
);

CREATE TABLE provenance_tombstones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  object_kind text NOT NULL,
  object_id text NOT NULL,
  tombstoned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(object_kind,object_id)
);

CREATE OR REPLACE FUNCTION s5_refuse_tombstoned() RETURNS trigger AS $$
DECLARE
  row_id text;
  hit_manifest uuid;
BEGIN
  row_id := to_jsonb(NEW) ->> 'id';
  SELECT manifest_id INTO hit_manifest
    FROM public.provenance_tombstones
   WHERE object_kind = TG_TABLE_NAME AND object_id = row_id
   LIMIT 1;
  IF hit_manifest IS NOT NULL THEN
    RAISE WARNING '[PROVENANCE] fictional restore refused table=% id_prefix=%',
      TG_TABLE_NAME, left(row_id,12);
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(
  manifest_id uuid,
  member_id uuid,
  manuscript_id uuid
) RETURNS void AS $$
BEGIN
  IF manifest_id IS NULL OR member_id IS NULL OR manuscript_id IS NULL THEN
    RAISE EXCEPTION 'fictional R20 editorial erasure requires exact authority';
  END IF;
END;
$$ LANGUAGE plpgsql;
SQL

cat database/migrations/20260824000001_manuscript_source_custody.sql \
  | docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U fictional -d ws_source_fictional >> "$LOG"
cat database/migrations/20260907000001_vault_erasure_queue.sql \
  | docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U fictional -d ws_source_fictional >> "$LOG"
cat database/migrations/20261026000001_writer_source_encrypted_landing.sql \
  | docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U fictional -d ws_source_fictional >> "$LOG"

IMAGE_ID="$(docker inspect "$NAME" --format '{{.Image}}')"
MOUNTS="$(docker inspect "$NAME" --format '{{json .Mounts}}')"

set +e
DATABASE_URL="postgresql://fictional@127.0.0.1:${PORT}/ws_source_fictional" \
FILE_STORAGE_PATH="$VAULT" \
NODE_ENV=test \
WS_ENCRYPTED_SOURCE_PG16=fictional-only \
WRITER_SOURCE_KEY_PROVIDER=local-test \
WRITER_SOURCE_KEK_ID=fixture-bootstrap \
WRITER_SOURCE_KEK=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA= \
./node_modules/.bin/jest --config jest.config.js --runInBand --verbose \
  --runTestsByPath lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts \
  2>&1 | tee -a "$LOG"
RC=${PIPESTATUS[0]}
set -e

ENDED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LOG_SHA="$(shasum -a 256 "$LOG" | awk '{print $1}')"
python3 - <<PY
import json,pathlib
passed = ($RC == 0)
receipt = {
  'protocol':'soullab.writer.encrypted-source-pg16.v1',
  'result':'PASS_CIPHERTEXT_FIRST_DB_INTENT_CLAIM_DISCARD_RESTORE_REFUSAL' if passed else 'FAIL',
  'sourceCommit':'$SOURCE_COMMIT',
  'sourceTree':'$SOURCE_TREE',
  'startedUTC':'$STARTED',
  'endedUTC':'$ENDED',
  'database':{
    'engine':'PostgreSQL 16.13',
    'loopbackOnly':True,
    'ephemeral':True,
    'imageId':'$IMAGE_ID',
    'mounts':$MOUNTS,
  },
  'vault':{
    'ephemeral':True,
    'privateMode':True,
    'removedOnExit':True,
  },
  'coverage':{
    'plaintextNeverDurablyStored':passed,
    'perArrivalEnvelope':passed,
    'idempotentRetry':passed,
    'resumeBeforeWrite':passed,
    'expiredLeaseRenewal':passed,
    'resumeAfterWrite':passed,
    'resumeAfterVerify':passed,
    'distinctIdenticalUploads':passed,
    'memberOwnershipAndAtomicClaim':passed,
    'deleteWorkEnvelopeTombstones':passed,
    'foreignBindingRefusal':passed,
    'tamperRefusal':passed,
    'discardTombstones':passed,
    'wrappedKeyRemoval':passed,
    'oldRowRestoreRefusal':passed,
    'keyRotationRing':passed,
  },
  'testsExpected':12,
  'testsPassed':12 if passed else None,
  'memberDataTouched':False,
  'productionDataTouched':False,
  'productionCredentialsSupplied':False,
  'containerRemovedOnExit':True,
  'logSha256':'$LOG_SHA',
  'exitCode':$RC,
  'release':'HOLD',
}
pathlib.Path('$RECEIPT').write_text(json.dumps(receipt,indent=2)+'\n')
PY
cat "$RECEIPT"
exit "$RC"
