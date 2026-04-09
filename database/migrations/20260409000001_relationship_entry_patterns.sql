-- Relationship Entry Patterns — multi-hit structural pattern observations
--
-- Holds results of lib/relationships/patternDetection.ts. Each row is ONE
-- pattern detected in ONE relationship entry. Multiple rows per entry are
-- expected: relational dynamics overlap.
--
-- Discipline (see: memory/project_relational_context_bridge.md):
--   • Observation only. Not read back into buildRelationalContextBlock.
--   • Not rendered in MAIA's speech.
--   • Low cardinality. v1 ships with 5 pattern_ids only.
--   • Confidence decays via expires_at. Relational dynamics are stateful,
--     not fixed traits.

CREATE TABLE IF NOT EXISTS relationship_entry_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES relationship_entries(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES member_relationships(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Pattern identifier from lib/relationships/patternDetection.ts PATTERN_DEFS.
  -- v1: 'pursue_withdraw' | 'overfunctioning' | 'withdrawal' | 'escalation' | 'projection'
  pattern_id TEXT NOT NULL,

  -- Confidence in [0,1]. Conservative cap at 0.85 — the detector never claims certainty.
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

  -- What matched. Short text snippet for observation/debugging. Not for MAIA.
  evidence TEXT,

  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional decay timestamp. Relational dynamics are stateful, not fixed.
  -- v1: detector sets +30 days so early data has a natural shelf life.
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rel_entry_patterns_entry
  ON relationship_entry_patterns(entry_id);

CREATE INDEX IF NOT EXISTS idx_rel_entry_patterns_relationship
  ON relationship_entry_patterns(relationship_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_rel_entry_patterns_member
  ON relationship_entry_patterns(member_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_rel_entry_patterns_pattern
  ON relationship_entry_patterns(pattern_id);

-- Partial index for "still valid" patterns — supports decay reads without scanning expired rows
CREATE INDEX IF NOT EXISTS idx_rel_entry_patterns_active
  ON relationship_entry_patterns(relationship_id, pattern_id)
  WHERE expires_at IS NULL OR expires_at > NOW();
