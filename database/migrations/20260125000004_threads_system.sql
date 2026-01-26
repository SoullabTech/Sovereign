-- Threads System: Trajectories and Storylines
-- A thread is a string of beads - how things unfold over time

-- Main threads table
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Identity
  title TEXT NOT NULL,          -- "Vocation emergence", "Partnership healing"
  description TEXT,

  -- Life domain
  domain TEXT CHECK (domain IN (
    'vocation', 'relationship', 'health', 'creativity',
    'spirituality', 'family', 'money', 'identity', 'community', 'other'
  )),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('dormant', 'active', 'integration', 'completed')),
  current_phase TEXT,           -- Current facet/element position

  -- Milestone tracking
  current_milestone TEXT CHECK (current_milestone IN (
    'rupture', 'revelation', 'decision', 'descent',
    'reconciliation', 'embodiment', 'completion', NULL
  )),
  milestone_history JSONB DEFAULT '[]',
  -- [{milestone: "rupture", reached_at: "2026-01-15", notes: "..."}]

  -- Spiralogic signature (elemental blend of this thread)
  elemental_signature JSONB DEFAULT '{"fire": 0, "water": 0, "earth": 0, "air": 0, "aether": 0}',
  dominant_facets TEXT[],       -- Most active facets in this thread

  -- Learning (what MAIA has learned about this thread)
  open_questions TEXT[],        -- Questions still unresolved
  helpful_practices TEXT[],     -- What helps movement in this thread
  stuck_patterns TEXT[],        -- Where it tends to get stuck

  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Prediction (what MAIA thinks comes next)
  predicted_next TEXT,
  predicted_confidence FLOAT CHECK (predicted_confidence >= 0 AND predicted_confidence <= 1),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread events (entries/milestones within threads)
CREATE TABLE IF NOT EXISTS thread_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Source entry
  source_type TEXT NOT NULL CHECK (source_type IN ('journal', 'capture', 'conversation', 'episode', 'elemental_journal', 'milestone')),
  source_id TEXT NOT NULL,

  -- Event data
  event_type TEXT CHECK (event_type IN ('entry', 'milestone', 'shift', 'insight', 'practice')),
  summary TEXT,                 -- Brief description of what happened

  -- Beads activated in this event
  bead_ids UUID[],

  -- State change tracking
  phase_before TEXT,
  phase_after TEXT,
  milestone_reached TEXT,       -- If this event hit a milestone

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread-bead associations (which beads are characteristic of this thread)
CREATE TABLE IF NOT EXISTS thread_beads (
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  bead_id UUID NOT NULL REFERENCES beads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- How central is this bead to this thread
  centrality FLOAT DEFAULT 0.5 CHECK (centrality >= 0 AND centrality <= 1),
  occurrence_count INT DEFAULT 1,

  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (thread_id, bead_id)
);

-- Indexes for threads
CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_status ON threads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_threads_user_domain ON threads(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_threads_last_updated ON threads(user_id, last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_threads_active ON threads(user_id)
  WHERE status = 'active';

-- Indexes for thread_events
CREATE INDEX IF NOT EXISTS idx_thread_events_thread ON thread_events(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_events_user ON thread_events(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_events_source ON thread_events(source_type, source_id);

-- Indexes for thread_beads
CREATE INDEX IF NOT EXISTS idx_thread_beads_thread ON thread_beads(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_beads_bead ON thread_beads(bead_id);
CREATE INDEX IF NOT EXISTS idx_thread_beads_user ON thread_beads(user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON threads TO soullab;
GRANT SELECT, INSERT, UPDATE ON thread_events TO soullab;
GRANT SELECT, INSERT, UPDATE, DELETE ON thread_beads TO soullab;

-- Comments
COMMENT ON TABLE threads IS 'Storylines/trajectories - strings of beads showing how things unfold over time';
COMMENT ON COLUMN threads.domain IS 'Life domain this thread belongs to (vocation, relationship, etc.)';
COMMENT ON COLUMN threads.current_milestone IS 'Current spiral milestone: rupture, revelation, decision, descent, reconciliation, embodiment, completion';
COMMENT ON COLUMN threads.elemental_signature IS 'Elemental blend {fire: 0.3, water: 0.5, ...} characterizing this thread';
COMMENT ON TABLE thread_events IS 'Events (entries, milestones, shifts) that occur within a thread';
COMMENT ON TABLE thread_beads IS 'Association between threads and their characteristic beads';
