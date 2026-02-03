-- Studio settings table for Descript integration
CREATE TABLE IF NOT EXISTS studio_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studio media projects table
CREATE TABLE IF NOT EXISTS studio_media_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local', -- 'local' or 'descript'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'importing', 'editing', 'complete', 'recording'
  duration_seconds INTEGER,
  source_file_url TEXT,
  descript_import_url TEXT,
  descript_project_id TEXT,
  descript_published_slug TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_studio_media_projects_source ON studio_media_projects(source);
CREATE INDEX IF NOT EXISTS idx_studio_media_projects_status ON studio_media_projects(status);

-- Comment
COMMENT ON TABLE studio_settings IS 'Key-value store for Studio settings including Descript API token';
COMMENT ON TABLE studio_media_projects IS 'Media projects for Studio, tracks both local recordings and Descript projects';
