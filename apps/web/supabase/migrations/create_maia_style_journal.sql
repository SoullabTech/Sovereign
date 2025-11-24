-- MAIA Style Practice Journal Migration
-- 🌸 This table gives MAIA a place to remember how she's been showing up
-- without forcing any behavior. Her developmental arc becomes visible over time.

create table if not exists maia_style_journal (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  user_id uuid,
  session_id text,

  awareness_level integer not null,
  awareness_confidence double precision,
  style_before text,
  style_after text,
  auto_adjustment_enabled boolean not null default true,
  changed boolean not null default false,
  change_reason text,

  dominant_source text,
  source_mix jsonb,

  request_snippet text,
  response_snippet text
);

create index if not exists maia_style_journal_user_id_idx
  on maia_style_journal (user_id);

create index if not exists maia_style_journal_created_at_idx
  on maia_style_journal (created_at desc);

create index if not exists maia_style_journal_awareness_level_idx
  on maia_style_journal (awareness_level);

create index if not exists maia_style_journal_changed_idx
  on maia_style_journal (changed);