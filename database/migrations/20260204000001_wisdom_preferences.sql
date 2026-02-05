-- Wisdom Translation Preferences
-- Stores member preferences for wisdom systems and cultural context

-- Add wisdom preference columns to member_settings
ALTER TABLE member_settings
  ADD COLUMN IF NOT EXISTS wisdom_systems TEXT[] DEFAULT ARRAY['astrology', 'psychology'],
  ADD COLUMN IF NOT EXISTS cultural_lens VARCHAR(50) DEFAULT 'western-esoteric';

-- Comments for documentation
COMMENT ON COLUMN member_settings.wisdom_systems IS 'Array of preferred wisdom system IDs: astrology, alchemy, psychology, spiral, somatic, mythology, energy, archetypal';
COMMENT ON COLUMN member_settings.cultural_lens IS 'Cultural context preference: western-esoteric, vedic, east-asian, african-diasporic, indigenous-american, celtic-norse, sufi, kabbalistic';
