-- backend
-- Create tables for Consciousness Trace Spine + S-Expression rules

create table if not exists public.consciousness_traces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text,
  request_id text,
  agent text,
  model text,

  -- fast filters / summaries
  facet text,
  mode text,
  confidence numeric,
  safety_level text,
  latency_ms integer,

  -- references (optional)
  memory_ids uuid[],

  -- full trace object
  trace jsonb not null
);

create index if not exists consciousness_traces_user_created_idx
  on public.consciousness_traces (user_id, created_at desc);

create index if not exists consciousness_traces_request_idx
  on public.consciousness_traces (request_id);

create index if not exists consciousness_traces_trace_gin
  on public.consciousness_traces using gin (trace);

alter table public.consciousness_traces enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='consciousness_traces' and policyname='select_own_traces'
  ) then
    create policy select_own_traces
      on public.consciousness_traces
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='consciousness_traces' and policyname='insert_own_traces'
  ) then
    create policy insert_own_traces
      on public.consciousness_traces
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Rules table (S-expression rules as data, versioned + enabled)
create table if not exists public.consciousness_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null unique,
  sexpr text not null,
  enabled boolean not null default true,
  priority integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists consciousness_rules_enabled_priority_idx
  on public.consciousness_rules (enabled, priority desc, updated_at desc);

alter table public.consciousness_rules enable row level security;

-- Default: anyone authenticated can read enabled rules (backend can also cache them).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='consciousness_rules' and policyname='read_enabled_rules'
  ) then
    create policy read_enabled_rules
      on public.consciousness_rules
      for select
      using (enabled = true);
  end if;
end $$;

-- Optional: only service-role updates rules; keep RLS strict (no insert/update policies here).

create or replace function public.touch_consciousness_rules_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_consciousness_rules_updated_at on public.consciousness_rules;

create trigger trg_touch_consciousness_rules_updated_at
before update on public.consciousness_rules
for each row
execute function public.touch_consciousness_rules_updated_at();
