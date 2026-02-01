-- ═══════════════════════════════════════════════════════════════════════════════
-- DIVINATION READINGS TABLES
-- Unified storage for all divination readings (I Ching, Tarot, Runes)
-- Allows members to optionally save readings for reflection
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- TAROT READINGS TABLE
-- Stores saved Tarot card readings
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS divination_tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Question asked (if any)
  question TEXT,

  -- Spread type used
  spread_type TEXT NOT NULL CHECK (spread_type IN ('single', 'three_card', 'celtic_cross', 'horseshoe', 'custom')),

  -- Cards drawn (array of card objects)
  -- Example: [{ "position": "past", "card": "The Fool", "reversed": false, "number": 0 }]
  cards_json JSONB NOT NULL,

  -- Overall interpretation and guidance
  interpretation_text TEXT,
  guidance_text TEXT,

  -- Archetypal themes detected
  archetypal_themes TEXT[] NOT NULL DEFAULT '{}',

  -- Sacred timing insight
  sacred_timing TEXT,

  -- Integration ritual suggestion
  ritual_suggestion TEXT,

  -- Member notes (for personal reflection)
  member_notes TEXT,

  -- Metadata (spiral phase, context, etc.)
  metadata_json JSONB NOT NULL DEFAULT '{}',

  -- Favorite/archive flags
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Tarot readings
CREATE INDEX IF NOT EXISTS idx_tarot_user_id ON divination_tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_created_at ON divination_tarot_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarot_user_recent ON divination_tarot_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarot_favorite ON divination_tarot_readings(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tarot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tarot_updated_at ON divination_tarot_readings;
CREATE TRIGGER trigger_tarot_updated_at
  BEFORE UPDATE ON divination_tarot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_tarot_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- RUNES READINGS TABLE
-- Stores saved Elder Futhark rune readings
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS divination_runes_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Question asked (if any)
  question TEXT,

  -- Cast type used
  cast_type TEXT NOT NULL CHECK (cast_type IN ('single', 'three_norns', 'nine_worlds', 'custom')),

  -- Runes drawn (array of rune objects)
  -- Example: [{ "position": "past", "rune": "Fehu", "reversed": false, "element": "fire" }]
  runes_json JSONB NOT NULL,

  -- Wyrd message (fate/destiny insight)
  wyrd_message TEXT,

  -- Overall interpretation and guidance
  interpretation_text TEXT,
  guidance_text TEXT,

  -- Archetypal themes detected
  archetypal_themes TEXT[] NOT NULL DEFAULT '{}',

  -- Sacred timing insight
  sacred_timing TEXT,

  -- Integration ritual suggestion
  ritual_suggestion TEXT,

  -- Member notes (for personal reflection)
  member_notes TEXT,

  -- Metadata (spiral phase, context, etc.)
  metadata_json JSONB NOT NULL DEFAULT '{}',

  -- Favorite/archive flags
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Runes readings
CREATE INDEX IF NOT EXISTS idx_runes_user_id ON divination_runes_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_runes_created_at ON divination_runes_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runes_user_recent ON divination_runes_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runes_favorite ON divination_runes_readings(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_runes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_runes_updated_at ON divination_runes_readings;
CREATE TRIGGER trigger_runes_updated_at
  BEFORE UPDATE ON divination_runes_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_runes_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- EXTEND EXISTING I CHING TABLE
-- Add columns for member notes, favorites, and archive status
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE divination_iching_readings
  ADD COLUMN IF NOT EXISTS member_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Trigger to update updated_at for I Ching
CREATE OR REPLACE FUNCTION update_iching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_iching_updated_at ON divination_iching_readings;
CREATE TRIGGER trigger_iching_updated_at
  BEFORE UPDATE ON divination_iching_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_iching_updated_at();

-- Index for favorites
CREATE INDEX IF NOT EXISTS idx_iching_favorite ON divination_iching_readings(user_id, is_favorite) WHERE is_favorite = TRUE;


-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE divination_tarot_readings IS 'Saved Tarot card readings for member reflection';
COMMENT ON TABLE divination_runes_readings IS 'Saved Elder Futhark rune readings for member reflection';

COMMENT ON COLUMN divination_tarot_readings.member_notes IS 'Personal reflections added by the member after the reading';
COMMENT ON COLUMN divination_tarot_readings.is_favorite IS 'Flag for readings marked as important by the member';
COMMENT ON COLUMN divination_tarot_readings.is_archived IS 'Flag for readings hidden from main view but not deleted';

COMMENT ON COLUMN divination_runes_readings.wyrd_message IS 'The fate/destiny message from the rune cast';
COMMENT ON COLUMN divination_runes_readings.member_notes IS 'Personal reflections added by the member after the reading';
