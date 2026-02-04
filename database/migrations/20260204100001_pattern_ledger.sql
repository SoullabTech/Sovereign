-- Pattern Ledger: MAIA-noticed patterns (system-authored)
-- Implements epistemic separation: MAIA can notice patterns, member decides significance
-- @see docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md

CREATE TABLE IF NOT EXISTS pattern_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Pattern content
  statement TEXT NOT NULL,                    -- Short description of the pattern
  evidence_refs JSONB NOT NULL DEFAULT '[]',  -- Array of {type, id, excerpt} evidence points
  scope TEXT NOT NULL CHECK (scope IN (
    'relationship', 'work', 'somatic', 'spiritual', 'recurring_trigger', 'theme'
  )),

  -- Epistemic status
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT NOT NULL DEFAULT 'emerging' CHECK (status IN (
    'emerging',    -- MAIA detected, not yet offered
    'offered',     -- Offered to member, awaiting response
    'confirmed',   -- Member confirmed significance
    'partial',     -- Member said "sort of" / partial recognition
    'rejected',    -- Member said no
    'retired'      -- Pattern no longer relevant / superseded
  )),

  -- Member response tracking
  member_response TEXT,                       -- Member's actual words when responding
  member_response_at TIMESTAMPTZ,
  times_offered INTEGER NOT NULL DEFAULT 0,   -- How many times offered (should be low)

  -- Lifecycle
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_evidence_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_offered_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  retirement_reason TEXT,                     -- Why retired: 'member_rejected', 'superseded', 'stale'

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient member lookups
CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member
  ON pattern_ledger(member_id, status);

-- Index for finding active patterns to potentially offer
CREATE INDEX IF NOT EXISTS idx_pattern_ledger_active
  ON pattern_ledger(member_id, status, confidence DESC)
  WHERE status IN ('emerging', 'offered', 'confirmed', 'partial');

-- Index for evidence freshness
CREATE INDEX IF NOT EXISTS idx_pattern_ledger_evidence
  ON pattern_ledger(member_id, last_evidence_at DESC);

-- Pattern evidence links (for tracking which moments contributed to a pattern)
CREATE TABLE IF NOT EXISTS pattern_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES pattern_ledger(id) ON DELETE CASCADE,

  -- Evidence source
  source_type TEXT NOT NULL CHECK (source_type IN (
    'capture', 'breakthrough', 'journal', 'conversation_turn', 'oracle_cast'
  )),
  source_id UUID NOT NULL,                    -- ID of the source record
  excerpt TEXT,                               -- Relevant excerpt/quote

  -- When this evidence was added
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate evidence
  UNIQUE(pattern_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_pattern_evidence_pattern
  ON pattern_evidence(pattern_id);

CREATE INDEX IF NOT EXISTS idx_pattern_evidence_source
  ON pattern_evidence(source_type, source_id);

-- Pattern offering events (audit trail of when patterns were surfaced)
CREATE TABLE IF NOT EXISTS pattern_offering_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES pattern_ledger(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Context of offering
  conversation_id UUID,                       -- If offered during conversation
  offering_text TEXT NOT NULL,                -- Exact text MAIA used

  -- Member response
  response_type TEXT CHECK (response_type IN (
    'confirmed', 'partial', 'rejected', 'deferred', 'no_response'
  )),
  response_text TEXT,                         -- Member's actual response
  response_at TIMESTAMPTZ,

  -- Timing
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pattern_offering_events_pattern
  ON pattern_offering_events(pattern_id);

CREATE INDEX IF NOT EXISTS idx_pattern_offering_events_member
  ON pattern_offering_events(member_id, offered_at DESC);

-- View: Active patterns ready to potentially offer
CREATE OR REPLACE VIEW active_patterns AS
SELECT
  pl.*,
  COUNT(pe.id) as evidence_count,
  MAX(pe.detected_at) as latest_evidence_at
FROM pattern_ledger pl
LEFT JOIN pattern_evidence pe ON pe.pattern_id = pl.id
WHERE pl.status IN ('emerging', 'confirmed', 'partial')
  AND pl.confidence >= 0.3
GROUP BY pl.id;

-- View: Pattern offering stats per member
CREATE OR REPLACE VIEW pattern_offering_stats AS
SELECT
  member_id,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'partial') as partial_count,
  COUNT(*) FILTER (WHERE status = 'emerging') as emerging_count,
  AVG(confidence) FILTER (WHERE status = 'confirmed') as avg_confirmed_confidence
FROM pattern_ledger
GROUP BY member_id;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pattern_ledger_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pattern_ledger_updated_at ON pattern_ledger;
CREATE TRIGGER pattern_ledger_updated_at
  BEFORE UPDATE ON pattern_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_ledger_timestamp();

-- Comment documentation
COMMENT ON TABLE pattern_ledger IS 'MAIA-noticed patterns (system-authored). Member decides significance.';
COMMENT ON COLUMN pattern_ledger.status IS 'Epistemic status: emerging (detected) → offered → confirmed/partial/rejected → retired';
COMMENT ON COLUMN pattern_ledger.confidence IS 'MAIA confidence in pattern (0-1). Does NOT determine significance — member does.';
COMMENT ON COLUMN pattern_ledger.times_offered IS 'Should stay low. Never insist on rejected patterns.';
