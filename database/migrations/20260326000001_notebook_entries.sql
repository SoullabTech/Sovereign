-- Living Notebook: Unified cognitive capture and structuring layer
-- Entries mature over time (note → insight → pattern), support auto-classification,
-- and bridge to existing state layers (spiral, themes, elements).

CREATE TABLE IF NOT EXISTS notebook_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL,
  content         TEXT NOT NULL,
  entry_type      TEXT NOT NULL DEFAULT 'note'
    CHECK (entry_type IN ('note','task','insight','pattern','decision','reminder')),
  title           TEXT,
  tags            TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'active'
    CHECK (status IN ('active','done','archived','snoozed')),
  priority        TEXT CHECK (priority IN ('low','medium','high','urgent')),
  due_at          TIMESTAMPTZ,
  source          TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','voice','maia','comms','import')),
  source_ref      JSONB,                -- flexible linking without hard FKs
  client_id       UUID,                 -- soft ref to clients table
  conversation_id UUID,                 -- soft ref to conversation
  session_id      UUID,                 -- soft ref to session
  primary_context TEXT DEFAULT 'personal'
    CHECK (primary_context IN ('personal','client','project','system')),
  classification  JSONB,                -- AI metadata (type confidence, detected tags, model version)

  -- Evolution fields (entries mature over time)
  weight          FLOAT DEFAULT 0,      -- importance / signal strength
  occurrence_count INT DEFAULT 1,       -- recurrence tracking
  last_seen_at    TIMESTAMPTZ,          -- last time this pattern reappeared
  evolution_state JSONB DEFAULT '{}',   -- promoted types, confidence changes, linked entries, themes/element/facet

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notebook_member
  ON notebook_entries (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notebook_type
  ON notebook_entries (member_id, entry_type)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notebook_client
  ON notebook_entries (client_id, created_at DESC)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notebook_due
  ON notebook_entries (member_id, due_at)
  WHERE due_at IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_notebook_context
  ON notebook_entries (member_id, primary_context)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notebook_weight
  ON notebook_entries (member_id, weight DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notebook_search
  ON notebook_entries USING gin (to_tsvector('english', coalesce(title, '') || ' ' || content));

-- Auto-update trigger (reuses existing function from other tables)
DO $$ BEGIN
  CREATE TRIGGER notebook_entries_updated_at
    BEFORE UPDATE ON notebook_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

COMMENT ON TABLE notebook_entries IS 'Living Notebook: unified cognitive capture with auto-classification and evolution';
COMMENT ON COLUMN notebook_entries.entry_type IS 'Auto-detected or manual: note, task, insight, pattern, decision, reminder';
COMMENT ON COLUMN notebook_entries.source IS 'Where this entry originated: manual, voice, maia (auto-capture), comms, import';
COMMENT ON COLUMN notebook_entries.source_ref IS 'Flexible back-reference: { type, id, url } — no hard FKs';
COMMENT ON COLUMN notebook_entries.primary_context IS 'Disambiguates personal vs client vs project vs system';
COMMENT ON COLUMN notebook_entries.classification IS 'AI classification metadata: { confidence, detected_type, detected_tags, model }';
COMMENT ON COLUMN notebook_entries.weight IS 'Signal strength — entries earn weight through recurrence and relevance';
COMMENT ON COLUMN notebook_entries.evolution_state IS 'Entry maturation: promoted types, theme/element/facet bridge, linked entries';
