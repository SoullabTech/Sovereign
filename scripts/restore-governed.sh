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
  PSQL_ATOMIC=(psql -v ON_ERROR_STOP=1 --single-transaction "$RESTORE_DB_URL")
else
  PSQL=(docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME")
  PSQL_ATOMIC=(docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 --single-transaction -U "$DB_USER" -d "$DB_NAME")
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

# pg_dump deliberately emits an empty search_path. That is safe for fully
# qualified dump statements, but application triggers/functions may contain
# historically unqualified references. PostgreSQL 17 pg_dump also emits
# transaction_timeout, which PostgreSQL 16 correctly rejects. Normalize only
# those exact compatibility lines; all other dump bytes pass through.
stream_raw_dump() {
  case "$DUMP_FILE" in
    *.gz) gunzip -c "$DUMP_FILE" ;;
    *) cat "$DUMP_FILE" ;;
  esac
}

filter_pg_dump_compat() {
  awk -v reset="SELECT pg_catalog.set_config('search_path', '', false);" '
    $0 == "SET transaction_timeout = 0;" { next }
    { print }
    $0 == reset { print "SET search_path = pg_catalog, public;" }
  '
}

stream_governed_dump() { stream_raw_dump | filter_pg_dump_compat; }
stream_preserved_governance() { cat "$PRESERVE_FILE" | filter_pg_dump_compat; }

# `psql --single-transaction` is the rollback boundary for restore + governance
# reapply + anti-resurrection sweep. Refuse a dump that could end that boundary
# from inside the input stream. Do not match a bare `END;`: pg_dump emits that
# line inside PL/pgSQL function bodies, where it closes a procedural block rather
# than a SQL transaction. `COMMIT;`, `BEGIN;`, and `START TRANSACTION;` are the
# unambiguous top-level transaction controls this line-oriented preflight can
# safely reject.
if stream_raw_dump | awk '
  /^[[:space:]]*(BEGIN|START[[:space:]]+TRANSACTION|COMMIT)[[:space:]]*;[[:space:]]*$/ { found=1 }
  END { exit(found ? 0 : 1) }
'; then
  fail "R20: dump contains explicit transaction control; refusing non-atomic governed restore"
fi

# ── 2–4. Restore + governance reapply + sweep — ONE transaction ─────────────
# A later compatibility, governance, or sweep error must roll the restored rows
# back. No intermediate resurrection may commit.
echo "📦 Restoring, re-applying governance, and sweeping in one transaction..."
LANE_SQL="SET s5.restore_lane = 'governed';"
{
  echo "$LANE_SQL"
  stream_governed_dump
  cat <<'SQL'
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n
    FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
   WHERE ns.nspname='public' AND c.relkind IN ('r','p')
     AND c.relname IN ('deletion_manifests','deletion_manifest_scopes','provenance_tombstones');
  IF n <> 3 THEN
    RAISE EXCEPTION 'R20: restored snapshot lacks required deletion-governance tables';
  END IF;
END $$;
SQL
  if [ -s "$PRESERVE_FILE" ]; then
    stream_preserved_governance
  fi
  cat <<'SQL'
DO $$
DECLARE
  scope RECORD;
  ts RECORD;
  writer_target RECORD;
  writer_tombstone_count BIGINT := 0;
  n BIGINT;
  total BIGINT := 0;
BEGIN
  -- Writer retains deliberately immutable editorial lineage outside ordinary
  -- manuscript cascades. A restored member_manuscripts tombstone therefore
  -- needs the same narrow constitutional erasure used by live Delete Work.
  -- Materialize all candidate owners first: the erasure function temporarily
  -- alters immutable-history triggers and must not be called while a query is
  -- actively scanning one of those tables.
  SELECT count(*) INTO writer_tombstone_count
    FROM public.provenance_tombstones
   WHERE object_kind = 'member_manuscripts';

  IF writer_tombstone_count > 0 THEN
    IF to_regprocedure('public.r20_erase_writer_editorial_history(uuid,uuid,uuid)') IS NULL
       OR to_regclass('public.writer_editorial_chain_origins') IS NULL
       OR to_regclass('public.proposal_chains') IS NULL THEN
      RAISE EXCEPTION 'R20: Writer constitutional erasure authority unavailable; refusing restore';
    END IF;

    CREATE TEMP TABLE r20_restore_writer_targets (
      manifest_id UUID NOT NULL,
      manuscript_id UUID NOT NULL,
      member_id UUID NOT NULL,
      PRIMARY KEY (manifest_id, manuscript_id, member_id)
    ) ON COMMIT DROP;

    INSERT INTO r20_restore_writer_targets(manifest_id, manuscript_id, member_id)
    SELECT t.manifest_id, t.object_id::UUID, m.member_id
      FROM public.provenance_tombstones t
      JOIN public.member_manuscripts m ON m.id::TEXT = t.object_id
     WHERE t.object_kind = 'member_manuscripts'
    ON CONFLICT DO NOTHING;

    INSERT INTO r20_restore_writer_targets(manifest_id, manuscript_id, member_id)
    SELECT t.manifest_id, t.object_id::UUID, o.member_id
      FROM public.provenance_tombstones t
      JOIN public.writer_editorial_chain_origins o ON o.manuscript_id::TEXT = t.object_id
     WHERE t.object_kind = 'member_manuscripts'
    ON CONFLICT DO NOTHING;

    INSERT INTO r20_restore_writer_targets(manifest_id, manuscript_id, member_id)
    SELECT t.manifest_id, t.object_id::UUID, c.member_id
      FROM public.provenance_tombstones t
      JOIN public.proposal_chains c ON c.work_id::TEXT = t.object_id
     WHERE t.object_kind = 'member_manuscripts'
    ON CONFLICT DO NOTHING;

    IF EXISTS (
      SELECT 1
        FROM public.provenance_tombstones t
        LEFT JOIN (
          SELECT manifest_id, manuscript_id, count(DISTINCT member_id) AS owners
            FROM r20_restore_writer_targets
           GROUP BY manifest_id, manuscript_id
        ) candidates
          ON candidates.manifest_id = t.manifest_id
         AND candidates.manuscript_id::TEXT = t.object_id
       WHERE t.object_kind = 'member_manuscripts'
         AND COALESCE(candidates.owners, 0) <> 1
    ) THEN
      RAISE EXCEPTION 'R20: Writer manuscript tombstone has missing or ambiguous owner; refusing restore';
    END IF;

    DELETE FROM public.member_manuscripts m
     USING r20_restore_writer_targets target
     WHERE m.id = target.manuscript_id;
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;

    FOR writer_target IN
      SELECT manifest_id, manuscript_id, member_id
        FROM r20_restore_writer_targets
       ORDER BY manuscript_id
    LOOP
      PERFORM public.r20_erase_writer_editorial_history(
        writer_target.manifest_id,
        writer_target.member_id,
        writer_target.manuscript_id
      );
    END LOOP;

    RAISE NOTICE '[PROVENANCE] restore sweep: % Writer manuscript tombstone(s) enforced with retained-lineage erasure',
      writer_tombstone_count;
  END IF;

  -- Per-object tombstones other than Writer manuscripts, which were handled
  -- above together with their separately retained editorial lineage.
  FOR ts IN
    SELECT DISTINCT object_kind
      FROM public.provenance_tombstones
     WHERE object_kind <> 'member_manuscripts'
  LOOP
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
} | "${PSQL_ATOMIC[@]}" >/dev/null

# Verify only after the atomic transaction committed.
restored_governance_count="$("${PSQL[@]}" -X -A -t -c "$GOVERNANCE_SQL" 2>/dev/null)" ||
  fail "R20: cannot verify restored deletion-governance schema"
[ "$restored_governance_count" = 3 ] ||
  fail "R20: restored snapshot lacks required deletion-governance tables"

echo "✅ Governed restore complete. Counts above are metadata-only (ids/rows, never content)."
echo "   Record this restore (date, dump file, authorizer: $RESTORE_AUTHORIZED_BY) in the ops log."
