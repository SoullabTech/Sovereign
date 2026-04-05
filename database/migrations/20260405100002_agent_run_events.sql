-- Agent run event trace: step-by-step detail for each agent execution
-- Pairs with agent_runs for one-row summary + full trace

CREATE TABLE IF NOT EXISTS agent_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,              -- started | attempt_started | retry | parsed_output | filter_applied | saved_drafts | failed | completed
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_run_events_run_id
  ON agent_run_events(agent_run_id);

CREATE INDEX IF NOT EXISTS idx_agent_run_events_event_type
  ON agent_run_events(event_type);

CREATE INDEX IF NOT EXISTS idx_agent_run_events_created_at
  ON agent_run_events(created_at DESC);

COMMENT ON TABLE agent_run_events IS 'Step trace for agent runs. Read-only observability — never feeds back into agents.';
