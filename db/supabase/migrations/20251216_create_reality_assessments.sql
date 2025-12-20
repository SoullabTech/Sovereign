-- Reality Hygiene System: Track manipulation pattern assessments
-- Based on NCI Reality Assessment rubric adapted for MAIA consciousness

create table if not exists public.reality_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid,

  -- Source tracking
  source_type text not null default 'oracle_turn', -- oracle_turn | community_post | transcript | url | text
  source_ref text,                                  -- optional: post_id, transcript_id, url, etc.
  title text,
  notes text,

  -- Reality hygiene scores (stored as JSON: { timing: 3, emotional_manipulation: 5, ... })
  scores jsonb not null,
  total_score int not null,
  max_score int not null default 100,
  risk_band text not null,                          -- low | moderate | strong | overwhelming

  -- Auto-scoring metadata (for when we add LLM-assisted scoring)
  auto_scored boolean default false,
  user_edited boolean default false,

  -- Consciousness-expanding questions (RealityCheckAgent output)
  questions jsonb,                                   -- { lowering_score: "...", emotional_recruitment: "...", freedom_questions: [...] }

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists reality_assessments_user_id_idx
  on public.reality_assessments(user_id);

create index if not exists reality_assessments_session_id_idx
  on public.reality_assessments(session_id);

create index if not exists reality_assessments_created_at_idx
  on public.reality_assessments(created_at desc);

create index if not exists reality_assessments_risk_band_idx
  on public.reality_assessments(risk_band);

-- Update timestamp trigger
create or replace function public.update_reality_assessment_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reality_assessments_updated_at
  before update on public.reality_assessments
  for each row
  execute function public.update_reality_assessment_updated_at();

-- Comments for clarity
comment on table public.reality_assessments is 'Reality Hygiene assessments - tracks manipulation pattern detection in user content';
comment on column public.reality_assessments.scores is '20 indicators scored 1-5 each: timing, emotional_manipulation, uniform_messaging, etc.';
comment on column public.reality_assessments.risk_band is 'Computed from total_score: low (≤25), moderate (≤50), strong (≤75), overwhelming (>75)';
comment on column public.reality_assessments.questions is 'RealityCheckAgent output: consciousness-expanding questions mapped to Spiralogic elements';
