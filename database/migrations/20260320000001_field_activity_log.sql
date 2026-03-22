-- Field activity log: universal timeline for partner workspace events
CREATE TABLE IF NOT EXISTS field_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug TEXT NOT NULL,
  actor_id UUID REFERENCES members(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,  -- 'card_added' | 'card_moved' | 'card_deleted' | 'dm_sent' | 'decision_logged'
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_field_activity_slug ON field_activity_log(field_slug, created_at DESC);
