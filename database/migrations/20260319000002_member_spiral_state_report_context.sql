-- Bridge D extension: Active report context snapshot on member_spiral_state
-- Allows the oracle to load a lightweight Spiralogic report snapshot without
-- querying spiralogic_reports on every conversation turn.

ALTER TABLE member_spiral_state
  ADD COLUMN IF NOT EXISTS active_report_context JSONB;

COMMENT ON COLUMN member_spiral_state.active_report_context IS
  'Lightweight snapshot of the member''s most recent Spiralogic report — used to ground MAIA oracle context without passing full report data.';
