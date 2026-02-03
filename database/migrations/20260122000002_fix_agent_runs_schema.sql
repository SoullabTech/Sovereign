-- Migration: Fix agent_runs table schema
-- Purpose: Add all missing columns that corpusCallosumService expects
-- Date: 2026-01-22

BEGIN;

-- Create table if it doesn't exist (base schema)
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all missing columns to agent_runs
ALTER TABLE public.agent_runs
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS turn_id INTEGER,
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS req_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_name TEXT,
  ADD COLUMN IF NOT EXISTS element TEXT,
  ADD COLUMN IF NOT EXISTS epistemic_mode TEXT,
  ADD COLUMN IF NOT EXISTS phase TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS input_summary TEXT,
  ADD COLUMN IF NOT EXISTS output_text TEXT,
  ADD COLUMN IF NOT EXISTS output_json JSONB,
  ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS confidence REAL,
  ADD COLUMN IF NOT EXISTS intensity REAL,
  ADD COLUMN IF NOT EXISTS inhibited_by TEXT,
  ADD COLUMN IF NOT EXISTS meta JSONB;

-- Change id to UUID if it's currently integer (for consistency with other tables)
-- Note: This is safe because the existing table likely has minimal data
-- If data preservation is needed, this would need a more careful migration

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agent_runs_session_id ON public.agent_runs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_turn_id ON public.agent_runs(turn_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name ON public.agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON public.agent_runs(created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.agent_runs.session_id IS 'Session identifier for grouping related agent runs';
COMMENT ON COLUMN public.agent_runs.turn_id IS 'Turn ID within the conversation';
COMMENT ON COLUMN public.agent_runs.agent_name IS 'Name of the agent that produced this output';
COMMENT ON COLUMN public.agent_runs.epistemic_mode IS 'Epistemic mode: structured, symbolic, relational, etc.';
COMMENT ON COLUMN public.agent_runs.phase IS 'Processing phase: intake, process, integrate';
COMMENT ON COLUMN public.agent_runs.status IS 'Run status: ok, error, inhibited';
COMMENT ON COLUMN public.agent_runs.confidence IS 'Agent confidence score (0-1)';
COMMENT ON COLUMN public.agent_runs.intensity IS 'Response intensity (0-1)';
COMMENT ON COLUMN public.agent_runs.inhibited_by IS 'Name of agent that inhibited this run';

COMMIT;
