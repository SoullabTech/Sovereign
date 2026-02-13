-- Add mode_used and ended_at to session_summary_queue
-- Required by lib/sovereign/sessionFinalizer.ts (continuity path)
-- These columns track which session mode triggered the summary
-- and when the session actually ended.

ALTER TABLE session_summary_queue ADD COLUMN IF NOT EXISTS mode_used TEXT DEFAULT 'continuity';
ALTER TABLE session_summary_queue ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ DEFAULT now();
