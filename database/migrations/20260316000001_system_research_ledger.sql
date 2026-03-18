-- System Research Ledger: longitudinal metric aggregations
-- Stores daily and weekly computed metrics for system intelligence research.
-- No conversation content. Counts, rates, distributions, scores only.
--
-- Design invariants:
--   * metric_version enables future definition changes without ambiguity
--   * job_run_id ties rows to one aggregation run for debugging
--   * direction = 'insufficient_data' is valid and preferred on sparse baseline

CREATE TABLE IF NOT EXISTS system_research_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type     TEXT NOT NULL CHECK (period_type IN ('daily','weekly')),
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  metric_key      TEXT NOT NULL,
  metric_version  TEXT NOT NULL DEFAULT 'v1',
  metric_value    NUMERIC,
  metric_payload  JSONB NOT NULL DEFAULT '{}',
  direction       TEXT CHECK (direction IN ('improving','degrading','stable','insufficient_data')),
  baseline_value  NUMERIC,
  job_run_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique per version: allows v2 redefinitions to coexist with v1 history
CREATE UNIQUE INDEX IF NOT EXISTS uq_research_ledger_period_metric
  ON system_research_ledger (period_type, period_start, metric_key, metric_version);

CREATE INDEX IF NOT EXISTS idx_research_ledger_metric_key
  ON system_research_ledger (metric_key, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_research_ledger_period
  ON system_research_ledger (period_type, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_research_ledger_job_run
  ON system_research_ledger (job_run_id) WHERE job_run_id IS NOT NULL;

INSERT INTO schema_migrations (filename, applied_at)
  VALUES ('20260316000001_system_research_ledger.sql', NOW())
  ON CONFLICT (filename) DO NOTHING;
