-- ============================================
-- MEDIA STUDIO BUILD A
--
-- Sovereign media management for MAIA Studio.
-- Replaces stub studio_media_projects table.
-- Job queue uses FOR UPDATE SKIP LOCKED pattern
-- (same as comms_analysis_queue).
-- ============================================

-- 1. media_projects

CREATE TABLE IF NOT EXISTS media_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'image', 'document')),
  status TEXT NOT NULL DEFAULT 'uploading'
    CHECK (status IN ('uploading', 'processing', 'ready', 'error', 'archived')),
  duration_seconds NUMERIC(10,2),
  width INTEGER,
  height INTEGER,
  file_size_bytes BIGINT,
  mime_type TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Consent / trust fields
  privacy_level TEXT NOT NULL DEFAULT 'private'
    CHECK (privacy_level IN ('private', 'standard', 'sensitive', 'confidential')),
  contains_sensitive_content BOOLEAN NOT NULL DEFAULT false,
  client_consent_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (client_consent_status IN ('not_required', 'pending', 'obtained', 'denied')),
  external_editing_allowed BOOLEAN NOT NULL DEFAULT false,
  publishing_allowed BOOLEAN NOT NULL DEFAULT false,
  redaction_required BOOLEAN NOT NULL DEFAULT false,
  ai_processing_allowed BOOLEAN NOT NULL DEFAULT true,

  -- Meaning classification (populated by classify job after transcription)
  inference_type TEXT,
  expansion_level TEXT,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'upload'
    CHECK (source IN ('upload', 'recording', 'import', 'voice_note')),
  source_session_id UUID,
  source_voice_note_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_projects_practitioner ON media_projects(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_media_projects_status ON media_projects(status);
CREATE INDEX IF NOT EXISTS idx_media_projects_media_type ON media_projects(media_type);
CREATE INDEX IF NOT EXISTS idx_media_projects_created ON media_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_projects_tags ON media_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_projects_privacy ON media_projects(privacy_level);

-- 2. media_assets

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL
    CHECK (asset_type IN ('original', 'thumbnail', 'waveform', 'audio_extract', 'caption_file', 'processed')),
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(project_id, asset_type);

-- 3. media_transcripts

CREATE TABLE IF NOT EXISTS media_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  engine TEXT NOT NULL DEFAULT 'whisper-local',
  language TEXT DEFAULT 'en',
  full_text TEXT,
  segments JSONB,
  speaker_count INTEGER,
  word_count INTEGER,
  summary TEXT,
  summary_model TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_transcripts_project ON media_transcripts(project_id);
CREATE INDEX IF NOT EXISTS idx_media_transcripts_status ON media_transcripts(status);

-- 4. media_jobs (async processing queue)

CREATE TABLE IF NOT EXISTS media_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL
    CHECK (job_type IN ('validate', 'inspect', 'thumbnail', 'waveform', 'audio_extract', 'transcribe', 'classify', 'summarize')),
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'done', 'failed', 'skipped')),
  is_critical BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 5,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  depends_on UUID REFERENCES media_jobs(id),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_media_jobs_queue
  ON media_jobs(status, priority, queued_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_media_jobs_project ON media_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_media_jobs_depends ON media_jobs(depends_on) WHERE depends_on IS NOT NULL;

-- 5. media_exports

CREATE TABLE IF NOT EXISTS media_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL
    CHECK (export_type IN ('transcript_txt', 'transcript_srt', 'transcript_vtt', 'audio_mp3', 'audio_wav', 'video_mp4')),
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  format_options JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_exports_project ON media_exports(project_id);

-- 6. media_integrations

CREATE TABLE IF NOT EXISTS media_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('descript', 'heygen', 'canva')),
  external_id TEXT,
  external_url TEXT,
  sync_status TEXT NOT NULL DEFAULT 'linked'
    CHECK (sync_status IN ('linked', 'syncing', 'synced', 'error')),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, service)
);

CREATE INDEX IF NOT EXISTS idx_media_integrations_project ON media_integrations(project_id);

-- 7. media_publish_targets

CREATE TABLE IF NOT EXISTS media_publish_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL
    CHECK (platform IN ('youtube', 'spotify', 'podcast_rss', 'website', 'social', 'nostr')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'removed')),
  external_url TEXT,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_publish_targets_project ON media_publish_targets(project_id);

-- Stale job reaper function

CREATE OR REPLACE FUNCTION fn_requeue_stale_media_jobs(stale_threshold INTERVAL)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE requeued INTEGER;
BEGIN
  UPDATE media_jobs
  SET status = 'queued', claimed_by = NULL, claimed_at = NULL,
      heartbeat_at = NULL, started_at = NULL
  WHERE status = 'processing'
    AND heartbeat_at < NOW() - stale_threshold
    AND attempts < max_attempts;
  GET DIAGNOSTICS requeued = ROW_COUNT;
  RETURN requeued;
END;
$$;

-- Deprecate old table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'studio_media_projects') THEN
    COMMENT ON TABLE studio_media_projects IS 'DEPRECATED: Replaced by media_projects in Build A (20260407100001)';
  END IF;
END $$;
