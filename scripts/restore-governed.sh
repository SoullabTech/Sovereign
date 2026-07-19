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

echo "🔐 Governed restore starting (R20)"
echo "   dump: $DUMP_FILE"
echo "   authorized by: $RESTORE_AUTHORIZED_BY"

# ── 1. Preserve the deletion-governance tables ────────────────────────────────
PRESERVE_FILE="$(mktemp /tmp/s5-governance-preserve.XXXXXX)"
echo "📥 Preserving deletion manifests/scopes/tombstones → $PRESERVE_FILE"
if [ -n "$RESTORE_DB_URL" ]; then
  PG_DUMP=(pg_dump "$RESTORE_DB_URL")
else
  PG_DUMP=(docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME")
fi
"${PG_DUMP[@]}" \
  --data-only --column-inserts --on-conflict-do-nothing \
  -t deletion_manifests -t deletion_manifest_scopes -t provenance_tombstones \
  > "$PRESERVE_FILE" 2>/dev/null || {
    echo "⚠️  Governance tables absent in live DB (pre-S5 database) — nothing to preserve"
    : > "$PRESERVE_FILE"
  }

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

rm -f "$PRESERVE_FILE"

echo "✅ Governed restore complete. Counts above are metadata-only (ids/rows, never content)."
echo "   Record this restore (date, dump file, authorizer: $RESTORE_AUTHORIZED_BY) in the ops log."
