-- Content Pipeline: manuscript extraction → transformation → curated posts
-- Phase 1: manual approval only, single-item review

CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  source_title TEXT,
  source_element TEXT,
  post_type TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_post_type CHECK (post_type IN ('short', 'long', 'poetic', 'audio_script')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'approved', 'scheduled'))
);

CREATE INDEX IF NOT EXISTS idx_content_posts_member ON content_posts(member_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);

COMMENT ON TABLE content_posts IS 'Curated content from manuscript pipeline. Manual approval only — no auto-publish.';
COMMENT ON COLUMN content_posts.post_type IS 'short | long | poetic | audio_script';
COMMENT ON COLUMN content_posts.status IS 'draft → approved → scheduled (manual transitions only)';
