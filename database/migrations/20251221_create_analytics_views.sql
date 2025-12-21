-- Phase 4.4A: Analytics Dashboard - Database Foundation
-- Date: 2025-12-21
-- Purpose: Create materialized views and indexes for consciousness trace analytics

-- ============================================================================
-- SECTION 1: Additional Indexes for Analytics Performance
-- ============================================================================

-- Index for facet-based queries
CREATE INDEX IF NOT EXISTS consciousness_traces_facet_idx
  ON consciousness_traces (facet)
  WHERE facet IS NOT NULL;

-- Index for agent-based queries
CREATE INDEX IF NOT EXISTS consciousness_traces_agent_idx
  ON consciousness_traces (agent)
  WHERE agent IS NOT NULL;

-- Index for safety queries (partial index for elevated/critical only)
CREATE INDEX IF NOT EXISTS consciousness_traces_safety_idx
  ON consciousness_traces (safety_level)
  WHERE safety_level IN ('elevated', 'critical');

-- Index for recent data (DESC order for time-series queries)
-- Note: No partial index with NOW() since it's not immutable
CREATE INDEX IF NOT EXISTS consciousness_traces_recent_idx
  ON consciousness_traces (created_at DESC);

-- ============================================================================
-- SECTION 2: Materialized Views
-- ============================================================================

-- View 1: Facet Distribution
-- Purpose: Track which facets are being activated and their performance
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_facet_distribution AS
SELECT
  facet,
  COUNT(*) as total_traces,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(confidence) as avg_confidence,
  AVG(latency_ms) as avg_latency_ms,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM consciousness_traces
WHERE facet IS NOT NULL
GROUP BY facet;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_facet_distribution_pkey
  ON analytics_facet_distribution (facet);

-- View 2: Agent Metrics
-- Purpose: Track agent routing frequency and latency percentiles
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_agent_metrics AS
SELECT
  agent,
  COUNT(*) as total_routes,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(latency_ms) as avg_latency_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
  MIN(created_at) as first_route,
  MAX(created_at) as last_route
FROM consciousness_traces
WHERE agent IS NOT NULL
  AND latency_ms IS NOT NULL
GROUP BY agent;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_agent_metrics_pkey
  ON analytics_agent_metrics (agent);

-- View 3: Hourly Activity
-- Purpose: Track temporal patterns in trace activity and facet distribution
-- Note: facet_breakdown computed via subquery to avoid nested aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_hourly_activity AS
WITH hourly_stats AS (
  SELECT
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as trace_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(latency_ms) as avg_latency_ms,
    COUNT(*) FILTER (WHERE safety_level = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE safety_level = 'elevated') as elevated_events
  FROM consciousness_traces
  GROUP BY DATE_TRUNC('hour', created_at)
),
facet_counts AS (
  SELECT
    DATE_TRUNC('hour', created_at) as hour,
    COALESCE(facet, 'none') as facet,
    COUNT(*) as count
  FROM consciousness_traces
  GROUP BY DATE_TRUNC('hour', created_at), COALESCE(facet, 'none')
)
SELECT
  h.hour,
  h.trace_count,
  h.unique_users,
  h.avg_latency_ms,
  h.critical_events,
  h.elevated_events,
  jsonb_object_agg(f.facet, f.count) as facet_breakdown
FROM hourly_stats h
LEFT JOIN facet_counts f ON h.hour = f.hour
GROUP BY h.hour, h.trace_count, h.unique_users, h.avg_latency_ms, h.critical_events, h.elevated_events
ORDER BY h.hour DESC;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_hourly_activity_pkey
  ON analytics_hourly_activity (hour);

-- View 4: Practice Recommendations
-- Purpose: Track which practices are being recommended and their context
-- CORRECTED: Uses trace->'plan'->'steps' not trace->'routing'->'practices'
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_practice_recommendations AS
SELECT
  practice_detail as practice,
  COUNT(*) as recommendation_count,
  COUNT(DISTINCT user_id) as unique_users,
  array_agg(DISTINCT facet) FILTER (WHERE facet IS NOT NULL) as associated_facets,
  AVG(confidence) as avg_confidence_when_recommended,
  MIN(created_at) as first_recommended,
  MAX(created_at) as last_recommended
FROM consciousness_traces,
     LATERAL (
       SELECT (step->>'detail') as practice_detail
       FROM jsonb_array_elements(trace->'plan'->'steps') as step
       WHERE step->>'kind' = 'practice'
     ) practices
WHERE trace ? 'plan'
  AND trace->'plan' ? 'steps'
GROUP BY practice_detail
ORDER BY recommendation_count DESC;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_practice_recommendations_pkey
  ON analytics_practice_recommendations (practice);

-- View 5: Safety Events
-- Purpose: Track elevated and critical safety events for monitoring
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_safety_events AS
SELECT
  id,
  created_at,
  user_id,
  safety_level,
  facet,
  mode,
  agent,
  latency_ms,
  trace->'plan'->'steps' as practices,
  trace->'inference'->'rationale' as rationale
FROM consciousness_traces
WHERE safety_level IN ('elevated', 'critical')
ORDER BY created_at DESC;

CREATE INDEX IF NOT EXISTS analytics_safety_events_created_idx
  ON analytics_safety_events (created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_safety_events_user_idx
  ON analytics_safety_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_safety_events_level_idx
  ON analytics_safety_events (safety_level);

-- ============================================================================
-- SECTION 3: Refresh Function
-- ============================================================================

-- Function to refresh all analytics materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS TABLE(view_name TEXT, refresh_time_ms NUMERIC) AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
BEGIN
  -- Refresh facet distribution
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW analytics_facet_distribution;
  end_time := clock_timestamp();
  view_name := 'analytics_facet_distribution';
  refresh_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh agent metrics
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW analytics_agent_metrics;
  end_time := clock_timestamp();
  view_name := 'analytics_agent_metrics';
  refresh_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh hourly activity
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW analytics_hourly_activity;
  end_time := clock_timestamp();
  view_name := 'analytics_hourly_activity';
  refresh_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh practice recommendations
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW analytics_practice_recommendations;
  end_time := clock_timestamp();
  view_name := 'analytics_practice_recommendations';
  refresh_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh safety events
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW analytics_safety_events;
  end_time := clock_timestamp();
  view_name := 'analytics_safety_events';
  refresh_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 4: Anonymized Research View (TSAI Compliance)
-- ============================================================================

-- Create anonymized view for external research sharing
CREATE OR REPLACE VIEW analytics_anonymized_traces AS
SELECT
  id,
  created_at,
  MD5(user_id::text) as anonymized_user_id,  -- One-way hash
  facet,
  mode,
  confidence,
  safety_level,
  latency_ms,
  trace->'plan'->'steps' as practices,
  trace->'rules'->'fired' as rules_fired
FROM consciousness_traces;

-- Optional: Create role for research partners (commented out - run manually when needed)
-- CREATE ROLE tsai_research_role WITH LOGIN PASSWORD 'secure_password_here';
-- GRANT SELECT ON analytics_anonymized_traces TO tsai_research_role;
-- GRANT SELECT ON analytics_facet_distribution TO tsai_research_role;
-- GRANT SELECT ON analytics_agent_metrics TO tsai_research_role;
-- GRANT SELECT ON analytics_hourly_activity TO tsai_research_role;
-- GRANT SELECT ON analytics_practice_recommendations TO tsai_research_role;

-- ============================================================================
-- SECTION 5: Initial Refresh
-- ============================================================================

-- Perform initial refresh of all views
SELECT * FROM refresh_analytics_views();

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification query
SELECT
  'Migration complete' as status,
  (SELECT COUNT(*) FROM pg_matviews WHERE matviewname LIKE 'analytics_%') as materialized_views,
  (SELECT COUNT(*) FROM pg_views WHERE viewname = 'analytics_anonymized_traces') as anonymized_views;

-- Display created materialized views
SELECT
  matviewname as view_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
  ispopulated
FROM pg_matviews
WHERE matviewname LIKE 'analytics_%'
ORDER BY matviewname;
