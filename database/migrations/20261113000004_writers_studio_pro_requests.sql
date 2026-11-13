-- Writer's Studio — "Ask about Pro" (step C4). Built dark.
--
-- Founder ruling 2026-11-13 (docs/programme/WRITERS-STUDIO_FREE_STUDIO_STEP_C_DESIGN_2026-11-13.md §5.3):
--   an in-Studio request the founder answers personally; no price shown until checkout exists; no follow-up sequence.
-- Read and written only while WS_PRO_ASK_ENABLED = 'true'.
--
-- A request records only that this member asked, when, and an optional short note in their own words. It grants
-- nothing and triggers nothing automatic. At most one open request per member, so asking twice never piles up.
-- Erasing a member removes their requests with them (R20).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writers_studio_pro_requests (
  id          BIGSERIAL   PRIMARY KEY,
  member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  note        TEXT        CHECK (note IS NULL OR char_length(note) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ,
  answered_by UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_writers_studio_pro_requests_open
  ON writers_studio_pro_requests (member_id) WHERE answered_at IS NULL;

COMMENT ON TABLE writers_studio_pro_requests IS
  'Writer''s Studio "Ask about Pro" (founder ruling 2026-11-13): answered personally by the founder; grants nothing. Read only when WS_PRO_ASK_ENABLED=true.';

COMMIT;
