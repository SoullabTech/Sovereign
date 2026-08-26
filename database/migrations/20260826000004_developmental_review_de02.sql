-- DE-02 — reading again, and knowing how this reading relates to the last.
--
-- Additive to DE-01. Its snapshot, pass, evidence and disposition machinery is
-- unchanged: this adds lineage, incremental reuse, and the record of what MAIA
-- has noticed across readings.
--
-- ── THE ONE RULE THIS SCHEMA EXISTS TO ENFORCE ────────────────────────────
--
-- "No longer observed" is NOT "resolved".
--
-- A finding that does not reappear may have been addressed, may have moved,
-- or may simply not have been noticed this time. Only the writer resolves a
-- finding. So the fact that a reading stopped seeing something is recorded in
-- its OWN columns, next to the disposition and never inside it — and there is
-- deliberately no trigger, default or backfill that moves one to the other.
-- The distinction is the whole point of having both.
--
-- ── LINEAGE IS A FACT ABOUT READINGS ──────────────────────────────────────
--
--   newly_observed   nothing in the previous reading matches it
--   persists         the same thing said the same way
--   changed          the same thing, said differently
--
-- None of these is a judgement about the Work, and none of them ranks
-- anything. A finding that persists across four readings is not thereby more
-- important; it is more persistent, which is a different fact.
--
-- ROLLBACK:
--   ALTER TABLE developmental_review_passes
--     DROP COLUMN IF EXISTS segment_hash, DROP COLUMN IF EXISTS reused_from_pass_id;
--   ALTER TABLE developmental_findings
--     DROP COLUMN IF EXISTS lineage, DROP COLUMN IF EXISTS ancestor_finding_id,
--     DROP COLUMN IF EXISTS no_longer_observed_at,
--     DROP COLUMN IF EXISTS no_longer_observed_in_review_id,
--     DROP COLUMN IF EXISTS carried;
--   ALTER TABLE developmental_reviews
--     DROP COLUMN IF EXISTS supersedes_review_id, DROP COLUMN IF EXISTS reused_pass_count;

ALTER TABLE developmental_reviews
  -- The reading this one continues from. NULL for a first reading.
  ADD COLUMN IF NOT EXISTS supersedes_review_id UUID
    REFERENCES developmental_reviews(id) ON DELETE SET NULL,
  -- How many passes were carried rather than re-read. A fact the room can
  -- state plainly: "MAIA re-read 2 of 11 parts."
  ADD COLUMN IF NOT EXISTS reused_pass_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE developmental_review_passes
  -- Identity of the text this pass read, independent of where it sat. Reuse is
  -- matched on THIS, never on segment_index: inserting a paragraph in chapter
  -- 2 shifts every later index, and matching on position would invalidate the
  -- whole book to re-read one chapter.
  ADD COLUMN IF NOT EXISTS segment_hash TEXT,
  ADD COLUMN IF NOT EXISTS reused_from_pass_id UUID
    REFERENCES developmental_review_passes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS developmental_passes_hash_idx
  ON developmental_review_passes (review_id, lens, segment_hash);

ALTER TABLE developmental_findings
  ADD COLUMN IF NOT EXISTS lineage TEXT NOT NULL DEFAULT 'newly_observed'
    CHECK (lineage IN ('newly_observed', 'persists', 'changed')),
  -- The finding in the previous reading this one continues. Kept as a chain
  -- rather than collapsed, so "what did MAIA notice about this, and when"
  -- is answerable across months.
  ADD COLUMN IF NOT EXISTS ancestor_finding_id UUID
    REFERENCES developmental_findings(id) ON DELETE SET NULL,
  -- Carried forward from a reused pass rather than re-read this time. The
  -- evidence offsets were still re-located against this review's snapshot —
  -- carried never means stale.
  ADD COLUMN IF NOT EXISTS carried BOOLEAN NOT NULL DEFAULT FALSE,

  -- ⛔ These two are the ones that must never touch `disposition`.
  ADD COLUMN IF NOT EXISTS no_longer_observed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_longer_observed_in_review_id UUID
    REFERENCES developmental_reviews(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS developmental_findings_lineage_idx
  ON developmental_findings (review_id, lineage);

COMMENT ON COLUMN developmental_findings.no_longer_observed_at IS
  'When a later reading stopped seeing this finding. This is NOT resolution: '
  'the finding may have been addressed, may have moved, or may simply not have '
  'been noticed. Only the writer resolves a finding, via disposition, and '
  'nothing in the review pipeline may write disposition.';

COMMENT ON COLUMN developmental_findings.lineage IS
  'How this finding relates to the previous reading. A fact about readings, '
  'never a judgement about the Work and never a ranking.';
