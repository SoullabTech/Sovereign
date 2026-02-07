-- ============================================
-- Migration: Audio Usage Events
-- ============================================
-- Per-event logging for audio uploads/transcriptions.
-- Feeds future metering, quotas, and pricing decisions.
-- Philosophy: log the shape of usage, not the content.

CREATE TABLE IF NOT EXISTS audio_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- What happened
  event_type TEXT NOT NULL,  -- 'upload', 'transcribe', 'stream_chunk'
  route TEXT NOT NULL,       -- e.g. '/api/journal/quick/audio'

  -- Size & duration (nullable — not all events have both)
  file_size_bytes BIGINT,
  duration_ms INTEGER,
  mime_type TEXT,

  -- Outcome
  status TEXT NOT NULL DEFAULT 'ok',  -- 'ok', 'rejected', 'error'
  reject_reason TEXT,                 -- 'PAID_FEATURE', 'CONSENT_DISABLED', 'UPLOADS_DISABLED', etc.

  -- Context (no content, no PII beyond member_id)
  session_id TEXT,           -- supervision session, journal entry, etc.
  tier TEXT,                 -- member tier at time of event

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for quota checks, billing queries, and analytics
CREATE INDEX IF NOT EXISTS idx_audio_usage_member_id
  ON audio_usage_events(member_id);

CREATE INDEX IF NOT EXISTS idx_audio_usage_created_at
  ON audio_usage_events(created_at);

CREATE INDEX IF NOT EXISTS idx_audio_usage_member_period
  ON audio_usage_events(member_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audio_usage_event_type
  ON audio_usage_events(event_type);

COMMENT ON TABLE audio_usage_events IS 'Per-event audio usage logging for metering and pricing decisions. Logs shape, not content.';
