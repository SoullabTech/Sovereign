-- Field Training System V1: Training source tables for persona building
-- These tables store structured training inputs that feed the persona builder.
-- The builder synthesizes them into a versioned persona build that the oracle reads.

-- 1. Corrections: practitioner feedback on MAIA responses
CREATE TABLE IF NOT EXISTS persona_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES practitioner_personas(id) ON DELETE CASCADE,
  original_response TEXT NOT NULL,
  correction TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_corrections_persona
  ON persona_corrections(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_corrections_created
  ON persona_corrections(persona_id, created_at DESC);

-- 2. Exemplar Q&A pairs (tagged by layer)
CREATE TABLE IF NOT EXISTS persona_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES practitioner_personas(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ideal_response TEXT NOT NULL,
  layer TEXT NOT NULL CHECK (layer IN ('voice', 'stance', 'knowledge')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_examples_persona
  ON persona_examples(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_examples_layer
  ON persona_examples(persona_id, layer);

-- 3. Tone/style preferences (key-value with category)
CREATE TABLE IF NOT EXISTS persona_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES practitioner_personas(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('voice', 'stance', 'boundary')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_preferences_active
  ON persona_preferences(persona_id, active) WHERE active = TRUE;

-- One active value per key per category per persona
CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_preferences_unique_key
  ON persona_preferences(persona_id, category, key) WHERE active = TRUE;

-- 4. Built persona snapshots (versioned, draft-first workflow)
CREATE TABLE IF NOT EXISTS persona_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES practitioner_personas(id) ON DELETE CASCADE,
  version INT NOT NULL,
  voice_block TEXT,
  stance_block TEXT,
  knowledge_block TEXT,
  system_prompt_block TEXT NOT NULL,
  base_system_block TEXT,
  build_input_summary JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  validation_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (validation_status IN ('draft', 'validated', 'rejected')),
  validation_issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_builds_active
  ON persona_builds(persona_id, is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_builds_version
  ON persona_builds(persona_id, version);

-- Trigger: enforce single active build per persona
CREATE OR REPLACE FUNCTION deactivate_other_persona_builds()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE persona_builds
    SET is_active = FALSE
    WHERE persona_id = NEW.persona_id
      AND id != NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_active_persona_build ON persona_builds;
CREATE TRIGGER enforce_single_active_persona_build
  BEFORE INSERT OR UPDATE OF is_active ON persona_builds
  FOR EACH ROW EXECUTE FUNCTION deactivate_other_persona_builds();

-- Track migration
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260325000001_field_training_sources.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
