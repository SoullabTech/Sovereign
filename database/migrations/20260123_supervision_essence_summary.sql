-- Migration: Add essence_summary to supervision_sessions
-- Purpose: Store Fathom-like session synthesis (themes, gold lines, supervision focus)
-- Date: 2026-01-23

BEGIN;

-- Add essence_summary JSONB column for session-level synthesis
ALTER TABLE public.supervision_sessions
  ADD COLUMN IF NOT EXISTS essence_summary JSONB DEFAULT NULL;

-- Add finalization tracking
ALTER TABLE public.supervision_sessions
  ADD COLUMN IF NOT EXISTS essence_finalized_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for finding sessions with/without synthesis
CREATE INDEX IF NOT EXISTS idx_supervision_sessions_has_essence
  ON public.supervision_sessions ((essence_summary IS NOT NULL), ended_at DESC);

-- Add generate_summary to job types if not present
-- (Already in CHECK constraint from initial migration, but documenting here)

COMMENT ON COLUMN public.supervision_sessions.essence_summary IS
'Session-level synthesis: {title, coreInsight, themes, goldLines, turningPoints, spiralMovement, elementalSignature, nextSteps, practices, supervisionFocus}';

COMMENT ON COLUMN public.supervision_sessions.essence_finalized_at IS
'When the essence synthesis was generated/finalized';

COMMIT;
