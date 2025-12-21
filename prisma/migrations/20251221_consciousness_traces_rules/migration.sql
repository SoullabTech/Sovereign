-- Consciousness Trace Spine + S-Expression Rules (Postgres-native)
-- Migrated from Supabase to local Postgres
-- Date: 2025-12-21

-- Table: consciousness_traces
-- Stores full trace objects for consciousness routing and debugging
CREATE TABLE IF NOT EXISTS consciousness_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT (no auth.users dependency)
  session_id TEXT,
  request_id TEXT,
  agent TEXT,
  model TEXT,

  -- Fast filters / summaries
  facet TEXT,
  mode TEXT,
  confidence NUMERIC,
  safety_level TEXT,
  latency_ms INTEGER,

  -- References (optional)
  memory_ids UUID[],

  -- Full trace object
  trace JSONB NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS consciousness_traces_user_created_idx
  ON consciousness_traces (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS consciousness_traces_request_idx
  ON consciousness_traces (request_id);

CREATE INDEX IF NOT EXISTS consciousness_traces_trace_gin
  ON consciousness_traces USING GIN (trace);

-- Table: consciousness_rules
-- S-expression rules as data, versioned + enabled
CREATE TABLE IF NOT EXISTS consciousness_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL UNIQUE,
  sexpr TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- Index for fetching enabled rules by priority
CREATE INDEX IF NOT EXISTS consciousness_rules_enabled_priority_idx
  ON consciousness_rules (enabled, priority DESC, updated_at DESC);

-- Trigger: Auto-update updated_at on consciousness_rules
CREATE OR REPLACE FUNCTION touch_consciousness_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_touch_consciousness_rules_updated_at ON consciousness_rules;

CREATE TRIGGER trg_touch_consciousness_rules_updated_at
BEFORE UPDATE ON consciousness_rules
FOR EACH ROW
EXECUTE FUNCTION touch_consciousness_rules_updated_at();
