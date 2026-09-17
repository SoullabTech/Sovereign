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
#   4. SWEEPS: applies deletion tombstones/scopes and P5-D account-erasure
#      fences. Ordinary member-bound rows stay absent; Circle membership/share/
#      response rows are restored only in their lawful left/revoked/withdrawn
#      tombstone state. (The DB-side triggers cover data-only restores into a
#      live schema.)
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
echo "🧹 Sweeping tombstoned, member-erased and manifest-scoped rows..."
"${PSQL[@]}" <<'SQL'
DO $$
DECLARE
  scope RECORD;
  ts RECORD;
  col RECORD;
  n BIGINT;
  total BIGINT := 0;
BEGIN
  -- Per-object tombstones. The members subject tombstone is deliberately last:
  -- dependent member-bound rows and Circle state must become inert first.
  FOR ts IN
    SELECT DISTINCT object_kind FROM provenance_tombstones
     WHERE object_kind <> 'members'
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

  -- P5-D Circle fences preserve historical FACTS while ending representation.
  IF to_regclass('public.shared_artifacts') IS NOT NULL THEN
    UPDATE shared_artifacts s
       SET revoked_at = COALESCE(s.revoked_at, p.tombstoned_at)
      FROM provenance_tombstones p
     WHERE p.object_kind = 'shared_artifacts:revoked'
       AND p.object_id = s.id::text;

    UPDATE shared_artifacts s
       SET revoked_at = COALESCE(s.revoked_at, p.tombstoned_at)
      FROM provenance_tombstones p
     WHERE p.object_kind = 'members'
       AND p.object_id = s.shared_by::text
       AND s.revoked_at IS NULL;
  END IF;

  IF to_regclass('public.circle_inquiry_responses') IS NOT NULL THEN
    UPDATE circle_inquiry_responses r
       SET withdrawn_at = COALESCE(r.withdrawn_at, p.tombstoned_at),
           response_text = NULL,
           response_type = NULL
      FROM provenance_tombstones p
     WHERE p.object_kind = 'circle_inquiry_responses:withdrawn'
       AND p.object_id = r.id::text;

    UPDATE circle_inquiry_responses r
       SET withdrawn_at = COALESCE(r.withdrawn_at, p.tombstoned_at),
           response_text = NULL,
           response_type = NULL
      FROM provenance_tombstones p
     WHERE p.object_kind = 'members'
       AND p.object_id = r.member_id::text
       AND (r.withdrawn_at IS NULL OR r.response_text IS NOT NULL OR r.response_type IS NOT NULL);
  END IF;

  IF to_regclass('public.circle_memberships') IS NOT NULL THEN
    UPDATE circle_memberships m
       SET status = 'left', updated_at = GREATEST(m.updated_at, p.tombstoned_at)
      FROM provenance_tombstones p
     WHERE p.object_kind = 'circle_memberships:left'
       AND p.object_id = m.id::text;

    UPDATE circle_memberships m
       SET status = 'left', updated_at = GREATEST(m.updated_at, p.tombstoned_at)
      FROM provenance_tombstones p
     WHERE p.object_kind = 'members'
       AND p.object_id = m.member_id::text
       AND m.status = 'active';
  END IF;

  -- A member tombstone is also a broad subject fence. Any direct member-bound
  -- row restored from an older dump is removed even if that exact object did not
  -- exist at deletion time. Circle rows and the erasure accountability act are
  -- excluded because their lawful post-erasure state is retention, not erasure.
  FOR col IN
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND column_name = ANY(ARRAY[
         'user_id','member_id','owner_id','author_id','created_by','subject_member_id',
         'participant_id','actor_id','from_member_id','to_member_id',
         'client_member_id','practitioner_member_id'
       ])
       AND table_name NOT IN (
         'account_erasure_acts',
         'circle_memberships',
         'circle_inquiry_responses',
         'deletion_manifest_scopes'
       )
  LOOP
    EXECUTE format(
      'DELETE FROM %I t USING provenance_tombstones p
        WHERE p.object_kind = ''members'' AND t.%I::text = p.object_id',
      col.table_name, col.column_name);
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
  END LOOP;

  -- Predicate scopes (table + session + window)
  FOR scope IN SELECT * FROM deletion_manifest_scopes LOOP
    IF to_regclass('public.' || scope.table_name) IS NULL THEN CONTINUE; END IF;
    IF scope.session_id IS NULL AND scope.window_start IS NULL THEN
      RAISE WARNING '[PROVENANCE] restore sweep: member-only scope on % NOT swept — P5-D member erasure uses subject/object tombstones instead (manifest %)',
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
  END LOOP;

  -- Identity ends last. Any old RESTRICT/NO ACTION relationship that was absent
  -- at erasure time but reappears from an older backup makes this DELETE fail
  -- loudly. The restore must never silently resurrect the erased member.
  IF to_regclass('public.members') IS NOT NULL THEN
    DELETE FROM members m USING provenance_tombstones p
     WHERE p.object_kind = 'members' AND p.object_id = m.id::text;
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
  END IF;

  RAISE NOTICE '[PROVENANCE] governed restore sweep complete — % ordinary row(s) refused resurrection; Circle tombstone updates are retained history', total;
END $$;
SQL

rm -f "$PRESERVE_FILE"

echo "✅ Governed restore complete. Counts above are metadata-only (ids/rows, never content)."
echo "   Record this restore (date, dump file, authorizer: $RESTORE_AUTHORIZED_BY) in the ops log."
