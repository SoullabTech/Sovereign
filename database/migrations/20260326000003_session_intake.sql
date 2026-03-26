-- ============================================
-- SESSION INTAKE FIELDS
-- Structured pre-session context from client
-- ============================================

-- Raw intake fields (captured during booking)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intake_presenting_issue TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intake_focus_area TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intake_desired_outcome TEXT;

-- Derived signal (MAIA-generated or heuristic)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intake_signal JSONB;

-- Practitioner preparation (MAIA-generated)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS practitioner_prep JSONB;

COMMENT ON COLUMN sessions.intake_presenting_issue IS 'What brings the client here right now (free text)';
COMMENT ON COLUMN sessions.intake_focus_area IS 'Primary area of focus (structured selection)';
COMMENT ON COLUMN sessions.intake_desired_outcome IS 'What would make this session meaningful (free text)';
COMMENT ON COLUMN sessions.intake_signal IS 'Derived structured signal: summary, tone, keywords, urgency';
COMMENT ON COLUMN sessions.practitioner_prep IS 'MAIA-generated: summary, tone assessment, suggested stance';
