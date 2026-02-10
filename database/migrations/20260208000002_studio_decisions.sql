-- Studio Decisions Table
-- Consultant's decision analysis tool using AIN consultation engine
--
-- A decision is a moment where a leader faces a choice.
-- The consultant captures the context, runs the AIN council,
-- and prepares questions to bring back to the leader.
--
-- This is a consultant-facing tool, not client-facing.

CREATE TABLE IF NOT EXISTS studio_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL,

  -- Decision context (what the consultant captures)
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  stakes TEXT,
  time_pressure TEXT CHECK (time_pressure IN ('none', 'low', 'medium', 'high', 'urgent')),
  emotional_state TEXT,

  -- AIN consultation result (full ConsultationResult as JSONB)
  -- { insights, tensions, risks, recommendation, framingsUsed,
  --   confidence, emergenceRating, rawResponses, framingWeights }
  council_result JSONB,

  -- Consultant's synthesis (after reviewing council output)
  consultant_notes TEXT,
  questions_for_leader TEXT[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'consulting', 'complete', 'archived')),

  -- Timestamps
  consulted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_studio_decisions_practitioner
  ON studio_decisions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_studio_decisions_client
  ON studio_decisions(client_id);
CREATE INDEX IF NOT EXISTS idx_studio_decisions_team
  ON studio_decisions(team_id);
CREATE INDEX IF NOT EXISTS idx_studio_decisions_status
  ON studio_decisions(practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_studio_decisions_created
  ON studio_decisions(created_at DESC);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS tr_studio_decisions_updated_at ON studio_decisions;
CREATE TRIGGER tr_studio_decisions_updated_at
  BEFORE UPDATE ON studio_decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE studio_decisions IS
  'Decision analysis records — consultant preparation tool using AIN council';
