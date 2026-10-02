-- WRITERS-STUDIO-SMALL-BETA-01 / B3 — EXPLICIT BETA FEEDBACK
-- No passive telemetry. A row exists only because the member deliberately
-- named an experience in the beta feedback membrane.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_studio_beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  manuscript_id UUID REFERENCES member_manuscripts(id) ON DELETE SET NULL,
  signal TEXT NOT NULL CHECK (signal IN (
    'lost_thread',
    'maia_misunderstood',
    'too_much_too_quickly',
    'wanted_more_help',
    'felt_like_my_voice',
    'changed_how_i_see_work',
    'not_ready_to_decide',
    'something_else'
  )),
  studio_mode TEXT CHECK (studio_mode IN ('home','write','develop','review')),
  orientation_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  note TEXT CHECK (note IS NULL OR char_length(note) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(orientation_context) = 'object')
);

CREATE INDEX IF NOT EXISTS writer_studio_beta_feedback_member_idx
  ON writer_studio_beta_feedback (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS writer_studio_beta_feedback_signal_idx
  ON writer_studio_beta_feedback (signal, created_at DESC);

COMMENT ON TABLE writer_studio_beta_feedback IS
  'SMALL-BETA-01/B3: explicit writer-authored beta feedback only. No passive session, dwell, engagement, manuscript-body or behavioral telemetry.';
COMMENT ON COLUMN writer_studio_beta_feedback.orientation_context IS
  'Bounded navigation/orientation metadata only: route mode, field, movement, return source and section identifier. Never manuscript prose.';

COMMIT;
