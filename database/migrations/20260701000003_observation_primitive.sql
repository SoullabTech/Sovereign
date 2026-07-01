-- Observation Primitive: three-layer substrate
-- Layer 1: signals (automated facts, no interpretation)
-- Layer 2: observations (human witness records)
-- Layer 3: recognitions (explicit cross-observation synthesis — schema now, authoring UI later)

-- signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  -- invitation_shown | invitation_opened | conversation_started | conversation_abandoned |
  -- draft_generated | draft_saved | offering_created | offering_paused
  context_type TEXT NOT NULL,
  -- member | practitioner | encounter | offering | invitation | relationship
  context_id UUID,
  surface TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signals_signal_type_idx ON signals(signal_type);
CREATE INDEX IF NOT EXISTS signals_context_idx ON signals(context_type, context_id);
CREATE INDEX IF NOT EXISTS signals_created_at_idx ON signals(created_at);

-- observations
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witnessed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  observation_context_type TEXT NOT NULL,
  -- practitioner | member | encounter | offering | invitation | relationship | organization | community_event
  observation_context_id UUID,
  witnessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  witness_text TEXT NOT NULL,
  horizon TEXT,  -- operational | developmental | ecological
  surface TEXT,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS observations_witnessed_by_idx ON observations(witnessed_by);
CREATE INDEX IF NOT EXISTS observations_context_idx ON observations(observation_context_type, observation_context_id);
CREATE INDEX IF NOT EXISTS observations_horizon_idx ON observations(horizon) WHERE horizon IS NOT NULL;
CREATE INDEX IF NOT EXISTS observations_created_at_idx ON observations(created_at);

-- recognitions
CREATE TABLE IF NOT EXISTS recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authored_by UUID REFERENCES members(id) ON DELETE SET NULL,
  recognition_text TEXT NOT NULL,
  horizon TEXT,
  observation_ids UUID[] NOT NULL DEFAULT '{}',
  surface TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recognitions_authored_by_idx ON recognitions(authored_by);
CREATE INDEX IF NOT EXISTS recognitions_created_at_idx ON recognitions(created_at);
