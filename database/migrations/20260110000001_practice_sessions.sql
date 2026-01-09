-- Practice Sessions System
-- For solo practitioners (healers, coaches, guides) who want to learn and grow
-- MAIA acts as developmental mentor, not diagnostic authority
-- Local-first: all processing via Whisper + Ollama

-- Practice sessions (simplified from clinical supervision)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID,                    -- Links to members if authenticated
  title TEXT,
  client_alias TEXT,                       -- "Client A" - no real names stored

  -- Eclectic modality tagging
  modalities_tagged TEXT[] DEFAULT '{}',   -- ['somatic', 'parts_work', 'breathwork', 'cognitive']

  -- Session metadata
  session_type VARCHAR(30) DEFAULT 'individual' CHECK (session_type IN (
    'individual',      -- 1:1 session
    'couple',          -- Couples/relational
    'group',           -- Group facilitation
    'self_practice'    -- Practitioner's own practice
  )),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_duration_ms INTEGER,

  -- Processing state
  processing_status VARCHAR(20) DEFAULT 'recording' CHECK (processing_status IN (
    'recording', 'processing', 'transcribing', 'analyzing', 'complete', 'error'
  )),

  -- Optional paths for recordings
  recording_path TEXT,
  transcript_path TEXT,

  -- Metadata
  notes TEXT,                              -- Practitioner's own notes
  tags TEXT[] DEFAULT '{}',                -- Custom tags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcript segments (reuse structure from supervision)
CREATE TABLE IF NOT EXISTS practice_transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  speaker VARCHAR(50) NOT NULL,            -- 'practitioner', 'client', 'speaker_1', etc.
  speaker_confidence REAL,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  text TEXT NOT NULL,
  transcription_confidence REAL,
  language VARCHAR(10) DEFAULT 'en',
  is_final BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session insights (MAIA's developmental observations)
CREATE TABLE IF NOT EXISTS session_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,

  -- Developmental insight types
  insight_type VARCHAR(30) NOT NULL CHECK (insight_type IN (
    -- What happened
    'modality_used',         -- "You drew from somatic work here"
    'client_response',       -- "Your client lit up when..."
    'session_arc',           -- "The session moved from X to Y"
    'energy_shift',          -- "The field shifted at this moment"

    -- Learning opportunities
    'modality_opportunity',  -- "There was an opening for..."
    'blind_spot',            -- "Did you notice...?"
    'growth_edge',           -- "This might be a learning edge"
    'experiment_suggestion', -- "Next session, try..."

    -- Practitioner patterns
    'practitioner_pattern',  -- "You tend to X when clients Y"
    'strength_spotted',      -- "You did X beautifully"

    -- Client observations
    'client_resource',       -- "Your client has X capability"
    'client_pattern',        -- "Client tends to..."
    'resistance_noted',      -- "Where client got stuck"
    'breakthrough_moment',   -- "Transformation happened here"

    -- Cross-session (populated by background analysis)
    'cross_session_thread',  -- "This theme appears across sessions"

    -- Reflection prompts
    'reflection_question'    -- "What might you explore about...?"
  )),

  content TEXT NOT NULL,                   -- MAIA's observation

  -- Context
  timestamp_ms INTEGER,                    -- When in session this applies
  timestamp_end_ms INTEGER,                -- End of relevant range
  segment_refs UUID[],                     -- Referenced transcript segments

  -- Metadata
  significance NUMERIC(3,2),               -- 0.00-1.00 importance
  modality_tag VARCHAR(50),                -- Related modality if applicable
  model_used VARCHAR(100),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practitioner growth tracking (cross-session learning)
CREATE TABLE IF NOT EXISTS practitioner_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,

  -- What MAIA noticed
  growth_type VARCHAR(30) NOT NULL CHECK (growth_type IN (
    'pattern_identified',    -- Recurring tendency noticed
    'strength_developing',   -- Skill that's growing
    'edge_emerging',         -- New learning edge appearing
    'modality_expanding',    -- Practitioner trying new things
    'style_evolution',       -- How their approach is changing
    'client_type_affinity'   -- Types of clients they work well with
  )),

  observation TEXT NOT NULL,               -- MAIA's cross-session insight

  -- Evidence
  session_refs UUID[],                     -- Which sessions informed this
  first_noticed_at TIMESTAMPTZ,            -- When pattern first appeared
  confidence NUMERIC(3,2),                 -- How confident is this observation

  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,      -- Practitioner has seen this
  practitioner_notes TEXT,                 -- Their reflection on it

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practitioner insight preferences
CREATE TABLE IF NOT EXISTS practitioner_insight_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL UNIQUE,

  -- Which insight types they want MAIA to generate
  enabled_insights TEXT[] DEFAULT ARRAY[
    'modality_used', 'client_response', 'modality_opportunity',
    'growth_edge', 'strength_spotted', 'reflection_question'
  ],

  -- Their modality vocabulary (what they practice)
  modality_vocabulary TEXT[] DEFAULT ARRAY[
    'somatic', 'cognitive', 'relational', 'parts_work', 'breathwork',
    'mindfulness', 'narrative', 'expressive', 'energy_work', 'spiritual'
  ],

  -- MAIA's voice preferences
  insight_depth VARCHAR(20) DEFAULT 'balanced' CHECK (insight_depth IN (
    'light',      -- Just highlights
    'balanced',   -- Observations + questions
    'deep'        -- Full developmental analysis
  )),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modality reference (expandable vocabulary)
CREATE TABLE IF NOT EXISTS modality_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,        -- 'somatic', 'parts_work', etc.
  display_name TEXT NOT NULL,              -- 'Somatic/Body-Based'
  description TEXT,
  category VARCHAR(30),                    -- 'body', 'mind', 'relational', 'spiritual'
  is_system BOOLEAN DEFAULT FALSE,         -- Built-in vs user-created
  created_by UUID,                         -- If user-created
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed core modalities
INSERT INTO modality_vocabulary (code, display_name, category, is_system) VALUES
  ('somatic', 'Somatic/Body-Based', 'body', TRUE),
  ('breathwork', 'Breathwork', 'body', TRUE),
  ('movement', 'Movement/Dance', 'body', TRUE),
  ('cognitive', 'Cognitive/Mind-Based', 'mind', TRUE),
  ('mindfulness', 'Mindfulness/Presence', 'mind', TRUE),
  ('parts_work', 'Parts Work/IFS', 'mind', TRUE),
  ('narrative', 'Narrative/Story', 'mind', TRUE),
  ('relational', 'Relational/Attachment', 'relational', TRUE),
  ('family_systems', 'Family Systems', 'relational', TRUE),
  ('gestalt', 'Gestalt/Here-and-Now', 'relational', TRUE),
  ('expressive', 'Expressive Arts', 'creative', TRUE),
  ('imaginal', 'Imaginal/Visualization', 'creative', TRUE),
  ('dreamwork', 'Dreamwork', 'creative', TRUE),
  ('energy_work', 'Energy Work', 'spiritual', TRUE),
  ('spiritual', 'Spiritual/Transpersonal', 'spiritual', TRUE),
  ('shamanic', 'Shamanic/Indigenous', 'spiritual', TRUE),
  ('ritual', 'Ritual/Ceremony', 'spiritual', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Indexes

-- Practice sessions
CREATE INDEX idx_practice_sessions_practitioner
  ON practice_sessions(practitioner_id, started_at DESC);

CREATE INDEX idx_practice_sessions_client
  ON practice_sessions(practitioner_id, client_alias);

CREATE INDEX idx_practice_sessions_modalities
  ON practice_sessions USING GIN(modalities_tagged);

-- Transcript segments
CREATE INDEX idx_practice_segments_session_time
  ON practice_transcript_segments(session_id, start_ms);

-- Session insights
CREATE INDEX idx_session_insights_session
  ON session_insights(session_id, created_at DESC);

CREATE INDEX idx_session_insights_type
  ON session_insights(session_id, insight_type);

-- Practitioner growth
CREATE INDEX idx_practitioner_growth_practitioner
  ON practitioner_growth(practitioner_id, created_at DESC);

CREATE INDEX idx_practitioner_growth_unacknowledged
  ON practitioner_growth(practitioner_id)
  WHERE acknowledged = FALSE;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_practice_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

CREATE TRIGGER practitioner_growth_updated_at
  BEFORE UPDATE ON practitioner_growth
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

CREATE TRIGGER practitioner_insight_preferences_updated_at
  BEFORE UPDATE ON practitioner_insight_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

-- Comments
COMMENT ON TABLE practice_sessions IS 'Session recordings for solo practitioners (healers, coaches, guides)';
COMMENT ON TABLE practice_transcript_segments IS 'Timestamped transcript with speaker diarization';
COMMENT ON TABLE session_insights IS 'MAIA developmental insights - observations, not diagnoses';
COMMENT ON TABLE practitioner_growth IS 'Cross-session learning patterns MAIA notices';
COMMENT ON TABLE practitioner_insight_preferences IS 'What insights practitioner wants + their modality vocabulary';
COMMENT ON TABLE modality_vocabulary IS 'Expandable vocabulary of therapeutic/healing modalities';
