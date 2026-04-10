-- Founder Pattern Reviews — private founder annotation layer
--
-- Holds a single founder's verdict and note for one row in
-- relationship_entry_patterns. Founder-private. Not exposed to MAIA,
-- not joined into any context block, not surfaced to members.
--
-- This table sits on top of the observation layer shipped in
-- 20260409000001_relationship_entry_patterns.sql. It does NOT modify
-- the detector and does NOT feed back into pattern detection. It is
-- purely an interpretive layer for the founder review surface at
-- /founder/relational-patterns.
--
-- Verdict vocabulary (closed set, semantically distinct):
--   valid           — pattern was correctly detected (accuracy)
--   false_positive  — pattern was incorrectly detected (accuracy)
--   unclear         — evidence insufficient to judge (epistemic)
--   needs_followup  — review later, not finalized (process)

CREATE TABLE IF NOT EXISTS founder_pattern_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES relationship_entry_patterns(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('valid', 'false_positive', 'unclear', 'needs_followup')),
  note TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pattern_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_founder_pattern_reviews_pattern
  ON founder_pattern_reviews(pattern_id);

CREATE INDEX IF NOT EXISTS idx_founder_pattern_reviews_reviewer
  ON founder_pattern_reviews(reviewer_id, reviewed_at DESC);
