-- Soul Portrait — practitioner review-feedback instrumentation (Stage 1 pilot).
--
-- Captures structured practitioner feedback during a review session (the Larry
-- pilot): Keep / Change / Remove / Missing, six workflow scores, and the single
-- "one thing to change next" prioritization. This is the PRACTITIONER'S evaluation
-- of the WORKFLOW — not client data, not a portrait's content.
--
-- ADDITIVE · idempotent · self-protecting. Review/pilot instrumentation; held on a
-- review branch, not deployed. Reviewer-scoped (a reviewer reads only their own rows
-- via the API). portrait_id is optional context (which draft prompted the feedback).

CREATE TABLE IF NOT EXISTS soul_portrait_review_feedback (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_member_id UUID NOT NULL,
  -- Optional: the draft under review when the feedback was recorded. SET NULL on delete
  -- so feedback survives a draft being removed.
  portrait_id        UUID REFERENCES soul_portraits(id) ON DELETE SET NULL,
  keep               TEXT,
  change             TEXT,
  remove             TEXT,
  missing            TEXT,
  -- {clarity, professionalFit, trust, recognitionQuality, stewardshipValue, likelihoodOfUse} 1..5
  scores             JSONB NOT NULL DEFAULT '{}'::jsonb,
  top_priority       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sp_review_feedback_reviewer
  ON soul_portrait_review_feedback (reviewer_member_id, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_name = 'soul_portrait_review_feedback') THEN
    RAISE EXCEPTION 'review-feedback table did not land';
  END IF;
  RAISE NOTICE 'soul_portrait_review_feedback ready (pilot instrumentation)';
END $$;
