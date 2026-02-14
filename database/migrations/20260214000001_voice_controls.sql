-- Voice Controls: Global MAIA norm + member voice preferences
-- Member-adjustable faders that gently bias MAIA's baseline.
-- MAIA can still self-regulate during HOLD states.
--
-- Control stack: Norm -> Member Offsets -> Conductor -> Clamp/Hysteresis -> TTS
-- Sovereignty note: these are preferences (not psychological scoring),
-- so they're safe to persist and member-editable.

BEGIN;

-- ===================================================================
-- 1) Global MAIA voice norm (singleton row)
-- ===================================================================
-- The "house voice" — baseline cadence, warmth, directness, poetic density.

CREATE TABLE IF NOT EXISTS system_voice_profile (
  id                    TEXT PRIMARY KEY DEFAULT 'maia_default',
  voice_id              TEXT NOT NULL DEFAULT 'maia',
  pace_base             DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  warmth_base           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  poetry_base           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  directiveness_base    DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  energy_base           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by            UUID NULL REFERENCES members(id) ON DELETE SET NULL,

  CONSTRAINT system_voice_profile_singleton CHECK (id = 'maia_default'),
  CONSTRAINT system_voice_profile_pace_base CHECK (pace_base BETWEEN -1 AND 1),
  CONSTRAINT system_voice_profile_warmth_base CHECK (warmth_base BETWEEN -1 AND 1),
  CONSTRAINT system_voice_profile_poetry_base CHECK (poetry_base BETWEEN -1 AND 1),
  CONSTRAINT system_voice_profile_directiveness_base CHECK (directiveness_base BETWEEN -1 AND 1),
  CONSTRAINT system_voice_profile_energy_base CHECK (energy_base BETWEEN -1 AND 1)
);

-- Ensure singleton row exists
INSERT INTO system_voice_profile (id)
VALUES ('maia_default')
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 2) Member voice preferences (offsets from MAIA norm)
-- ===================================================================
-- Bounded to [-0.30, 0.30] so members can't break MAIA's identity.

CREATE TABLE IF NOT EXISTS member_voice_preferences (
  member_id               UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  voice_id_override       TEXT NULL,
  pace_offset             DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  warmth_offset           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  poetry_offset           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  directiveness_offset    DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  energy_offset           DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT member_voice_pref_pace CHECK (pace_offset BETWEEN -0.30 AND 0.30),
  CONSTRAINT member_voice_pref_warmth CHECK (warmth_offset BETWEEN -0.30 AND 0.30),
  CONSTRAINT member_voice_pref_poetry CHECK (poetry_offset BETWEEN -0.30 AND 0.30),
  CONSTRAINT member_voice_pref_directiveness CHECK (directiveness_offset BETWEEN -0.30 AND 0.30),
  CONSTRAINT member_voice_pref_energy CHECK (energy_offset BETWEEN -0.30 AND 0.30)
);

-- ===================================================================
-- 3) Auto-update triggers
-- ===================================================================

-- Reuse touch_updated_at if it already exists (from spiral state migration),
-- otherwise create it
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_system_voice_profile ON system_voice_profile;
CREATE TRIGGER trg_touch_system_voice_profile
  BEFORE UPDATE ON system_voice_profile
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_member_voice_preferences ON member_voice_preferences;
CREATE TRIGGER trg_touch_member_voice_preferences
  BEFORE UPDATE ON member_voice_preferences
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

COMMIT;
