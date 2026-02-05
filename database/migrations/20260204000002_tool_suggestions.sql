-- Tool Suggestions
-- Phase 1 of the community tool ecosystem
--
-- Members can suggest tools they want to see in the Lab.
-- Stewards review and triage. Best ideas become real tools.

CREATE TABLE IF NOT EXISTS tool_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Core suggestion fields
  title TEXT NOT NULL,
  category TEXT NOT NULL,                -- Must match toolRegistry categories
  short_description TEXT NOT NULL,       -- One-line promise
  use_case TEXT,                         -- When would you use it?
  ethical_notes TEXT,                    -- Anything to be careful about?
  reference_links TEXT,                  -- Links, inspiration

  -- Workflow
  status TEXT NOT NULL DEFAULT 'submitted',  -- submitted | triaged | accepted | building | shipped | declined
  steward_notes TEXT,                    -- Internal notes (not shown to member)
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for steward review queue (by status, oldest first)
CREATE INDEX IF NOT EXISTS idx_tool_suggestions_status
  ON tool_suggestions(status, created_at);

-- Index for member's own suggestions
CREATE INDEX IF NOT EXISTS idx_tool_suggestions_member
  ON tool_suggestions(member_id, created_at DESC);

-- Comments for documentation
COMMENT ON TABLE tool_suggestions IS
  'Member-submitted tool ideas for the Lab. Phase 1 of community tool ecosystem.';

COMMENT ON COLUMN tool_suggestions.status IS
  'Workflow states: submitted (new) | triaged (seen) | accepted (will build) | building (in progress) | shipped (done) | declined (with reason)';

COMMENT ON COLUMN tool_suggestions.ethical_notes IS
  'Member-provided notes on consent, harm risks, or stewardship considerations. Trains the culture.';

COMMENT ON COLUMN tool_suggestions.steward_notes IS
  'Internal notes from steward review. Not shown to the suggesting member.';
