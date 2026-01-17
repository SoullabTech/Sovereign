-- 20260116000002_academy_paths.sql
-- Academy Paths Schema Extension
-- Canonical Academy content + Practitioner-curated paths + Client enrollments

-- ============== CANONICAL ACADEMY DOMAINS ==============

CREATE TABLE IF NOT EXISTS academy_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  number SMALLINT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,

  elemental_weight JSONB NOT NULL DEFAULT '{
    "earth": 0.2,
    "water": 0.2,
    "fire": 0.2,
    "air": 0.2,
    "aether": 0.2
  }'::jsonb,

  sequence_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_domains_slug ON academy_domains(slug);
CREATE INDEX IF NOT EXISTS idx_academy_domains_number ON academy_domains(number);

-- ============== CANONICAL SEQUENCES ==============

CREATE TABLE IF NOT EXISTS academy_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES academy_domains(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,

  prompt_text TEXT NOT NULL,

  elemental_mood VARCHAR(20) NOT NULL DEFAULT 'aether'
    CHECK (elemental_mood IN ('earth', 'water', 'fire', 'air', 'aether')),
  depth_level SMALLINT NOT NULL DEFAULT 1
    CHECK (depth_level BETWEEN 1 AND 5),
  estimated_minutes SMALLINT,

  body_cue TEXT,

  position INTEGER NOT NULL DEFAULT 0,

  requires_capacity_check BOOLEAN NOT NULL DEFAULT false,
  crisis_protocol BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_sequences_domain ON academy_sequences(domain_id);
CREATE INDEX IF NOT EXISTS idx_academy_sequences_slug ON academy_sequences(slug);
CREATE INDEX IF NOT EXISTS idx_academy_sequences_mood ON academy_sequences(elemental_mood);
CREATE INDEX IF NOT EXISTS idx_academy_sequences_position ON academy_sequences(domain_id, position);

-- ============== PRACTITIONER PATHS (CURATION LAYER) ==============

CREATE TABLE IF NOT EXISTS academy_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,

  cover_image TEXT,
  icon VARCHAR(50),

  recommended_pace VARCHAR(50) NOT NULL DEFAULT 'self-paced'
    CHECK (recommended_pace IN ('daily', 'weekly', 'self-paced')),
  elemental_mood VARCHAR(20) NOT NULL DEFAULT 'aether'
    CHECK (elemental_mood IN ('earth', 'water', 'fire', 'air', 'aether')),

  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  item_count INTEGER NOT NULL DEFAULT 0,
  enrollment_count INTEGER NOT NULL DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  UNIQUE(practitioner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_academy_paths_practitioner ON academy_paths(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_academy_paths_public ON academy_paths(is_public, is_featured) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_academy_paths_mood ON academy_paths(elemental_mood);

-- ============== PATH ITEMS (CURATED SEQUENCE ORDER) ==============

CREATE TABLE IF NOT EXISTS academy_path_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES academy_paths(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES academy_sequences(id) ON DELETE CASCADE,

  position INTEGER NOT NULL,

  practitioner_note TEXT,
  is_optional BOOLEAN NOT NULL DEFAULT false,

  unlock_rule JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(path_id, sequence_id),
  UNIQUE(path_id, position)
);

CREATE INDEX IF NOT EXISTS idx_academy_path_items_path ON academy_path_items(path_id);
CREATE INDEX IF NOT EXISTS idx_academy_path_items_sequence ON academy_path_items(sequence_id);
CREATE INDEX IF NOT EXISTS idx_academy_path_items_position ON academy_path_items(path_id, position);

-- ============== CLIENT ENROLLMENTS ==============

CREATE TABLE IF NOT EXISTS academy_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES academy_paths(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'dropped')),

  current_item_id UUID REFERENCES academy_path_items(id) ON DELETE SET NULL,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  last_capacity_check JSONB,

  UNIQUE(client_id, path_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_enrollments_client ON academy_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_path ON academy_enrollments(path_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_status ON academy_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_active ON academy_enrollments(client_id, status) WHERE status = 'active';

-- ============== SEQUENCE COMPLETIONS ==============

CREATE TABLE IF NOT EXISTS academy_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES academy_sequences(id) ON DELETE CASCADE,

  reflection TEXT,
  rating SMALLINT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),

  capacity_before JSONB,
  capacity_after JSONB,

  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_completions_enrollment ON academy_completions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_academy_completions_sequence ON academy_completions(sequence_id);
CREATE INDEX IF NOT EXISTS idx_academy_completions_date ON academy_completions(completed_at);

-- ============== UPDATED_AT TRIGGERS ==============
-- Uses existing update function from practitioner portal migration:
-- update_practitioner_updated_at()

DROP TRIGGER IF EXISTS tr_academy_domains_updated_at ON academy_domains;
CREATE TRIGGER tr_academy_domains_updated_at
  BEFORE UPDATE ON academy_domains
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_academy_sequences_updated_at ON academy_sequences;
CREATE TRIGGER tr_academy_sequences_updated_at
  BEFORE UPDATE ON academy_sequences
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_academy_paths_updated_at ON academy_paths;
CREATE TRIGGER tr_academy_paths_updated_at
  BEFORE UPDATE ON academy_paths
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

-- ============== COMMENTS ==============

COMMENT ON TABLE academy_domains IS 'Canonical Academy domains (global Soullab content)';
COMMENT ON TABLE academy_sequences IS 'Canonical sequences/prompts within domains';
COMMENT ON TABLE academy_paths IS 'Practitioner-curated pathways through sequences';
COMMENT ON TABLE academy_path_items IS 'Ordered sequences within a practitioner path';
COMMENT ON TABLE academy_enrollments IS 'Client enrollment and progress through paths';
COMMENT ON TABLE academy_completions IS 'Sequence completion records with reflections';
