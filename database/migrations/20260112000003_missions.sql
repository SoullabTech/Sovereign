-- Missions table for tracking creative manifestations on the consciousness field map
-- Each mission appears as a pulsing dot in the relevant house

CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Mission details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'emerging' CHECK (status IN ('emerging', 'active', 'completed', 'urgent')),

  -- Chart placement
  house INTEGER NOT NULL CHECK (house >= 1 AND house <= 12),
  related_planets TEXT[], -- Array of planet names
  related_sign TEXT,

  -- Timeline
  identified_date TIMESTAMPTZ DEFAULT NOW(),
  started_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,

  -- Progress
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Story integration
  related_chapter_id UUID,
  related_thread_ids UUID[],
  related_session_ids UUID[],

  -- Transit context
  transit_context JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_house ON missions(house);
CREATE INDEX IF NOT EXISTS idx_missions_user_status ON missions(user_id, status);

-- Grant permissions
GRANT ALL ON missions TO PUBLIC;
