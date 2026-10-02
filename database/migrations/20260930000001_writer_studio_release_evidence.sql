-- Writer's Studio stewardship dashboard evidence substrate.
-- Additive, admin-only, structural telemetry only: no manuscript/source/prompt content.
-- Rollback: DROP the three tables below; no member-authored content is stored here.

CREATE TABLE IF NOT EXISTS writer_studio_releases (
  release_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  phase TEXT NOT NULL,
  candidate_sha TEXT NOT NULL,
  canonical_parent_sha TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('draft','candidate','founder_witness','beta','released','held','rolled_back')),
  rollback_plan TEXT NOT NULL,
  migration_set JSONB NOT NULL DEFAULT '[]'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  what_changed TEXT,
  remains_uncertain TEXT,
  falsifier TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writer_studio_release_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_key TEXT NOT NULL REFERENCES writer_studio_releases(release_key) ON DELETE CASCADE,
  gate_id TEXT NOT NULL CHECK (gate_id IN ('G0','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10')),
  status TEXT NOT NULL CHECK (status IN ('grey','green','amber','red')),
  evidence_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_by TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writer_studio_release_evidence_release_gate_time
  ON writer_studio_release_evidence (release_key, gate_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS writer_studio_metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_key TEXT NOT NULL REFERENCES writer_studio_releases(release_key) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  value NUMERIC,
  numerator BIGINT,
  denominator BIGINT,
  sample_count BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'grey'
    CHECK (status IN ('grey','green','amber','red')),
  notes TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writer_studio_metric_snapshots_release_metric_time
  ON writer_studio_metric_snapshots (release_key, metric_id, calculated_at DESC);

COMMENT ON TABLE writer_studio_releases IS
  'Release identity and stewardship declarations for Writer''s Studio; no member content.';
COMMENT ON TABLE writer_studio_release_evidence IS
  'Append-only gate evidence for Writer''s Studio releases; payloads must remain structural and content-free.';
COMMENT ON TABLE writer_studio_metric_snapshots IS
  'Aggregated Writer''s Studio stewardship metrics; no raw manuscript/source/prompt content.';
