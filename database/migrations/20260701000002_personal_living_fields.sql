-- Personal Living Fields: named developmental dimensions belonging to a member
CREATE TABLE IF NOT EXISTS personal_living_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  current_expression TEXT,
  status TEXT NOT NULL DEFAULT 'gathering',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, field_key)
);

-- Developmental history (not version history — humans have development, not versions)
CREATE TABLE IF NOT EXISTS personal_living_field_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES personal_living_fields(id) ON DELETE CASCADE,
  expression TEXT NOT NULL,
  change_note TEXT,
  authored_by TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sources that nourished a field
CREATE TABLE IF NOT EXISTS personal_living_field_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES personal_living_fields(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  source_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spirals: recurring developmental patterns
CREATE TABLE IF NOT EXISTS personal_spirals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- States: current lived conditions (change quickly)
CREATE TABLE IF NOT EXISTS personal_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  state_key TEXT NOT NULL,
  label TEXT NOT NULL,
  intensity NUMERIC(3,2),
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Development participant consent: explicit per-field, revocable.
-- The Personal Living Field is the constitutional center of gravity.
-- Participants (practitioners, coaches, partners, etc.) are chapters — not owners.
-- Removing a participant leaves the field fully intact.
CREATE TABLE IF NOT EXISTS living_field_participant_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  participant_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  participant_label TEXT, -- display name for non-member participants
  participant_type TEXT NOT NULL DEFAULT 'practitioner',
  field_key TEXT,
  field_version_id UUID REFERENCES personal_living_field_versions(id) ON DELETE SET NULL,
  consent_scope TEXT NOT NULL DEFAULT 'current',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Lifecycle: derive status as removed > revoked > silenced > paused > active
  paused_at TIMESTAMPTZ,
  silenced_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  access_note TEXT -- explains deletion limits where full removal isn't possible
);

CREATE INDEX IF NOT EXISTS idx_personal_living_fields_member ON personal_living_fields(member_id);
CREATE INDEX IF NOT EXISTS idx_personal_living_field_versions_field ON personal_living_field_versions(field_id);
CREATE INDEX IF NOT EXISTS idx_personal_living_field_sources_field ON personal_living_field_sources(field_id);
CREATE INDEX IF NOT EXISTS idx_personal_spirals_member ON personal_spirals(member_id);
CREATE INDEX IF NOT EXISTS idx_personal_states_member_key ON personal_states(member_id, state_key);
CREATE INDEX IF NOT EXISTS idx_living_field_consents_member ON living_field_participant_consents(member_id);
