#!/bin/bash
# Shell-only synthetic PG client mismatch proof. No Docker, no real data.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d /tmp/r20-client-refusal-20261016.XXXXXX)"
cleanup(){ rm -rf -- "$TMP"; }
trap cleanup EXIT
mkdir -m 700 "$TMP/bin"
printf '%s\n' 'SELECT 1;' > "$TMP/fictional-noop.sql"
cat > "$TMP/bin/psql" <<'SH'
#!/bin/sh
case "$*" in
  *server_version_num*) printf '%s\n' 160013 ;;
  *deletion_manifests*) printf '%s\n' 3 ;;
  *) printf 'unexpected fake psql invocation\n' >&2; exit 45 ;;
esac
SH
cat > "$TMP/bin/pg_dump" <<'SH'
#!/bin/sh
case "$*" in
  *--version*) printf 'pg_dump (PostgreSQL) %s\n' "${FAKE_PGDUMP_VERSION:-14.19}"; exit 0 ;;
  *) exit 43 ;;
esac
SH
chmod 700 "$TMP/bin/psql" "$TMP/bin/pg_dump"
echo '1. Refuse old pg_dump 14 against PG16 before any restore'
set +e
PATH="$TMP/bin:$PATH" FAKE_PGDUMP_VERSION='14.19' RESTORE_DB_URL='postgresql:///fictional?user=fictional' RESTORE_AUTHORIZED_BY='FAKE-R20-ONLY' \
  bash "$ROOT/scripts/restore-governed.sh" "$TMP/fictional-noop.sql" > "$TMP/old-client.log" 2>&1
rc=$?
set -e
test "$rc" -ne 0 || { echo 'FAIL: old client accepted'; exit 1; }
grep -Fq 'governance export client is older than target database' "$TMP/old-client.log" || { echo 'FAIL: wrong old client refusal'; exit 1; }
echo 'OLD_PGDUMP_REFUSAL=PASS'
echo '2. Fail closed on actual governance export error even with matching client'
set +e
PATH="$TMP/bin:$PATH" FAKE_PGDUMP_VERSION='16.13' RESTORE_DB_URL='postgresql:///fictional?user=fictional' RESTORE_AUTHORIZED_BY='FAKE-R20-ONLY' \
  bash "$ROOT/scripts/restore-governed.sh" "$TMP/fictional-noop.sql" > "$TMP/failed-export.log" 2>&1
rc=$?
set -e
test "$rc" -ne 0 || { echo 'FAIL: failed export accepted'; exit 1; }
grep -Fq 'governance export failed' "$TMP/failed-export.log" || { echo 'FAIL: wrong export refusal'; exit 1; }
echo 'EXPORT_FAILURE_REFUSAL=PASS'
echo 'Synthetic R20 client/export refusal tests 2/2 PASS; no database or Docker accessed.'
