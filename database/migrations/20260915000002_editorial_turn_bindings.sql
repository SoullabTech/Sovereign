-- W4-S2 · VALIDATION + BINDING SUBSTRATE — the turn ↔ authored-act relation.
--
-- Design: docs/programme/WS-EDITORIAL-WORKSPACE-01_W4-2_SCHEMA_DESIGN_2026-09-14.md §1.3, §2, §3, §11
-- Authorized: founder, 2026-09-15, W4-SCHEMA-IMPLEMENTATION, from canonical 348b9e54d.
--
-- ⭐ A NEW TRANSACTION, deliberately. S1's ACCESS EXCLUSIVE was released when
-- S1's file committed, so the two VALIDATE scans below take only
-- SHARE UPDATE EXCLUSIVE and do not block readers or writers.
--
-- ⭐⭐ THE GOVERNING SENTENCE:
--
--     One turn may carry AT MOST ONE semantic adjunct — and every one of the
--     nine claims below is a CONSTRAINT, not an application check.
--
-- ⛔ Unique-lock strategy: OPTION A (ordinary unique build). Earned, not
-- assumed: the protected preflight of 2026-09-14 read the live tables and found
-- ask_threads 8 kB / ask_turns 24 kB / total_threads 1, so the build is a blip.
-- ⛔ Option B (CREATE UNIQUE INDEX CONCURRENTLY) is structurally incompatible
-- with run-sql-migrations.sh, which force-wraps every file in BEGIN/COMMIT —
-- and CIC cannot run inside a transaction block. That was measured, not assumed.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A · VALIDATION — where S1's constraints stop reading true and become true.
--
-- ⛔ IF EITHER REFUSES, THAT IS THE FINDING AND THE MIGRATION MUST STOP.
-- A row carrying both subjects means something wrote one. ⛔ Do not repair it
-- here, do not widen the constraint to admit it, and do not delete it.
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject;
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_editorial_has_no_reading;

-- ══════════════════════════════════════════════════════════════════════════
-- B · THE FOUR SUPPORTING UNIQUE TARGETS.
--
-- A composite FK requires its target columns to carry a unique constraint.
-- Three are trivial re-statements of existing keys; ⭐ the THIRD IS A REAL GAP.
-- ══════════════════════════════════════════════════════════════════════════

-- B1/B2/B3 target. Trivially satisfied (`id` is the PK) and it exists ONLY to
-- be an FK target. ⭐ Its power is what it lets a referencing row prove in ONE
-- constraint: *this thread, and this thread's chain.*
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ask_threads_id_chain_key') THEN
    ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_id_chain_key UNIQUE (id, proposal_chain_id);
  END IF;
END $$;

-- B9 turn half. The PK is (thread_id, turn_index); the TRIPLE is a new target,
-- and it is what lets a binding prove the turn really has the speaker it claims.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ask_turns_thread_index_speaker_key') THEN
    ALTER TABLE ask_turns ADD CONSTRAINT ask_turns_thread_index_speaker_key
      UNIQUE (thread_id, turn_index, speaker);
  END IF;
END $$;

-- ⭐ B4 · THE REAL GAP. `proposal_versions` carries UNIQUE (chain_id, id);
-- `proposal_chain_directions` carries NOTHING equivalent, so there is today no
-- way for ANY constraint to say "this Direction is in this chain."
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                  WHERE conname = 'proposal_chain_directions_chain_id_id_author_key') THEN
    ALTER TABLE proposal_chain_directions
      ADD CONSTRAINT proposal_chain_directions_chain_id_id_author_key
      UNIQUE (proposal_chain_id, id, author);
  END IF;
END $$;

-- B5 · the author column added to the existing pair. ⛔ The existing
-- UNIQUE (chain_id, id) STAYS — `proposal_versions_predecessor_same_chain`
-- targets it, and dropping it would break succession.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                  WHERE conname = 'proposal_versions_chain_id_id_author_key') THEN
    ALTER TABLE proposal_versions
      ADD CONSTRAINT proposal_versions_chain_id_id_author_key
      UNIQUE (chain_id, id, author);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════
-- C · THE BINDING. ⭐ ONE RELATION, NOT TWO.
--
-- Two tables cannot express "one turn carries at most one adjunct" at all — it
-- would become an application convention across them. One relation expresses it
-- as a PRIMARY KEY: there is nowhere to put a second row.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS editorial_turn_bindings (
  thread_id         uuid    NOT NULL,
  turn_index        integer NOT NULL,

  -- ⚠️ THREE DENORMALISED COLUMNS, AND THEY ARE NOT A CACHE.
  --
  -- This programme treats duplicated facts as drift waiting to happen. Three
  -- properties make these safe, and ALL THREE ARE REQUIRED:
  --   1. each copy is FK-VERIFIED against its source row at write time;
  --   2. the sources CANNOT CHANGE — ask_turns refuses UPDATE
  --      (ask_turns_append_only); directions and versions refuse UPDATE
  --      (authored_editorial_record_immutable); ask_threads freezes
  --      proposal_chain_id. There is no later edit to fall out of step with;
  --   3. the binding itself refuses UPDATE (below), so the copy cannot be
  --      changed after the FK proved it.
  --
  -- ⭐ They are the only way ORDINARY CONSTRAINTS can express a mapping between
  -- two vocabularies — and the result is stronger than a constraint trigger:
  -- B9 becomes UNREPRESENTABLE rather than rejected. ⛔ No trigger is needed
  -- and none should be added.
  turn_speaker      text    NOT NULL CHECK (turn_speaker IN ('author', 'maia')),
  proposal_chain_id uuid    NOT NULL,
  act_author        text    NOT NULL CHECK (act_author IN ('maia', 'member')),

  direction_id      uuid,
  version_id        uuid,

  -- ⭐ B6, as the PRIMARY KEY: one turn, at most one adjunct.
  PRIMARY KEY (thread_id, turn_index),

  -- B6 · exactly one adjunct, and never zero. A binding that binds nothing is
  -- not a binding.
  CONSTRAINT etb_one_adjunct CHECK (num_nonnulls(direction_id, version_id) = 1),

  -- ⭐⭐ B9 · THE VOCABULARY BRIDGE. `ask_turns.speaker` says author|maia;
  -- authored acts say member|maia. No FK can express a MAPPING — but a row
  -- carrying both columns can, and the FKs below prove each column against its
  -- own source row, so the PAIR cannot be a lie.
  CONSTRAINT etb_speaker_matches_author CHECK (
    (turn_speaker = 'author' AND act_author = 'member')
    OR (turn_speaker = 'maia' AND act_author = 'maia')
  ),

  -- ⭐ B1 + B2 + B3 IN ONE CONSTRAINT. The thread exists, its editorial parent
  -- is this chain, and — because this row's proposal_chain_id is NOT NULL while
  -- an ANCHORED thread's is NULL — the thread cannot be an anchored Ask thread.
  CONSTRAINT etb_thread_is_editorial
    FOREIGN KEY (thread_id, proposal_chain_id)
    REFERENCES ask_threads (id, proposal_chain_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B9 (turn half) · the turn exists in that thread AND really has this speaker.
  CONSTRAINT etb_turn
    FOREIGN KEY (thread_id, turn_index, turn_speaker)
    REFERENCES ask_turns (thread_id, turn_index, speaker)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B4 + B9 (act half). ⭐ MATCH SIMPLE is load-bearing: unchecked when
  -- direction_id is NULL, which is exactly what a version-bound turn requires.
  CONSTRAINT etb_direction
    FOREIGN KEY (proposal_chain_id, direction_id, act_author)
    REFERENCES proposal_chain_directions (proposal_chain_id, id, author)
    MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,

  -- B5 + B9 (act half).
  CONSTRAINT etb_version
    FOREIGN KEY (proposal_chain_id, version_id, act_author)
    REFERENCES proposal_versions (chain_id, id, author)
    MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- ⛔ NO CHRONOLOGY COLUMNS, and NO SURROGATE id. `(thread_id, turn_index)` is
-- the identity, and `turn_index` already answers *where in discourse the act
-- occurred*. A surrogate id is exactly the column a future reader sorts by, and
-- there is no global ordering across Insight, Direction, Version and discourse.

-- B7 · one Direction is claimed by at most one turn.
CREATE UNIQUE INDEX IF NOT EXISTS etb_one_turn_per_direction
  ON editorial_turn_bindings (direction_id) WHERE direction_id IS NOT NULL;

-- B8 · one Version is claimed by at most one turn.
CREATE UNIQUE INDEX IF NOT EXISTS etb_one_turn_per_version
  ON editorial_turn_bindings (version_id) WHERE version_id IS NOT NULL;

-- ⭐⭐ IMMUTABLE, AND DELIBERATELY NOT `authored_editorial_record_immutable()`.
--
-- ⛔ That function refuses UPDATE **and DELETE**, which is right for an authored
-- act and WRONG for a binding: withdrawal has to be able to remove one. Reusing
-- it because the name fits would make the withdrawal law unenforceable at the
-- exact seam that exists to carry it.
CREATE OR REPLACE FUNCTION editorial_turn_binding_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'editorial turn binding %/% is immutable: a correction is a new binding, never a revision of one already recorded',
    OLD.thread_id, OLD.turn_index;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS editorial_turn_bindings_no_update ON editorial_turn_bindings;
CREATE TRIGGER editorial_turn_bindings_no_update
  BEFORE UPDATE ON editorial_turn_bindings
  FOR EACH ROW EXECUTE FUNCTION editorial_turn_binding_immutable();

COMMENT ON TABLE editorial_turn_bindings IS
  'Which authored act a turn of editorial discourse carried. The binding references the act; the act references nothing — so withdrawing a conversation never erases an authored record, and an authored record never carries a mutable turn reference.';
COMMENT ON COLUMN editorial_turn_bindings.turn_speaker IS
  'FK-verified copy of ask_turns.speaker (author|maia). Exists so etb_speaker_matches_author can bridge to the acts vocabulary (member|maia); never read as a cache.';
COMMENT ON COLUMN editorial_turn_bindings.act_author IS
  'FK-verified copy of the authored act''s author (member|maia). The other half of the B9 bridge.';

COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- ROLLBACK — ⛔ RUN THIS FOOTER BEFORE 20260915000001's, never after.
--
-- BEGIN;
--   DROP TRIGGER IF EXISTS editorial_turn_bindings_no_update ON editorial_turn_bindings;
--   DROP TABLE IF EXISTS editorial_turn_bindings;
--   DROP FUNCTION IF EXISTS editorial_turn_binding_immutable();
--   ALTER TABLE proposal_versions
--     DROP CONSTRAINT IF EXISTS proposal_versions_chain_id_id_author_key;
--   ALTER TABLE proposal_chain_directions
--     DROP CONSTRAINT IF EXISTS proposal_chain_directions_chain_id_id_author_key;
--   ALTER TABLE ask_turns DROP CONSTRAINT IF EXISTS ask_turns_thread_index_speaker_key;
--   ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_id_chain_key;
--   ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_editorial_has_no_reading;
--   ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_one_subject;
--   -- ⭐⭐ THE ONE STEP THAT CAN FAIL, AND IT MUST BE ALLOWED TO:
--   ALTER TABLE ask_threads ALTER COLUMN anchor SET NOT NULL;
-- COMMIT;
--
-- ⭐⭐ `SET NOT NULL` FAILS IF ANY EDITORIAL THREAD EXISTS, because an editorial
-- thread's anchor is NULL. That is correct, and it is this design's most
-- important rollback property:
--
--     Rollback is clean while the refinement has been applied and NOT YET USED.
--     Once a writer has held one editorial conversation, rolling back is no
--     longer a schema operation — it is a decision about their record.
--
-- ⛔ THE ROLLBACK MUST NOT DELETE EDITORIAL THREADS TO MAKE ITSELF SUCCEED. If
-- SET NOT NULL fails, the correct outcome is that the rollback STOPS and the
-- founder rules on those rows. A rollback that quietly destroys a member's
-- conversation to restore a column constraint is the more destructive error —
-- the same reasoning as the 2026-09-07 "reconcile forward" ruling.
--
-- ⛔ W4 changes NO trigger body. Running this footer leaves the W5-3
-- ask_threads_freeze() in place, which is correct; W5-3's own footer restores
-- the pre-W5 body, and the two must not be run out of order.
-- ══════════════════════════════════════════════════════════════════════════
