-- Affinity index: which atoms relate to which Living Field dimensions
-- Created by the system when atoms are kept; never by inference alone.
-- Governed by: atom's own register, elemental lens, source_type, and title.
-- Constitutional constraint: sacred_protected atoms are excluded at the indexing layer.

CREATE TABLE IF NOT EXISTS living_field_affinities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  atom_id UUID NOT NULL REFERENCES member_memory_atoms(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  affinity_score NUMERIC(4,3) NOT NULL DEFAULT 0.5, -- 0.0 to 1.0
  evidence_reason TEXT NOT NULL, -- why this atom was mapped here (e.g. "register:developmental", "lens:fire", "source_type:dream")
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(atom_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_living_field_affinities_member_field ON living_field_affinities(member_id, field_key);
CREATE INDEX IF NOT EXISTS idx_living_field_affinities_atom ON living_field_affinities(atom_id);
