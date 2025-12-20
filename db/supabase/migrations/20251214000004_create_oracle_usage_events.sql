-- Oracle Usage Events tracking for Option A: "Oracle = DEEP = Opus"
-- Track cost, usage patterns, and performance for premium oracle endpoint

create table if not exists oracle_usage_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),

  request_id text not null,
  user_id text,
  session_id text,
  ip text,

  level int not null,
  model text,
  status text not null, -- 'ok' | 'error' | 'rate_limited' | 'unauthorized'
  duration_ms int,

  prompt_tokens int,
  completion_tokens int,
  total_tokens int
);

create index if not exists oracle_usage_events_created_at_idx on oracle_usage_events (created_at desc);
create index if not exists oracle_usage_events_user_id_idx on oracle_usage_events (user_id);
create index if not exists oracle_usage_events_request_id_idx on oracle_usage_events (request_id);

-- Add some helpful views for cost monitoring
create or replace view oracle_usage_summary as
select
  date_trunc('day', created_at) as day,
  count(*) as total_requests,
  count(*) filter (where status = 'ok') as successful_requests,
  count(*) filter (where status = 'error') as error_requests,
  count(*) filter (where status = 'rate_limited') as rate_limited_requests,
  avg(duration_ms) filter (where status = 'ok') as avg_duration_ms,
  sum(total_tokens) filter (where status = 'ok') as total_tokens_used,
  avg(total_tokens) filter (where status = 'ok') as avg_tokens_per_request
from oracle_usage_events
group by date_trunc('day', created_at)
order by day desc;

-- Add user usage tracking view for quotas
create or replace view oracle_user_usage as
select
  user_id,
  date_trunc('day', created_at) as day,
  count(*) as requests_today,
  sum(total_tokens) as tokens_used_today,
  avg(duration_ms) as avg_response_time_ms
from oracle_usage_events
where user_id is not null
  and status = 'ok'
  and created_at >= date_trunc('day', now())
group by user_id, date_trunc('day', created_at)
order by requests_today desc;