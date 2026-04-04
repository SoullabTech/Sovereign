-- Dream Journal entries
-- MVP: member-entered dreams with optional metadata tagging
-- No DreamWeaverEngine dependency — analysis layer comes later

CREATE TABLE IF NOT EXISTS dream_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Member-tagged metadata
  symbols TEXT[] DEFAULT '{}',
  archetypes TEXT[] DEFAULT '{}',
  emotion TEXT,                          -- joy, fear, mystery, transformation, peace
  lucidity TEXT DEFAULT 'unconscious',   -- unconscious, semi-aware, lucid, transcendent
  sleep_quality SMALLINT,                -- 1-100
  lunar_phase TEXT,                      -- new, waxing, full, waning

  -- Extensible metadata (future: DreamWeaver signals, elemental patterns)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary lookup: member's dreams in reverse chronological order
CREATE INDEX IF NOT EXISTS idx_dream_entries_member
  ON dream_entries(member_id, recorded_at DESC);

-- Symbol and archetype search
CREATE INDEX IF NOT EXISTS idx_dream_entries_symbols
  ON dream_entries USING GIN(symbols);
CREATE INDEX IF NOT EXISTS idx_dream_entries_archetypes
  ON dream_entries USING GIN(archetypes);
