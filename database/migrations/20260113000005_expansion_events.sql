-- ============================================================
-- Expansion Events Table
-- Tracks explicit moments of user growth/expansion
--
-- Unlike ain_expansion_score (computed from telemetry), this table
-- captures specific, identifiable expansion moments:
-- - Insights voiced by user or detected by MAIA
-- - Breakthroughs in understanding
-- - Pattern integrations
-- - Reframes and perspective shifts
-- - Emotional completions
--
-- Sources:
-- - system_detected: MAIA identifies expansion markers in text
-- - user_reported: User explicitly marks something as an insight
-- - practitioner_noted: Practitioner flags expansion in supervision
-- - memory_surfaced: Expansion from memory recall/integration
-- ============================================================

CREATE TABLE IF NOT EXISTS expansion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Context
  session_id text NOT NULL,
  turn_id bigint REFERENCES maia_turns(id),
  user_id text,
  member_id uuid REFERENCES members(id),

  -- Event classification
  event_type text NOT NULL DEFAULT 'insight',
    -- insight: new understanding emerges
    -- breakthrough: significant shift in perspective
    -- integration: connecting previously separate ideas
    -- reframe: seeing situation differently
    -- completion: emotional/relational closure
    -- recognition: seeing self/pattern clearly
    -- boundary: healthy limit expressed/held
    -- other: custom/unclassified

  -- Source of the event
  source text NOT NULL DEFAULT 'system_detected',
    -- system_detected: MAIA identified expansion markers
    -- user_reported: user flagged as insight
    -- practitioner_noted: practitioner marked in supervision
    -- memory_surfaced: emerged from memory recall

  -- Content
  content text,                    -- the actual insight/breakthrough text
  context_before text,             -- what led up to it
  maia_response text,              -- how MAIA responded

  -- Scoring
  confidence float,                -- system confidence in classification (0-1)
  significance float,              -- estimated importance (0-1)

  -- Markers detected
  markers jsonb DEFAULT '[]',      -- specific patterns found: ["emotional_shift", "new_language", "self_reference"]

  -- Linking to other systems
  decision_id uuid,                -- link to maia_decisions if relevant
  memory_id text,                  -- link to memory if recall-triggered
  episode_id uuid,                 -- link to consciousness episode

  -- Outcome tracking (for later feedback)
  validated boolean,               -- did user confirm this was meaningful?
  feedback_score int,              -- 1-5 rating if provided
  feedback_text text,              -- user's reflection on the expansion

  -- Metadata
  meta jsonb DEFAULT '{}'
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Fast lookup by session (dashboard)
CREATE INDEX IF NOT EXISTS idx_expansion_events_session
  ON expansion_events(session_id);

-- Fast lookup by user (longitudinal analysis)
CREATE INDEX IF NOT EXISTS idx_expansion_events_user
  ON expansion_events(user_id);

-- Fast lookup by member (cross-device)
CREATE INDEX IF NOT EXISTS idx_expansion_events_member
  ON expansion_events(member_id);

-- Temporal queries
CREATE INDEX IF NOT EXISTS idx_expansion_events_created
  ON expansion_events(created_at DESC);

-- Type analysis
CREATE INDEX IF NOT EXISTS idx_expansion_events_type
  ON expansion_events(event_type);

-- Source analysis
CREATE INDEX IF NOT EXISTS idx_expansion_events_source
  ON expansion_events(source);

-- Validation filtering
CREATE INDEX IF NOT EXISTS idx_expansion_events_validated
  ON expansion_events(validated)
  WHERE validated IS NOT NULL;

-- GIN index for marker queries
CREATE INDEX IF NOT EXISTS idx_expansion_events_markers
  ON expansion_events USING gin(markers);

-- ============================================================
-- VIEWS FOR ANALYSIS
-- ============================================================

-- Daily expansion event counts by type
CREATE OR REPLACE VIEW expansion_events_daily AS
SELECT
  DATE_TRUNC('day', created_at)::date AS day,
  event_type,
  source,
  COUNT(*) AS event_count,
  AVG(COALESCE(confidence, 0)) AS avg_confidence,
  AVG(COALESCE(significance, 0)) AS avg_significance,
  SUM(CASE WHEN validated = true THEN 1 ELSE 0 END) AS validated_count,
  AVG(feedback_score) AS avg_feedback_score
FROM expansion_events
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2;

-- User expansion journey
CREATE OR REPLACE VIEW expansion_by_user AS
SELECT
  COALESCE(user_id, member_id::text) AS user_key,
  COUNT(*) AS total_expansions,
  COUNT(DISTINCT event_type) AS expansion_types,
  COUNT(DISTINCT session_id) AS sessions_with_expansion,
  AVG(COALESCE(confidence, 0)) AS avg_confidence,
  AVG(COALESCE(significance, 0)) AS avg_significance,
  SUM(CASE WHEN validated = true THEN 1 ELSE 0 END) AS validated_count,
  SUM(CASE WHEN validated = false THEN 1 ELSE 0 END) AS invalidated_count,
  AVG(feedback_score) AS avg_feedback_score,
  MIN(created_at) AS first_expansion,
  MAX(created_at) AS last_expansion,
  -- Expansion velocity: avg days between expansions
  CASE
    WHEN COUNT(*) > 1
    THEN EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / (COUNT(*) - 1) / 86400.0
    ELSE NULL
  END AS avg_days_between_expansions
FROM expansion_events
GROUP BY 1;

-- Session expansion summary
CREATE OR REPLACE VIEW expansion_by_session AS
SELECT
  session_id,
  COUNT(*) AS expansions,
  COUNT(DISTINCT event_type) AS expansion_types,
  AVG(COALESCE(confidence, 0)) AS avg_confidence,
  AVG(COALESCE(significance, 0)) AS avg_significance,
  array_agg(DISTINCT event_type) AS types_seen,
  MIN(created_at) AS first_expansion,
  MAX(created_at) AS last_expansion
FROM expansion_events
GROUP BY session_id;

-- Most common markers
CREATE OR REPLACE VIEW expansion_marker_frequency AS
SELECT
  marker,
  COUNT(*) AS occurrence_count,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT COALESCE(user_id, member_id::text)) AS users,
  AVG(COALESCE(significance, 0)) AS avg_significance
FROM expansion_events, jsonb_array_elements_text(markers) AS marker
GROUP BY marker
ORDER BY occurrence_count DESC;

-- Expansion event types by source (cross-tab)
CREATE OR REPLACE VIEW expansion_type_source_matrix AS
SELECT
  event_type,
  SUM(CASE WHEN source = 'system_detected' THEN 1 ELSE 0 END) AS system_detected,
  SUM(CASE WHEN source = 'user_reported' THEN 1 ELSE 0 END) AS user_reported,
  SUM(CASE WHEN source = 'practitioner_noted' THEN 1 ELSE 0 END) AS practitioner_noted,
  SUM(CASE WHEN source = 'memory_surfaced' THEN 1 ELSE 0 END) AS memory_surfaced,
  COUNT(*) AS total
FROM expansion_events
GROUP BY event_type
ORDER BY total DESC;

-- Expansion validation accuracy (system vs user agreement)
CREATE OR REPLACE VIEW expansion_validation_accuracy AS
SELECT
  source,
  event_type,
  COUNT(*) AS total,
  SUM(CASE WHEN validated IS NULL THEN 1 ELSE 0 END) AS pending_validation,
  SUM(CASE WHEN validated = true THEN 1 ELSE 0 END) AS validated_true,
  SUM(CASE WHEN validated = false THEN 1 ELSE 0 END) AS validated_false,
  ROUND(100.0 * SUM(CASE WHEN validated = true THEN 1 ELSE 0 END) /
    NULLIF(SUM(CASE WHEN validated IS NOT NULL THEN 1 ELSE 0 END), 0), 2) AS accuracy_pct
FROM expansion_events
GROUP BY source, event_type
ORDER BY source, total DESC;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE expansion_events IS 'Tracks explicit moments of user growth, insight, and expansion';
COMMENT ON COLUMN expansion_events.event_type IS 'Type: insight, breakthrough, integration, reframe, completion, recognition, boundary, other';
COMMENT ON COLUMN expansion_events.source IS 'How detected: system_detected, user_reported, practitioner_noted, memory_surfaced';
COMMENT ON COLUMN expansion_events.markers IS 'JSON array of specific markers detected (emotional_shift, new_language, etc.)';
COMMENT ON COLUMN expansion_events.validated IS 'User confirmation that this was meaningful (NULL=pending, true=confirmed, false=rejected)';
COMMENT ON COLUMN expansion_events.significance IS 'Estimated importance 0-1 (used for filtering/ranking)';
