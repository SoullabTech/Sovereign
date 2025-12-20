-- SOMATIC MEMORIES TABLE
-- Minimal table so the system stops erroring if pgvector isn't installed yet.
-- Created: 2025-12-14
-- Purpose: Store somatic/body-based memory patterns for consciousness work

create table if not exists public.somatic_memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id text,
  element text,
  tags text[] default '{}',
  content text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists somatic_memories_user_id_idx
  on public.somatic_memories(user_id);

create index if not exists somatic_memories_created_at_idx
  on public.somatic_memories(created_at desc);

-- Grant access (maia is the owner, no additional grants needed)
