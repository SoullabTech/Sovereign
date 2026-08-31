-- WS2-05B step 3 - proposal persistence.
--
-- CONSTITUTIONAL POSITION:
--
--   - A PROPOSAL IS NOT STRUCTURE. Nothing here is read by the outline, the
--     renderer, or anything that describes the Work. These rows exist so a
--     member can review a reading before deciding whether it is their book.
--     Until adoption, a manuscript with a proposal has exactly the same
--     structure as one without: none of it.
--
--   - `interpretation` IS IMMUTABLE, AND THE DATABASE ENFORCES IT. It is the
--     record of what the system proposed. A proposal whose original can be
--     revised is not evidence of anything, and the first time a member says
--     "that is not what MAIA suggested" the answer has to be a row rather than
--     a recollection. `evidence`, `coverage` and both hashes are frozen with it:
--     they are the inputs that reading was made from.
--
--   - `reviewed` IS THE MEMBER'S. It begins as a copy of the interpretation's
--     units and diverges as they correct it. THE DIFFERENCE BETWEEN THE TWO IS
--     THE MEMBER'S AUTHORSHIP, and keeping both is what makes that answerable
--     six months later.
--
--   - NO MEMBER PROSE. Bodies MAIA was given are NOT stored here, nor excerpts,
--     nor prompt payloads, nor model scratch text. The bodies remain where they
--     already live. What persists is MAIA's account ABOUT the Work, plus
--     headings that already exist in manuscript_sections, plus ids and counts.
--     A second copy of a member's writing is exactly what this table must not
--     become.
--
--   - TWO HASHES, TWO DIFFERENT CONSEQUENCES.
--       section_topology_hash      the ordered stable section ids. A HARD gate:
--                                  if the writable pieces or their order have
--                                  changed, the proposal is no longer about
--                                  this book and adoption is refused.
--       interpretation_input_hash  the headings plus exactly the bodies that
--                                  were read. A SOFT signal: the proposal still
--                                  applies, but something it rests on has been
--                                  rewritten, and the member is told rather
--                                  than left to assume.
--
-- Additive. No existing row is read, moved or rewritten.
--
-- Authority: docs/design/writer-studio/WS2-05B_MODEL.md

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_structure_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Frozen at creation. See the immutability trigger below.
  evidence jsonb NOT NULL,
  interpretation jsonb NOT NULL,
  coverage jsonb NOT NULL,
  section_topology_hash text NOT NULL CHECK (length(section_topology_hash) > 0),
  interpretation_input_hash text NOT NULL CHECK (length(interpretation_input_hash) > 0),

  -- The member's. Mutated only by review operations.
  reviewed jsonb NOT NULL,
  review_revision integer NOT NULL DEFAULT 0 CHECK (review_revision >= 0),
  reviewed_at timestamptz,

  -- Set once, at adoption.
  adopted_at timestamptz,
  adopted_review_revision integer,

  -- Adoption records WHICH revision was authored, so "what did they accept"
  -- is answerable without replaying the edit history.
  CONSTRAINT manuscript_structure_proposals_adoption_complete
    CHECK ((adopted_at IS NULL) = (adopted_review_revision IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_manuscript_structure_proposals_manuscript
  ON manuscript_structure_proposals(manuscript_id, created_at DESC);

-- Only one adopted proposal per manuscript. A second adoption is a REPLACEMENT
-- of authored structure, which the model names as the sharpest danger in this
-- unit and does not yet design. Until it does, the database refuses it.
CREATE UNIQUE INDEX IF NOT EXISTS idx_manuscript_structure_proposals_one_adopted
  ON manuscript_structure_proposals(manuscript_id)
  WHERE adopted_at IS NOT NULL;

-- The immutable half, enforced.
--
-- Not a convention and not a code comment: an UPDATE that changes any frozen
-- column aborts. The audit distinction this protects is the whole reason both
-- copies are kept.
CREATE OR REPLACE FUNCTION manuscript_structure_proposals_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interpretation IS DISTINCT FROM OLD.interpretation
     OR NEW.evidence IS DISTINCT FROM OLD.evidence
     OR NEW.coverage IS DISTINCT FROM OLD.coverage
     OR NEW.section_topology_hash IS DISTINCT FROM OLD.section_topology_hash
     OR NEW.interpretation_input_hash IS DISTINCT FROM OLD.interpretation_input_hash
     OR NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id THEN
    RAISE EXCEPTION
      'proposal % is immutable in evidence, interpretation, coverage and hashes: what the system proposed cannot be revised after the fact',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_structure_proposals_freeze_check
  ON manuscript_structure_proposals;
CREATE TRIGGER manuscript_structure_proposals_freeze_check
  BEFORE UPDATE ON manuscript_structure_proposals
  FOR EACH ROW EXECUTE FUNCTION manuscript_structure_proposals_freeze();

COMMENT ON TABLE manuscript_structure_proposals IS
  'WS2-05B. A reading of a Work, held for review. Not structure: nothing describes the manuscript until adoption writes ordinary manuscript_structure_units.';
COMMENT ON COLUMN manuscript_structure_proposals.interpretation IS
  'What the system proposed. IMMUTABLE by trigger - the difference between this and `reviewed` is the member''s authorship.';
COMMENT ON COLUMN manuscript_structure_proposals.reviewed IS
  'What the member has shaped. Begins as a copy of the interpretation''s units.';
COMMENT ON COLUMN manuscript_structure_proposals.section_topology_hash IS
  'Ordered stable section ids. HARD gate: a changed topology refuses adoption.';
COMMENT ON COLUMN manuscript_structure_proposals.interpretation_input_hash IS
  'Headings plus exactly the bodies read. SOFT signal: stale-as-read, surfaced to the member.';

COMMIT;

-- ROLLBACK (manual):
--   The table is referenced by nothing and holds no member prose. Dropping it
--   discards proposals and touches no manuscript.
--
--   DROP TRIGGER IF EXISTS manuscript_structure_proposals_freeze_check ON manuscript_structure_proposals;
--   DROP FUNCTION IF EXISTS manuscript_structure_proposals_freeze();
--   DROP TABLE IF EXISTS manuscript_structure_proposals;
