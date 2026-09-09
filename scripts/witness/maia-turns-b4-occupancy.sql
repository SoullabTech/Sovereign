-- B4 · maia_turns historical occupancy — READ-ONLY PRODUCTION WITNESS
--
-- ⛔ THIS SCRIPT MAY NOT MUTATE ANYTHING. It runs inside a READ ONLY
-- transaction and ends in ROLLBACK. It performs no migration, no deploy, and no
-- row change.
--
-- ⛔ IT PRINTS NO MEMBER CONTENT. No user_text, no maia_text, no previews, no
-- hashes, and no session identifiers — only counts. A witness that had to quote
-- the thing it was counting would be the disclosure it exists to avoid.
--
-- ⛔ IT INFERS NO OWNERSHIP. No session joins, no attribution, no heuristics.
-- Establishing whether rows exist is a different question from establishing
-- whose they are, and only the first is asked here.
--
-- THE QUESTION, and only this: do historical maia_turns rows actually exist?
--
-- Run from a host with production access:
--   ssh soullab@minisforum 'docker exec -i maia-postgres \
--     psql -U soullab -d maia_consciousness -f -' \
--     < scripts/witness/maia-turns-b4-occupancy.sql

\pset pager off
BEGIN;
SET TRANSACTION READ ONLY;

-- ── A · SUBJECT / DRIFT ────────────────────────────────────────────────────
-- Is production still the pre-B3 subject that was qualified locally?
--
-- ⭐ IF EITHER ROW BELOW IS NOT THE EXPECTED VALUE, STOP. Production has
-- drifted beyond the subject, and the occupancy count below is then a count of
-- something other than what was proved. Evidence belongs to a subject.

SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'maia_turns'
       AND column_name  = 'member_id'
  ) AS member_id_already_present,   -- expected: false (pre-B3)
  (
    SELECT confdeltype::text FROM pg_constraint
     WHERE conrelid  = 'public.expansion_events'::regclass
       AND confrelid = 'public.maia_turns'::regclass
       AND contype   = 'f'
     LIMIT 1
  ) AS expansion_events_delete_action;  -- expected: 'a' (NO ACTION, pre-B3)

-- ── B · OCCUPANCY ──────────────────────────────────────────────────────────
-- Counts only. distinct_sessions is a COUNT of distinct values, never the
-- values themselves.

SELECT
  count(*)                    AS total_rows,
  count(DISTINCT session_id)  AS distinct_sessions
FROM public.maia_turns;

-- ── C · NOTHING ELSE ───────────────────────────────────────────────────────

ROLLBACK;
