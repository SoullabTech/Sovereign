-- JARVIS-KP-01 / I4 — structural telemetry for epistemic integration shadow.
-- Separate child sink: when I4 is OFF, the existing relational-field shadow
-- writer remains schema-independent from this migration.

BEGIN;

CREATE TABLE IF NOT EXISTS public.maia_epistemic_join_integration_shadow_runs (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL,
  model_name TEXT NOT NULL,
  architecture_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('evaluated', 'error')),
  proposal_count INTEGER NOT NULL CHECK (proposal_count >= 0),
  evaluated_count INTEGER NOT NULL CHECK (evaluated_count >= 0),
  admitted_standing_counts JSONB NOT NULL
    CHECK (jsonb_typeof(admitted_standing_counts) = 'object')
    CHECK ((admitted_standing_counts - ARRAY['NONE_UNASSERTED', 'CANDIDATE_UNESTABLISHED', 'PROVISIONAL', 'WARRANTED', 'PROMOTED', 'DISCHARGED', 'SUPERSEDED']::text[]) = '{}'::jsonb)
    CHECK (
      COALESCE(jsonb_typeof(admitted_standing_counts -> 'NONE_UNASSERTED') = 'number' AND (admitted_standing_counts ->> 'NONE_UNASSERTED') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'CANDIDATE_UNESTABLISHED') = 'number' AND (admitted_standing_counts ->> 'CANDIDATE_UNESTABLISHED') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'PROVISIONAL') = 'number' AND (admitted_standing_counts ->> 'PROVISIONAL') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'WARRANTED') = 'number' AND (admitted_standing_counts ->> 'WARRANTED') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'PROMOTED') = 'number' AND (admitted_standing_counts ->> 'PROMOTED') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'DISCHARGED') = 'number' AND (admitted_standing_counts ->> 'DISCHARGED') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(admitted_standing_counts -> 'SUPERSEDED') = 'number' AND (admitted_standing_counts ->> 'SUPERSEDED') ~ '^[0-9]+$', TRUE)
    ),
  refusal_code_counts JSONB NOT NULL
    CHECK (jsonb_typeof(refusal_code_counts) = 'object')
    CHECK ((refusal_code_counts - ARRAY['no_warrant_offered', 'join_provenance_incomplete', 'warrant_unknown', 'warrant_not_live', 'reference_offered_as_reliance', 'reliance_not_declared', 'support_set_offered_as_composite_warrant', 'composite_method_is_mere_accumulation', 'composite_missing_dependence_resolution', 'composite_pseudo_independence', 'composite_circular_support', 'composite_nested_standing_ceiling', 'composite_method_does_not_license_semantics', 'jurisdiction_mismatch', 'cross_jurisdiction_transfer_undeclared', 'semantics_not_licensed', 'boundary_loss', 'uncertainty_blocks_elevation', 'standing_exceeds_warrant_ceiling', 'endpoint_evidence_offered_as_relation_evidence', 'authorship_composition_attempted', 'adoption_outside_adopter_jurisdiction', 'adoption_component_unknown', 'adoption_provenance_lost', 'operation_stage_below_requested_standing', 'terminal_standing_not_re_elevable', 'member_scope_violation']::text[]) = '{}'::jsonb)
    CHECK (
      COALESCE(jsonb_typeof(refusal_code_counts -> 'no_warrant_offered') = 'number' AND (refusal_code_counts ->> 'no_warrant_offered') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'join_provenance_incomplete') = 'number' AND (refusal_code_counts ->> 'join_provenance_incomplete') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'warrant_unknown') = 'number' AND (refusal_code_counts ->> 'warrant_unknown') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'warrant_not_live') = 'number' AND (refusal_code_counts ->> 'warrant_not_live') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'reference_offered_as_reliance') = 'number' AND (refusal_code_counts ->> 'reference_offered_as_reliance') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'reliance_not_declared') = 'number' AND (refusal_code_counts ->> 'reliance_not_declared') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'support_set_offered_as_composite_warrant') = 'number' AND (refusal_code_counts ->> 'support_set_offered_as_composite_warrant') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_method_is_mere_accumulation') = 'number' AND (refusal_code_counts ->> 'composite_method_is_mere_accumulation') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_missing_dependence_resolution') = 'number' AND (refusal_code_counts ->> 'composite_missing_dependence_resolution') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_pseudo_independence') = 'number' AND (refusal_code_counts ->> 'composite_pseudo_independence') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_circular_support') = 'number' AND (refusal_code_counts ->> 'composite_circular_support') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_nested_standing_ceiling') = 'number' AND (refusal_code_counts ->> 'composite_nested_standing_ceiling') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'composite_method_does_not_license_semantics') = 'number' AND (refusal_code_counts ->> 'composite_method_does_not_license_semantics') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'jurisdiction_mismatch') = 'number' AND (refusal_code_counts ->> 'jurisdiction_mismatch') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'cross_jurisdiction_transfer_undeclared') = 'number' AND (refusal_code_counts ->> 'cross_jurisdiction_transfer_undeclared') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'semantics_not_licensed') = 'number' AND (refusal_code_counts ->> 'semantics_not_licensed') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'boundary_loss') = 'number' AND (refusal_code_counts ->> 'boundary_loss') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'uncertainty_blocks_elevation') = 'number' AND (refusal_code_counts ->> 'uncertainty_blocks_elevation') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'standing_exceeds_warrant_ceiling') = 'number' AND (refusal_code_counts ->> 'standing_exceeds_warrant_ceiling') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'endpoint_evidence_offered_as_relation_evidence') = 'number' AND (refusal_code_counts ->> 'endpoint_evidence_offered_as_relation_evidence') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'authorship_composition_attempted') = 'number' AND (refusal_code_counts ->> 'authorship_composition_attempted') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'adoption_outside_adopter_jurisdiction') = 'number' AND (refusal_code_counts ->> 'adoption_outside_adopter_jurisdiction') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'adoption_component_unknown') = 'number' AND (refusal_code_counts ->> 'adoption_component_unknown') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'adoption_provenance_lost') = 'number' AND (refusal_code_counts ->> 'adoption_provenance_lost') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'operation_stage_below_requested_standing') = 'number' AND (refusal_code_counts ->> 'operation_stage_below_requested_standing') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'terminal_standing_not_re_elevable') = 'number' AND (refusal_code_counts ->> 'terminal_standing_not_re_elevable') ~ '^[0-9]+$', TRUE)
    AND COALESCE(jsonb_typeof(refusal_code_counts -> 'member_scope_violation') = 'number' AND (refusal_code_counts ->> 'member_scope_violation') ~ '^[0-9]+$', TRUE)
    ),
  representation_closed BOOLEAN NOT NULL CHECK (representation_closed = TRUE),
  error_count INTEGER NOT NULL CHECK (error_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (evaluated_count + error_count = proposal_count),
  CHECK (
    (status = 'evaluated' AND error_count = 0)
    OR (status = 'error' AND error_count > 0)
  ),
  FOREIGN KEY (turn_id, model_name, architecture_version)
    REFERENCES public.maia_relational_field_shadow_runs(turn_id, model_name, architecture_version)
    ON DELETE CASCADE,
  UNIQUE (turn_id, model_name, architecture_version)
);

CREATE INDEX IF NOT EXISTS idx_epistemic_join_integration_shadow_created
  ON public.maia_epistemic_join_integration_shadow_runs(created_at DESC);

COMMENT ON TABLE public.maia_epistemic_join_integration_shadow_runs IS
  'JARVIS-KP-01 I4 structural telemetry only. Exact-key count maps; no member id, evidence id, join id, proposition text, evidence text, response text, or semantic payload.';

COMMIT;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.maia_epistemic_join_integration_shadow_runs;
