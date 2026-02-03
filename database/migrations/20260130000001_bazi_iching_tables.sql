-- ═══════════════════════════════════════════════════════════════════════════════
-- BAZI & I CHING INTEGRATION TABLES
-- Stores member Four Pillars profiles and I Ching reading history
-- ═══════════════════════════════════════════════════════════════════════════════

-- Member BaZi (Four Pillars) Profile
-- Stores computed Chinese astrology profile from birth data
CREATE TABLE IF NOT EXISTS member_bazi_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Birth data (source)
  birth_datetime_utc TIMESTAMPTZ NOT NULL,
  birth_timezone TEXT NOT NULL,
  location_text TEXT,

  -- Four Pillars (computed)
  -- Each pillar is a Heavenly Stem + Earthly Branch pair
  pillars_json JSONB NOT NULL,
  -- Example: {
  --   "year": { "stem": "Jia", "branch": "Zi" },
  --   "month": { "stem": "Bing", "branch": "Yin" },
  --   "day": { "stem": "Geng", "branch": "Wu" },
  --   "hour": { "stem": "Ren", "branch": "Shen" }
  -- }

  -- Day Master (the "self" element)
  day_master TEXT NOT NULL,
  day_master_element TEXT NOT NULL CHECK (day_master_element IN ('wood', 'fire', 'earth', 'metal', 'water')),
  day_master_yinyang TEXT NOT NULL CHECK (day_master_yinyang IN ('yin', 'yang')),

  -- Element balance (computed from all pillars)
  wuxing_balance_json JSONB NOT NULL,
  -- Example: { "wood": 2, "fire": 3, "earth": 1, "metal": 2, "water": 0 }

  wuxing_percentages_json JSONB NOT NULL,
  -- Example: { "wood": 25, "fire": 37.5, "earth": 12.5, "metal": 25, "water": 0 }

  dominant_elements TEXT[] NOT NULL DEFAULT '{}',
  deficient_elements TEXT[] NOT NULL DEFAULT '{}',
  balance_score INTEGER NOT NULL DEFAULT 50 CHECK (balance_score >= 0 AND balance_score <= 100),

  -- Ten Gods (optional advanced analysis)
  ten_gods_json JSONB,

  -- Luck Cycles (optional - 10-year cycles)
  luck_cycles_json JSONB,

  -- Metadata
  computation_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_bazi UNIQUE (user_id)
);

-- Index for looking up member's profile
CREATE INDEX IF NOT EXISTS idx_bazi_user_id ON member_bazi_profile(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bazi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bazi_updated_at ON member_bazi_profile;
CREATE TRIGGER trigger_bazi_updated_at
  BEFORE UPDATE ON member_bazi_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_bazi_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- I CHING READINGS TABLE
-- Stores all I Ching divination sessions for audit and pattern tracking
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS divination_iching_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Casting method
  cast_method TEXT NOT NULL CHECK (cast_method IN ('coins', 'yarrow', 'rng', 'manual')),

  -- Question asked (if any)
  question TEXT,

  -- Primary hexagram (1-64)
  primary_hex INTEGER NOT NULL CHECK (primary_hex >= 1 AND primary_hex <= 64),
  primary_hex_name TEXT NOT NULL,

  -- Line values (bottom to top, 6=old yin, 7=young yang, 8=young yin, 9=old yang)
  line_values INTEGER[] NOT NULL CHECK (array_length(line_values, 1) = 6),

  -- Changing lines (1-indexed positions where transformation occurs)
  changing_lines INTEGER[] NOT NULL DEFAULT '{}',

  -- Relating (transformed) hexagram (if there are changing lines)
  relating_hex INTEGER CHECK (relating_hex >= 1 AND relating_hex <= 64),
  relating_hex_name TEXT,

  -- Trigram breakdown
  lower_trigram TEXT NOT NULL,
  upper_trigram TEXT NOT NULL,

  -- Wu Xing influence tags (computed from trigrams)
  wuxing_influence_json JSONB NOT NULL DEFAULT '{}',
  -- Example: { "fire": 2, "water": 1, "metal": 0, "wood": 1, "earth": 0 }

  -- Interpretation keywords/themes
  theme_keywords TEXT[] NOT NULL DEFAULT '{}',

  -- Full interpretation (if generated)
  interpretation_text TEXT,
  guidance_text TEXT,

  -- Context metadata
  metadata_json JSONB NOT NULL DEFAULT '{}',
  -- Can include: spiral_phase, nervous_system, session_context, etc.

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_iching_user_id ON divination_iching_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_iching_created_at ON divination_iching_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iching_primary_hex ON divination_iching_readings(primary_hex);
CREATE INDEX IF NOT EXISTS idx_iching_user_recent ON divination_iching_readings(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- HEXAGRAM REFERENCE TABLE (static data)
-- All 64 hexagrams with their properties
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS iching_hexagrams (
  number INTEGER PRIMARY KEY CHECK (number >= 1 AND number <= 64),
  name TEXT NOT NULL,
  chinese_name TEXT NOT NULL,

  -- Binary representation (bottom to top, 0=yin, 1=yang)
  binary_code TEXT NOT NULL CHECK (length(binary_code) = 6),

  -- Trigrams
  lower_trigram TEXT NOT NULL,
  upper_trigram TEXT NOT NULL,

  -- Elements
  primary_element TEXT NOT NULL CHECK (primary_element IN ('wood', 'fire', 'earth', 'metal', 'water')),
  secondary_element TEXT CHECK (secondary_element IN ('wood', 'fire', 'earth', 'metal', 'water')),

  -- Keywords and themes
  keyword TEXT NOT NULL,
  judgment TEXT NOT NULL,
  image TEXT NOT NULL,

  -- King Wen sequence position (for ordering)
  king_wen_sequence INTEGER NOT NULL CHECK (king_wen_sequence >= 1 AND king_wen_sequence <= 64),

  -- Opposite hexagram (binary inversion)
  opposite_hex INTEGER CHECK (opposite_hex >= 1 AND opposite_hex <= 64),

  -- Inverse hexagram (upside down)
  inverse_hex INTEGER CHECK (inverse_hex >= 1 AND inverse_hex <= 64),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE member_bazi_profile IS 'Stores computed Four Pillars (BaZi) Chinese astrology profiles for members';
COMMENT ON TABLE divination_iching_readings IS 'Audit log of all I Ching readings cast by members';
COMMENT ON TABLE iching_hexagrams IS 'Reference table for all 64 I Ching hexagrams';

COMMENT ON COLUMN member_bazi_profile.day_master IS 'The Heavenly Stem of the day pillar - represents the "self" in BaZi';
COMMENT ON COLUMN member_bazi_profile.wuxing_balance_json IS 'Raw count of each element across all eight characters (4 stems + 4 branches)';
COMMENT ON COLUMN member_bazi_profile.balance_score IS 'Overall balance score 0-100, where higher = more evenly distributed elements';

COMMENT ON COLUMN divination_iching_readings.line_values IS 'Six line values bottom-to-top: 6=old yin (changing), 7=young yang, 8=young yin, 9=old yang (changing)';
COMMENT ON COLUMN divination_iching_readings.changing_lines IS 'Positions (1-6) where lines change, enabling transformation to relating hexagram';
COMMENT ON COLUMN divination_iching_readings.wuxing_influence_json IS 'Wu Xing element weights computed from trigram pair for Spiral Core integration';
