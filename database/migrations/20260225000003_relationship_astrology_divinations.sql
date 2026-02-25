-- Migration: Relationship Astrology Snapshots + Divinations
-- Phase 3: Astrology panel, I Ching, Council for relationship hub

-- ─── Astrology snapshots (cached per relationship) ─────────

CREATE TABLE IF NOT EXISTS relationship_astrology_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES studio_relationships(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Natal chart (relationship person's chart)
  natal_chart JSONB,                -- Full BirthChart object
  natal_summary_json JSONB,         -- Condensed: sun/moon/rising + key houses + attachment signature

  -- Current transits to natal
  active_transits_json JSONB,       -- Top transits to personal points

  -- Synastry with practitioner (parent <-> child, etc.)
  synastry_result JSONB,            -- SynastryResult: aspects, highlights, scores
  synastry_narrative TEXT,           -- MAIA-generated 2-3 sentence relational signature

  -- Cache management
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rel_astro_relationship ON relationship_astrology_snapshots(relationship_id);
CREATE INDEX idx_rel_astro_expires ON relationship_astrology_snapshots(expires_at);

-- ─── Divinations (I Ching + Council for relationships) ─────

CREATE TABLE IF NOT EXISTS relationship_divinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES studio_relationships(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Type
  divination_type TEXT NOT NULL CHECK (divination_type IN ('iching', 'council')),

  -- Input context
  question TEXT,                     -- What they asked / framing
  context_json JSONB,                -- Recent check-ins, child state, etc.

  -- I Ching specific
  hexagram_number INTEGER,           -- 1-64
  hexagram_name TEXT,
  relating_hexagram_number INTEGER,  -- null if no changing lines
  changing_lines INTEGER[],          -- Positions (1-6)
  casting_method TEXT CHECK (casting_method IN ('yarrow', 'coin')),

  -- Results
  interpretation_json JSONB,         -- Hexagram data + MAIA interpretation
  council_result JSONB,              -- ConsultationResult from AIN

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rel_div_relationship ON relationship_divinations(relationship_id);
CREATE INDEX idx_rel_div_practitioner ON relationship_divinations(practitioner_id);
CREATE INDEX idx_rel_div_created ON relationship_divinations(created_at DESC);

-- ─── Auto-update triggers ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_relationship_astrology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rel_astro_updated
  BEFORE UPDATE ON relationship_astrology_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_relationship_astrology_updated_at();

CREATE TRIGGER trg_rel_div_updated
  BEFORE UPDATE ON relationship_divinations
  FOR EACH ROW EXECUTE FUNCTION update_relationship_astrology_updated_at();
