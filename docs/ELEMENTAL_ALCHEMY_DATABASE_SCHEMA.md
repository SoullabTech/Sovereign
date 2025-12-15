# Elemental Alchemy Database Schema

**Status**: Design Complete - Ready for Implementation
**Date**: 2025-12-14
**Purpose**: Database schema for all Elemental Alchemy book integration features

---

## Overview

This document defines the complete database schema needed to persist:
- User journey tracking (12-facet progression)
- Shadow integration tracking
- Daily alchemy engagement
- Book queries and interactions
- Analytics events
- User achievements

---

## Tables

### 1. `user_journey_state`

Tracks user's progression through the 12-phase Spiralogic journey.

```sql
CREATE TABLE user_journey_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current position
  current_facet_number INTEGER NOT NULL DEFAULT 1 CHECK (current_facet_number BETWEEN 1 AND 12),
  progress_in_facet DECIMAL(3, 2) NOT NULL DEFAULT 0.00 CHECK (progress_in_facet BETWEEN 0 AND 1),

  -- Completed facets (array of facet numbers)
  facets_completed INTEGER[] NOT NULL DEFAULT '{}',

  -- Spiral tracking
  spiral_level INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  journey_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_journey_state_user_id ON user_journey_state(user_id);
CREATE INDEX idx_user_journey_state_facet ON user_journey_state(current_facet_number);
CREATE INDEX idx_user_journey_state_updated ON user_journey_state(last_updated_at DESC);
```

**RLS Policies**:
```sql
-- Users can read their own journey
CREATE POLICY "Users can view own journey"
  ON user_journey_state FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own journey
CREATE POLICY "Users can update own journey"
  ON user_journey_state FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert journey
CREATE POLICY "System can insert journey"
  ON user_journey_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 2. `shadow_patterns`

Stores shadow patterns users are tracking.

```sql
CREATE TABLE shadow_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern identification
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Facet connection
  facet_number INTEGER NOT NULL CHECK (facet_number BETWEEN 1 AND 12),
  element VARCHAR(20) NOT NULL CHECK (element IN ('Fire', 'Water', 'Earth', 'Air', 'Aether')),

  -- Official teachings
  official_shadow_pattern TEXT NOT NULL,
  official_gold_medicine TEXT NOT NULL,

  -- Personal customization
  personal_triggers TEXT[] NOT NULL DEFAULT '{}',
  personal_gold_medicine TEXT[] NOT NULL DEFAULT '{}',

  -- Tracking
  first_noticed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_occurred_at TIMESTAMPTZ,
  instance_count INTEGER NOT NULL DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'integrating', 'integrated', 'dormant')),
  integration_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shadow_patterns_user_id ON shadow_patterns(user_id);
CREATE INDEX idx_shadow_patterns_status ON shadow_patterns(status);
CREATE INDEX idx_shadow_patterns_element ON shadow_patterns(element);
CREATE INDEX idx_shadow_patterns_facet ON shadow_patterns(facet_number);
CREATE INDEX idx_shadow_patterns_updated ON shadow_patterns(updated_at DESC);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own shadow patterns"
  ON shadow_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shadow patterns"
  ON shadow_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shadow patterns"
  ON shadow_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shadow patterns"
  ON shadow_patterns FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 3. `shadow_instances`

Records individual occurrences of shadow patterns.

```sql
CREATE TABLE shadow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shadow_pattern_id UUID NOT NULL REFERENCES shadow_patterns(id) ON DELETE CASCADE,

  -- Context
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger TEXT,
  context TEXT,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),

  -- Awareness
  notice_method VARCHAR(30) NOT NULL
    CHECK (notice_method IN (
      'body_sensation',
      'emotion',
      'behavior',
      'thought_pattern',
      'external_feedback'
    )),
  awareness TEXT NOT NULL,

  -- Response
  gold_medicine_applied TEXT,
  response_taken TEXT,

  -- Integration
  insights TEXT,
  was_integrated BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shadow_instances_user_id ON shadow_instances(user_id);
CREATE INDEX idx_shadow_instances_pattern_id ON shadow_instances(shadow_pattern_id);
CREATE INDEX idx_shadow_instances_occurred ON shadow_instances(occurred_at DESC);
CREATE INDEX idx_shadow_instances_integrated ON shadow_instances(was_integrated);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own shadow instances"
  ON shadow_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shadow instances"
  ON shadow_instances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shadow instances"
  ON shadow_instances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shadow instances"
  ON shadow_instances FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. `daily_alchemy_views`

Tracks when users view daily alchemy teachings.

```sql
CREATE TABLE daily_alchemy_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alchemy details
  alchemy_type VARCHAR(10) NOT NULL CHECK (alchemy_type IN ('morning', 'midday', 'evening')),
  element VARCHAR(20) NOT NULL CHECK (element IN ('Fire', 'Water', 'Earth', 'Air', 'Aether')),
  facet_id VARCHAR(20),
  day_of_year INTEGER NOT NULL,

  -- Content
  title TEXT NOT NULL,
  content_preview TEXT,

  -- Engagement
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_alchemy_views_user_id ON daily_alchemy_views(user_id);
CREATE INDEX idx_daily_alchemy_views_type ON daily_alchemy_views(alchemy_type);
CREATE INDEX idx_daily_alchemy_views_element ON daily_alchemy_views(element);
CREATE INDEX idx_daily_alchemy_views_viewed ON daily_alchemy_views(viewed_at DESC);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own alchemy views"
  ON daily_alchemy_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alchemy views"
  ON daily_alchemy_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 5. `book_queries`

Stores "Ask the Book" queries and responses.

```sql
CREATE TABLE book_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Query
  query TEXT NOT NULL,
  requested_element VARCHAR(20) CHECK (requested_element IN ('fire', 'water', 'earth', 'air', 'aether', 'spiralogic')),

  -- Detection
  detected_themes TEXT[] NOT NULL DEFAULT '{}',
  chapters_loaded TEXT[] NOT NULL DEFAULT '{}',

  -- Response metadata
  relevance_scores JSONB,

  -- Engagement
  queried_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds INTEGER,
  was_helpful BOOLEAN,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_book_queries_user_id ON book_queries(user_id);
CREATE INDEX idx_book_queries_queried ON book_queries(queried_at DESC);
CREATE INDEX idx_book_queries_chapters ON book_queries USING GIN(chapters_loaded);
CREATE INDEX idx_book_queries_themes ON book_queries USING GIN(detected_themes);
CREATE INDEX idx_book_queries_text ON book_queries USING GIN(to_tsvector('english', query));
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own book queries"
  ON book_queries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own book queries"
  ON book_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own book queries"
  ON book_queries FOR UPDATE
  USING (auth.uid() = user_id);
```

---

### 6. `analytics_events`

General analytics event tracking.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'book_query',
    'chapter_loaded',
    'journey_progress',
    'shadow_recorded',
    'shadow_integrated',
    'daily_alchemy_viewed',
    'practice_completed',
    'achievement_unlocked',
    'facet_completed'
  )),

  -- Metadata (flexible JSON for different event types)
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);
CREATE INDEX idx_analytics_events_metadata ON analytics_events USING GIN(metadata);
```

**RLS Policies**:
```sql
-- Users cannot directly query analytics (accessed via aggregated views)
-- System can insert events
CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 7. `user_achievements`

Tracks journey achievements and milestones.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Achievement
  achievement_type VARCHAR(30) NOT NULL CHECK (achievement_type IN (
    'facet_complete',
    'stage_complete',
    'spiral_complete',
    'milestone'
  )),

  achievement_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Context
  facet_number INTEGER CHECK (facet_number BETWEEN 1 AND 12),
  related_data JSONB,

  -- Timestamps
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: One achievement per user
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 8. `practice_completions`

Tracks when users complete recommended practices.

```sql
CREATE TABLE practice_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Practice
  practice_name VARCHAR(255) NOT NULL,
  practice_type VARCHAR(50) NOT NULL,
  element VARCHAR(20) CHECK (element IN ('Fire', 'Water', 'Earth', 'Air', 'Aether')),
  facet_number INTEGER CHECK (facet_number BETWEEN 1 AND 12),

  -- Completion
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Feedback
  notes TEXT,
  impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_practice_completions_user_id ON practice_completions(user_id);
CREATE INDEX idx_practice_completions_element ON practice_completions(element);
CREATE INDEX idx_practice_completions_completed ON practice_completions(completed_at DESC);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own practice completions"
  ON practice_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice completions"
  ON practice_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Views

### `v_user_journey_overview`

Provides comprehensive journey overview for users.

```sql
CREATE VIEW v_user_journey_overview AS
SELECT
  ujs.user_id,
  ujs.current_facet_number,
  ujs.progress_in_facet,
  ujs.spiral_level,
  array_length(ujs.facets_completed, 1) AS facets_completed_count,
  ujs.journey_started_at,

  -- Days in journey
  EXTRACT(DAY FROM NOW() - ujs.journey_started_at) AS days_in_journey,

  -- Recent achievements
  (
    SELECT COUNT(*)
    FROM user_achievements ua
    WHERE ua.user_id = ujs.user_id
      AND ua.unlocked_at >= NOW() - INTERVAL '30 days'
  ) AS achievements_last_30_days,

  -- Recent shadow work
  (
    SELECT COUNT(*)
    FROM shadow_instances si
    WHERE si.user_id = ujs.user_id
      AND si.occurred_at >= NOW() - INTERVAL '30 days'
  ) AS shadow_instances_last_30_days,

  -- Recent book engagement
  (
    SELECT COUNT(*)
    FROM book_queries bq
    WHERE bq.user_id = ujs.user_id
      AND bq.queried_at >= NOW() - INTERVAL '30 days'
  ) AS book_queries_last_30_days

FROM user_journey_state ujs;
```

### `v_platform_analytics_summary`

Platform-wide metrics for admin/Kelly.

```sql
CREATE VIEW v_platform_analytics_summary AS
SELECT
  -- Users
  (SELECT COUNT(DISTINCT user_id) FROM user_journey_state) AS total_users,
  (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_timestamp >= NOW() - INTERVAL '30 days') AS active_users_30_days,

  -- Engagement
  (SELECT COUNT(*) FROM book_queries WHERE queried_at >= NOW() - INTERVAL '30 days') AS book_queries_30_days,
  (SELECT COUNT(*) FROM shadow_instances WHERE occurred_at >= NOW() - INTERVAL '30 days') AS shadow_instances_30_days,
  (SELECT COUNT(*) FROM daily_alchemy_views WHERE viewed_at >= NOW() - INTERVAL '30 days') AS alchemy_views_30_days,

  -- Transformation
  (SELECT COUNT(*) FROM shadow_patterns WHERE status = 'integrated') AS total_patterns_integrated,
  (SELECT AVG(current_facet_number) FROM user_journey_state) AS avg_facet_progress,

  -- Last updated
  NOW() AS generated_at;
```

---

## Migration Order

When implementing, create tables in this order:

1. `user_journey_state` (no dependencies)
2. `shadow_patterns` (depends on users)
3. `shadow_instances` (depends on shadow_patterns)
4. `daily_alchemy_views` (no dependencies)
5. `book_queries` (no dependencies)
6. `analytics_events` (no dependencies)
7. `user_achievements` (no dependencies)
8. `practice_completions` (no dependencies)
9. Views (depend on tables)

---

## Supabase Migration File

```sql
-- File: supabase/migrations/20251214_elemental_alchemy_integration.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- [Include all CREATE TABLE statements from above]

-- [Include all CREATE INDEX statements]

-- [Include all CREATE POLICY statements]

-- Enable RLS on all tables
ALTER TABLE user_journey_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_alchemy_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_completions ENABLE ROW LEVEL SECURITY;

-- [Include all CREATE VIEW statements]
```

---

## Integration with Services

### TypeScript Service → Database Mapping

| Service File | Primary Tables |
|-------------|----------------|
| `ElementalJourneyTracker.ts` | `user_journey_state`, `user_achievements` |
| `ShadowIntegrationTracker.ts` | `shadow_patterns`, `shadow_instances` |
| `DailyAlchemyService.ts` | `daily_alchemy_views` |
| `AskTheBookService.ts` | `book_queries` |
| `ElementalAlchemyAnalytics.ts` | `analytics_events` (all tables for aggregation) |

---

## TODO: Implementation Steps

1. **Create Migration File**: Copy SQL to `supabase/migrations/20251214_elemental_alchemy_integration.sql`
2. **Run Migration**: `supabase db push` or apply via Supabase dashboard
3. **Update Services**: Replace in-memory caches with Supabase client calls
4. **Test Queries**: Verify all CRUD operations work
5. **Add Indexes**: Monitor query performance and add indexes as needed
6. **Setup Monitoring**: Track table sizes and query performance

---

**Document Maintained By**: Claude Code
**Last Updated**: 2025-12-14
**Status**: Schema Design Complete - Ready for Implementation
