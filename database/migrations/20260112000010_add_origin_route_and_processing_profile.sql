-- Migration: Add origin_route and processing_profile to corpus callosum tables
-- Purpose: Enable clean filtering by API route and processing tier in NocoDB/dashboards
-- Date: 2026-01-12

BEGIN;

-- 1) agent_runs: add origin_route + processing_profile
ALTER TABLE public.agent_runs
  ADD COLUMN IF NOT EXISTS origin_route text,
  ADD COLUMN IF NOT EXISTS processing_profile text;

-- 2) integration_passes: add origin_route + processing_profile
ALTER TABLE public.integration_passes
  ADD COLUMN IF NOT EXISTS origin_route text,
  ADD COLUMN IF NOT EXISTS processing_profile text;

-- 3) Speed up filtering in NocoDB / dashboards
CREATE INDEX IF NOT EXISTS idx_agent_runs_route_profile
  ON public.agent_runs (origin_route, processing_profile, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_passes_route_profile
  ON public.integration_passes (origin_route, processing_profile, created_at DESC);

-- 4) Add comments for documentation
COMMENT ON COLUMN public.agent_runs.origin_route IS 'API route that triggered this agent run (e.g. /api/sovereign/app/maia, /api/between/chat)';
COMMENT ON COLUMN public.agent_runs.processing_profile IS 'Processing tier (FAST, CORE, DEEP for sovereign; BETWEEN for orchestrator)';
COMMENT ON COLUMN public.integration_passes.origin_route IS 'API route that triggered this integration pass';
COMMENT ON COLUMN public.integration_passes.processing_profile IS 'Processing tier at time of integration';

COMMIT;
