-- W4-2 — THREAD SUBJECT, AND THE TURN ↔ AUTHORED-ACT BINDING.
--
-- ⭐⭐ THE BAR (design record, §0):
--   A binding must not merely preserve a claimed relationship; the database
--   must make the WRONG TURN, WRONG CHAIN, WRONG ACT and WRONG AUTHOR
--   UNREPRESENTABLE.
--
-- Governed by docs/programme/WS-EDITORIAL-WORKSPACE-01_W4-2_SCHEMA_DESIGN_2026-09-14.md
--   design authority   f210df118
--   custody ruling     911efbbb   (§8 — base lock, fixture custody)
--
-- ⛔ NO STORE, NO ROUTE, NO RUNTIME accompanies this, exactly as W5-3 carried
-- none. After it the schema knows WHICH TURN PERFORMED WHICH AUTHORED ACT;
-- nothing in the product creates that row yet.
--
-- ⚠️ TWO TRANSACTIONS, DELIBERATELY. See part D: a VALIDATE in the same
-- transaction as its ADD ... NOT VALID would hold ACCESS EXCLUSIVE for the
-- length of the scan, which is the precise cost the split exists to avoid.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A · THREAD SUBJECT — exactly one, and never a reading as well.
-- ══════════════════════════════════════════════════════════════════════════

-- ⛔ NO BACKFILL. A historical thread's absent proposal_chain_id is the
-- evidence that it predates the editorial object. Nothing here invents a
-- subject for a row that has one already.
ALTER TABLE ask_threads ALTER COLUMN anchor DROP NOT NULL;

-- The XOR. An anchored Ask thread carries an anchor; an editorial thread
-- carries a chain; neither carries both, and nothing carries neither.
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_one_subject
  CHECK (num_nonnulls(anchor, proposal_chain_id) = 1) NOT VALID;

-- ⭐ An editorial thread is not ALSO frozen against a reading. reading_identity
-- exists so a proposal-dependent anchor can be checked against the reading it
-- points into; an editorial thread has no anchor and points into neither. A
-- thread carrying both would assert it was about a frozen reading it never
-- addressed.
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_editorial_has_no_reading
  CHECK (proposal_chain_id IS NULL OR reading_identity IS NULL) NOT VALID;

-- ⭐ canonical_at_open is UNTOUCHED and stays its own fact. It is the BEFORE of
-- the conversation's own before/after assertion. ⛔ It does not become
-- proposal_chains.base_version — two different moments, and collapsing them
-- would make the thread's baseline a copy of a fact it does not own.

-- ⭐ The freeze needs NO change: W5-3 already added proposal_chain_id to
-- ask_threads_freeze(), and anchor was already frozen — so a thread cannot
-- acquire an anchor later and break the XOR by mutation.

-- ══════════════════════════════════════════════════════════════════════════
-- B · FK TARGETS. A composite FK requires a unique constraint on its target
--     columns. Three of these restate keys that already exist in substance;
--     ⭐ the third is a GENUINE ABSENCE.
-- ══════════════════════════════════════════════════════════════════════════

-- Trivially satisfied (id is the PK). It exists ONLY to be an FK target, and
-- its power is what one constraint then proves: this thread, AND this thread's
-- chain. ⛔ It does not constrain threads-per-chain — id is already unique, so
-- many threads may still belong to one chain (W5-3 · A8).
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_id_chain_key UNIQUE (id, proposal_chain_id);

-- The turn half of the vocabulary bridge. PK is (thread_id, turn_index); the
-- triple is a new target.
ALTER TABLE ask_turns
  ADD CONSTRAINT ask_turns_thread_index_speaker_key
  UNIQUE (thread_id, turn_index, speaker);

-- ⭐ THE REAL GAP. proposal_versions carries UNIQUE (chain_id, id);
-- proposal_chain_directions carried NOTHING equivalent, so before this line
-- there was no way for ANY constraint to say "this Direction is in this chain".
ALTER TABLE proposal_chain_directions
  ADD CONSTRAINT proposal_chain_directions_chain_id_id_author_key
  UNIQUE (proposal_chain_id, id, author);

-- ⛔ The existing UNIQUE (chain_id, id) STAYS — proposal_versions'
-- predecessor-same-chain FK targets it, and dropping it would break succession.
ALTER TABLE proposal_versions
  ADD CONSTRAINT proposal_versions_chain_id_id_author_key
  UNIQUE (chain_id, id, author);

-- ══════════════════════════════════════════════════════════════════════════
-- C · THE BINDING. One relation, not two — because the cross-kind law is
--     "one turn may carry at most one semantic adjunct", and two tables
--     cannot express that law at all; it would become an application
--     convention across them. One relation expresses it as a PRIMARY KEY.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE editorial_turn_bindings (
  -- ⭐ B6, as the PRIMARY KEY: one turn, at most one adjunct. Not a CHECK
  -- across two tables; not a convention. There is nowhere to put a second row.
  thread_id         uuid    NOT NULL,
  turn_index        integer NOT NULL,

  -- ⭐ Denormalised so the composite FKs below can prove B2/B3/B9. Admissible
  -- ONLY because all three hold: each copy is FK-verified against its source
  -- row at write time; every source refuses UPDATE or is frozen; and this row
  -- refuses UPDATE too. They are not a cache — they are the only way ordinary
  -- constraints can express a MAPPING between two vocabularies.
  turn_speaker      text    NOT NULL CHECK (turn_speaker IN ('author', 'maia')),
  proposal_chain_id uuid    NOT NULL,
  act_author        text    NOT NULL CHECK (act_author IN ('maia', 'member')),

  direction_id      uuid,
  version_id        uuid,

  PRIMARY KEY (thread_id, turn_index),

  -- B6 · exactly one adjunct, and never zero.
  CONSTRAINT etb_one_adjunct CHECK (num_nonnulls(direction_id, version_id) = 1),

  -- ⭐⭐ B9 · THE VOCABULARY BRIDGE. ask_turns.speaker says author|maia;
  -- authored acts say member|maia. No FK can express a MAPPING — but a row
  -- carrying both columns can, and the FKs below prove each column against its
  -- own source row, so the pair cannot be a lie. ⭐ The result is stronger than
  -- a constraint trigger: B9 becomes UNREPRESENTABLE rather than rejected.
  CONSTRAINT etb_speaker_matches_author CHECK (
    (turn_speaker = 'author' AND act_author = 'member')
    OR (turn_speaker = 'maia' AND act_author = 'maia')
  ),

  -- B1 + B2 + B3 in ONE constraint. The thread exists, its editorial parent is
  -- this chain, and — because this row's proposal_chain_id is NOT NULL while an
  -- anchored thread's is NULL — the thread cannot be an anchored Ask thread.
  CONSTRAINT etb_thread_is_editorial
    FOREIGN KEY (thread_id, proposal_chain_id)
    REFERENCES ask_threads (id, proposal_chain_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B9 (turn half) · the turn exists in that thread AND really has this speaker.
  CONSTRAINT etb_turn
    FOREIGN KEY (thread_id, turn_index, turn_speaker)
    REFERENCES ask_turns (thread_id, turn_index, speaker)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B4 + B9 (act half). MATCH SIMPLE: unchecked when direction_id is NULL.
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

-- B7 · one Direction is claimed by at most one turn.
CREATE UNIQUE INDEX etb_one_turn_per_direction
  ON editorial_turn_bindings (direction_id) WHERE direction_id IS NOT NULL;

-- B8 · one Version is claimed by at most one turn.
CREATE UNIQUE INDEX etb_one_turn_per_version
  ON editorial_turn_bindings (version_id) WHERE version_id IS NOT NULL;

-- ⛔ NO CHRONOLOGY COLUMNS, and NO SURROGATE id. (thread_id, turn_index) is the
-- identity, and turn_index already answers WHERE IN DISCOURSE the act occurred.
-- A surrogate id would be exactly the column a future reader sorts by, creating
-- a global ordering across Insight, Direction, Version and conversation that
-- this design refuses to imply.

-- ⛔ authored_editorial_record_immutable() is NOT reused. It refuses UPDATE AND
-- DELETE, which is right for an authored act and WRONG for a binding:
-- withdrawal has to be able to remove one. Reusing it because the name fits
-- would make the withdrawal law unenforceable at the exact seam that carries it.
CREATE OR REPLACE FUNCTION editorial_turn_binding_immutable()
RETURNS TRIGGER AS $fn$
BEGIN
  RAISE EXCEPTION
    'editorial turn binding %/% is immutable: a correction is a new binding, never a revision of one already recorded',
    OLD.thread_id, OLD.turn_index;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS editorial_turn_bindings_no_update ON editorial_turn_bindings;
CREATE TRIGGER editorial_turn_bindings_no_update
  BEFORE UPDATE ON editorial_turn_bindings
  FOR EACH ROW EXECUTE FUNCTION editorial_turn_binding_immutable();

COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- D · VALIDATE — ⚠️ ITS OWN TRANSACTION, AND THAT IS THE WHOLE POINT.
--
-- ADD CONSTRAINT ... NOT VALID takes ACCESS EXCLUSIVE briefly and does not
-- scan. VALIDATE scans, under only SHARE UPDATE EXCLUSIVE. ⛔ Run inside the
-- transaction above, the ADD's ACCESS EXCLUSIVE would still be held while the
-- scan ran — the weaker lock would be written down and not obtained.
--
-- ⛔ AND THE VALIDATE IS NOT OPTIONAL: a constraint left NOT VALID is enforced
-- for new rows and SILENTLY UNENFORCED as an invariant over the existing ones —
-- the shape of a guarantee that reads true and is not.
--
-- ⭐ Every existing row is expected to satisfy it: anchor was NOT NULL until
-- part A, and proposal_chain_id has no backfill. ⛔ If a VALIDATE below FAILS,
-- that is a FINDING, NOT AN OBSTACLE — a row carrying both subjects means
-- something wrote one. The migration must STOP and the row be adjudicated.
-- ⛔ Do not repair it here, and do not drop the constraint to proceed.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject;
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_editorial_has_no_reading;
COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- ROLLBACK
--
-- ⭐⭐ SET NOT NULL FAILS IF ANY EDITORIAL THREAD EXISTS, and it must be allowed
-- to. Rollback is clean while this refinement has been applied and NOT YET
-- USED. Once a writer has held one editorial conversation, rolling back is no
-- longer a schema operation — it is a decision about their record.
--
-- ⛔ THE ROLLBACK MUST NOT DELETE EDITORIAL THREADS TO MAKE ITSELF SUCCEED. If
-- SET NOT NULL fails, the correct outcome is that the rollback STOPS and the
-- founder rules on those rows. Destroying a member's conversation to restore a
-- column constraint is the more destructive error — the same reasoning as the
-- 2026-09-07 "reconcile forward" ruling.
--
-- ⛔ Read together with W5-3's rollback footer, which restores the PRE-W5
-- ask_threads_freeze(). Running THIS rollback alone leaves the W5-3 freeze in
-- place, which is correct — ⛔ but the two footers must not be run out of order.
--
-- BEGIN;
--   DROP TRIGGER IF EXISTS editorial_turn_bindings_no_update ON editorial_turn_bindings;
--   DROP TABLE IF EXISTS editorial_turn_bindings;
--   DROP FUNCTION IF EXISTS editorial_turn_binding_immutable();
--
--   ALTER TABLE proposal_versions
--     DROP CONSTRAINT IF EXISTS proposal_versions_chain_id_id_author_key;
--   ALTER TABLE proposal_chain_directions
--     DROP CONSTRAINT IF EXISTS proposal_chain_directions_chain_id_id_author_key;
--   ALTER TABLE ask_turns
--     DROP CONSTRAINT IF EXISTS ask_turns_thread_index_speaker_key;
--   ALTER TABLE ask_threads
--     DROP CONSTRAINT IF EXISTS ask_threads_id_chain_key;
--
--   ALTER TABLE ask_threads
--     DROP CONSTRAINT IF EXISTS ask_threads_editorial_has_no_reading;
--   ALTER TABLE ask_threads
--     DROP CONSTRAINT IF EXISTS ask_threads_one_subject;
--
--   -- ⭐⭐ THE ONE STEP THAT CAN FAIL, AND IT MUST BE ALLOWED TO.
--   ALTER TABLE ask_threads ALTER COLUMN anchor SET NOT NULL;
-- COMMIT;
