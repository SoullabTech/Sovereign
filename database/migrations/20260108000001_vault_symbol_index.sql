-- Vault Symbol Index: MAIA's Image-Based Memory
--
-- This schema enables MAIA to remember "where meaning lives" rather than
-- re-scanning the vault every time. Based on the insight that human memory
-- works through images and associations, not keyword retrieval.
--
-- Three tables:
--   1. vault_symbols - Core mnemonic anchors (spiral, threshold, mirror, etc.)
--   2. vault_symbol_links - Symbol → file/heading mappings with learned weights
--   3. vault_query_patterns - Question pattern → symbol associations
--
-- Learning signal comes from RCN's provenance + confidence + not_verified

-- 1) Core images / mnemonic anchors
CREATE TABLE IF NOT EXISTS vault_symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- 'spiral', 'threshold', etc.
  title TEXT NOT NULL,                 -- Human-friendly label
  description TEXT,                    -- What this image represents
  elemental_affinity TEXT,             -- Optional: fire/water/earth/air/aether
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Links from symbol -> vault target (file + optional heading)
CREATE TABLE IF NOT EXISTS vault_symbol_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id UUID NOT NULL REFERENCES vault_symbols(id) ON DELETE CASCADE,
  vault_path TEXT NOT NULL,            -- Which vault (e.g., 'ain', 'maia-consciousness')
  file_path TEXT NOT NULL,             -- Relative path in vault
  heading TEXT,                        -- Optional: specific heading section

  -- Learning weights
  weight REAL NOT NULL DEFAULT 0.0,    -- Grows when helpful, decays over time
  times_used INT NOT NULL DEFAULT 0,   -- How often this link was accessed
  times_helpful INT NOT NULL DEFAULT 0,-- How often it led to high-confidence answers

  last_useful_at TIMESTAMPTZ,          -- When it last contributed to a good answer
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate links
  UNIQUE(symbol_id, vault_path, file_path, heading)
);

CREATE INDEX IF NOT EXISTS idx_vault_symbol_links_symbol ON vault_symbol_links(symbol_id);
CREATE INDEX IF NOT EXISTS idx_vault_symbol_links_path ON vault_symbol_links(vault_path, file_path);
CREATE INDEX IF NOT EXISTS idx_vault_symbol_links_weight ON vault_symbol_links(weight DESC);

-- 3) Question patterns -> which symbols tend to help first
CREATE TABLE IF NOT EXISTS vault_query_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_type TEXT NOT NULL DEFAULT 'vault',
  pattern TEXT NOT NULL,               -- 'what_is', 'how_do_i', 'compare', 'summarize', etc.
  pattern_description TEXT,            -- Human explanation of what triggers this pattern
  symbol_id UUID NOT NULL REFERENCES vault_symbols(id) ON DELETE CASCADE,

  -- Learning weights
  weight REAL NOT NULL DEFAULT 0.0,
  seen_count INT NOT NULL DEFAULT 0,
  helpful_count INT NOT NULL DEFAULT 0,

  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One pattern -> symbol mapping
  UNIQUE(corpus_type, pattern, symbol_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_query_patterns_pattern ON vault_query_patterns(pattern);
CREATE INDEX IF NOT EXISTS idx_vault_query_patterns_symbol ON vault_query_patterns(symbol_id);

-- 4) Optional: Track misses for learning what's NOT working
CREATE TABLE IF NOT EXISTS vault_symbol_misses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,                -- RCN run_id for correlation
  prompt_pattern TEXT,                 -- Detected pattern type
  not_verified TEXT[],                 -- What couldn't be confirmed
  forced_submit BOOLEAN DEFAULT false,
  budget_exhausted_reason TEXT,
  suggested_symbols TEXT[],            -- Which symbols might help next time
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_symbol_misses_pattern ON vault_symbol_misses(prompt_pattern);

-- Seed the initial 5 core images
INSERT INTO vault_symbols (slug, title, description, elemental_affinity) VALUES
  ('spiral', 'The Spiral',
   'Developmental movement through Spiralogic''s 12 facets. Questions about growth, stages, where someone is in their journey. Regression and progression as complementary forces.',
   'aether'),

  ('threshold', 'The Threshold',
   'Liminal space where transformation happens. The pause before, the initiatory moment. Where thinking turns and something new becomes possible.',
   'water'),

  ('mirror', 'The Witness-Mirror',
   'MAIA as witness, not fixer. Reflection without judgment. The sacred mirror function where soul sees itself.',
   'air'),

  ('polarity', 'Held Opposites',
   'Fire/Water tension, Air/Earth grounding. When opposites need holding rather than resolving. Elemental alchemy as process, not prescription.',
   'fire'),

  ('field', 'The Coherence Field',
   'Ubuntu: I am because we are. Collective resonance, relational knowing. Not individual insight but shared emergence.',
   'earth')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  elemental_affinity = EXCLUDED.elemental_affinity,
  updated_at = now();

-- Add helpful comment
COMMENT ON TABLE vault_symbols IS 'Core mnemonic anchors that orient MAIA before searching. Images that tell her where to begin.';
COMMENT ON TABLE vault_symbol_links IS 'Learned associations between symbols and vault locations. Weight grows with usefulness.';
COMMENT ON TABLE vault_query_patterns IS 'Maps question types to starting symbols. Enables image-triggered orientation.';
COMMENT ON TABLE vault_symbol_misses IS 'Tracks what MAIA couldn''t find. Learning signal for improving symbol coverage.';
