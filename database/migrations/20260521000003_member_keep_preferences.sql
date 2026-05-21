-- Member Keep Preferences — the keep-offer governor's persisted state
--
-- Phase 1.5D of the Psyche Engagement Layer.
-- Governed by: docs/canon/THE_CLEARING.md
--              docs/canon/SPIRAL_CONTINUITY_ENGINE.md
--              docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
-- Spec: docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
--
-- Purpose:
--   Persisted state for the keep-offer governor. Survives sessions because
--   the member's response to being asked is itself a relational signal that
--   MAIA must honor across time.
--
-- Ethic:
--   This is not engagement optimization. This is respect memory.
--
--   - declined once       → cool down (runtime)
--   - declined repeatedly → raise threshold (persisted via decline_streak)
--   - "stop asking"       → pause (persisted)
--   - "you can ask again" → resume (persisted)
--   - accepted            → reset decline_streak
--
-- Session offer count is deliberately NOT persisted (lives in runtime state).
-- Only durable preference / decline posture lives here.

CREATE TABLE IF NOT EXISTS member_keep_preferences (
  member_id              UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,

  -- Pause state
  -- offers_paused=TRUE + offers_paused_until=NULL → indefinite pause
  -- offers_paused=TRUE + offers_paused_until=future → timed snooze
  -- offers_paused=FALSE → not paused
  offers_paused          BOOLEAN NOT NULL DEFAULT FALSE,
  offers_paused_until    TIMESTAMPTZ,

  -- Decline tracking
  -- decline_streak resets to 0 on accept.
  -- It feeds the threshold-rise rule in evaluateKeepOffer: after N declines,
  -- only the strongest salience signals (explicit_remember, explicit_matters)
  -- clear the higher bar.
  decline_streak         INTEGER NOT NULL DEFAULT 0 CHECK (decline_streak >= 0),
  total_declines         INTEGER NOT NULL DEFAULT 0 CHECK (total_declines >= 0),
  total_accepts          INTEGER NOT NULL DEFAULT 0 CHECK (total_accepts >= 0),

  -- Activity timestamps (informational; not used by the scorer directly)
  last_offer_at          TIMESTAMPTZ,
  last_decline_at        TIMESTAMPTZ,
  last_accept_at         TIMESTAMPTZ,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_member_keep_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_keep_preferences_updated_at ON member_keep_preferences;
CREATE TRIGGER trg_member_keep_preferences_updated_at
  BEFORE UPDATE ON member_keep_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_member_keep_preferences_updated_at();

-- Documentation
COMMENT ON TABLE member_keep_preferences IS
  'Persisted state for the keep-offer governor. Survives sessions because the member''s response to being asked is itself a relational signal that MAIA must honor across time. This is not engagement optimization — it is respect memory.';

COMMENT ON COLUMN member_keep_preferences.offers_paused IS
  'TRUE when the member has asked MAIA to stop offering keep prompts. Set by pauseOffers(), cleared by resumeOffers().';

COMMENT ON COLUMN member_keep_preferences.offers_paused_until IS
  'When NOT NULL and in the future, pause expires at this time (timed snooze). When NULL while paused, pause is indefinite. Member must explicitly resume.';

COMMENT ON COLUMN member_keep_preferences.decline_streak IS
  'Consecutive declines without an intervening accept. Feeds the threshold-rise rule: after N declines, only the strongest salience signals clear the bar. Resets to 0 on accept.';

COMMENT ON COLUMN member_keep_preferences.total_declines IS
  'Lifetime decline count. Informational. Does not affect threshold (only the streak does).';

COMMENT ON COLUMN member_keep_preferences.total_accepts IS
  'Lifetime accept count. Informational.';
