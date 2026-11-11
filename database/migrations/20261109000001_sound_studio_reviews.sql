-- LISTEN-01 · Sound Studio review conversation, phase 1 (founder rulings 2026-11-09: build phase 1; hybrid guide).
--
-- A row exists only because a named beta reviewer deliberately confirmed it at the end of a review conversation.
-- No passive telemetry: no listening, dwell, skip or session tracking. Follows the explicit-feedback precedent of
-- writer_studio_beta_feedback (20260929000005).
--
-- lines       the reviewer-confirmed summary lines, each { kind: observation|experience|suggestion, text }
-- transcript  the raw conversation, stored ONLY when the reviewer chose to keep it; otherwise NULL
-- origin      review_guide (phase 1); maia_bridge is reserved for phase 2 and is not written by phase 1 code
--
-- Reviewer-deletable. Deleting the member deletes their reviews.
-- ⛔ Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive only.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS sound_studio_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  work_id         TEXT NOT NULL CHECK (work_id ~ '^[a-z0-9][a-z0-9.-]{0,79}$'),
  passage_label   TEXT CHECK (passage_label IS NULL OR length(passage_label) <= 120),
  elapsed_ms      INTEGER CHECK (elapsed_ms IS NULL OR elapsed_ms BETWEEN 0 AND 86400000),
  lines           JSONB NOT NULL CHECK (jsonb_typeof(lines) = 'array'
                    AND jsonb_array_length(lines) BETWEEN 1 AND 12),
  transcript      JSONB CHECK (transcript IS NULL OR (jsonb_typeof(transcript) = 'array'
                    AND jsonb_array_length(transcript) <= 40)),
  consent_version TEXT NOT NULL CHECK (length(consent_version) BETWEEN 1 AND 80),
  origin          TEXT NOT NULL DEFAULT 'review_guide' CHECK (origin IN ('review_guide', 'maia_bridge')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sound_studio_reviews_member_idx ON sound_studio_reviews (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sound_studio_reviews_work_idx ON sound_studio_reviews (work_id, created_at DESC);

COMMENT ON TABLE sound_studio_reviews IS
  'LISTEN-01 phase 1: reviewer-confirmed Sound Studio review lines only. No passive telemetry. Never read by MAIA memory.';
COMMENT ON COLUMN sound_studio_reviews.transcript IS
  'Raw review conversation, present only when the reviewer explicitly chose to keep it.';

COMMIT;
