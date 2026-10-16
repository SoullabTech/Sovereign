#!/usr/bin/env bash
set -euo pipefail
NAME='soullab-r20-failclosed-existing-20261016'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG='/tmp/soullab-r20-existing-governance-failclosed-20261016.log'
exec > >(tee "$LOG") 2>&1
cleanup(){ docker rm -f "$NAME" >/dev/null 2>&1 || true; echo 'r20_synthetic_container_removed=yes'; }
trap cleanup EXIT
if docker ps -a --format '{{.Names}}' | grep -Fxq "$NAME"; then echo 'STOP reserved container already exists'; exit 2; fi
docker run -d --rm --name "$NAME" --network none --memory 512m --cpus 1 --tmpfs /var/lib/postgresql/data:rw,size=256m -e POSTGRES_HOST_AUTH_METHOD=trust -v "$ROOT/scripts/restore-governed.sh:/proof/restore-governed.sh:ro" pgvector/pgvector@sha256:7d400e340efb42f4d8c9c12c6427adb253f726881a9985d2a471bf0eed824dff >/dev/null
ready=0
for i in $(seq 1 80); do
  if docker logs "$NAME" 2>&1 | grep -Fq 'PostgreSQL init process complete; ready for start up.' && test "$(docker exec "$NAME" psql -X -U postgres -d postgres -At -c 'SELECT 1' 2>/dev/null)" = 1; then ready=1; break; fi
  sleep 0.5
done
test "$ready" = 1 || { echo 'STOP PG16 did not become ready'; exit 1; }
docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres -q -c 'CREATE ROLE proof LOGIN SUPERUSER;'
docker exec "$NAME" createdb -U postgres -O proof proof
docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U proof -d proof -q <<'SQL'
CREATE TABLE members(id uuid PRIMARY KEY);
CREATE TABLE synthetic_sessions(id uuid PRIMARY KEY, session_id text, created_at timestamptz);
CREATE TABLE deletion_manifests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),reason_class text NOT NULL,incident_ref text,authorized_by text NOT NULL,executed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),note text);
CREATE TABLE deletion_manifest_scopes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,table_name text NOT NULL,session_id text,member_id text,window_start timestamptz,window_end timestamptz,CHECK(session_id IS NOT NULL OR member_id IS NOT NULL OR window_start IS NOT NULL));
CREATE TABLE provenance_tombstones(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,object_kind text NOT NULL,object_id text NOT NULL,tombstoned_at timestamptz NOT NULL DEFAULT now(),UNIQUE(object_kind,object_id));
INSERT INTO members VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
INSERT INTO synthetic_sessions VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','synthetic-session-A',now()),('dddddddd-dddd-4ddd-8ddd-dddddddddddd','synthetic-session-B',now());
SQL
docker exec "$NAME" sh -c 'pg_dump --data-only --column-inserts --on-conflict-do-nothing -U proof -d proof -t members -t synthetic_sessions > /tmp/synthetic_old_data.sql' || { echo 'synthetic pg_dump failed'; exit 1; }
docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U proof -d proof -q <<'SQL'
DELETE FROM members WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
DELETE FROM synthetic_sessions WHERE session_id='synthetic-session-A';
INSERT INTO deletion_manifests(id,reason_class,authorized_by) VALUES ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','member_deletion','fictional-review');
INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id) VALUES ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','members','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
INSERT INTO deletion_manifest_scopes(manifest_id,table_name,session_id) VALUES ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','synthetic_sessions','synthetic-session-A');
SQL
docker exec -e RESTORE_DB_URL='postgresql:///proof?user=proof' -e RESTORE_AUTHORIZED_BY='FICTIONAL-R20-ONLY-NOT-A-PRODUCTION-APPROVAL' "$NAME" bash /proof/restore-governed.sh /tmp/synthetic_old_data.sql
post=$(docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U proof -d proof -At -c "SELECT (SELECT count(*) FROM members WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')||','||(SELECT count(*) FROM members WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')||','||(SELECT count(*) FROM synthetic_sessions WHERE session_id='synthetic-session-A')||','||(SELECT count(*) FROM synthetic_sessions WHERE session_id='synthetic-session-B')||','||(SELECT count(*) FROM provenance_tombstones)||','||(SELECT count(*) FROM deletion_manifest_scopes)")
test "$post" = '0,1,0,1,1,1' || { echo "R20_SYNTHETIC_FAIL counts=$post"; exit 1; }
echo 'R20_FICTIONAL_RESTORE_PASS tombstone_prevented_resurrection=1 scope_prevented_resurrection=1 unaffected_records_preserved=2 governance_records_preserved=2'
echo 'No real backup, deletion manifest or production data accessed'
