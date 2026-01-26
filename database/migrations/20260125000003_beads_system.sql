-- Beads System: Memory Atoms for Across-Time Pattern Recognition
-- A bead is a compressed state-token - not the story, but the signature

-- Main beads table
CREATE TABLE IF NOT EXISTS beads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Core identity
  code TEXT NOT NULL,           -- e.g., "W2-grief-relational"
  label TEXT NOT NULL,          -- Human-readable: "Grief purge in relational field"

  -- Spiralogic position
  element TEXT NOT NULL CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  facet TEXT CHECK (facet IN ('F1', 'F2', 'F3', 'W1', 'W2', 'W3', 'E1', 'E2', 'E3', 'A1', 'A2', 'A3')),

  -- Characteristics
  polarity TEXT DEFAULT 'neutral' CHECK (polarity IN ('descent', 'ascent', 'shadow', 'gift', 'neutral')),
  signal_type TEXT CHECK (signal_type IN ('emotional', 'somatic', 'cognitive', 'relational', 'imaginal')),
  intensity_band TEXT CHECK (intensity_band IN ('low', 'medium', 'high', 'peak')),

  -- Spiral context
  spiral_scale TEXT CHECK (spiral_scale IN ('micro', 'meso', 'macro', 'collective')),
  spiral_id TEXT,               -- Which named spiral (Living, Twin, Vocation, etc.)

  -- Learning stats
  activation_count INT DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_activated TIMESTAMPTZ DEFAULT NOW(),
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),

  -- What resolves/triggers this bead (stored as JSONB arrays)
  triggers JSONB DEFAULT '[]',      -- conditions that activate
  resolvers JSONB DEFAULT '[]',     -- what helps integrate
  typical_followers JSONB DEFAULT '[]', -- beads that tend to come next

  -- Embedding for semantic matching (optional, for future RAG integration)
  bead_embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, code)
);

-- Bead activations (links beads to entries/sources)
CREATE TABLE IF NOT EXISTS bead_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bead_id UUID NOT NULL REFERENCES beads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Source entry
  source_type TEXT NOT NULL CHECK (source_type IN ('journal', 'capture', 'conversation', 'episode', 'elemental_journal')),
  source_id TEXT NOT NULL,

  -- Context at activation
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  intensity FLOAT CHECK (intensity >= 0 AND intensity <= 1),
  user_confirmed BOOLEAN,       -- NULL=not asked, true/false=user response

  -- What else was active (co-activation pattern)
  co_activated_beads UUID[],

  -- Sanctuary check (no write if source was sanctuary)
  is_sanctuary BOOLEAN DEFAULT FALSE,

  UNIQUE(bead_id, source_type, source_id)
);

-- Indexes for beads table
CREATE INDEX IF NOT EXISTS idx_beads_user_id ON beads(user_id);
CREATE INDEX IF NOT EXISTS idx_beads_user_element ON beads(user_id, element);
CREATE INDEX IF NOT EXISTS idx_beads_user_facet ON beads(user_id, facet);
CREATE INDEX IF NOT EXISTS idx_beads_last_activated ON beads(user_id, last_activated DESC);
CREATE INDEX IF NOT EXISTS idx_beads_code ON beads(code);
CREATE INDEX IF NOT EXISTS idx_beads_activation_count ON beads(user_id, activation_count DESC);

-- Indexes for bead_activations table
CREATE INDEX IF NOT EXISTS idx_bead_activations_bead ON bead_activations(bead_id);
CREATE INDEX IF NOT EXISTS idx_bead_activations_source ON bead_activations(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_bead_activations_time ON bead_activations(user_id, activated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bead_activations_user ON bead_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_bead_activations_confirmed ON bead_activations(user_id, user_confirmed)
  WHERE user_confirmed IS NOT NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON beads TO soullab;
GRANT SELECT, INSERT, UPDATE ON bead_activations TO soullab;

-- Comments
COMMENT ON TABLE beads IS 'Memory atoms - compressed state-tokens carrying meaning across time';
COMMENT ON COLUMN beads.code IS 'Unique identifier like "W2-grief-relational" for this bead pattern';
COMMENT ON COLUMN beads.facet IS 'Spiralogic facet (F1-F3, W1-W3, E1-E3, A1-A3) or NULL for pure elemental';
COMMENT ON COLUMN beads.polarity IS 'Whether this bead represents descent, ascent, shadow, gift, or neutral state';
COMMENT ON COLUMN beads.typical_followers IS 'Beads that tend to follow this one - learned over time';
COMMENT ON TABLE bead_activations IS 'Records when beads are activated by entries, enabling pattern learning';
