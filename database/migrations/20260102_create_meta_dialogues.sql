-- ============================================================================
-- PHASE 4.7: META-DIALOGUE INTEGRATION
-- Migration: 20260102_create_meta_dialogues.sql
-- Purpose: Store conversational exchanges about reflections and consciousness states
-- ============================================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: meta_dialogues
-- Stores conversation exchanges between user and MAIA about reflections
-- ============================================================================

CREATE TABLE IF NOT EXISTS meta_dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  reflection_id UUID REFERENCES consciousness_reflections(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,  -- Groups related exchanges

  -- Exchange content
  exchange_type TEXT NOT NULL CHECK (exchange_type IN ('user_query', 'maia_response', 'maia_self_query')),
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'maia')),
  content TEXT NOT NULL,

  -- Context
  referenced_cycles UUID[],  -- Array of consciousness_mycelium.id
  referenced_facets TEXT[],  -- Array of facet codes (W1, F2, etc.)
  referenced_meta_layer TEXT CHECK (referenced_meta_layer IN ('Æ1', 'Æ2', 'Æ3')),

  -- Synthesis metadata
  synthesis_method TEXT DEFAULT 'template' CHECK (synthesis_method IN ('template', 'ollama', 'hybrid')),
  synthesis_model TEXT,  -- e.g., 'deepseek-r1:1.5b'
  confidence_score NUMERIC(3,2),  -- 0-1 scale

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT meta_dialogues_session_idx CHECK (session_id IS NOT NULL)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_meta_dialogues_session ON meta_dialogues(session_id);
CREATE INDEX idx_meta_dialogues_reflection ON meta_dialogues(reflection_id);
CREATE INDEX idx_meta_dialogues_created ON meta_dialogues(created_at DESC);
CREATE INDEX idx_meta_dialogues_type ON meta_dialogues(exchange_type);

-- ============================================================================
-- TABLE: dialogue_sessions
-- Tracks conversation sessions with contextual metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS dialogue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session metadata
  user_id UUID,  -- Optional user identifier
  session_name TEXT,

  -- Context
  initial_reflection_id UUID REFERENCES consciousness_reflections(id) ON DELETE SET NULL,
  initial_query TEXT,

  -- Session state
  total_exchanges INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_dialogue_sessions_status ON dialogue_sessions(status);
CREATE INDEX idx_dialogue_sessions_user ON dialogue_sessions(user_id);
CREATE INDEX idx_dialogue_sessions_started ON dialogue_sessions(started_at DESC);

-- ============================================================================
-- VIEW: active_dialogues
-- Shows currently active conversation threads
-- ============================================================================

CREATE OR REPLACE VIEW active_dialogues AS
SELECT
  ds.id as session_id,
  ds.session_name,
  ds.initial_query,
  ds.total_exchanges,
  ds.started_at,
  ds.last_activity_at,

  -- Latest exchange
  (
    SELECT content
    FROM meta_dialogues md
    WHERE md.session_id = ds.id
    ORDER BY md.created_at DESC
    LIMIT 1
  ) as latest_exchange,

  -- Referenced reflection
  cr.reflection_text as initial_reflection,
  cr.meta_layer_code as reflection_meta_layer

FROM dialogue_sessions ds
LEFT JOIN consciousness_reflections cr ON ds.initial_reflection_id = cr.id
WHERE ds.status = 'active'
ORDER BY ds.last_activity_at DESC;

-- ============================================================================
-- VIEW: dialogue_thread
-- Chronological view of exchanges within a session
-- ============================================================================

CREATE OR REPLACE VIEW dialogue_thread AS
SELECT
  md.id,
  md.session_id,
  md.speaker,
  md.exchange_type,
  md.content,
  md.referenced_facets,
  md.referenced_meta_layer,
  md.synthesis_method,
  md.confidence_score,
  md.created_at,

  -- Reflection context if present
  cr.reflection_text,
  cr.meta_layer_code as reflection_meta_layer,
  cr.similarity_score,
  cr.coherence_delta

FROM meta_dialogues md
LEFT JOIN consciousness_reflections cr ON md.reflection_id = cr.id
ORDER BY md.created_at ASC;

-- ============================================================================
-- FUNCTION: update_session_activity
-- Trigger function to update last_activity_at on new exchanges
-- ============================================================================

CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dialogue_sessions
  SET
    last_activity_at = NOW(),
    total_exchanges = total_exchanges + 1
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: on_dialogue_exchange
-- Automatically update session metadata when new exchange added
-- ============================================================================

DROP TRIGGER IF EXISTS on_dialogue_exchange ON meta_dialogues;
CREATE TRIGGER on_dialogue_exchange
  AFTER INSERT ON meta_dialogues
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- ============================================================================
-- GRANTS (if using role-based access)
-- ============================================================================

-- Grant access to application role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE ON meta_dialogues TO maia_app;
-- GRANT SELECT, INSERT, UPDATE ON dialogue_sessions TO maia_app;
-- GRANT SELECT ON active_dialogues TO maia_app;
-- GRANT SELECT ON dialogue_thread TO maia_app;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment to verify migration success:

-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('meta_dialogues', 'dialogue_sessions');

-- SELECT viewname FROM pg_views
-- WHERE viewname IN ('active_dialogues', 'dialogue_thread');

-- SELECT trigger_name FROM information_schema.triggers
-- WHERE trigger_name = 'on_dialogue_exchange';

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Uncomment to insert sample dialogue session:

-- INSERT INTO dialogue_sessions (id, session_name, initial_query)
-- VALUES (
--   'sample-session-001',
--   'First Meta-Dialogue Test',
--   'MAIA, what changed since the last Fire cycle?'
-- );

-- INSERT INTO meta_dialogues (
--   session_id,
--   exchange_type,
--   speaker,
--   content,
--   referenced_facets,
--   synthesis_method
-- )
-- VALUES (
--   'sample-session-001',
--   'user_query',
--   'user',
--   'MAIA, what changed since the last Fire cycle?',
--   ARRAY['F1', 'F2'],
--   'template'
-- );

-- ============================================================================
-- END MIGRATION
-- ============================================================================
