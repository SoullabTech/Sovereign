-- MAIA-RELATIONAL-FIELD-SHADOW-01
-- Research evidence only. No member-facing, memory, standing, routing, or learning authority.

CREATE TABLE IF NOT EXISTS public.maia_relational_field_shadow_runs (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL REFERENCES public.maia_turns(id) ON DELETE CASCADE,
  exchange_id TEXT,
  architecture_version TEXT NOT NULL,
  model_name TEXT NOT NULL,
  deterministic_seed INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('rendered', 'refused', 'error')),
  processing_profile TEXT NOT NULL CHECK (processing_profile IN ('FAST', 'CORE', 'DEEP')),
  origin_route TEXT,
  primary_stage TEXT NOT NULL DEFAULT 'sovereign_list_pre_http_return',
  primary_response_sha256 TEXT NOT NULL,
  primary_response_text TEXT NOT NULL,
  current_evidence_id TEXT NOT NULL,
  evidence_manifest JSONB NOT NULL,
  packet_digest TEXT NOT NULL,
  prompt_sha256 TEXT,
  basis_evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  raw_plan JSONB,
  raw_plan_sha256 TEXT,
  shadow_response_text TEXT,
  rendered_digest TEXT,
  refusal_code TEXT,
  error_code TEXT,
  generation_ms INTEGER,
  total_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (turn_id, model_name, architecture_version)
);

CREATE INDEX IF NOT EXISTS idx_relational_field_shadow_created
  ON public.maia_relational_field_shadow_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relational_field_shadow_turn
  ON public.maia_relational_field_shadow_runs(turn_id);
CREATE INDEX IF NOT EXISTS idx_relational_field_shadow_status
  ON public.maia_relational_field_shadow_runs(status, created_at DESC);

COMMENT ON TABLE public.maia_relational_field_shadow_runs IS
  'MAIA relational-field shadow research evidence. Disposable, non-member-facing, excluded from memory/standing/routing/learning promotion.';
COMMENT ON COLUMN public.maia_relational_field_shadow_runs.primary_stage IS
  'Stage of paired primary evidence. Cut 1 uses sovereign_list_pre_http_return: the response object is constructed, but this is still a server-side research capture.';
COMMENT ON COLUMN public.maia_relational_field_shadow_runs.evidence_manifest IS
  'Source references and digests for recomputation. Historical member transcript text is not duplicated here.';
