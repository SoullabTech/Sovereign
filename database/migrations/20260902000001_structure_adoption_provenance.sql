-- WS2-06A — provenance for structure the member authored from a reviewed reading.
--
-- WHAT THIS ANSWERS THAT THE 05A COLUMN CANNOT. `adopted_from_id` is a
-- self-reference on manuscript_structure_units, from a model in which proposals
-- lived in that same table as `origin = 'proposed'` rows. 05B put proposals in
-- their own table as JSONB instead, so a reviewed unit's id ('p1', 'p3') is
-- proposal-internal and is not a unit uuid. There is nothing for that column to
-- point at, and nothing writes `origin = 'proposed'`.
--
-- So per-unit descent is recorded as what it actually is: a pair naming the
-- proposal and the key of the reviewed unit inside it.
--
--     adopted_from_proposal_id     which reviewed reading
--     adopted_from_review_unit_key which unit within that reading
--
-- WHY BOTH, AND WHY PAIRED. Either alone is unusable — a proposal id without a
-- unit key cannot say which division descended from which, and a unit key
-- without a proposal id names nothing, because keys are only unique inside one
-- proposal. The CHECK makes half-populated provenance impossible rather than
-- merely discouraged.
--
-- WHY `NO ACTION`. Deleting a proposal that a member authored structure from
-- would silently strip the provenance off canonical rows. It is refused. The
-- proposal is the frozen record of what MAIA proposed and what the member
-- answered; it cannot outlive its own consequences by being deleted out from
-- under them. (`ON DELETE CASCADE` would be worse still: it would delete the
-- member's authored structure because a proposal was removed.)
--
-- WHY UNIQUE PER (proposal, unit_key). One reviewed unit becomes at most one
-- canonical unit. Two canonical rows claiming descent from the same reviewed
-- unit would make "which division is this one" unanswerable, and is the shape a
-- partial re-adoption would leave behind.
--
-- AUTHORSHIP IS UNCHANGED. Adopted rows are still written `origin = 'member'`.
-- The member reviewed a reading and performed the act that made it the Work's
-- structure; the rows record the member, and these two columns record what they
-- were answering. Provenance is not a claim that MAIA authored anything.
--
-- `adopted_from_id` IS DEPRECATED IN PLACE, NOT DROPPED.
-- `lib/manuscript/structure/canonicalFingerprint.ts` selects it, so the column
-- is part of every persisted canonical digest. Dropping it would change the
-- digest of Works that have not changed, and every stored fingerprint taken
-- before this migration would stop matching. A deprecated column that costs one
-- NULL per row is cheaper than invalidating the record of what was already
-- proven. It keeps its FK and stays unwritten.
--
-- Additive: no existing row is read, moved or rewritten. Nothing has adopted a
-- proposal, so every existing row satisfies the new constraints with NULLs.
--
-- Adversarial evidence (not authority): the abandoned-model reading of
-- `adopted_from_id` is pinned in
-- docs/programme/WS2-06A_PUSHED_BRANCH_ADVERSARIAL_REVIEW_2026-09-02.md §3 S1.
-- That document is an acceptance instrument; the representation below is the
-- ratified 6A design.

BEGIN;

ALTER TABLE manuscript_structure_units
  ADD COLUMN IF NOT EXISTS adopted_from_proposal_id uuid
    REFERENCES manuscript_structure_proposals(id) ON DELETE NO ACTION,
  ADD COLUMN IF NOT EXISTS adopted_from_review_unit_key text;

-- Blank is not a key. Without this, '' would satisfy the pairing CHECK and
-- record provenance that names nothing.
ALTER TABLE manuscript_structure_units
  DROP CONSTRAINT IF EXISTS manuscript_structure_units_review_unit_key_nonblank;
ALTER TABLE manuscript_structure_units
  ADD CONSTRAINT manuscript_structure_units_review_unit_key_nonblank
  CHECK (adopted_from_review_unit_key IS NULL
         OR length(trim(adopted_from_review_unit_key)) > 0);

-- Both, or neither.
ALTER TABLE manuscript_structure_units
  DROP CONSTRAINT IF EXISTS manuscript_structure_units_adoption_provenance_paired;
ALTER TABLE manuscript_structure_units
  ADD CONSTRAINT manuscript_structure_units_adoption_provenance_paired
  CHECK ((adopted_from_proposal_id IS NULL) = (adopted_from_review_unit_key IS NULL));

-- One reviewed unit descends to at most one canonical unit. Partial index: rows
-- with no provenance are unconstrained, and NULLs would otherwise be distinct.
CREATE UNIQUE INDEX IF NOT EXISTS idx_manuscript_structure_units_review_descent
  ON manuscript_structure_units(adopted_from_proposal_id, adopted_from_review_unit_key)
  WHERE adopted_from_proposal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_manuscript_structure_units_adopted_proposal
  ON manuscript_structure_units(adopted_from_proposal_id)
  WHERE adopted_from_proposal_id IS NOT NULL;

COMMENT ON COLUMN manuscript_structure_units.adopted_from_proposal_id IS
  'WS2-06A. The reviewed reading this division was authored from. Paired with adopted_from_review_unit_key. NO ACTION: a proposal cannot be deleted out from under structure a member authored from it.';
COMMENT ON COLUMN manuscript_structure_units.adopted_from_review_unit_key IS
  'WS2-06A. The reviewed unit''s key within that proposal (proposal-internal, e.g. ''p3''), never a unit uuid.';
COMMENT ON COLUMN manuscript_structure_units.adopted_from_id IS
  'DEPRECATED (WS2-06A). From the abandoned model in which proposals were ''proposed'' rows in this table. Nothing writes it. Retained, not dropped: canonicalFingerprint.ts selects it, so removing it would change the digest of unchanged Works and invalidate every fingerprint taken before 2026-09-02. Use adopted_from_proposal_id + adopted_from_review_unit_key.';

COMMIT;

-- ROLLBACK (manual):
--   DROP INDEX IF EXISTS idx_manuscript_structure_units_review_descent;
--   DROP INDEX IF EXISTS idx_manuscript_structure_units_adopted_proposal;
--   ALTER TABLE manuscript_structure_units
--     DROP CONSTRAINT IF EXISTS manuscript_structure_units_adoption_provenance_paired,
--     DROP CONSTRAINT IF EXISTS manuscript_structure_units_review_unit_key_nonblank,
--     DROP COLUMN IF EXISTS adopted_from_review_unit_key,
--     DROP COLUMN IF EXISTS adopted_from_proposal_id;
