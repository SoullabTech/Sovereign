-- AIN Executor Runs Table
-- Tracks all executions delegated from committee deliberations to Agent Zero
-- Links to deliberations table for complete audit trail
--
-- Usage: Committee decides → Executor runs → Result logged here → NocoDB shows it

-- ─── Main Table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ain_executor_runs (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Link to deliberation that triggered this execution
  deliberation_id text,

  -- Execution task identifier
  task_id text NOT NULL,

  -- Executor provider used
  provider text NOT NULL DEFAULT 'agent_zero',

  -- Task classification
  task_type text NOT NULL DEFAULT 'other',
  risk text NOT NULL DEFAULT 'medium',

  -- Execution outcome
  ok boolean NOT NULL DEFAULT false,
  summary text,
  duration_ms integer,

  -- Audit trail
  user_id text,

  -- Full result for debugging
  result_json jsonb
);

-- ─── Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup by deliberation (for linking to decisions)
CREATE INDEX IF NOT EXISTS ain_executor_runs_deliberation_id_idx
  ON ain_executor_runs(deliberation_id);

-- Fast lookup by task (for debugging)
CREATE INDEX IF NOT EXISTS ain_executor_runs_task_id_idx
  ON ain_executor_runs(task_id);

-- Fast lookup by user (for audit)
CREATE INDEX IF NOT EXISTS ain_executor_runs_user_id_idx
  ON ain_executor_runs(user_id);

-- Recent runs (for dashboard)
CREATE INDEX IF NOT EXISTS ain_executor_runs_created_at_idx
  ON ain_executor_runs(created_at DESC);

-- Provider analysis
CREATE INDEX IF NOT EXISTS ain_executor_runs_provider_idx
  ON ain_executor_runs(provider);

-- Success/failure analysis
CREATE INDEX IF NOT EXISTS ain_executor_runs_ok_idx
  ON ain_executor_runs(ok);

-- ─── Views for Analysis ────────────────────────────────────────────────────────

-- Executor success rates by provider
CREATE OR REPLACE VIEW executor_provider_stats AS
SELECT
  provider,
  COUNT(*) as total_runs,
  SUM(CASE WHEN ok THEN 1 ELSE 0 END) as successful_runs,
  SUM(CASE WHEN NOT ok THEN 1 ELSE 0 END) as failed_runs,
  ROUND(100.0 * SUM(CASE WHEN ok THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate,
  AVG(duration_ms) as avg_duration_ms
FROM ain_executor_runs
GROUP BY provider;

-- Executor runs by task type
CREATE OR REPLACE VIEW executor_task_type_stats AS
SELECT
  task_type,
  risk,
  COUNT(*) as total_runs,
  SUM(CASE WHEN ok THEN 1 ELSE 0 END) as successful_runs,
  ROUND(100.0 * SUM(CASE WHEN ok THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate,
  AVG(duration_ms) as avg_duration_ms
FROM ain_executor_runs
GROUP BY task_type, risk
ORDER BY total_runs DESC;

-- Recent executor activity (last 24 hours)
CREATE OR REPLACE VIEW executor_recent_activity AS
SELECT
  id,
  created_at,
  task_id,
  provider,
  task_type,
  risk,
  ok,
  summary,
  duration_ms,
  user_id,
  deliberation_id
FROM ain_executor_runs
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Decision → Executor linkage (joins with maia_decisions table)
CREATE OR REPLACE VIEW decision_executor_pairs AS
SELECT
  d.id as decision_id,
  d.final_label,
  d.final_confidence,
  d.decided_by,
  d.created_at as decision_created_at,
  d.deliberation_triggered,
  e.id as executor_run_id,
  e.task_id,
  e.provider,
  e.task_type,
  e.risk,
  e.ok as executor_ok,
  e.summary as executor_summary,
  e.duration_ms,
  e.created_at as executor_created_at
FROM maia_decisions d
LEFT JOIN ain_executor_runs e ON e.deliberation_id = d.id::text
ORDER BY d.created_at DESC;

-- ─── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE ain_executor_runs IS 'Tracks executions delegated from AIN committee to Agent Zero';
COMMENT ON COLUMN ain_executor_runs.deliberation_id IS 'UUID of the deliberation that triggered this execution';
COMMENT ON COLUMN ain_executor_runs.task_id IS 'UUID of the execution task sent to the executor';
COMMENT ON COLUMN ain_executor_runs.provider IS 'Executor provider: agent_zero, local_shell, mcp_tool, a2a_agent';
COMMENT ON COLUMN ain_executor_runs.task_type IS 'Type: web_research, repo_change, run_command, file_ops, etc.';
COMMENT ON COLUMN ain_executor_runs.risk IS 'Risk level: low, medium, high';
COMMENT ON COLUMN ain_executor_runs.ok IS 'Whether the execution succeeded';
COMMENT ON COLUMN ain_executor_runs.summary IS 'Human-readable summary of what happened';
COMMENT ON COLUMN ain_executor_runs.duration_ms IS 'Execution duration in milliseconds';
COMMENT ON COLUMN ain_executor_runs.result_json IS 'Full execution result for debugging';
