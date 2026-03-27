-- Field Ideas: pre-decisional creative intelligence layer
-- Ideas ferment here before graduating into decisions or kanban cards.
-- Lifecycle: spark → developing → intensifying → ripe → (adopted / parked / composted)

CREATE TABLE IF NOT EXISTS field_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'spark',   -- spark|developing|intensifying|ripe|adopted|parked|composted
  warmth TEXT DEFAULT 'low',              -- low|medium|high
  origin TEXT,                            -- meeting|maia|personal|conversation
  tags TEXT[] DEFAULT '{}',
  promoted_to_decision_id UUID REFERENCES field_decisions(id) ON DELETE SET NULL,
  promoted_to_kanban_id UUID REFERENCES field_kanban_cards(id) ON DELETE SET NULL,
  promotion_reason TEXT,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_ideas_slug
  ON field_ideas(field_slug, status, created_at DESC);

-- Idea iterations: version trail showing how thinking evolved
CREATE TABLE IF NOT EXISTS field_idea_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES field_ideas(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_idea_iterations
  ON field_idea_iterations(idea_id, version_number);
