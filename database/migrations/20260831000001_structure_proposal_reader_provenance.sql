-- WS2-05B-5½ · REAL-STRUCTURE-READER-01 — who read it, frozen with the reading.
--
-- WHY THIS IS NOT OPTIONAL METADATA:
--
--   A proposal is a claim about a member's Work made by something that is not
--   the member. "What produced this reading" must be answerable from a ROW, not
--   from a recollection or from whatever the code happens to say today. Models
--   change, prompts change, and the reading in front of a member six months
--   from now was made by neither of the current ones.
--
--   Deriving provenance later describes the CURRENT reader - which is precisely
--   the reader you cannot trust it to have been. So it is captured at freeze
--   time and frozen by the same trigger that already protects the interpretation
--   it belongs to.
--
-- WHAT IT HOLDS, AND WHAT IT MUST NOT:
--
--   provider · model · promptHash · readerVersion · frozenAt
--
--   Attribution only. NOT the prompt payload, NOT the request, NOT excerpts,
--   NOT model scratch text. `promptHash` is a digest of the standing
--   instructions and the tool contract precisely so the instructions themselves
--   do not need to be stored here - a hash answers "was this the same reader"
--   without this table becoming an archive of anything the member wrote.
--
-- NULLABLE, deliberately. Proposals already stored were made by the fixture
-- readers of 05B-3 through 05B-5c, which had no model and no prompt. NULL means
-- "not machine-read", which is true of every row that exists today, and is not
-- the same claim as an empty object.
--
-- Additive. No existing row is read, moved or rewritten.
--
-- Authority: docs/design/writer-studio/WS2-05B_CHARTER + the 5½ ruling.

BEGIN;

ALTER TABLE manuscript_structure_proposals
  ADD COLUMN IF NOT EXISTS reader_provenance jsonb;

-- Frozen with the rest of the reading. An UPDATE that changes it aborts, for
-- the same reason the interpretation cannot be revised: a proposal whose
-- attribution can be rewritten is not evidence of who read the Work.
CREATE OR REPLACE FUNCTION manuscript_structure_proposals_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interpretation IS DISTINCT FROM OLD.interpretation
     OR NEW.evidence IS DISTINCT FROM OLD.evidence
     OR NEW.coverage IS DISTINCT FROM OLD.coverage
     OR NEW.section_topology_hash IS DISTINCT FROM OLD.section_topology_hash
     OR NEW.interpretation_input_hash IS DISTINCT FROM OLD.interpretation_input_hash
     OR NEW.reader_provenance IS DISTINCT FROM OLD.reader_provenance
     OR NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id THEN
    RAISE EXCEPTION
      'proposal % is immutable in evidence, interpretation, coverage, hashes and reader provenance: what the system proposed, and who proposed it, cannot be revised after the fact',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN manuscript_structure_proposals.reader_provenance IS
  'WS2-05B-5½. Attribution of the reading: provider, model, promptHash, readerVersion, frozenAt. IMMUTABLE by trigger. NULL means not machine-read. Never the prompt payload and never member prose.';

COMMIT;

-- ROLLBACK (manual):
--   The column is additive and read by nothing that describes the Work.
--   Dropping it discards attribution and touches no manuscript. The trigger
--   would need restoring to its 20260830000005 body first.
--
--   ALTER TABLE manuscript_structure_proposals DROP COLUMN IF EXISTS reader_provenance;
