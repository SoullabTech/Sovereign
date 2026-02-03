-- Ask MAIA: Knowledge/Insight Feed for Consciousness, Psychology, Metaphysics, and Spirituality
-- Created: 2026-01-17

-- Ask MAIA Cards Table
CREATE TABLE IF NOT EXISTS ask_maia_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type VARCHAR(50) NOT NULL,           -- daily_transmission, concept, practice, archetype, deep_dive, contrast
  access_level VARCHAR(20) NOT NULL DEFAULT 'personal',  -- personal, practitioner, pro
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  content TEXT NOT NULL,
  source VARCHAR(255),                      -- Attribution (Obsidian, academic, etc.)
  source_url VARCHAR(500),
  tags TEXT[],
  read_time_minutes INTEGER DEFAULT 3,
  is_featured BOOLEAN DEFAULT false,
  is_daily BOOLEAN DEFAULT false,           -- For daily transmission
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_type ON ask_maia_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_level ON ask_maia_cards(access_level);
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_featured ON ask_maia_cards(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_daily ON ask_maia_cards(is_daily) WHERE is_daily = true;
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_published ON ask_maia_cards(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_tags ON ask_maia_cards USING GIN(tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_ask_maia_cards_fts ON ask_maia_cards
  USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, '')));

-- Updated trigger function
CREATE OR REPLACE FUNCTION update_ask_maia_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ask_maia_cards_updated_at ON ask_maia_cards;
CREATE TRIGGER ask_maia_cards_updated_at
  BEFORE UPDATE ON ask_maia_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_ask_maia_cards_updated_at();

-- Comments for documentation
COMMENT ON TABLE ask_maia_cards IS 'Knowledge cards for the Ask MAIA consciousness insight feed';
COMMENT ON COLUMN ask_maia_cards.card_type IS 'Type of card: daily_transmission, concept, practice, archetype, deep_dive, contrast';
COMMENT ON COLUMN ask_maia_cards.access_level IS 'Access tier required: personal (free), practitioner, pro';
COMMENT ON COLUMN ask_maia_cards.is_daily IS 'Whether this is the featured daily transmission';
