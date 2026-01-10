-- Quick Journal: Base table for dreams, day reflections, and handwriting entries
-- Supports rapid capture with minimal friction

CREATE TABLE IF NOT EXISTS quick_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('dream', 'day', 'handwriting')),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'quick_sheet',
  meta JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_quick_journal_user_id ON quick_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_journal_created_at ON quick_journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quick_journal_type ON quick_journal_entries(entry_type);

COMMENT ON TABLE quick_journal_entries IS 'Fast capture for dreams, day reflections, and handwritten notes';
COMMENT ON COLUMN quick_journal_entries.entry_type IS 'Type: dream (night capture), day (reflection), handwriting (OCR)';
COMMENT ON COLUMN quick_journal_entries.source IS 'Capture source: quick_sheet, voice, scan';
COMMENT ON COLUMN quick_journal_entries.meta IS 'Optional metadata (OCR confidence, image info)';
