-- database/migrations/20260211000001_member_videos.sql

create table if not exists member_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  heygen_url text not null,
  tags text[] not null default '{}',
  visibility text not null default 'member'
    check (visibility in ('member','practitioner','admin')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_videos_visibility_idx on member_videos (visibility);
create index if not exists member_videos_featured_idx on member_videos (is_featured);