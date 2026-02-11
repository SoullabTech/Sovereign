-- ============================================================================
-- Session Notes Storage (MCP session_notes tool)
-- ============================================================================
-- Stores processed session analysis from the session_notes MCP tool.
-- Feeds into the consciousness bloodstream: state vectors, threshold events,
-- symbolic motifs, and follow-up intentions.
--
-- Sovereignty invariant: Sanctuary sessions store only metadata (mode=sanctuary).
-- ============================================================================

-- 1. Session Summaries (processed session notes)
CREATE TABLE IF NOT EXISTS session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  session_id UUID,  -- Optional link to maia_sessions if from live session
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Privacy & Consent
  privacy_mode TEXT NOT NULL DEFAULT 'standard'
    CHECK (privacy_mode IN ('sanctuary', 'standard', 'full')),
  consent_level TEXT NOT NULL DEFAULT 'coaching'
    CHECK (consent_level IN ('clinical', 'coaching', 'personal', 'research')),

  -- Content
  summary_text TEXT NOT NULL,  -- Markdown summary
  state_vector JSONB,  -- { primary_element, secondary_element, facet, kairos, confidence }
  practitioner_intent TEXT,

  -- Metadata
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_session_id UNIQUE (session_id)
);

-- Index for member history
CREATE INDEX IF NOT EXISTS idx_session_summaries_member
  ON session_summaries (member_id, session_date DESC);

-- Index for element/facet queries
CREATE INDEX IF NOT EXISTS idx_session_summaries_state
  ON session_summaries USING GIN (state_vector);

-- 2. Symbolic Motifs (recurring symbols/themes from sessions)
CREATE TABLE IF NOT EXISTS symbolic_motifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  session_id UUID REFERENCES session_summaries(id) ON DELETE CASCADE,

  symbol TEXT NOT NULL,  -- The image, metaphor, or theme
  valence TEXT NOT NULL DEFAULT 'ambivalent'
    CHECK (valence IN ('helpful', 'haunting', 'ambivalent')),
  frequency TEXT NOT NULL DEFAULT 'medium'
    CHECK (frequency IN ('low', 'medium', 'high')),

  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for resonance search
CREATE INDEX IF NOT EXISTS idx_symbolic_motifs_member
  ON symbolic_motifs (member_id, created_at DESC);

-- Text search on symbols
CREATE INDEX IF NOT EXISTS idx_symbolic_motifs_symbol
  ON symbolic_motifs USING GIN (to_tsvector('english', symbol));

-- 3. Follow-up Intentions (suggested practices from sessions)
CREATE TABLE IF NOT EXISTS follow_up_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  session_id UUID REFERENCES session_summaries(id) ON DELETE CASCADE,

  suggestion TEXT NOT NULL,
  facet TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),

  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested', 'accepted', 'completed', 'declined')),
  completed_at TIMESTAMPTZ,

  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for member follow-ups
CREATE INDEX IF NOT EXISTS idx_follow_up_intentions_member
  ON follow_up_intentions (member_id, status, priority);

-- 4. Add session_id to threshold_events if not exists
-- (allows linking threshold events to session summaries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threshold_events' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE threshold_events ADD COLUMN session_id UUID;
  END IF;
END $$;

-- 5. Helper: Get member's recent session context
CREATE OR REPLACE FUNCTION fn_member_session_context(
  p_member_id TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  session_id UUID,
  session_date TIMESTAMPTZ,
  primary_element TEXT,
  facet TEXT,
  kairos TEXT,
  summary_preview TEXT,
  threshold_count BIGINT,
  motif_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id AS session_id,
    ss.session_date,
    (ss.state_vector->>'primary_element')::TEXT AS primary_element,
    (ss.state_vector->>'facet')::TEXT AS facet,
    (ss.state_vector->>'kairos')::TEXT AS kairos,
    LEFT(ss.summary_text, 200) AS summary_preview,
    (SELECT COUNT(*) FROM threshold_events te WHERE te.session_id = ss.id) AS threshold_count,
    (SELECT COUNT(*) FROM symbolic_motifs sm WHERE sm.session_id = ss.id) AS motif_count
  FROM session_summaries ss
  WHERE ss.member_id = p_member_id
    AND ss.privacy_mode != 'sanctuary'
  ORDER BY ss.session_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger: Update updated_at on session_summaries
CREATE OR REPLACE FUNCTION fn_update_session_summaries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_session_summaries_updated ON session_summaries;
CREATE TRIGGER tr_session_summaries_updated
  BEFORE UPDATE ON session_summaries
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_session_summaries_timestamp();
