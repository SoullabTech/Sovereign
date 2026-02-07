-- Audio usage event log (append-only) for metering + pricing
-- Stores bytes and (if known) seconds, per route, per member.

CREATE TABLE IF NOT EXISTS audio_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  route text NOT NULL,
  kind text NOT NULL DEFAULT 'audio', -- e.g. 'audio', 'transcription', 'upload'
  bytes bigint NOT NULL DEFAULT 0,
  seconds integer NULL,
  status text NOT NULL DEFAULT 'accepted', -- accepted|ok|error|blocked
  error_code text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audio_usage_events_member_created_at_idx
  ON audio_usage_events (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audio_usage_events_route_created_at_idx
  ON audio_usage_events (route, created_at DESC);

CREATE INDEX IF NOT EXISTS audio_usage_events_status_idx
  ON audio_usage_events (status);
