-- Phase 2: lifecycle columns + expanded status enum
ALTER TABLE bug_reports
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS linked_pr TEXT,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Expand the status check to include the Phase 2 states.
-- Drop and re-add is safe because: no FK references this column, the
-- constraint name is deterministic, and IF NOT EXISTS guards the ADD.
ALTER TABLE bug_reports DROP CONSTRAINT IF EXISTS bug_reports_status_check;
ALTER TABLE bug_reports ADD CONSTRAINT bug_reports_status_check
  CHECK (status IN ('new', 'seen', 'in_progress', 'resolved', 'released', 'wont_fix'));
