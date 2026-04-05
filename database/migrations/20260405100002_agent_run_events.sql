-- Agent run event trace: step-by-step detail for each agent execution
-- Pairs with bounded_agent_runs for one-row summary + full trace

CREATE TABLE IF NOT EXISTS bounded_agent_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  agent_run_id UUID NOT NULL REFERENCES bounded_agent_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,              -- started | attempt_started | retry | parsed_output | filter_applied | saved_drafts | failed | completed
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_run_events_run_id
  ON bounded_agent_run_events(agent_run_id);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_run_events_event_type
  ON bounded_agent_run_events(event_type);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_run_events_created_at
  ON bounded_agent_run_events(created_at DESC);

COMMENT ON TABLE bounded_agent_run_events IS 'Step trace for bounded agent runs. Read-only observability — never feeds back into agents.';
