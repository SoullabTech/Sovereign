-- Member Videos Table
-- Phase 1.5: Simple video library with manual publish workflow
-- Admin generates scripts -> produces videos in HeyGen -> pastes URL -> publishes

CREATE TABLE IF NOT EXISTS member_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  heygen_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'member'
    CHECK (visibility IN ('member', 'practitioner', 'admin')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  duration_seconds INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS member_videos_visibility_idx ON member_videos (visibility);
CREATE INDEX IF NOT EXISTS member_videos_featured_idx ON member_videos (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS member_videos_sort_idx ON member_videos (sort_order, created_at DESC);

-- Updated_at trigger (if not exists)
CREATE OR REPLACE FUNCTION update_member_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_videos_updated_at ON member_videos;
CREATE TRIGGER member_videos_updated_at
  BEFORE UPDATE ON member_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_member_videos_updated_at();

COMMENT ON TABLE member_videos IS 'Soullab Guides - explainer videos for members';
COMMENT ON COLUMN member_videos.heygen_url IS 'HeyGen video URL (or other hosted video)';
COMMENT ON COLUMN member_videos.visibility IS 'member=all members, practitioner=practitioners only, admin=admin only';
COMMENT ON COLUMN member_videos.is_featured IS 'Show in featured section at top of library';
COMMENT ON COLUMN member_videos.sort_order IS 'Manual ordering (lower = first)';
