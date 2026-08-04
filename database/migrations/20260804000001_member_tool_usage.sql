-- Member Tool Usage
-- Adds recency/frequency tracking to the member's Lab tools.
--
-- Why: My Lab shows 40+ instruments with no memory of what the member
-- actually reaches for. Without recency the surface cannot answer the
-- return test -- "when the member comes back after time, what do they
-- naturally resume?" -- and every visit starts from scratch.
--
-- Scope discipline: this records THAT a tool was opened from the Lab and
-- how often. It records no content, no duration, no session linkage, and
-- nothing about what happened inside the tool. It is navigation memory,
-- not experience memory.

ALTER TABLE member_enabled_tools
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS use_count INT NOT NULL DEFAULT 0;

-- Index for the "recently used" read: most-recent-first per member.
-- Partial index -- rows never opened are the majority and are never scanned.
CREATE INDEX IF NOT EXISTS idx_member_enabled_tools_recent
  ON member_enabled_tools (member_id, last_used_at DESC)
  WHERE last_used_at IS NOT NULL;

COMMENT ON COLUMN member_enabled_tools.last_used_at IS
  'When the member last opened this tool from My Lab. NULL = never opened. Navigation memory only -- no content, no duration.';
COMMENT ON COLUMN member_enabled_tools.use_count IS
  'How many times the member has opened this tool from My Lab.';
