-- Studio Relationships + Check-ins
-- Parent Flow MVP: relational sandbox for tracking significant relationships
-- and getting MAIA guidance in the moment.
--
-- Two tables:
--   studio_relationships — people the member has relationships with
--   relationship_checkins — the running stream of check-in entries

-- ═══════════════════════════════════════════════════════════
-- Table 1: Relationships (person profiles)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS studio_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Person info
  person_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('child', 'partner', 'parent', 'friend', 'cofounder', 'sibling', 'other')),

  -- Birth data (optional, for future astrology integration)
  birth_date DATE,
  birth_time TEXT,                -- HH:MM or null
  birth_location_name TEXT,
  birth_location_lat NUMERIC,
  birth_location_lng NUMERIC,
  birth_timezone TEXT,

  -- Convenience
  age_years INTEGER,              -- updated on write, nullable
  notes TEXT,                     -- freeform private notes

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_studio_relationships_practitioner
  ON studio_relationships(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_studio_relationships_status
  ON studio_relationships(practitioner_id, status);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS tr_studio_relationships_updated_at ON studio_relationships;
CREATE TRIGGER tr_studio_relationships_updated_at
  BEFORE UPDATE ON studio_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE studio_relationships IS
  'Person profiles for the Relationship Flow module — tracks who the member relates to';

-- ═══════════════════════════════════════════════════════════
-- Table 2: Check-in entries (the running stream)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS relationship_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES studio_relationships(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- What happened (the core input)
  what_happened TEXT NOT NULL,
  child_state TEXT CHECK (child_state IN ('calm', 'sensitive', 'anxious', 'angry', 'withdrawn', 'big_questions', 'social_pain')),
  parent_need TEXT CHECK (parent_need IN ('what_to_say', 'how_serious', 'regulate', 'is_normal', 'pattern')),

  -- MAIA responses (stored after generation)
  maia_response JSONB,            -- { framing, script, action, threshold, model, generatedAt }
  mentor_reflection JSONB,        -- { questions, sovereigntyCheck, nextExperiment, generatedAt }

  -- Tags (for future pattern layer)
  context_tag TEXT,               -- home, school, travel, money, intimacy, family, etc.
  element_state TEXT,             -- fire, water, earth, air, aether (optional)
  outcome TEXT,                   -- repair, unresolved, escalated, bonded (optional, set post-hoc)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_relationship
  ON relationship_checkins(relationship_id);
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_practitioner
  ON relationship_checkins(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_created
  ON relationship_checkins(created_at DESC);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS tr_relationship_checkins_updated_at ON relationship_checkins;
CREATE TRIGGER tr_relationship_checkins_updated_at
  BEFORE UPDATE ON relationship_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE relationship_checkins IS
  'Check-in entries for the Relationship Flow — what happened, MAIA response, and mentor reflections';
