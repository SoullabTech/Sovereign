-- Writer's Studio MAIA reading allowance — usage record, step M1 (shadow). Built dark.
--
-- Founder rulings, 2026-11-13 (recorded on #1800; design docs/programme/WRITERS-STUDIO_MAIA_READING_ALLOWANCE_DESIGN_2026-11-13.md):
--   * Free never limits Works or words; MAIA's readings are metered instead;
--   * the allowance counts the amount MAIA reads (words, measured from input tokens);
--   * Free and Pro amounts are set by the founder after a shadow period of real usage.
-- Nothing writes this table unless WS_MAIA_METER_MODE is 'shadow'. Nothing refuses anything in M1.
--
-- ⛔ CONTENT-FREE BY CONSTRUCTION. A row says only: which member, which kind of MAIA reading, when, how many tokens,
-- which model. There is no column for text, prompt, question, Work, manuscript, section or lens — nothing a row could
-- reveal about what was written. Sanctuary turns are never written (enforced by the writer in lib/writersStudio/maiaMeter.ts).
-- Erasing a member removes their rows with them (R20).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writers_studio_maia_usage (
  id             BIGSERIAL   PRIMARY KEY,
  member_id      UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  act            TEXT        NOT NULL CHECK (act ~ '^[a-z][a-z0-9_]{0,39}$'),
  input_tokens   INTEGER     NOT NULL CHECK (input_tokens >= 0),
  output_tokens  INTEGER     NOT NULL CHECK (output_tokens >= 0),
  model          TEXT        NOT NULL CHECK (char_length(model) BETWEEN 1 AND 100),
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly totals per member.
CREATE INDEX IF NOT EXISTS idx_writers_studio_maia_usage_member_time
  ON writers_studio_maia_usage (member_id, occurred_at DESC);

COMMIT;
