-- Socratic Validator Events table
-- Tracks all validator decisions for telemetry and learning

create table if not exists public.socratic_validator_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Session context
  user_id text,
  session_id text,
  turn_id uuid, -- Link to opus_axiom_turns if available
  route text, -- 'oracle', 'core', 'fast', 'deep', etc.

  -- Validator decision
  decision text not null check (decision in ('ALLOW', 'FLAG', 'BLOCK', 'REGENERATE')),
  is_gold boolean not null default false,
  passes boolean not null,

  -- Rupture details
  ruptures jsonb not null default '[]'::jsonb,
  rupture_count int not null default 0,
  critical_count int not null default 0,
  violation_count int not null default 0,
  warning_count int not null default 0,

  -- Context
  element text, -- Fire, Water, Earth, Air, Aether
  facet text, -- FIRE_1, WATER_2, etc.
  phase int,
  confidence numeric(3,2), -- 0.00 to 1.00
  is_uncertain boolean default false,

  -- Regeneration tracking
  regenerated boolean default false,
  regeneration_attempt int default 0,

  -- Summary
  summary text
);

-- Indexes for analytics queries
create index if not exists idx_socratic_validator_events_created_at
  on public.socratic_validator_events (created_at desc);

create index if not exists idx_socratic_validator_events_user_id
  on public.socratic_validator_events (user_id, created_at desc);

create index if not exists idx_socratic_validator_events_decision
  on public.socratic_validator_events (decision, created_at desc);

create index if not exists idx_socratic_validator_events_element
  on public.socratic_validator_events (element, created_at desc);

create index if not exists idx_socratic_validator_events_is_gold
  on public.socratic_validator_events (is_gold, created_at desc);

-- Index for finding rupture patterns
create index if not exists idx_socratic_validator_events_ruptures
  on public.socratic_validator_events using gin (ruptures);

-- Note: RLS policies removed for local PostgreSQL deployment
-- In local PostgreSQL, service_role and authenticated roles don't exist
-- These would be enabled in Supabase deployment only

-- Enable RLS (Row Level Security) - but no policies for local PostgreSQL
-- alter table public.socratic_validator_events enable row level security;

-- Supabase-only policies (commented out for local PostgreSQL):
-- create policy "Service role can manage validator events"
--   on public.socratic_validator_events
--   for all
--   to service_role
--   using (true)
--   with check (true);

-- create policy "Users can view their own validator events"
--   on public.socratic_validator_events
--   for select
--   to authenticated
--   using (auth.uid()::text = user_id);

-- Comments for documentation
comment on table public.socratic_validator_events is 'Tracks Socratic Validator decisions for all MAIA responses - Phase 3 of Three-Layer Conscience Architecture';
comment on column public.socratic_validator_events.decision is 'ALLOW = deliver as-is, FLAG = deliver but review, BLOCK = do not deliver, REGENERATE = attempt repair';
comment on column public.socratic_validator_events.is_gold is 'True if zero ruptures detected (perfect response)';
comment on column public.socratic_validator_events.ruptures is 'Array of detected ruptures with layer, code, severity, detected, recommendation';
comment on column public.socratic_validator_events.regenerated is 'True if this event resulted in response regeneration';
comment on column public.socratic_validator_events.regeneration_attempt is '0 = first pass, 1 = first regeneration, 2 = second regeneration, etc.';
