-- Field Kanban: shared project board for partner fields
CREATE TABLE IF NOT EXISTS field_kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug TEXT NOT NULL,
  column_id TEXT NOT NULL,  -- 'in-progress' | 'planned' | 'shipped' | 'decision' | 'insight'
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_kanban_slug ON field_kanban_cards(field_slug);
CREATE INDEX IF NOT EXISTS idx_field_kanban_column ON field_kanban_cards(field_slug, column_id);
