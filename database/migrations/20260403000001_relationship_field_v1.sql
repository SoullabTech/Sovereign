-- Relationship Field v1 — Real relational intelligence foundation
-- Supports outer (people), inner (archetypes/parts), and transpersonal relationships

-- The person/bond/figure
CREATE TABLE IF NOT EXISTS member_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  realm TEXT NOT NULL DEFAULT 'outer' CHECK (realm IN ('outer', 'inner', 'transpersonal')),
  bond_type TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_member_relationships_member ON member_relationships(member_id);
CREATE INDEX IF NOT EXISTS idx_member_relationships_active ON member_relationships(member_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_member_relationships_realm ON member_relationships(member_id, realm) WHERE archived_at IS NULL;

-- The between (field state) — created lazily on first check-in, NOT required
CREATE TABLE IF NOT EXISTS relationship_field_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES member_relationships(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_tone TEXT,
  active_signals TEXT[],
  dominant_pattern TEXT,
  developmental_theme TEXT,
  elemental_dynamics JSONB,
  last_checkin_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(relationship_id)
);

CREATE INDEX IF NOT EXISTS idx_relationship_field_member ON relationship_field_state(member_id);

-- The unfolding (entries / timeline)
CREATE TABLE IF NOT EXISTS relationship_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES member_relationships(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('checkin', 'note', 'reflection', 'threshold', 'rupture', 'repair')),
  felt_signals TEXT[],
  free_text TEXT,
  maia_reflection TEXT,
  pattern_hint TEXT,
  field_tone_snapshot TEXT,
  suggested_movement TEXT,
  content TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relationship_entries_rel ON relationship_entries(relationship_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relationship_entries_member ON relationship_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_relationship_entries_kind ON relationship_entries(relationship_id, kind);
