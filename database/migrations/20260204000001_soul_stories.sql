-- Soul Stories: Living Mythology Co-Authored with MAIA
-- This is the database schema for evolving personal narratives
-- Philosophy: Stories GROW (not static readings), Co-authored, Living mythology

-- Main soul story table
CREATE TABLE IF NOT EXISTS soul_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Story metadata
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),

  -- Chart summary (denormalized for quick access)
  sun_sign VARCHAR(50),
  moon_sign VARCHAR(50),
  rising_sign VARCHAR(50),
  chart_pattern VARCHAR(50), -- Bucket, Bowl, Locomotive, etc.
  dominant_element VARCHAR(20), -- Fire, Water, Earth, Air
  key_themes JSONB DEFAULT '[]'::jsonb, -- Array of theme strings

  -- Story settings (member preferences)
  narrative_voice VARCHAR(20) DEFAULT 'second-person', -- 'third-person' or 'second-person'
  archetype_depth VARCHAR(20) DEFAULT 'tarnas-level', -- 'accessible', 'deep', 'tarnas-level'
  auto_generate_chapters BOOLEAN DEFAULT true,
  include_transits BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one story per member
  CONSTRAINT unique_member_story UNIQUE (member_id)
);

-- Story chapters table
CREATE TABLE IF NOT EXISTS story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES soul_stories(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Chapter metadata
  title VARCHAR(255) NOT NULL,
  chapter_number INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'in-revision', 'approved'

  -- The narrative content
  current_draft TEXT NOT NULL,

  -- Source data (what contributed to this chapter)
  source_data JSONB DEFAULT '{}'::jsonb, -- chartInsights, sessionIds, journalIds, etc.

  -- Timeline
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  period_start DATE, -- When this chapter's timeframe begins
  period_end DATE, -- When this chapter's timeframe ends (null for current)

  -- Ensure unique chapter numbers per story
  CONSTRAINT unique_chapter_number UNIQUE (story_id, chapter_number)
);

-- Member notes on chapters (co-authorship feedback)
CREATE TABLE IF NOT EXISTS story_member_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  note_text TEXT NOT NULL,
  related_section VARCHAR(255), -- Which part of the narrative this refers to
  resolved BOOLEAN DEFAULT false, -- Has MAIA incorporated this feedback?

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chapter revision history
CREATE TABLE IF NOT EXISTS story_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,

  previous_text TEXT NOT NULL,
  trigger VARCHAR(50) NOT NULL, -- 'maia-initial', 'member-feedback', 'session-integration', 'transit-update'
  trigger_context TEXT, -- Session ID, transit data, etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Story threads (patterns MAIA tracks across the journey)
CREATE TABLE IF NOT EXISTS story_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES soul_stories(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL, -- "Saturn focal point work", "Moon emotional healing"
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'emerging', -- 'emerging', 'active', 'integrated', 'completed'

  -- Related items
  related_chapters UUID[] DEFAULT '{}', -- Chapter IDs
  related_sessions UUID[] DEFAULT '{}', -- Session IDs
  related_journals UUID[] DEFAULT '{}', -- Journal entry IDs

  -- Chart context
  chart_context JSONB DEFAULT '{}'::jsonb, -- planets, houses, aspects, transits

  first_detected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timeline events (visual markers in the story journey)
CREATE TABLE IF NOT EXISTS story_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES soul_stories(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL, -- 'chapter-created', 'breakthrough-session', 'major-transit', 'life-event'
  title VARCHAR(255) NOT NULL,
  description TEXT,

  related_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
  related_session_id UUID,
  related_journal_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_soul_stories_member ON soul_stories(member_id);
CREATE INDEX IF NOT EXISTS idx_story_chapters_story ON story_chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_story_chapters_member ON story_chapters(member_id);
CREATE INDEX IF NOT EXISTS idx_story_chapters_status ON story_chapters(status);
CREATE INDEX IF NOT EXISTS idx_story_threads_story ON story_threads(story_id);
CREATE INDEX IF NOT EXISTS idx_story_threads_status ON story_threads(status);
CREATE INDEX IF NOT EXISTS idx_story_timeline_story ON story_timeline_events(story_id);
CREATE INDEX IF NOT EXISTS idx_story_timeline_date ON story_timeline_events(event_date);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_story_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_soul_stories_updated ON soul_stories;
CREATE TRIGGER trigger_soul_stories_updated
  BEFORE UPDATE ON soul_stories
  FOR EACH ROW EXECUTE FUNCTION update_story_updated_at();

DROP TRIGGER IF EXISTS trigger_story_chapters_updated ON story_chapters;
CREATE TRIGGER trigger_story_chapters_updated
  BEFORE UPDATE ON story_chapters
  FOR EACH ROW EXECUTE FUNCTION update_story_updated_at();

COMMENT ON TABLE soul_stories IS 'Living mythologies co-authored with MAIA - one per member';
COMMENT ON TABLE story_chapters IS 'Individual chapters in the soul story - co-authored and approved';
COMMENT ON TABLE story_member_notes IS 'Member feedback on MAIA drafts for true co-authorship';
COMMENT ON TABLE story_threads IS 'Patterns MAIA tracks across sessions, journals, and transits';
COMMENT ON TABLE story_timeline_events IS 'Visual markers in the story journey';
