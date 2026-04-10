-- Crystal Field Weekly Review
-- Structured observation loop for MAIA system tuning.
-- One review per reviewer per week.

CREATE TABLE IF NOT EXISTS crystal_field_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer TEXT NOT NULL,
  review_date DATE NOT NULL,
  sample_size TEXT,
  source TEXT,

  -- Moments that landed: [{element, state, closing_type, what_happened, why_it_worked}]
  moments_landed JSONB NOT NULL DEFAULT '[]',

  -- Moments slightly off: [{element, state, closing_type, what_happened, where_it_missed}]
  moments_off JSONB NOT NULL DEFAULT '[]',

  pattern_emerging TEXT,
  candidate_rule TEXT,

  -- System signal check: {closing_type_notes, depth_mode_notes, doorway_notes}
  system_signals JSONB NOT NULL DEFAULT '{}',

  -- Decision: hold / refine / investigate
  decision TEXT NOT NULL DEFAULT 'hold',
  decision_notes TEXT,

  notes TEXT,

  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One review per reviewer per date
CREATE UNIQUE INDEX IF NOT EXISTS uq_crystal_field_reviewer_date
  ON crystal_field_reviews (reviewer, review_date);

-- Fast lookup by date descending
CREATE INDEX IF NOT EXISTS idx_crystal_field_date
  ON crystal_field_reviews (review_date DESC);
