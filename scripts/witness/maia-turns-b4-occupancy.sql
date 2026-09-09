-- B4 · maia_turns historical occupancy — READ-ONLY PRODUCTION WITNESS
--
-- ⛔ MUTATES NOTHING. READ ONLY transaction, ends in ROLLBACK. No migration, no
-- deploy, no row change.
--
-- ⛔ PRINTS NO MEMBER CONTENT. No user_text, no maia_text, no previews, no
-- hashes, no session identifiers — counts only. A witness that had to quote the
-- thing it was counting would be the disclosure it exists to avoid.
--
-- ⛔ INFERS NO OWNERSHIP. No session joins, no attribution, no heuristics.
-- Whether rows exist and whose they are are different questions; only the first
-- is asked here.
--
-- ── HOW TO RUN IT — PINNED, NOT FROM A WORKING TREE ────────────────────────
--
-- ⭐ Evidence belongs to an INSTRUMENT subject as well as a database subject.
-- Piping the working-tree file would witness whatever happened to be on disk.
-- Run the exact committed bytes:
--
--   git show <THIS-COMMIT-SHA>:scripts/witness/maia-turns-b4-occupancy.sql \
--     | ssh soullab@minisforum 'docker exec -i maia-postgres \
--         psql -v ON_ERROR_STOP=1 -U soullab -d maia_consciousness -f -'
--
-- Exit 0 = the witness ran on the qualified subject; its counts are evidence.
-- Non-zero = it refused or failed. There is no third outcome, and a non-zero
-- exit is never to be read past.

\set ON_ERROR_STOP on
\pset pager off

BEGIN;
SET TRANSACTION READ ONLY;

-- ── A · SUBJECT / DRIFT — MECHANICAL, NOT ADVISORY ─────────────────────────
--
-- Production must still be the pre-B3 subject that was qualified locally:
-- `member_id` absent, and exactly one expansion_events → maia_turns foreign key
-- whose delete action is still 'a' (NO ACTION).

SELECT
  NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'maia_turns'
       AND column_name  = 'member_id'
  )
  AND (
    SELECT count(*) = 1 AND bool_and(confdeltype = 'a')
      FROM pg_constraint
     WHERE conrelid  = 'public.expansion_events'::regclass
       AND confrelid = 'public.maia_turns'::regclass
       AND contype   = 'f'
  ) AS subject_matches
\gset b4_

\if :b4_subject_matches
\else
  \echo '‼ B4 STOP — production schema is not the qualified pre-B3 subject.'
  \echo '  The occupancy count below would be a count of something else.'
  \echo '  Evidence belongs to a subject. Do not proceed; re-qualify first.'
  -- ⭐ THE REFUSAL MUST BE NON-ZERO, AND `\quit 3` CANNOT DELIVER THAT.
  -- Verified on psql 16: `\quit` ignores its argument and exits 0, so a script
  -- that echoed a STOP and quit would hand a caller a success code — the exact
  -- fail-open this check exists to close. A raised exception under
  -- ON_ERROR_STOP exits 3, and the ROLLBACK still happens.
  DO $$ BEGIN
    RAISE EXCEPTION 'B4 refused: production is not the qualified pre-B3 subject';
  END $$;
\endif

-- ── B · OCCUPANCY — reached only on the qualified subject ──────────────────
-- Counts only. `distinct_sessions` is a COUNT of distinct values, never the
-- values themselves.

SELECT
  count(*)                    AS total_rows,
  count(DISTINCT session_id)  AS distinct_sessions
FROM public.maia_turns;

-- ── C · NOTHING ELSE ───────────────────────────────────────────────────────

ROLLBACK;
