#!/usr/bin/env bash
# R20-R2 isolated PostgreSQL migration and transaction rehearsal.
# Never connects to live DB, backups or NAS.
set -Eeuo pipefail
umask 077
IMAGE=pgvector/pgvector:pg16
DB=r20_r2_synthetic
NAME="r20-r2-synthetic-$(date -u +%H%M%S)-$$"
test "$#" -eq 1 || { echo 'REFUSAL: supply migration path'; exit 1; }
MIGRATION="$1"
[ -r "$MIGRATION" ] || { echo 'REFUSAL: synthetic migration unavailable'; exit 1; }
[ "$DB" = r20_r2_synthetic ] || exit 1
[[ "$NAME" == r20-r2-synthetic-* ]] || exit 1
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --network none --name "$NAME" --memory=512m \
  --tmpfs /var/lib/postgresql/data:rw,size=256m \
  -e POSTGRES_USER=soullab -e POSTGRES_DB="$DB" \
  -e POSTGRES_HOST_AUTH_METHOD=trust "$IMAGE" >/dev/null
for attempt in $(seq 1 40); do
  docker exec "$NAME" pg_isready -q -U soullab -d "$DB" >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$NAME" pg_isready -q -U soullab -d "$DB"

docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" >/dev/null <<'SQL'
CREATE TABLE deletion_manifests (
 id uuid PRIMARY KEY, reason_class text NOT NULL, incident_ref text,
 authorized_by text NOT NULL, executed_at timestamptz,
 created_at timestamptz DEFAULT now(), note text
);
CREATE TABLE provenance_tombstones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 manifest_id uuid NOT NULL REFERENCES deletion_manifests(id),
 object_kind text NOT NULL, object_id text NOT NULL,
 UNIQUE (object_kind,object_id)
);
CREATE TABLE member_manuscripts (
 id uuid PRIMARY KEY, member_id uuid NOT NULL, body text NOT NULL
);
CREATE TABLE manuscript_sections (
 id uuid PRIMARY KEY, manuscript_id uuid NOT NULL
 REFERENCES member_manuscripts(id) ON DELETE CASCADE, body text NOT NULL
);
INSERT INTO member_manuscripts VALUES
 ('f0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000099','SYNTHETIC abandoned work'),
 ('f0000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000099','SYNTHETIC rollback control');
INSERT INTO manuscript_sections VALUES
 ('e0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','SYNTHETIC dependent');
SQL

echo 'APPLYING CANDIDATE MIGRATION TO ISOLATED TEMPORARY DATABASE'
docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" < "$MIGRATION" >/dev/null

docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" >/dev/null <<'SQL'
BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('r20:deletion-authority',0));
DELETE FROM member_manuscripts
 WHERE id='f0000000-0000-4000-8000-000000000001';
INSERT INTO deletion_manifests
 (id, reason_class, incident_ref, authorized_by, executed_at, note)
 VALUES ('e0000000-0000-4000-8000-000000000002','member_deletion','WS-DELETE-01','authenticated-member-act',now(),'synthetic only');
INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id)
 VALUES ('e0000000-0000-4000-8000-000000000002','member_manuscripts','f0000000-0000-4000-8000-000000000001');
INSERT INTO r20_deletion_authority_outbox (manifest_id,subject_kind)
 VALUES ('e0000000-0000-4000-8000-000000000002','member_manuscripts');
COMMIT;
SQL
COUNT_SQL="SELECT (SELECT count(*) FROM member_manuscripts WHERE id='f0000000-0000-4000-8000-000000000001'),
 (SELECT count(*) FROM manuscript_sections),
 (SELECT count(*) FROM provenance_tombstones),
 (SELECT count(*) FROM r20_deletion_authority_outbox);"
COUNT="$(docker exec "$NAME" psql -X -tA -F ',' -U soullab -d "$DB" -c "$COUNT_SQL")"
[ "$COUNT" = '0,0,1,1' ] || { echo "FAIL: unexpected commit counts $COUNT"; exit 1; }
echo 'PASS: atomic deletion + dependent-row cascade + tombstone + outbox: 0,0,1,1'

if docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" \
  -c "UPDATE r20_deletion_authority_outbox SET subject_kind='member_manuscripts';" >/dev/null 2>&1; then
  echo 'FAIL: outbox allowed UPDATE'; exit 1
fi
if docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" \
  -c 'DELETE FROM r20_deletion_authority_outbox;' >/dev/null 2>&1; then
  echo 'FAIL: outbox allowed DELETE'; exit 1
fi
echo 'PASS: ordinary outbox UPDATE/DELETE operations refused'

if docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d "$DB" >/dev/null 2>&1 <<'SQL'
BEGIN;
DELETE FROM member_manuscripts WHERE id='f0000000-0000-4000-8000-000000000002';
INSERT INTO r20_deletion_authority_outbox(manifest_id,subject_kind)
 VALUES ('e0000000-0000-4000-8000-000000000002','member_manuscripts');
COMMIT;
SQL
then
  echo 'FAIL: failed outbox transaction unexpectedly committed'; exit 1
fi
SURVIVOR="$(docker exec "$NAME" psql -X -tA -U soullab -d "$DB" \
  -c "SELECT count(*) FROM member_manuscripts WHERE id='f0000000-0000-4000-8000-000000000002'")"
[ "$SURVIVOR" = 1 ] || { echo 'FAIL: failed authority transaction destroyed unrelated Work'; exit 1; }
echo 'PASS: failure rolls back member Work deletion (synthetic survivor count 1)'
echo 'PASS: temporary database and all test records will be destroyed on exit'
