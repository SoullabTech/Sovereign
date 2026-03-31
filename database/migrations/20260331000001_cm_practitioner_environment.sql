-- CM Practitioner Environment
-- Adds perceptual field configuration for Chinese Medicine practitioners
-- Four-layer composition: energy (TCM/Taoist), symbolic (shamanic/Jungian),
-- embodiment (somatic/psychological), integration (psychological+Taoist)

-- Member-level environment toggle + state
ALTER TABLE members ADD COLUMN IF NOT EXISTS cm_environment_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS cm_active_layer VARCHAR(20) DEFAULT 'weave';
ALTER TABLE members ADD COLUMN IF NOT EXISTS cm_layer_weights JSONB DEFAULT '{"energy":0.2,"symbolic":0.3,"embodiment":0.3,"integration":0.2}';

-- Layer signal tracking (fire-and-forget, like member_theme_signals)
CREATE TABLE IF NOT EXISTS member_cm_layer_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  layer VARCHAR(20) NOT NULL CHECK (layer IN ('energy', 'symbolic', 'embodiment', 'integration')),
  signal_type VARCHAR(20) DEFAULT 'active',
  resonance_strength FLOAT DEFAULT 0.5,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cm_layer_signals_member
  ON member_cm_layer_signals(member_id, created_at DESC);
