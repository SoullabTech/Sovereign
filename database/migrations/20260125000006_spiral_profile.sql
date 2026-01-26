-- Spiral Profile: Cross-Time Learned Model
-- MAIA's model of how this user changes over time

CREATE TABLE IF NOT EXISTS spiral_profiles (
  user_id TEXT PRIMARY KEY,

  -- Dominant cycles (learned sequences that repeat)
  dominant_cycles JSONB DEFAULT '[]',
  -- [{name: "grief-to-creation", sequence: ["W2", "E2", "F3"], frequency: 5, confidence: 0.8, last_seen: "..."}]

  -- Transition probabilities (what tends to follow what)
  transition_map JSONB DEFAULT '{}',
  -- {"W2": {"E2": 0.4, "W3": 0.3, "F1": 0.2, ...}, "F1": {...}}

  -- Effective stabilizers (what helps integration)
  effective_stabilizers JSONB DEFAULT '[]',
  -- [{practice: "morning pages", elements: ["air", "water"], effectiveness: 0.8, usage_count: 12}]

  -- Loop patterns (where they get stuck)
  loop_patterns JSONB DEFAULT '[]',
  -- [{pattern: "W2→W2→W2", trigger: "boundary violation", frequency: 3, last_occurred: "..."}]

  -- Tempo observations (relative cadence, not time estimates)
  typical_micro_cycle_days INT,     -- How long micro spirals tend to take
  typical_meso_cycle_weeks INT,     -- How long meso spirals tend to take

  -- Elemental affinities
  elemental_strengths JSONB DEFAULT '{"fire": 0.5, "water": 0.5, "earth": 0.5, "air": 0.5, "aether": 0.5}',
  elemental_growth_edges JSONB DEFAULT '{}',
  -- {earth: "grounding practices needed", fire: "hesitant to initiate"}

  -- Facet mastery tracking
  facet_activations JSONB DEFAULT '{}',
  -- {"F1": {"count": 15, "last": "...", "integration_rate": 0.7}, ...}

  -- Current spiral position (snapshot)
  current_position JSONB DEFAULT '{}',
  -- {facet: "W2", element: "water", entered_at: "...", depth: "meso"}

  -- Learning metadata
  total_entries_processed INT DEFAULT 0,
  total_beads_activated INT DEFAULT 0,
  profile_confidence FLOAT DEFAULT 0.1 CHECK (profile_confidence >= 0 AND profile_confidence <= 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transition history (detailed record for learning)
CREATE TABLE IF NOT EXISTS spiral_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- The transition
  from_bead_code TEXT,
  to_bead_code TEXT NOT NULL,
  from_facet TEXT,
  to_facet TEXT,
  from_element TEXT,
  to_element TEXT,

  -- Source that triggered this transition
  source_type TEXT CHECK (source_type IN ('journal', 'capture', 'conversation', 'episode', 'elemental_journal')),
  source_id TEXT,

  -- Context
  time_gap_hours INT,           -- Hours between from and to
  was_predicted BOOLEAN,        -- Did MAIA predict this?
  prediction_confidence FLOAT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical beads seed table (36 starter beads based on plan)
CREATE TABLE IF NOT EXISTS canonical_beads (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  element TEXT NOT NULL CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  facet TEXT CHECK (facet IN ('F1', 'F2', 'F3', 'W1', 'W2', 'W3', 'E1', 'E2', 'E3', 'A1', 'A2', 'A3')),
  polarity TEXT NOT NULL CHECK (polarity IN ('gift', 'shadow', 'neutral')),
  description TEXT,
  typical_triggers TEXT[],
  typical_resolvers TEXT[]
);

-- Seed the 36 canonical beads (Fire)
INSERT INTO canonical_beads (code, label, element, facet, polarity, description) VALUES
  ('F1-call', 'The Call Awakens', 'fire', 'F1', 'gift', 'Recognition of authentic desire or direction'),
  ('F1-inertia', 'Stalled Ignition', 'fire', 'F1', 'neutral', 'The call is present but movement hasn''t begun'),
  ('F1-false-start', 'False Start', 'fire', 'F1', 'shadow', 'Acting before the call is clear or true'),
  ('F2-trial', 'Trial by Fire', 'fire', 'F2', 'gift', 'Meeting challenge with courage and will'),
  ('F2-avoidance', 'Avoiding the Fire', 'fire', 'F2', 'neutral', 'Resistance to necessary confrontation'),
  ('F2-burnout', 'Burnt Out', 'fire', 'F2', 'shadow', 'Will exhausted from over-effort or wrong effort'),
  ('F3-lived-fire', 'Lived Fire', 'fire', 'F3', 'gift', 'Embodied passion integrated into daily life'),
  ('F3-imposter', 'Fire Imposter', 'fire', 'F3', 'neutral', 'Appearance of mastery without inner flame'),
  ('F3-inflation', 'Fire Inflation', 'fire', 'F3', 'shadow', 'Grandiosity, over-identification with power')
ON CONFLICT (code) DO NOTHING;

-- Seed the 36 canonical beads (Water)
INSERT INTO canonical_beads (code, label, element, facet, polarity, description) VALUES
  ('W1-opening', 'Heart Opening', 'water', 'W1', 'gift', 'Vulnerability that allows feeling to flow'),
  ('W1-defended', 'Defended Heart', 'water', 'W1', 'neutral', 'Protection that blocks feeling but serves survival'),
  ('W1-flooding', 'Emotional Flood', 'water', 'W1', 'shadow', 'Overwhelm, loss of boundaries in feeling'),
  ('W2-underworld', 'Underworld Descent', 'water', 'W2', 'gift', 'Conscious descent into grief, shadow, or depth'),
  ('W2-bypass', 'Spiritual Bypass', 'water', 'W2', 'neutral', 'Avoiding depth through premature transcendence'),
  ('W2-drowning', 'Drowning', 'water', 'W2', 'shadow', 'Lost in the underworld, unable to return'),
  ('W3-inner-gold', 'Inner Gold Found', 'water', 'W3', 'gift', 'Treasure retrieved from the depths'),
  ('W3-bitterness', 'Bitter Waters', 'water', 'W3', 'neutral', 'Grief that hasn''t fully metabolized'),
  ('W3-dissociation', 'Soul Dissociation', 'water', 'W3', 'shadow', 'Split from the feeling body')
ON CONFLICT (code) DO NOTHING;

-- Seed the 36 canonical beads (Earth)
INSERT INTO canonical_beads (code, label, element, facet, polarity, description) VALUES
  ('E1-seed-pattern', 'Seed Pattern', 'earth', 'E1', 'gift', 'Clear recognition of what wants to form'),
  ('E1-scattered', 'Scattered Seeds', 'earth', 'E1', 'neutral', 'Too many possibilities, no clear form'),
  ('E1-premature-form', 'Premature Form', 'earth', 'E1', 'shadow', 'Forcing form before pattern is clear'),
  ('E2-practice', 'Practice Ground', 'earth', 'E2', 'gift', 'Sustained effort building real capacity'),
  ('E2-neglect', 'Neglected Form', 'earth', 'E2', 'neutral', 'Letting practice lapse, skill atrophy'),
  ('E2-rigidity', 'Rigid Form', 'earth', 'E2', 'shadow', 'Over-attachment to structure, unable to adapt'),
  ('E3-stewardship', 'Stewardship', 'earth', 'E3', 'gift', 'Mature care for what has been built'),
  ('E3-abandonment', 'Form Abandonment', 'earth', 'E3', 'neutral', 'Walking away from completed work'),
  ('E3-hoarding', 'Form Hoarding', 'earth', 'E3', 'shadow', 'Clinging to old forms that no longer serve')
ON CONFLICT (code) DO NOTHING;

-- Seed the 36 canonical beads (Air)
INSERT INTO canonical_beads (code, label, element, facet, polarity, description) VALUES
  ('A1-honest-dialogue', 'Honest Dialogue', 'air', 'A1', 'gift', 'Speaking and hearing truth clearly'),
  ('A1-silence', 'Strategic Silence', 'air', 'A1', 'neutral', 'Withholding speech, for protection or timing'),
  ('A1-over-explain', 'Over-Explanation', 'air', 'A1', 'shadow', 'Words as defense against being truly seen'),
  ('A2-pattern-speech', 'Pattern Speech', 'air', 'A2', 'gift', 'Articulating what was previously unspeakable'),
  ('A2-confusion', 'Mental Fog', 'air', 'A2', 'neutral', 'Unable to find the right words or frame'),
  ('A2-dogma', 'Dogmatic Mind', 'air', 'A2', 'shadow', 'Closed system, unable to receive new meaning'),
  ('A3-mythic-integration', 'Mythic Integration', 'air', 'A3', 'gift', 'Personal story connected to larger pattern'),
  ('A3-isolation', 'Isolated Meaning', 'air', 'A3', 'neutral', 'Story disconnected from others'),
  ('A3-inflation', 'Meaning Inflation', 'air', 'A3', 'shadow', 'Over-importance assigned to personal narrative')
ON CONFLICT (code) DO NOTHING;

-- Indexes for spiral_profiles
CREATE INDEX IF NOT EXISTS idx_spiral_profiles_updated ON spiral_profiles(updated_at DESC);

-- Indexes for spiral_transitions
CREATE INDEX IF NOT EXISTS idx_spiral_transitions_user ON spiral_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_spiral_transitions_time ON spiral_transitions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spiral_transitions_from ON spiral_transitions(from_bead_code);
CREATE INDEX IF NOT EXISTS idx_spiral_transitions_to ON spiral_transitions(to_bead_code);
CREATE INDEX IF NOT EXISTS idx_spiral_transitions_facets ON spiral_transitions(from_facet, to_facet);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON spiral_profiles TO soullab;
GRANT SELECT, INSERT ON spiral_transitions TO soullab;
GRANT SELECT ON canonical_beads TO soullab;

-- Comments
COMMENT ON TABLE spiral_profiles IS 'Cross-time learned model of how this user changes - MAIA''s understanding of their spiral patterns';
COMMENT ON COLUMN spiral_profiles.transition_map IS 'Learned probabilities: what facet/bead tends to follow what';
COMMENT ON COLUMN spiral_profiles.effective_stabilizers IS 'Practices that help this user integrate spiral movements';
COMMENT ON COLUMN spiral_profiles.loop_patterns IS 'Where this user tends to get stuck in repetitive cycles';
COMMENT ON TABLE spiral_transitions IS 'Detailed record of state transitions for learning patterns';
COMMENT ON TABLE canonical_beads IS 'The 36 starter beads based on 12 Spiralogic facets x 3 polarities';
