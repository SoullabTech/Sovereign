-- Clause A (docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md): type integration_passes rows honestly.
--
-- The live integration_passes path is OBSERVATIONAL (a diagnostic trace of which agents ran on a
-- turn). The member-facing answer is single-authored by MaiaVoice; the trace does NOT author it.
-- `record_type` makes this explicit and reserves 'synthesis' for a future voice-merge that must
-- pass the accountability merge-gate before serving a member.
--
-- Existing rows are all traces (the answer was always single-authored), so the DEFAULT correctly
-- backfills every prior row as 'trace_observation' with no data migration needed.

ALTER TABLE public.integration_passes
  ADD COLUMN IF NOT EXISTS record_type text NOT NULL DEFAULT 'trace_observation';

COMMENT ON COLUMN public.integration_passes.record_type IS
  'trace_observation (default): diagnostic record of which agents ran; does NOT author the member-facing answer. synthesis: a genuine voice-merge that authored the answer and passed the merge-gate (docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md).';

CREATE INDEX IF NOT EXISTS idx_integration_passes_record_type
  ON public.integration_passes (record_type, created_at DESC);
