-- Process Items: the unified Field layer
-- Six types: challenge, change, decision, breakthrough, question, next_edge
--
-- Decisions and Changes also live in studio_decisions / studio_changes
-- for their rich domain logic (council, hexagram, iterations).
-- Process items serve as the Field-level index across all six types.

-- Also moves studio_mode from practitioners to members.

-- 1. studio_mode on members
ALTER TABLE members ADD COLUMN IF NOT EXISTS studio_mode TEXT NOT NULL DEFAULT 'practice';
COMMENT ON COLUMN members.studio_mode IS 'Orientation toggle: personal (Field) or practice (operations)';
ALTER TABLE practitioners DROP COLUMN IF EXISTS studio_mode;

-- 2. Process Items
CREATE TABLE IF NOT EXISTS process_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  practitioner_id UUID REFERENCES practitioners(id),
  type TEXT NOT NULL CHECK (type IN ('challenge', 'change', 'decision', 'breakthrough', 'question', 'next_edge')),
  title TEXT NOT NULL,
  body TEXT,
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  status TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'resolved', 'released', 'archived')),
  urgency TEXT DEFAULT 'none' CHECK (urgency IN ('none', 'low', 'medium', 'high', 'acute')),
  tags TEXT[] DEFAULT '{}',
  -- Optional link to rich domain record
  source_table TEXT,  -- 'studio_changes', 'studio_decisions', 'field_records'
  source_id UUID,     -- ID in that table
  -- Ancestry
  parent_id UUID REFERENCES process_items(id),
  -- Temporal
  occurred_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_process_items_member ON process_items(member_id);
CREATE INDEX IF NOT EXISTS idx_process_items_member_type ON process_items(member_id, type);
CREATE INDEX IF NOT EXISTS idx_process_items_member_status ON process_items(member_id, status);
CREATE INDEX IF NOT EXISTS idx_process_items_source ON process_items(source_table, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_process_items_tags ON process_items USING gin(tags);

CREATE OR REPLACE TRIGGER update_process_items_updated_at
  BEFORE UPDATE ON process_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Process Item Events (evolution log)
CREATE TABLE IF NOT EXISTS process_item_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES process_items(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'updated', 'reflected', 'consulted',
    'resolved', 'released', 'reopened', 'promoted', 'linked'
  )),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_process_item_events_item ON process_item_events(item_id);
CREATE INDEX IF NOT EXISTS idx_process_item_events_item_type ON process_item_events(item_id, event_type);
