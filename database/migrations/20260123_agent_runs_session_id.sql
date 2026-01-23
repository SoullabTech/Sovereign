-- Migration: Add session_id to agent_runs
-- Purpose: CorpusCallosum service requires session_id for agent run logging
-- Date: 2026-01-23

BEGIN;

-- Add session_id column to agent_runs if it doesn't exist
ALTER TABLE public.agent_runs
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add index for session-based queries
CREATE INDEX IF NOT EXISTS idx_agent_runs_session_id
  ON public.agent_runs (session_id, created_at DESC);

COMMENT ON COLUMN public.agent_runs.session_id IS 'Session ID linking agent run to conversation session';

COMMIT;
