CREATE TABLE IF NOT EXISTS field_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  context TEXT,
  recommendation TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'decided' | 'deferred' | 'superseded'
  deadline DATE,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES members(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_decisions_slug ON field_decisions(field_slug, status, created_at DESC);
