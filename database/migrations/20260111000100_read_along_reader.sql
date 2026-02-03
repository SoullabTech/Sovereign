-- Read-Along Reader Tables
-- Supports segment-synced audiobook experience with highlights, notes, and MAIA dialogue

-- Audiobook chapters metadata
CREATE TABLE IF NOT EXISTS audiobook_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug TEXT NOT NULL,          -- e.g., 'elemental-alchemy'
  chapter_slug TEXT NOT NULL,       -- e.g., 'preface', 'ch01'
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  audio_url TEXT,                   -- path to MP3
  duration_ms INTEGER,              -- total duration
  segment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_slug, chapter_slug)
);

-- Audiobook segments (text + timing)
CREATE TABLE IF NOT EXISTS audiobook_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES audiobook_chapters(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,   -- order within chapter
  text TEXT NOT NULL,               -- the spoken text
  start_ms INTEGER NOT NULL,        -- start time in audio
  end_ms INTEGER NOT NULL,          -- end time in audio
  segment_type TEXT DEFAULT 'paragraph', -- paragraph, heading, quote, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, segment_index)
);

-- Reading moments (highlights, notes, questions)
CREATE TABLE IF NOT EXISTS reading_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES audiobook_segments(id) ON DELETE CASCADE,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('highlight', 'note', 'question', 'insight')),
  content TEXT,                     -- user's note or MAIA's response
  ritual_mode TEXT,                 -- earth, water, fire, air, aether
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audiobook_segments_chapter ON audiobook_segments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_audiobook_segments_timing ON audiobook_segments(chapter_id, start_ms);
CREATE INDEX IF NOT EXISTS idx_reading_moments_member ON reading_moments(member_id);
CREATE INDEX IF NOT EXISTS idx_reading_moments_segment ON reading_moments(segment_id);
