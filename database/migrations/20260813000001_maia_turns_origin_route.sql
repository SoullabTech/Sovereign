-- Migration: R1 diagnostic — record which serving route produced each MAIA turn.
--
-- Context: the 2026-08-13 continuity incident could not be attributed because
-- maia_turns carries no route attribution. agent_runs.origin_route exists but only
-- witnesses routes that invoke Corpus Callosum, and its emission ceased at
-- 2026-08-13 13:20:21Z — before the witnessed turns. There is therefore no way to
-- bind a turn to the route that served it.
--
-- This is a DIAGNOSTIC ONLY. It changes no routing, no guard, no memory composition,
-- and no Sanctuary behavior (Sanctuary turns already skip logMaiaTurn entirely and
-- so never reach this column).
--
-- Nullable by design: historical rows and any caller that does not declare an origin
-- remain valid. Nothing reads this column yet.

ALTER TABLE public.maia_turns
  ADD COLUMN IF NOT EXISTS origin_route text;

CREATE INDEX IF NOT EXISTS idx_maia_turns_origin_route
  ON public.maia_turns (origin_route, created_at DESC);

COMMENT ON COLUMN public.maia_turns.origin_route IS
  'API route that served this turn (e.g. /api/sovereign/app/maia, /api/sovereign/app/maia/list). NULL for historical rows and for callers that do not declare an origin. Added 2026-08-13 as the R1 serving-route witness.';
