-- Elemental Alchemy Journal Entries
-- Structured reflections tied to elements, chapters, and practices

CREATE TABLE IF NOT EXISTS elemental_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  chapter_num INTEGER,
  practice_id TEXT,
  prompt TEXT,
  content TEXT NOT NULL,
  insights TEXT[] DEFAULT '{}',
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ej_user_id ON elemental_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ej_user_element ON elemental_journal_entries(user_id, element);
CREATE INDEX IF NOT EXISTS idx_ej_created ON elemental_journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ej_practice ON elemental_journal_entries(practice_id) WHERE practice_id IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_elemental_journal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS elemental_journal_updated_at ON elemental_journal_entries;
CREATE TRIGGER elemental_journal_updated_at
  BEFORE UPDATE ON elemental_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_elemental_journal_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON elemental_journal_entries TO soullab;
