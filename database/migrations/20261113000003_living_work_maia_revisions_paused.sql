-- Living Works: the writer's own "MAIA asks, never rewrites" setting for a whole Work.
--
-- Founder authorization 2026-11-13 (ledger #1938, College Essay controlled beta):
-- a questions-only MAIA posture for a Work, e.g. a college application essay,
-- where the words must remain the writer's own.
--
-- Member-declared, same precedent as title/purpose/form/stage: the only writer
-- is the member act through PATCH /api/sovereign/living-works/[id]. The system
-- never infers or sets it from the Work's free-text form.
--
-- While true, every editorial turn on a manuscript belonging to this Work is
-- run with proposalPolicy 'reply_only' (lib/manuscript/editorialRuntime/turn.ts):
-- the proposal kind is withheld from MAIA's schema and any proposal that comes
-- back anyway is refused and never persisted. The per-passage "Pause MAIA's
-- revisions" control is unchanged; this is its Work-wide, durable form.
--
-- Additive and defaulted: existing Works are unchanged (false).

ALTER TABLE living_works
  ADD COLUMN IF NOT EXISTS maia_revisions_paused boolean NOT NULL DEFAULT false;
