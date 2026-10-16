#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign — Governed Database Restore (Sanctuary S5 / R20)
# ═══════════════════════════════════════════════════════════════════════════════
# Constitutional sentence (ratified 2026-07-17, incident SANC-20260614-01):
#
#   "Deletion is not complete if restoration can silently resurrect what
#    sovereignty required the system to forget."
#
# This script is THE restore path. A raw psql/pg_restore of a dump is an
# ungoverned operation and is refused by policy (R20): it can resurrect rows
# that a sovereignty-driven deletion removed.
#
# What this does beyond a raw restore:
#   1. PRESERVES the live deletion_manifests / deletion_manifest_scopes /
#      provenance_tombstones tables before restoring (they must survive even
#      if the incoming dump predates them).
#   2. Restores the dump.
#   3. RE-APPLIES the preserved manifests/scopes/tombstones.
#   4. SWEEPS: deletes any restored row that is tombstoned or falls inside a
#      deletion-manifest scope — the restore-side half of R20. (The DB-side
#      half is the s5_refuse_tombstoned BEFORE INSERT trigger, which covers
#      data-only restores into a live schema.)
#   5. Reports counts only — never content.
#
# Usage:
#   RESTORE_AUTHORIZED_BY="<founder ruling ref>" ./scripts/restore-governed.sh <dump.sql[.gz]>
#
# Runs against the maia-postgres container by default (like backup-db.sh).
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail
umask 077

CONTAINER_NAME="${POSTGRES_CONTAINER:-maia-postgres}"
DB_NAME="${DB_NAME:-maia_consciousness}"
DB_USER="${DB_USER:-soullab}"
# RESTORE_DB_URL: run against a host-reachable postgres URL instead of docker
# exec (dev stacks, rehearsals against disposable copies). Production omits it.
RESTORE_DB_URL="${RESTORE_DB_URL:-}"

DUMP_FILE="${1:-}"

fail() { echo "❌ $1" >&2; exit 1; }

[ -n "$DUMP_FILE" ] || fail "Usage: RESTORE_AUTHORIZED_BY=<ref> $0 <dump.sql[.gz]>"
[ -f "$DUMP_FILE" ] || fail "Dump file not found: $DUMP_FILE"
[ -n "${RESTORE_AUTHORIZED_BY:-}" ] || fail "R20: a restore is a constitutional event. Set RESTORE_AUTHORIZED_BY to the authorizing ruling/actor (recorded, content-free)."

if [ -n "$RESTORE_DB_URL" ]; then
  PSQL=(psql -v ON_ERROR_STOP=1 "$RESTORE_DB_URL")
else
  PSQL=(docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME")
fi

# Verify client/server compatibility BEFORE touching a restore target.
# Older pg_dump versions cannot reliably preserve newer PostgreSQL databases.
if [ -n "$RESTORE_DB_URL" ]; then
  PG_DUMP=(pg_dump "$RESTORE_DB_URL")
  PG_DUMP_VERSION=(pg_dump --version)
else
  PG_DUMP=(docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME")
  PG_DUMP_VERSION=(docker exec "$CONTAINER_NAME" pg_dump --version)
fi
db_version_num="$("${PSQL[@]}" -X -A -t -c 'SHOW server_version_num' 2>/dev/null)" ||
  fail "R20: cannot inspect target PostgreSQL server version"
[[ "$db_version_num" =~ ^[0-9]{5,6}$ ]] ||
  fail "R20: invalid target PostgreSQL server version"
pgdump_version="$("${PG_DUMP_VERSION[@]}" 2>/dev/null)" ||
  fail "R20: cannot identify governance export client version"
version_regex='PostgreSQL\) ([0-9]+)'
if [[ "$pgdump_version" =~ $version_regex ]]; then
  pgdump_major="${BASH_REMATCH[1]}"
else
  fail "R20: unsupported governance export client version"
fi
server_major=$(( db_version_num / 10000 ))
[ "$pgdump_major" -ge "$server_major" ] ||
  fail "R20: governance export client is older than target database; refusing restore"

echo "🔐 Governed restore starting (R20)"
echo "   dump: $DUMP_FILE"
echo "   authorized by: $RESTORE_AUTHORIZED_BY"

# ── 1. Preserve the deletion-governance tables ────────────────────────────────
# R20 fail-closed preflight. An incompatible pg_dump or database connection
# must NOT masquerade as an older database with no deletion-governance tables.
GOVERNANCE_SQL="SELECT count(*)
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind IN ('r','p')
    AND c.relname IN (
      'deletion_manifests','deletion_manifest_scopes','provenance_tombstones'
    );"
governance_count="$("${PSQL[@]}" -X -A -t -c "$GOVERNANCE_SQL" 2>/dev/null)" ||
  fail "R20: cannot verify deletion-governance schema; refusing restore"
case "$governance_count" in
  0)
    # Permit a *truly fresh* target, never a partially migrated existing DB.
    table_count="$("${PSQL[@]}" -X -A -t -c "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p');" 2>/dev/null)" ||
      fail "R20: cannot verify fresh restore target; refusing restore"
    [ "$table_count" = 0 ] ||
      fail "R20: existing public tables without deletion governance; refusing restore"
    echo "   R20: empty fresh target; governance must be present after restore"
    ;;
  3) echo "   R20: three governance tables present; export required" ;;
  *) fail "R20: incomplete governance schema; refusing restore" ;;
esac

PRESERVE_FILE="$(mktemp /tmp/s5-governance-preserve.XXXXXX)"
cleanup_preserve() { rm -f -- "$PRESERVE_FILE"; }
trap cleanup_preserve EXIT
if [ "$governance_count" = 3 ]; then
  echo "📥 Preserving deletion manifests/scopes/tombstones → $PRESERVE_FILE"
  if ! "${PG_DUMP[@]}" --data-only --column-inserts --on-conflict-do-nothing -t deletion_manifests -t deletion_manifest_scopes -t provenance_tombstones > "$PRESERVE_FILE" 2>/dev/null; then
    fail "R20: governance export failed (client/version/permissions); refusing restore"
  fi
  [ -s "$PRESERVE_FILE" ] ||
    fail "R20: governance export was empty; refusing restore"
fi

# ── 2. Restore the dump ───────────────────────────────────────────────────────
# The session declares the governed restore lane FIRST: the S5 mint gates admit
# historical (unknown-historical) rows only under this declaration, so an
# ungoverned replay of a historical dump fails loudly at the database itself.
echo "📦 Restoring dump (governed lane declared)..."
LANE_SQL="SET s5.restore_lane = 'governed';"
case "$DUMP_FILE" in
  *.gz) { echo "$LANE_SQL"; gunzip -c "$DUMP_FILE"; } | "${PSQL[@]}" >/dev/null ;;
  *)    { echo "$LANE_SQL"; cat "$DUMP_FILE"; } | "${PSQL[@]}" >/dev/null ;;
esac

# The restored dump must supply the R20 governance schema. Without it,
# sweeping deletion markers is impossible; never claim a successful restore.
restored_governance_count="$("${PSQL[@]}" -X -A -t -c "$GOVERNANCE_SQL" 2>/dev/null)" ||
  fail "R20: cannot verify restored deletion-governance schema"
[ "$restored_governance_count" = 3 ] ||
  fail "R20: restored snapshot lacks required deletion-governance tables"

# ── 3. Re-apply preserved governance rows ─────────────────────────────────────
if [ -s "$PRESERVE_FILE" ]; then
  echo "📤 Re-applying preserved manifests/scopes/tombstones..."
  "${PSQL[@]}" < "$PRESERVE_FILE" >/dev/null
fi

# ── 4. Sweep — the restore may not keep what sovereignty deleted ─────────────
echo "🧹 Sweeping tombstoned and manifest-scoped rows..."
"${PSQL[@]}" <<'SQL'
DO $$
DECLARE
  scope RECORD;
  ts RECORD;
  n BIGINT;
  total BIGINT := 0;
BEGIN
  -- Per-object tombstones
  FOR ts IN SELECT DISTINCT object_kind FROM provenance_tombstones LOOP
    IF to_regclass('public.' || ts.object_kind) IS NULL THEN CONTINUE; END IF;
    EXECUTE format(
      'DELETE FROM %I t USING provenance_tombstones p
       WHERE p.object_kind = %L AND p.object_id = t.id::text',
      ts.object_kind, ts.object_kind);
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
    IF n > 0 THEN
      RAISE NOTICE '[PROVENANCE] restore sweep: % tombstoned row(s) removed from %', n, ts.object_kind;
    END IF;
  END LOOP;

  -- Predicate scopes (table + session + window)
  FOR scope IN SELECT * FROM deletion_manifest_scopes LOOP
    IF to_regclass('public.' || scope.table_name) IS NULL THEN CONTINUE; END IF;
    IF scope.session_id IS NULL AND scope.window_start IS NULL THEN
      -- member-only scope: column naming varies per table (user_id/member_id);
      -- those deletions must tombstone per-object ids instead. LOUD, not silent.
      RAISE WARNING '[PROVENANCE] restore sweep: member-only scope on % NOT swept — use per-object tombstones for member deletions (manifest %)',
        scope.table_name, scope.manifest_id;
      CONTINUE;
    END IF;
    EXECUTE format(
      'DELETE FROM %I WHERE ($1::text IS NULL OR session_id = $1)
         AND ($2::timestamptz IS NULL OR created_at >= $2)
         AND ($3::timestamptz IS NULL OR created_at <= $3)
         AND ($1::text IS NOT NULL OR $2::timestamptz IS NOT NULL)',
      scope.table_name)
      USING scope.session_id, scope.window_start, scope.window_end;
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
    IF n > 0 THEN
      RAISE NOTICE '[PROVENANCE] restore sweep: % scoped row(s) removed from % (manifest %)',
        n, scope.table_name, scope.manifest_id;
    END IF;
  END LOOP;

  RAISE NOTICE '[PROVENANCE] restore sweep complete — % row(s) refused resurrection', total;
END $$;
SQL

echo "✅ Governed restore complete. Counts above are metadata-only (ids/rows, never content)."
echo "   Record this restore (date, dump file, authorizer: $RESTORE_AUTHORIZED_BY) in the ops log."
