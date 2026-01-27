-- Scribe Sessions: Witness mode for solo, practitioner, and couples use
-- Part of MAIA's relational container system

-- Main sessions table
CREATE TABLE IF NOT EXISTS scribe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Container type determines tone, markers, and outputs
  -- 'solo' = self-study, 'practitioner' = session notes, 'witness' = Third Chair for couples/groups
  container TEXT NOT NULL DEFAULT 'solo' CHECK (container IN ('solo', 'witness', 'practitioner')),

  -- Session metadata
  title TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Consent tracking (critical for witness mode)
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending', 'confirmed', 'declined')),
  consent_confirmed_at TIMESTAMPTZ,
  consent_method TEXT CHECK (consent_method IN ('voice', 'tap', 'both')),
  consent_transcript_snippet TEXT,  -- Optional audit trail

  -- Participants (for witness/couples mode)
  -- Format: [{ "label": "Partner", "role": "partner" }, ...]
  participants JSONB DEFAULT '[]'::jsonb,

  -- Privacy controls
  memory_policy TEXT NOT NULL DEFAULT 'sealed' CHECK (memory_policy IN ('sealed', 'learning')),
  transcript_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Summary (populated on session end)
  -- Format: { "short": "...", "long": "...", "themes": [], "agreements": [], "nextSteps": [] }
  summary JSONB,

  -- For "Discuss with MAIA" - scoped conversation thread
  discussion_thread_id UUID,

  -- Facet tracking (optional, for practitioner/solo)
  facet_observations JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Markers: significant moments during a session
CREATE TABLE IF NOT EXISTS scribe_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,

  -- Timestamp within the session
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Marker type varies by container:
  -- solo: insight, resistance, opening, integration, question
  -- practitioner: turning_point, somatic_shift, avoidance, repair_attempt, breakthrough
  -- witness: escalation, softening, miss, need_named, repair, appreciation
  marker_type TEXT NOT NULL,

  -- Optional note or context
  note TEXT,

  -- Who spoke / marked (avoids "who said what" overreach for couples)
  speaker TEXT CHECK (speaker IN ('self', 'other', 'maia', 'unknown')),

  -- Who created the marker
  marked_by TEXT NOT NULL DEFAULT 'member' CHECK (marked_by IN ('member', 'maia')),

  -- Optional transcript excerpt at this moment
  transcript_excerpt TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transcript entries (only populated if transcript_enabled = true)
CREATE TABLE IF NOT EXISTS scribe_transcript_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,

  -- Who spoke (uses same labels as markers)
  speaker TEXT NOT NULL CHECK (speaker IN ('self', 'other', 'maia', 'unknown')),
  participant_label TEXT,  -- If multiple participants, which one

  -- Content
  content TEXT NOT NULL,

  -- Timing
  spoken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_member ON scribe_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_active ON scribe_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_container ON scribe_sessions(container);
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_created ON scribe_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scribe_markers_session ON scribe_markers(session_id);
CREATE INDEX IF NOT EXISTS idx_scribe_markers_type ON scribe_markers(marker_type);
CREATE INDEX IF NOT EXISTS idx_scribe_markers_time ON scribe_markers(marked_at);
CREATE INDEX IF NOT EXISTS idx_scribe_transcript_session ON scribe_transcript_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_scribe_transcript_time ON scribe_transcript_entries(spoken_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_scribe_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scribe_sessions_updated_at ON scribe_sessions;
CREATE TRIGGER scribe_sessions_updated_at
  BEFORE UPDATE ON scribe_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_scribe_session_updated_at();
