-- COMMUNITY COMMONS POSTS TABLE
-- Date: December 14, 2025
-- Purpose: Store wisdom contributions from Level 4+ users

CREATE TABLE IF NOT EXISTS community_commons_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Post content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Moderation
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  moderation_notes TEXT,

  -- Cognitive context (captured at time of post)
  cognitive_level_at_post NUMERIC,
  cognitive_stability_at_post TEXT
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_commons_posts_user_id ON community_commons_posts(user_id);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_commons_posts_created_at ON community_commons_posts(created_at DESC);

-- Index for published posts
CREATE INDEX IF NOT EXISTS idx_commons_posts_published ON community_commons_posts(is_published) WHERE is_published = TRUE;

-- Index for featured posts
CREATE INDEX IF NOT EXISTS idx_commons_posts_featured ON community_commons_posts(is_featured) WHERE is_featured = TRUE;

-- Full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_commons_posts_search ON community_commons_posts USING gin(to_tsvector('english', title || ' ' || content));

-- Comments table (for post discussions)
CREATE TABLE IF NOT EXISTS community_commons_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_commons_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  parent_comment_id UUID REFERENCES community_commons_comments(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Engagement
  like_count INTEGER DEFAULT 0,

  -- Moderation
  is_published BOOLEAN DEFAULT TRUE,
  moderation_notes TEXT
);

-- Index for post comments
CREATE INDEX IF NOT EXISTS idx_commons_comments_post_id ON community_commons_comments(post_id);

-- Index for user comments
CREATE INDEX IF NOT EXISTS idx_commons_comments_user_id ON community_commons_comments(user_id);

-- Index for threaded replies
CREATE INDEX IF NOT EXISTS idx_commons_comments_parent ON community_commons_comments(parent_comment_id);

COMMENT ON TABLE community_commons_posts IS 'Community Commons posts - wisdom contributions from users at Level 4+ (pattern recognition and above)';
COMMENT ON COLUMN community_commons_posts.cognitive_level_at_post IS 'User''s rolling average cognitive level at time of posting (captured for longitudinal research)';
COMMENT ON COLUMN community_commons_posts.cognitive_stability_at_post IS 'User''s cognitive stability at time of posting (stable/ascending/descending/volatile)';
