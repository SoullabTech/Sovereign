-- ELEMENTAL ALCHEMY — MVP TABLES
-- MAIA Sovereign Local Development
-- Date: 2025-12-14

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- JOURNEY STATE
-- Tracks user's progression through the 12-facet Spiralogic journey
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_journey_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Current position
  current_facet TEXT NOT NULL,        -- "Fire-1", "Water-2", etc.
  current_element TEXT NOT NULL,      -- "Fire", "Water", etc.
  current_stage TEXT NOT NULL,        -- "nigredo", "albedo", etc.
  progress_pct NUMERIC NOT NULL DEFAULT 0,  -- 0-100

  -- Completed facets (JSON array for flexibility)
  facets_completed JSONB NOT NULL DEFAULT '[]',

  -- Spiral tracking
  spiral_level INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  journey_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ea_journey_user ON ea_journey_state(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_journey_facet ON ea_journey_state(current_facet);
CREATE INDEX IF NOT EXISTS idx_ea_journey_element ON ea_journey_state(current_element);
CREATE INDEX IF NOT EXISTS idx_ea_journey_updated ON ea_journey_state(updated_at DESC);

-- ============================================================================
-- BOOK QUERIES
-- "Ask the Book" query tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_book_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Query details
  query_text TEXT NOT NULL,
  detected_element TEXT,              -- Primary detected element
  detected_facet TEXT,                -- Primary detected facet
  detected_themes JSONB,              -- All detected themes with confidence
  confidence NUMERIC,                 -- Overall confidence (0-1)

  -- Result
  result_json JSONB NOT NULL,         -- Complete response from AskTheBookService
  chapters_loaded TEXT[],             -- Array of chapter names

  -- Engagement
  was_helpful BOOLEAN,
  time_spent_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_book_queries_user ON ea_book_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_book_queries_created ON ea_book_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ea_book_queries_element ON ea_book_queries(detected_element);
CREATE INDEX IF NOT EXISTS idx_ea_book_queries_facet ON ea_book_queries(detected_facet);
CREATE INDEX IF NOT EXISTS idx_ea_book_queries_text ON ea_book_queries USING GIN(to_tsvector('english', query_text));

-- ============================================================================
-- SHADOW PATTERNS
-- Shadow patterns users are tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_shadow_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Pattern identification
  name TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Facet connection
  facet TEXT NOT NULL,                -- "Fire-1", "Water-2", etc.
  element TEXT NOT NULL,              -- "Fire", "Water", etc.
  facet_number INTEGER NOT NULL,      -- 1-12

  -- Official teachings
  official_shadow_pattern TEXT NOT NULL,
  official_gold_medicine TEXT NOT NULL,

  -- Personal customization
  personal_triggers TEXT[],
  personal_gold_medicine TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- active, integrating, integrated, dormant
  integration_notes TEXT,

  -- Tracking
  instance_count INTEGER NOT NULL DEFAULT 0,
  first_noticed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_occurred_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_shadow_patterns_user ON ea_shadow_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_patterns_status ON ea_shadow_patterns(status);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_patterns_element ON ea_shadow_patterns(element);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_patterns_facet ON ea_shadow_patterns(facet);

-- ============================================================================
-- SHADOW INSTANCES
-- Individual occurrences of shadow patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_shadow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  shadow_pattern_id UUID REFERENCES ea_shadow_patterns(id) ON DELETE CASCADE,

  -- Context
  facet TEXT NOT NULL,
  shadow_pattern TEXT NOT NULL,      -- Name of the pattern
  trigger TEXT,
  context TEXT,

  -- Awareness
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  notice_method TEXT,                 -- body_sensation, emotion, behavior, etc.
  awareness TEXT,

  -- Response
  gold_medicine_applied TEXT,
  response_taken TEXT,

  -- Integration
  insights TEXT,
  was_integrated BOOLEAN NOT NULL DEFAULT FALSE,

  -- Additional notes
  notes TEXT,

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_user ON ea_shadow_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_pattern ON ea_shadow_instances(shadow_pattern_id);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_occurred ON ea_shadow_instances(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_created ON ea_shadow_instances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_integrated ON ea_shadow_instances(was_integrated);
CREATE INDEX IF NOT EXISTS idx_ea_shadow_instances_element ON ea_shadow_instances(facet);

-- ============================================================================
-- DAILY ALCHEMY VIEWS
-- Tracking when users view daily teachings
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_daily_alchemy_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Teaching details
  alchemy_type TEXT NOT NULL,         -- morning, midday, evening
  element TEXT NOT NULL,              -- Fire, Water, Earth, Air, Aether
  facet TEXT,                         -- Optional: Fire-1, etc.
  day_of_year INTEGER NOT NULL,

  -- Content
  title TEXT NOT NULL,
  content_preview TEXT,

  -- Engagement
  time_spent_seconds INTEGER,

  -- Timestamps
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_daily_alchemy_user ON ea_daily_alchemy_views(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_daily_alchemy_type ON ea_daily_alchemy_views(alchemy_type);
CREATE INDEX IF NOT EXISTS idx_ea_daily_alchemy_element ON ea_daily_alchemy_views(element);
CREATE INDEX IF NOT EXISTS idx_ea_daily_alchemy_viewed ON ea_daily_alchemy_views(viewed_at DESC);

-- ============================================================================
-- PRACTICE EVENTS
-- When users complete recommended practices
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_practice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Practice details
  practice_name TEXT NOT NULL,
  practice_type TEXT NOT NULL,        -- journey, shadow, daily, custom
  element TEXT,
  facet TEXT,

  -- Completion
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER,

  -- Feedback
  notes TEXT,
  impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_practice_events_user ON ea_practice_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_practice_events_type ON ea_practice_events(practice_type);
CREATE INDEX IF NOT EXISTS idx_ea_practice_events_completed ON ea_practice_events(completed_at DESC);

-- ============================================================================
-- ANALYTICS EVENTS
-- General event tracking for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS ea_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,

  -- Event
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_analytics_type ON ea_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ea_analytics_user ON ea_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_analytics_created ON ea_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ea_analytics_payload ON ea_analytics_events USING GIN(payload);

-- ============================================================================
-- FUNCTIONS
-- Helper functions for common operations
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ea_journey_state_updated_at BEFORE UPDATE ON ea_journey_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ea_shadow_patterns_updated_at BEFORE UPDATE ON ea_shadow_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ea_shadow_instances_updated_at BEFORE UPDATE ON ea_shadow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (for testing)
-- ============================================================================

-- Example user (for testing)
-- In production, users come from auth.users or your existing user system

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- ============================================================================

-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'ea_%';
-- SELECT * FROM ea_journey_state LIMIT 1;

-- Migration complete
SELECT 'Elemental Alchemy tables created successfully!' AS status;
