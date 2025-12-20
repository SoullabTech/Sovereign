-- MAIA Skills System: RLS + Indexes
-- Created: 2025-12-20

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_skill_usage_user_time
  ON skill_usage_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_usage_skill_time
  ON skill_usage_events (skill_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_feedback_user_time
  ON skill_feedback (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_feedback_skill_time
  ON skill_feedback (skill_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_unlocks_user_skill
  ON skill_unlocks (user_id, skill_id);

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

-- NOTE: RLS disabled for direct Postgres usage (not using Supabase auth)
-- Access control happens at application layer in lib/skills/db.ts
-- If deploying to Supabase in future, enable RLS and uncomment policies below

-- ALTER TABLE skills_registry ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skill_unlocks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skill_usage_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skill_feedback ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_emergence_candidates ENABLE ROW LEVEL SECURITY;

-- Example policies for Supabase deployment (commented out):
--
-- DO $$ BEGIN
--   CREATE POLICY "skills_registry_read_enabled" ON skills_registry
--     FOR SELECT TO authenticated
--     USING (enabled = true);
-- EXCEPTION WHEN duplicate_object THEN NULL;
-- END $$;
--
-- DO $$ BEGIN
--   CREATE POLICY "skill_unlocks_read_own" ON skill_unlocks
--     FOR SELECT TO authenticated
--     USING (auth.uid() = user_id);
-- EXCEPTION WHEN duplicate_object THEN NULL;
-- END $$;
--
-- DO $$ BEGIN
--   CREATE POLICY "skill_usage_read_own" ON skill_usage_events
--     FOR SELECT TO authenticated
--     USING (auth.uid() = user_id);
-- EXCEPTION WHEN duplicate_object THEN NULL;
-- END $$;
--
-- DO $$ BEGIN
--   CREATE POLICY "skill_feedback_read_own" ON skill_feedback
--     FOR SELECT TO authenticated
--     USING (auth.uid() = user_id);
-- EXCEPTION WHEN duplicate_object THEN NULL;
-- END $$;
--
-- DO $$ BEGIN
--   CREATE POLICY "skill_feedback_insert_own" ON skill_feedback
--     FOR INSERT TO authenticated
--     WITH CHECK (auth.uid() = user_id);
-- EXCEPTION WHEN duplicate_object THEN NULL;
-- END $$;
