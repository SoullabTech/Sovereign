-- Member astrology consent column
--
-- Separates "did they decide?" from "did they provide data?".
-- Consent persists server-side so it survives localStorage clears and
-- cross-device sign-ins — a user who declines on one device should not
-- be asked again on another.
--
-- States:
--   'unknown'   → member has not yet seen the choice screen
--   'opted_in'  → member explicitly chose to add birth data
--   'declined'  → member explicitly chose not to add birth data
--
-- Design note:
--   The presence of birth_date != NULL implies opted_in, but we track
--   consent separately so the system knows whether to show the step
--   even before (or if) birth data is provided.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS astrology_consent VARCHAR(10)
    NOT NULL DEFAULT 'unknown'
    CHECK (astrology_consent IN ('unknown', 'opted_in', 'declined'));

-- Index for astrology-aware queries (personalised transit reports, etc.)
-- Excludes 'unknown' rows since they haven't provided data and can't be used.
CREATE INDEX IF NOT EXISTS idx_members_astrology_consent
  ON members(astrology_consent)
  WHERE astrology_consent != 'unknown';

COMMENT ON COLUMN members.astrology_consent IS
  'Astrology personalisation consent: unknown (not yet asked), opted_in (birth data welcome), declined (not wanted). Persisted server-side for cross-device continuity.';
