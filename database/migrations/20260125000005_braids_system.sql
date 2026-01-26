-- Braids System: Co-Traveling Patterns
-- A braid is a set of threads that tend to move together

CREATE TABLE IF NOT EXISTS braids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Identity
  name TEXT,                    -- Auto-generated or user-named
  description TEXT,

  -- Component threads (stored as array of UUIDs)
  thread_ids UUID[] NOT NULL,

  -- Pattern signature
  typical_sequence JSONB DEFAULT '[]',
  -- [{facet: "W2", element: "water"}, {facet: "E2", element: "earth"}, ...]

  -- Cycle tracking
  cycle_count INT DEFAULT 0,    -- How many times this pattern has repeated

  -- Timing patterns (not estimates, just observed cadence)
  average_cycle_duration_days INT,
  shortest_cycle_days INT,
  longest_cycle_days INT,

  -- Learning
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  first_detected TIMESTAMPTZ DEFAULT NOW(),
  last_observed TIMESTAMPTZ DEFAULT NOW(),

  -- What helps and hurts
  stabilizers TEXT[],           -- Practices that help this braid integrate
  loop_risks TEXT[],            -- Where it tends to get stuck

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Braid cycle records (each time the braid pattern completes)
CREATE TABLE IF NOT EXISTS braid_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  braid_id UUID NOT NULL REFERENCES braids(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Cycle timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_days INT,

  -- Sequence of beads/facets in this cycle
  sequence JSONB NOT NULL,      -- [{bead_code: "W2-grief", facet: "W2", timestamp: "..."}]

  -- Outcome
  integration_quality TEXT CHECK (integration_quality IN ('stuck', 'partial', 'complete', 'breakthrough')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread co-movement detection (intermediate table for braid detection)
CREATE TABLE IF NOT EXISTS thread_co_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Which threads moved together
  thread_id_a UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  thread_id_b UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,

  -- When they co-moved
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,

  -- Co-movement metrics
  co_activation_count INT DEFAULT 1,
  correlation_strength FLOAT CHECK (correlation_strength >= 0 AND correlation_strength <= 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates (order-independent)
  CONSTRAINT thread_co_movements_unique CHECK (thread_id_a < thread_id_b),
  UNIQUE(thread_id_a, thread_id_b, window_start)
);

-- Indexes for braids
CREATE INDEX IF NOT EXISTS idx_braids_user ON braids(user_id);
CREATE INDEX IF NOT EXISTS idx_braids_active ON braids(user_id, is_active)
  WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_braids_last_observed ON braids(user_id, last_observed DESC);

-- Indexes for braid_cycles
CREATE INDEX IF NOT EXISTS idx_braid_cycles_braid ON braid_cycles(braid_id);
CREATE INDEX IF NOT EXISTS idx_braid_cycles_user ON braid_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_braid_cycles_time ON braid_cycles(user_id, started_at DESC);

-- Indexes for thread_co_movements
CREATE INDEX IF NOT EXISTS idx_thread_co_movements_user ON thread_co_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_co_movements_thread_a ON thread_co_movements(thread_id_a);
CREATE INDEX IF NOT EXISTS idx_thread_co_movements_thread_b ON thread_co_movements(thread_id_b);
CREATE INDEX IF NOT EXISTS idx_thread_co_movements_time ON thread_co_movements(user_id, window_start DESC);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON braids TO soullab;
GRANT SELECT, INSERT, UPDATE ON braid_cycles TO soullab;
GRANT SELECT, INSERT, UPDATE, DELETE ON thread_co_movements TO soullab;

-- Comments
COMMENT ON TABLE braids IS 'Sets of threads that tend to move together - co-traveling patterns';
COMMENT ON COLUMN braids.typical_sequence IS 'Learned sequence of facet/element transitions in this braid';
COMMENT ON COLUMN braids.stabilizers IS 'Practices that help this braid pattern integrate smoothly';
COMMENT ON COLUMN braids.loop_risks IS 'Where this braid pattern tends to get stuck';
COMMENT ON TABLE braid_cycles IS 'Records of each time a braid pattern completes a full cycle';
COMMENT ON TABLE thread_co_movements IS 'Intermediate detection table for identifying which threads move together';
