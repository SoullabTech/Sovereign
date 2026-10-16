#!/bin/bash
# Deliberately fictional, network-disabled R20 refusal proof; NO real backups.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NAME='soullab-r20-failclosed-negative-20261016'
IMAGE='pgvector/pgvector@sha256:7d400e340efb42f4d8c9c12c6427adb253f726881a9985d2a471bf0eed824dff'
OUT='/tmp/soullab-r20-failclosed-negative-20261016.log'
if docker ps -a --format '{{.Names}}' | grep -Fxq "$NAME"; then echo 'REFUSE: reserved container exists'; exit 2; fi
cleanup(){ docker rm -f "$NAME" >/dev/null 2>&1 || true; rm -f "$OUT"; echo 'negative_test_isolation_cleanup=PASS'; }
trap cleanup EXIT
docker run -d --rm --name "$NAME" --network none --cpus 1 --memory 800m --tmpfs /var/lib/postgresql/data:rw,size=256m \
 -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=soullab -v "$ROOT/scripts/restore-governed.sh:/proof/restore-governed.sh:ro" -v "$ROOT/scripts/witness/r20-failing-pgdump-fixture.sh:/proof/failing-pgdump:ro" "$IMAGE" >/dev/null
ready=0
for i in $(seq 1 70); do
 if docker logs "$NAME" 2>&1 | grep -Fq 'PostgreSQL init process complete; ready for start up.' && \
    [ "$(docker exec "$NAME" psql -X -U soullab -d soullab -At -c 'SELECT 1' 2>/dev/null)" = 1 ]; then ready=1; break; fi
 sleep 0.3
done
test "$ready" = 1 || { echo 'isolated_postgres_not_ready'; exit 1; }
for db in with_governance partial_schema table_without_governance empty_target; do docker exec "$NAME" createdb -U soullab "$db"; done
docker exec -i "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d with_governance -q <<'SQL'
CREATE TABLE deletion_manifests(id uuid PRIMARY KEY);
CREATE TABLE deletion_manifest_scopes(id uuid PRIMARY KEY);
CREATE TABLE provenance_tombstones(id uuid PRIMARY KEY);
CREATE TABLE fictional_records(id integer PRIMARY KEY);
INSERT INTO fictional_records VALUES (1);
SQL
docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d partial_schema -q -c 'CREATE TABLE deletion_manifests(id uuid PRIMARY KEY);'
docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U soullab -d table_without_governance -q -c 'CREATE TABLE fictional_records(id integer PRIMARY KEY); INSERT INTO fictional_records VALUES (1);'
docker exec "$NAME" sh -c 'mkdir -m 700 /tmp/failbin; cp /proof/failing-pgdump /tmp/failbin/pg_dump; chmod 700 /tmp/failbin/pg_dump; printf "SELECT 1;\n" > /tmp/fictional_noop.sql; printf "CREATE TABLE public.fictional_only(id integer);\n" > /tmp/fictional_missing_governance.sql'
echo '1. Existing governance and failed pg_dump MUST abort before SQL is read'
if docker exec -e PATH='/tmp/failbin:/usr/local/bin:/usr/bin:/bin' \
   -e RESTORE_DB_URL='postgresql:///with_governance?user=soullab' -e RESTORE_AUTHORIZED_BY='FICTIONAL-ONLY' \
   "$NAME" bash /proof/restore-governed.sh /tmp/fictional_noop.sql > "$OUT" 2>&1; then
 echo 'FAIL: pg_dump failure incorrectly reported success'; exit 1
fi
grep -Fq 'governance export failed' "$OUT" || { echo 'FAIL: incorrect refusal reason for pg_dump failure'; exit 1; }
count=$(docker exec "$NAME" psql -X -At -U soullab -d with_governance -c 'SELECT count(*) FROM fictional_records')
test "$count" = 1 || { echo 'FAIL: preexisting fictional row changed'; exit 1; }
leftover=$(docker exec "$NAME" sh -c "find /tmp -maxdepth 1 -name 's5-governance-preserve.*' | wc -l")
test "$leftover" = 0 || { echo 'FAIL: governance export temp file leaked'; exit 1; }
echo 'EXPORT_FAILURE_REFUSED=PASS existing_rows_unchanged=yes temp_export_clean=yes'
echo '2. Partial governance schema MUST abort'
if docker exec -e RESTORE_DB_URL='postgresql:///partial_schema?user=soullab' -e RESTORE_AUTHORIZED_BY='FICTIONAL-ONLY' \
  "$NAME" bash /proof/restore-governed.sh /tmp/fictional_noop.sql > "$OUT" 2>&1; then
 echo 'FAIL: partial governance schema incorrectly allowed'; exit 1
fi
grep -Fq 'incomplete governance schema' "$OUT" || { echo 'FAIL: wrong partial schema refusal'; grep -E '^(❌ |R20:)' "$OUT" | head -6 || true; exit 1; }
echo 'PARTIAL_GOVERNANCE_REFUSED=PASS'
echo '3. Pre-existing tables without governance MUST abort'
if docker exec -e RESTORE_DB_URL='postgresql:///table_without_governance?user=soullab' -e RESTORE_AUTHORIZED_BY='FICTIONAL-ONLY' \
  "$NAME" bash /proof/restore-governed.sh /tmp/fictional_noop.sql > "$OUT" 2>&1; then
 echo 'FAIL: incomplete existing schema incorrectly allowed'; exit 1
fi
grep -Fq 'existing public tables without deletion governance' "$OUT" || { echo 'FAIL: wrong old-schema refusal'; exit 1; }
echo 'NONEMPTY_WITHOUT_GOVERNANCE_REFUSED=PASS'
echo '4. Fresh target with non-governed dump MUST NOT claim success'
if docker exec -e RESTORE_DB_URL='postgresql:///empty_target?user=soullab' -e RESTORE_AUTHORIZED_BY='FICTIONAL-ONLY' \
  "$NAME" bash /proof/restore-governed.sh /tmp/fictional_missing_governance.sql > "$OUT" 2>&1; then
 echo 'FAIL: restored snapshot missing governance incorrectly allowed'; exit 1
fi
grep -Fq 'restored snapshot lacks required deletion-governance tables' "$OUT" || { echo 'FAIL: wrong no-governance refusal'; exit 1; }
echo 'MISSING_RESTORED_GOVERNANCE_REFUSED=PASS'
echo 'R20_SYNTHETIC_FAILCLOSED_NEGATIVE_TESTS=4/4 PASS'
