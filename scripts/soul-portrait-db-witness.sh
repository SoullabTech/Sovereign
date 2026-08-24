#!/usr/bin/env bash
#
# Soul Portrait DB witness — READ ONLY.
#
# Closes the residual question left open by Phase 1 of the 2026-08-24 Soul Portrait
# investigation (docs/ops/SOUL_PORTRAIT_RECOVERY_2026-08-24.md): were there ever
# production DB-backed portrait drafts, and if so, under which member identity?
#
# Run from the Mac Studio. It SSHes to minisforum and reads maia-postgres.
#
# STRUCTURALLY READ ONLY: every statement runs inside `BEGIN READ ONLY`, and the
# session sets default_transaction_read_only. A write in this script would abort,
# not execute. Do not add one — recovery writes belong in a Phase 2 plan with an
# approved rollback, not in a witness.
#
# Usage:  scripts/soul-portrait-db-witness.sh [current_member_id]
set -euo pipefail

MEMBER_ID="${1:-49ae4717-2b3a-4189-b25d-2bef95b1a45a}"
HOST="${MINISFORUM_HOST:-soullab@minisforum}"

psql_ro() {
  # -v ON_ERROR_STOP=1 so a failed read is loud, never a silent empty result.
  ssh "$HOST" "docker exec -i maia-postgres psql -U soullab maia_consciousness \
    -v ON_ERROR_STOP=1 -c \"SET default_transaction_read_only = on;\" -c \"$1\""
}

echo "════════════════════════════════════════════════════════════════════"
echo " Soul Portrait DB witness — READ ONLY"
echo " host=$HOST   member=$MEMBER_ID   at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "════════════════════════════════════════════════════════════════════"

echo; echo "── 0. Does the table exist, and how many rows in total? ──────────────"
psql_ro "BEGIN READ ONLY;
SELECT to_regclass('public.soul_portraits') AS table_exists,
       (SELECT count(*) FROM soul_portraits) AS total_rows,
       (SELECT count(*) FROM soul_portraits WHERE owner_member_id = '$MEMBER_ID') AS rows_for_current_member;
COMMIT;"

echo; echo "── 1. Ownership census — every owner with portraits ──────────────────"
psql_ro "BEGIN READ ONLY;
SELECT sp.owner_member_id,
       m.username, m.email, m.name,
       count(*) AS portraits,
       min(sp.created_at) AS first_created,
       max(sp.created_at) AS last_created
  FROM soul_portraits sp
  LEFT JOIN members m ON m.id = sp.owner_member_id
 GROUP BY 1,2,3,4
 ORDER BY portraits DESC;
COMMIT;"

echo; echo "── 2. Full row inventory (every portrait, every owner) ───────────────"
psql_ro "BEGIN READ ONLY;
SELECT sp.id, sp.slug, sp.portrait_kind, sp.owner_member_id, sp.subject_member_id,
       sp.subject_person_id, sp.consent_state, sp.published_at,
       sp.created_at, sp.updated_at,
       sp.immutable_text->'person'->>'name' AS subject_name_in_text,
       ppl.name AS subject_name_in_directory
  FROM soul_portraits sp
  LEFT JOIN studio_people ppl ON ppl.id = sp.subject_person_id
 ORDER BY sp.created_at DESC;
COMMIT;"

echo; echo "── 3. Candidate Kelly member identities ──────────────────────────────"
psql_ro "BEGIN READ ONLY;
SELECT m.id, m.username, m.email, m.name, m.created_at,
       (m.id = '$MEMBER_ID') AS is_current_session_member,
       (SELECT count(*) FROM soul_portraits sp WHERE sp.owner_member_id = m.id) AS owned_portraits,
       (SELECT count(*) FROM auth_sessions s WHERE s.member_id = m.id AND s.revoked = FALSE
          AND s.expires_at > NOW()) AS live_sessions
  FROM members m
 WHERE m.email ILIKE '%soullab1%' OR m.email ILIKE '%kelly%'
    OR m.name ILIKE '%kelly%'    OR m.name ILIKE '%nezat%'
    OR m.username ILIKE '%kelly%'
 ORDER BY m.created_at;
COMMIT;"

echo; echo "── 4. INTEGRITY PROBE — was anything ever deleted out of band? ───────"
echo "     n_tup_del > 0 means PostgreSQL counted deletes on that table since the"
echo "     applicable stats reset. It is DELETION ACTIVITY DETECTED — not proof"
echo "     that a missing Kelly portrait was the row deleted. Investigate before"
echo "     classifying the portrait incident."
# NOTE: pg_stat_user_tables has NO stats_reset column (verified against PG 16.13 —
# selecting it aborts the query, and with ON_ERROR_STOP/set -e that would kill this
# witness before §5, the strongest probe, ever ran). stats_reset lives on
# pg_stat_database, so it is reported separately below.
psql_ro "BEGIN READ ONLY;
SELECT relname, n_live_tup, n_tup_ins, n_tup_upd, n_tup_del,
       last_vacuum, last_autovacuum
  FROM pg_stat_user_tables
 WHERE relname IN ('soul_portraits','soul_portrait_consents','members')
 ORDER BY relname;
COMMIT;"

echo
echo "     Database-wide stats reset, for context only. This does NOT prove an"
echo "     individual table's counters were never reset separately —"
echo "     pg_stat_reset_single_table_counters() zeroes one table without"
echo "     touching this timestamp. A recent reset weakens a low n_tup_del;"
echo "     it never weakens a high one."
psql_ro "BEGIN READ ONLY;
SELECT datname, stats_reset
  FROM pg_stat_database
 WHERE datname = current_database();
COMMIT;"

echo; echo "── 5. Consent ledger — activity that outlives a deleted portrait ─────"
echo "     The FK is NO ACTION (confdeltype='a', verified live), so a plain parent"
echo "     DELETE is REFUSED while ledger rows reference it. An orphan therefore"
echo "     proves referential integrity was violated at some point — but not by"
echo "     what: a dropped/disabled constraint, a migration anomaly, a restore, or"
echo "     historical bad data all produce one. ESCALATION SIGNAL, not a"
echo "     reconstruction of the event."
echo "     Corollary: because the FK blocks it, any n_tup_del in §4 most likely"
echo "     reflects portraits that never had ledger rows — i.e. unconsented drafts."
psql_ro "BEGIN READ ONLY;
SELECT (SELECT count(*) FROM soul_portrait_consents) AS ledger_rows,
       (SELECT count(*) FROM soul_portrait_consents c
          WHERE NOT EXISTS (SELECT 1 FROM soul_portraits sp WHERE sp.id = c.portrait_id)
       ) AS orphaned_ledger_rows;
COMMIT;"

cat <<'EOT'

════════════════════════════════════════════════════════════════════
 CLASSIFY THE RESULT (founder ruling, 2026-08-24)
════════════════════════════════════════════════════════════════════
 Read §0 total_rows and §1 first, then §4/§5 to confirm.

 total_rows = 0, and §4 n_tup_del = 0
   → ARCHITECTURE MISMATCH, NOT RECOVERY.
     Studio has simply never indexed the static registry. Close the
     incident. No Phase 2.

 Rows exist, but none under another Kelly identity (§3 shows no second
 Kelly row with owned_portraits > 0)
   → NO RECOVERY INCIDENT. Same conclusion as above.

 Rows exist under another Kelly member ID (§3 second identity with
 owned_portraits > 0)
   → NARROW PHASE 2: ownership reconciliation. STILL NO WRITE until the
     canonical identity is established and exactly what moves is agreed.
     Report the two IDs, both row counts, and the evidence tying the rows
     to Kelly. Do not merge accounts.

 §4 n_tup_del > 0, or §5 orphaned_ledger_rows > 0, or rows visibly absent
   → DELETION ACTIVITY / INTEGRITY VIOLATION DETECTED. Investigate BEFORE
     classifying the portrait incident — neither signal names which row,
     or proves a Kelly portrait was the row affected. Establish when, by
     what, and what else that operation touched, before any restore, and
     keep it on its own track rather than folding it into portrait
     recovery.

 NO BACKFILL in any branch. Moving the static registry into soul_portraits
 is new product behavior, not restoration — those portraits concern named
 people and Larry Closs is under an explicit consent hold.
════════════════════════════════════════════════════════════════════
EOT
