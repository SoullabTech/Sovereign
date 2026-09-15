-- W4-S2 · VALIDATION + THE TURN ↔ AUTHORED-ACT BINDING.
--
-- Governed by docs/programme/WS-EDITORIAL-WORKSPACE-01_W4-2_SCHEMA_DESIGN_2026-09-14.md
--   reconciled carrier  b52807fa
--   lawful shape        §10 · lock strategy §11 + §32 · preflight §53.4
--
-- ⛔⛔ PRECONDITION — A BOUNDED PREFLIGHT, NOT AN EXPECTATION.
--
--   "No backfill required" ≠ "existing rows satisfy the new constraint."
--
-- ⛔ This file MUST NOT be executed against a protected database expecting the
-- VALIDATE to succeed. Existing protected rows remain UNPROVED until the
-- preflight named in §53.4 establishes that they satisfy the XOR. No production
-- runtime currently writes `proposal_chain_id`, so no RUNTIME-CREATED violating
-- row is known — ⛔ which is not the same as no row.
--
-- ⭐ If VALIDATE refuses, that is a FINDING, NOT AN OBSTACLE: a row carrying
-- both subjects means something wrote one. ⛔ The migration STOPS. It does not
-- repair the row, and it does not drop the constraint to proceed. W4-S1 stays
-- ledgered and applied; this file stays un-ledgered and retryable once the row
-- has been ruled on.
--
-- ⚠️ LOCK STRATEGY — OPTION A, AND THE RULING IS DATED (§32). The ordinary
-- unique build was earned against sizes read on 2026-09-15 (the two live
-- targets at 8 kB and 24 kB of heap; an ACCESS EXCLUSIVE build over that is a
-- blip). ⛔ If the succession lane lands and data accumulates before this file
-- is authorized, RE-RUN THE PREFLIGHT — the ruling is earned by a measurement,
-- not by the shape of the tables. ⛔ Option B (CREATE UNIQUE INDEX CONCURRENTLY)
-- is NOT used: no precedent in this repository, an INVALID-index recovery path
-- to own, and structural incompatibility with `run-sql-migrations.sh`, which
-- force-wraps every file in a transaction.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A · VALIDATION. The scan runs here, under SHARE UPDATE EXCLUSIVE, because
--     W4-S1's ACCESS EXCLUSIVE was released at ITS commit — in a different
--     transaction, in a different file, with its own ledger row.
--
--     ⛔ The VALIDATE is not optional. A constraint left NOT VALID is enforced
--     for new rows and SILENTLY UNENFORCED as an invariant over the existing
--     ones — the shape of a guarantee that reads true and is not.
--     ⭐ VALIDATE on an already-validated constraint is a no-op, so this is
--     idempotent as written.
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject;
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_editorial_has_no_reading;

-- ══════════════════════════════════════════════════════════════════════════
-- B · FK TARGETS — four supporting UNIQUE keys. Three restate keys that exist
--     in substance; ⭐ the third is a GENUINE ABSENCE.
-- ══════════════════════════════════════════════════════════════════════════

DO $w4s2$
BEGIN
  -- Trivially satisfied (id is the PK); it exists ONLY to be an FK target, and
  -- its power is what one constraint then proves: this thread, AND this
  -- thread's chain. ⛔ It does not constrain threads-per-chain.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'ask_threads_id_chain_key'
                   AND conrelid = 'ask_threads'::regclass) THEN
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_id_chain_key UNIQUE (id, proposal_chain_id);
  END IF;

  -- The turn half of the vocabulary bridge. PK is (thread_id, turn_index);
  -- the triple is a new target.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'ask_turns_thread_index_speaker_key'
                   AND conrelid = 'ask_turns'::regclass) THEN
    ALTER TABLE ask_turns
      ADD CONSTRAINT ask_turns_thread_index_speaker_key
      UNIQUE (thread_id, turn_index, speaker);
  END IF;

  -- ⭐ THE REAL GAP. proposal_versions carries UNIQUE (chain_id, id);
  -- proposal_chain_directions carried NOTHING equivalent, so before this line
  -- no constraint anywhere could say "this Direction is in this chain".
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'proposal_chain_directions_chain_id_id_author_key'
                   AND conrelid = 'proposal_chain_directions'::regclass) THEN
    ALTER TABLE proposal_chain_directions
      ADD CONSTRAINT proposal_chain_directions_chain_id_id_author_key
      UNIQUE (proposal_chain_id, id, author);
  END IF;

  -- ⛔ The existing UNIQUE (chain_id, id) STAYS — the predecessor-same-chain FK
  -- targets it, and dropping it would break succession.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'proposal_versions_chain_id_id_author_key'
                   AND conrelid = 'proposal_versions'::regclass) THEN
    ALTER TABLE proposal_versions
      ADD CONSTRAINT proposal_versions_chain_id_id_author_key
      UNIQUE (chain_id, id, author);
  END IF;
END
$w4s2$;

-- ══════════════════════════════════════════════════════════════════════════
-- C · THE BINDING. One relation, not two — because the cross-kind law is
--     "one turn may carry at most one semantic adjunct", and two tables cannot
--     express that law at all; it would become an application convention
--     across them. One relation expresses it as a PRIMARY KEY.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS editorial_turn_bindings (
  -- ⭐ B6, as the PRIMARY KEY: one turn, at most one adjunct. There is nowhere
  -- to put a second row.
  thread_id         uuid    NOT NULL,
  turn_index        integer NOT NULL,

  -- ⭐ Denormalised so the composite FKs below can prove B2/B3/B9. Admissible
  -- ONLY because all three hold: each copy is FK-verified against its source
  -- row at write time; every source refuses UPDATE or is frozen; and this row
  -- refuses UPDATE too. Not a cache — the only way ordinary constraints can
  -- express a MAPPING between two vocabularies.
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
  -- own source row, so the pair cannot be a lie. ⭐ Stronger than a constraint
  -- trigger: B9 becomes UNREPRESENTABLE rather than rejected.
  CONSTRAINT etb_speaker_matches_author CHECK (
    (turn_speaker = 'author' AND act_author = 'member')
    OR (turn_speaker = 'maia' AND act_author = 'maia')
  ),

  -- B1 + B2 + B3 in ONE constraint. The thread exists, its editorial parent is
  -- this chain, and — because this row's proposal_chain_id is NOT NULL while an
  -- anchored thread's is NULL — the thread cannot be an anchored Ask thread.
  -- ⭐ That inference is exactly what W4-S1's XOR, validated above, licenses.
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
CREATE UNIQUE INDEX IF NOT EXISTS etb_one_turn_per_direction
  ON editorial_turn_bindings (direction_id) WHERE direction_id IS NOT NULL;

-- B8 · one Version is claimed by at most one turn.
CREATE UNIQUE INDEX IF NOT EXISTS etb_one_turn_per_version
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

-- ⛔ NO STORE, NO ROUTE, NO RUNTIME accompanies this. After it the schema knows
-- WHICH TURN PERFORMED WHICH AUTHORED ACT; nothing in the product creates that
-- row yet.

COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- ROLLBACK — W4-S2
--
-- ⛔⛔ ORDER: THIS FOOTER RUNS FIRST, before W4-S1's, before W5-3's.
--
--   W4-S2  →  W4-S1  →  W5-3
--
-- ⭐ The order is forced, not stylistic: this footer drops the binding, whose
-- FKs target constraints that W4-S1's footer removes; W4-S1's footer restores
-- `anchor SET NOT NULL`, which cannot succeed while editorial threads exist;
-- and W5-3's footer drops `proposal_chain_directions`, which THIS table
-- references. Run out of order, each step is refused by the next one's objects.
--
-- ⛔ Dropping the binding DESTROYS the record of which turn performed which
-- authored act. The authored acts themselves survive — no FK points from them
-- at this table — but the attribution does not. That is a decision about a
-- writer's record, not a schema operation, once any binding exists.
--
-- ⭐ VALIDATION IS NOT ROLLED BACK HERE. Leaving both CHECKs validated is
-- correct: they constrain rows this file never created, and un-validating them
-- would restore the silent-unenforcement state for no gain. W4-S1's footer
-- drops the constraints outright.
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
-- COMMIT;
