-- Prompt Library: weekly elemental themes + prompt sets for MAIA activation
-- Phase 1 of content pipeline integration

CREATE TABLE IF NOT EXISTS prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  element TEXT CHECK (element IS NULL OR element IN ('fire', 'water', 'earth', 'air', 'aether')),
  refinement_phase TEXT CHECK (refinement_phase IS NULL OR refinement_phase IN ('emergence', 'deepening', 'mastery')),
  chapter_ref TEXT,                    -- e.g. "Elemental Alchemy Ch. 3"
  orientation TEXT NOT NULL,           -- short frame for the week (1-3 sentences)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('reflection', 'inquiry', 'grounding', 'action', 'integration')),
  element_tag TEXT,                    -- optional elemental resonance
  tonal_tag TEXT,                      -- optional tonal quality (e.g. 'gentle', 'direct', 'contemplative')
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_library_slug ON prompt_library(slug);
CREATE INDEX IF NOT EXISTS idx_prompt_library_status ON prompt_library(status);
CREATE INDEX IF NOT EXISTS idx_prompt_library_active ON prompt_library(status, active_from, active_until)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_prompt_library_items_library ON prompt_library_items(library_id);
