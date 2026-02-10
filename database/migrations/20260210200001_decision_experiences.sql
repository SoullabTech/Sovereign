-- Decision Experiences — Connective Tissue Between Iterations
--
-- Between council consultations, practitioners log what happened in the field:
-- field events, reflections, breakthroughs, setbacks.
-- This is how meaning accumulates between councils.
--
-- The experience timeline creates a richer spiral narrative
-- alongside the structured consultation iterations.

CREATE TABLE IF NOT EXISTS decision_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES studio_decisions(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- What happened
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  experience_type TEXT NOT NULL
    CHECK (experience_type IN ('field_event', 'reflection', 'breakthrough', 'setback')),
  content TEXT NOT NULL,

  -- Optional elemental tone
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),

  -- Freeform tags
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_experiences_decision
  ON decision_experiences(decision_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_experiences_practitioner
  ON decision_experiences(practitioner_id);

COMMENT ON TABLE decision_experiences IS
  'Field events, reflections, breakthroughs, and setbacks logged between council consultations';
