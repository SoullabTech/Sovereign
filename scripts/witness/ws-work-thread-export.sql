-- WS-WORK-CONTINUITY · thread export (READ-ONLY).
-- Purpose: confirm or refute the hypothesis in the plan (§3) that MAIA quoted
-- text on an earlier turn and that quote persisted in replayed history after the
-- writer's locus moved. This reads rows; it writes nothing.
--
-- WHAT THIS CANNOT SHOW: ask_turns stores no sectionId / locus, so the passage
-- supplied on each send is NOT recoverable from the database. The export shows
-- WHAT MAIA said and WHEN, never WHAT TEXT SHE HAD. That gap is itself a finding
-- (the plan's B5 "what she read stays visible" needs a per-turn record).
--
-- Stage 1 (no variable): lists the 10 most recent Work conversations, no turn text.
-- Stage 2 (-v thread=<uuid>): additionally prints that one thread's turns.

\set ON_ERROR_STOP on
BEGIN READ ONLY;

-- Threads of EITHER container (a Living Work or a manuscript), most recent first.
-- Only the Work-subject ones (anchor = {"on":"work"}) are Work conversations.
SELECT t.id AS thread_id, t.manuscript_id, t.living_work_id, t.anchor,
       t.opened_at, COUNT(u.turn_index)::int AS turns,
       MAX(u.created_at) AS last_turn_at
  FROM ask_threads t
  LEFT JOIN ask_turns u ON u.thread_id = t.id
 GROUP BY t.id
 ORDER BY COALESCE(MAX(u.created_at), t.opened_at) DESC
 LIMIT 15;

\if :{?thread}
-- Unaligned and without the repeated staleness/provenance blobs, so the whole
-- thread reads as plain text and can be redirected to a file.
\pset format unaligned
\pset fieldsep ' | '
SELECT turn_index, speaker, created_at, body
  FROM ask_turns
 WHERE thread_id = :'thread'::uuid
 ORDER BY turn_index;
\endif

ROLLBACK;
