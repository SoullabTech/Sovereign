-- ================================================
-- PRACTITIONER CASELOAD SYSTEM
-- Enables therapists to manage client cases with MAIA consultation
-- Migration: 20260107000001_practitioner_caseload.sql
-- ================================================

-- Enable practitioner role for members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS is_practitioner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS practitioner_license_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS practitioner_since TIMESTAMPTZ;

-- ================================================
-- CASES (Client records within practitioner's caseload)
-- ================================================
CREATE TABLE IF NOT EXISTS practitioner_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Client identification (practitioner's own ID/pseudonym)
  client_identifier VARCHAR(100) NOT NULL,
  client_name_encrypted TEXT,               -- Optional encrypted real name

  -- Case metadata
  presenting_concerns TEXT[],               -- Array of initial concerns
  intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
  case_status VARCHAR(20) DEFAULT 'active'
    CHECK (case_status IN ('active', 'paused', 'completed', 'transferred', 'archived')),

  -- Spiralogic positioning
  primary_element VARCHAR(20),              -- Earth, Water, Fire, Air, Aether
  spiral_stage VARCHAR(50),                 -- Current developmental position
  facet_code VARCHAR(20),                   -- e.g., "WATER-2", "FIRE-3"

  -- Privacy model
  privacy_mode VARCHAR(20) DEFAULT 'private'
    CHECK (privacy_mode IN ('private', 'transparent', 'consent_based')),
  consent_captured_at TIMESTAMPTZ,
  consent_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Ensure unique client per practitioner
  UNIQUE(practitioner_id, client_identifier)
);

CREATE INDEX IF NOT EXISTS idx_cases_practitioner ON practitioner_cases(practitioner_id, case_status);
CREATE INDEX IF NOT EXISTS idx_cases_element ON practitioner_cases(primary_element);
CREATE INDEX IF NOT EXISTS idx_cases_status ON practitioner_cases(case_status);

-- ================================================
-- CASE NOTES (Manual session documentation)
-- ================================================
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id),

  -- Note content
  note_type VARCHAR(30) NOT NULL
    CHECK (note_type IN ('session', 'observation', 'consultation', 'progress', 'intake', 'discharge', 'supervision')),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_duration_minutes INTEGER,

  -- Structured content
  content TEXT NOT NULL,                    -- Main note body
  interventions_used TEXT[],                -- Interventions applied
  themes_observed TEXT[],                   -- Themes/patterns observed

  -- Spiralogic tracking
  element_focus VARCHAR(20),                -- Primary element in this session
  spiral_movement VARCHAR(50),              -- Any spiral transitions observed

  -- AI-assisted analysis (populated by MAIA)
  maia_analysis JSONB,                      -- MAIA's pattern observations
  pattern_markers TEXT[],                   -- Key patterns flagged

  -- Linked capture sessions
  linked_capture_session_id TEXT,           -- FK to capture_sessions if recorded

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case ON case_notes(case_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_case_notes_practitioner ON case_notes(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_type ON case_notes(note_type);

-- ================================================
-- CASE MEMORIES (MAIA's developmental memory scoped to case)
-- ================================================
CREATE TABLE IF NOT EXISTS case_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id),

  -- Memory classification
  memory_type VARCHAR(30) NOT NULL
    CHECK (memory_type IN (
      'pattern',              -- Recurring pattern detected
      'breakthrough',         -- Significant progress moment
      'stuck_point',          -- Identified resistance/block
      'spiral_transition',    -- Stage movement
      'intervention_outcome', -- What worked/didn't work
      'hypothesis',           -- Clinical hypothesis
      'supervision_insight'   -- From supervision/consultation
    )),

  -- Memory content
  content TEXT NOT NULL,
  significance NUMERIC(3,2) DEFAULT 0.70 CHECK (significance >= 0 AND significance <= 1),

  -- Spiralogic context
  facet_code VARCHAR(20),
  element_tags VARCHAR(20)[],

  -- Source tracking
  source_note_id UUID REFERENCES case_notes(id),
  source_consultation_id UUID,              -- If from MAIA consultation

  -- Vector embedding for semantic search
  vector_embedding vector(768),

  -- Timestamps
  formed_at TIMESTAMPTZ DEFAULT NOW(),
  last_recalled_at TIMESTAMPTZ,
  recall_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_case_memories_case ON case_memories(case_id, significance DESC);
CREATE INDEX IF NOT EXISTS idx_case_memories_type ON case_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_case_memories_vector ON case_memories
  USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);

-- ================================================
-- MAIA CONSULTATIONS (Supervision-style dialogues)
-- ================================================
CREATE TABLE IF NOT EXISTS maia_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id),

  -- Scope
  case_id UUID REFERENCES practitioner_cases(id),  -- NULL = cross-caseload consultation
  consultation_type VARCHAR(30) NOT NULL
    CHECK (consultation_type IN (
      'case_formulation',     -- Understanding the case
      'intervention_planning',-- What to try next
      'pattern_analysis',     -- What MAIA sees in the data
      'stuck_point',          -- When feeling stuck
      'supervision',          -- Broader supervision
      'spiralogic_mapping'    -- Elemental/spiral exploration
    )),

  -- Consultation content
  practitioner_query TEXT NOT NULL,         -- What practitioner asked
  context_provided JSONB,                   -- Case data shared with MAIA
  maia_response TEXT NOT NULL,              -- MAIA's consultation response

  -- Quality markers
  practitioner_rating INTEGER CHECK (practitioner_rating >= 1 AND practitioner_rating <= 5),
  practitioner_feedback TEXT,

  -- Metadata
  model_used VARCHAR(100) DEFAULT 'claude-opus-4-5-20251101',
  tokens_used INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_practitioner ON maia_consultations(practitioner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_case ON maia_consultations(case_id);
CREATE INDEX IF NOT EXISTS idx_consultations_type ON maia_consultations(consultation_type);

-- ================================================
-- CAPTURE SESSION LINKS (Connect Note mode to cases)
-- ================================================
CREATE TABLE IF NOT EXISTS case_capture_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  capture_session_id TEXT NOT NULL,         -- FK to capture_sessions

  -- Link metadata
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  linked_by UUID NOT NULL REFERENCES members(id),

  -- Auto-generated case note from capture
  generated_note_id UUID REFERENCES case_notes(id),

  UNIQUE(case_id, capture_session_id)
);

CREATE INDEX IF NOT EXISTS idx_capture_links_case ON case_capture_links(case_id);
CREATE INDEX IF NOT EXISTS idx_capture_links_session ON case_capture_links(capture_session_id);

-- ================================================
-- UPDATE TIMESTAMP TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_case_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cases_timestamp ON practitioner_cases;
CREATE TRIGGER update_cases_timestamp
  BEFORE UPDATE ON practitioner_cases
  FOR EACH ROW EXECUTE FUNCTION update_case_timestamp();

DROP TRIGGER IF EXISTS update_case_notes_timestamp ON case_notes;
CREATE TRIGGER update_case_notes_timestamp
  BEFORE UPDATE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION update_case_timestamp();

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE practitioner_cases IS 'Client cases within a practitioner caseload - clients are contexts, not users';
COMMENT ON TABLE case_notes IS 'Manual session documentation for cases';
COMMENT ON TABLE case_memories IS 'MAIA developmental memories scoped to specific cases';
COMMENT ON TABLE maia_consultations IS 'Supervision-style MAIA consultations about cases';
COMMENT ON COLUMN practitioner_cases.privacy_mode IS 'private=practitioner only, transparent=client can see, consent_based=requires explicit consent';
COMMENT ON COLUMN practitioner_cases.client_identifier IS 'Practitioner-defined identifier (pseudonym, case number, initials)';
