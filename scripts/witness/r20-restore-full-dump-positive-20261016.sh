#!/bin/bash
set -euo pipefail
umask 077
NAME='soullab-mail-r20-full-failclosed-test'
IMAGE='pgvector/pgvector@sha256:7d400e340efb42f4d8c9c12c6427adb253f726881a9985d2a471bf0eed824dff'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESTORE="$ROOT/scripts/restore-governed.sh"
if docker ps -a --format '{{.Names}}' | grep -Fxq "$NAME"; then echo 'BLOCK: container name in use'; exit 2; fi
cleanup(){ docker rm -f "$NAME" >/dev/null 2>&1 || true; echo 'fictional_full_snapshot_container_removed=YES'; }
trap cleanup EXIT
echo 'Starting network-disabled production-matched PostgreSQL16 synthetic full-SQL restore test'
docker run -d --rm --name "$NAME" --network none --cpus 1 --memory 900m --tmpfs /var/lib/postgresql/data:rw,size=256m \
 -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=soullab -e POSTGRES_INITDB_ARGS='--locale=en_US.utf8 --encoding=UTF8' \
 -v "$RESTORE:/proof/restore-governed.sh:ro" "$IMAGE" >/dev/null
ready=0
for i in $(seq 1 80); do
 if docker logs "$NAME" 2>&1 | grep -Fq 'PostgreSQL init process complete; ready for start up.' && \
    test "$(docker exec "$NAME" psql -X -U soullab -d soullab -At -c 'SELECT 1' 2>/dev/null)" = 1; then ready=1; break; fi
 sleep 0.3
done
test "$ready" = 1 || { echo 'BLOCK: synthetic PG16 did not start'; exit 1; }
docker exec "$NAME" createdb -U soullab fictional_source
docker exec "$NAME" createdb -U soullab fictional_restore
docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d fictional_source -q <<'SQL'
CREATE TABLE members(id uuid PRIMARY KEY, only_synthetic text NOT NULL);
CREATE TABLE synthetic_sessions(id uuid PRIMARY KEY, session_id text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE deletion_manifests(id uuid PRIMARY KEY, reason_class text NOT NULL, authorized_by text NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE deletion_manifest_scopes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), manifest_id uuid REFERENCES deletion_manifests(id), table_name text NOT NULL, session_id text, member_id text, window_start timestamptz, window_end timestamptz);
CREATE TABLE provenance_tombstones(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),manifest_id uuid REFERENCES deletion_manifests(id),object_kind text,object_id text,tombstoned_at timestamptz DEFAULT now(),UNIQUE(object_kind,object_id));
INSERT INTO members VALUES ('11111111-1111-4111-8111-111111111111','fictional-erased'),('22222222-2222-4222-8222-222222222222','fictional-kept');
INSERT INTO synthetic_sessions VALUES ('33333333-3333-4333-8333-333333333333','fictional-erased-session',now()),('44444444-4444-4444-8444-444444444444','fictional-kept-session',now());
INSERT INTO deletion_manifests VALUES ('55555555-5555-4555-8555-555555555555','member_deletion','fictional-operator',now());
INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id) VALUES ('55555555-5555-4555-8555-555555555555','members','11111111-1111-4111-8111-111111111111');
INSERT INTO deletion_manifest_scopes(manifest_id,table_name,session_id) VALUES ('55555555-5555-4555-8555-555555555555','synthetic_sessions','fictional-erased-session');
SQL
docker exec "$NAME" sh -c 'pg_dump -U soullab -d fictional_source -f /tmp/fictional_full_dump.sql'
docker exec "$NAME" sh -c 'gzip -c /tmp/fictional_full_dump.sql > /tmp/fictional_full_dump.sql.gz'
echo 'synthetic_full_schema_and_data_snapshot_created=YES'
docker exec -e RESTORE_DB_URL='postgresql:///fictional_restore?user=soullab' \
 -e RESTORE_AUTHORIZED_BY='FICTIONAL-R20-FULL-DUMP-NO-PROD' \
 "$NAME" bash /proof/restore-governed.sh /tmp/fictional_full_dump.sql.gz
counts=$(docker exec "$NAME" psql -X -At -v ON_ERROR_STOP=1 -U soullab -d fictional_restore -c "SELECT
 (SELECT count(*) FROM members WHERE id='11111111-1111-4111-8111-111111111111') || ',' ||
 (SELECT count(*) FROM members WHERE id='22222222-2222-4222-8222-222222222222') || ',' ||
 (SELECT count(*) FROM synthetic_sessions WHERE session_id='fictional-erased-session') || ',' ||
 (SELECT count(*) FROM synthetic_sessions WHERE session_id='fictional-kept-session') || ',' ||
 (SELECT count(*) FROM deletion_manifests) || ',' ||
 (SELECT count(*) FROM deletion_manifest_scopes) || ',' ||
 (SELECT count(*) FROM provenance_tombstones)")
test "$counts" = '0,1,0,1,1,1,1' || { echo "R20_FICTIONAL_FULL_SNAPSHOT=FAIL count-pattern=$counts"; exit 1; }
echo 'R20_FICTIONAL_FULL_SNAPSHOT=PASS exact_pg16_16_13_pgvector_0_8_2'
echo 'erased_objects_stay_erased=2 unaffected_objects_survive=2 governance_markers_preserved=3'
echo 'dump_form=full_pg_dump_plain_SQL_gzip no_production_data=no_network'
