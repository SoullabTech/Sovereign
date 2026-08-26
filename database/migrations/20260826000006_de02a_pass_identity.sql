-- DE-02A — bind a finding to the pass that produced it.
--
-- DE-02 carried findings across readings by asking "which prior findings used
-- this lens?" and then re-locating their quotes in the current manuscript.
-- Both halves were too loose:
--
--   · The prior-findings read filtered by lens and NOT by segment, so a
--     Threads finding from chapter 9 was in scope while advancing chapter 2.
--   · Its quote still exists somewhere in the book, so it re-located
--     successfully and was carried into the wrong pass. Lineage crossed a
--     segment boundary and the finding appeared twice.
--
-- The repair is identity, not a better query. A finding belongs to the PASS
-- that produced it; a current pass names the exact prior pass it continues;
-- carrying reads that pass and nothing else. There is no inference left to get
-- wrong.
--
-- One-to-one is enforced in the planner rather than here, because "at most one
-- current pass may consume a given prior pass" is a statement about a plan and
-- a unique index would also forbid the legitimate case of re-planning after a
-- failed review. A book that repeats a section verbatim has two segments with
-- the same hash; without one-to-one they would both carry the same findings,
-- and the duplicate would read as corroboration.
--
-- ROLLBACK:
--   ALTER TABLE developmental_findings DROP COLUMN IF EXISTS review_pass_id;
--   ALTER TABLE developmental_review_passes DROP COLUMN IF EXISTS supersedes_pass_id;

ALTER TABLE developmental_review_passes
  -- The exact pass in the superseded reading that this one continues.
  ADD COLUMN IF NOT EXISTS supersedes_pass_id UUID
    REFERENCES developmental_review_passes(id) ON DELETE SET NULL;

ALTER TABLE developmental_findings
  -- Which pass produced this. Nullable only because DE-01/DE-02 rows predate
  -- the column; every row written from here on carries it.
  ADD COLUMN IF NOT EXISTS review_pass_id UUID
    REFERENCES developmental_review_passes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS developmental_findings_pass_idx
  ON developmental_findings (review_pass_id);

COMMENT ON COLUMN developmental_findings.review_pass_id IS
  'The pass that produced this finding. Carrying a finding into a later '
  'reading reads by this id and nothing else, so a finding can never cross a '
  'segment boundary on the strength of a quote that happens to appear '
  'elsewhere in the manuscript.';
