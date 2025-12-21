-- backend
-- Create tables for Consciousness Trace Spine + S-Expression rules

create table if not exists consciousness_traces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text not null,
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
  on consciousness_traces (user_id, created_at desc);

create index if not exists consciousness_traces_request_idx
  on consciousness_traces (request_id);

create index if not exists consciousness_traces_trace_gin
  on consciousness_traces using gin (trace);

-- Rules table (S-expression rules as data, versioned + enabled)
create table if not exists consciousness_rules (
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
  on consciousness_rules (enabled, priority desc, updated_at desc);

create or replace function touch_consciousness_rules_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_consciousness_rules_updated_at on consciousness_rules;

create trigger trg_touch_consciousness_rules_updated_at
before update on consciousness_rules
for each row
execute function touch_consciousness_rules_updated_at();
