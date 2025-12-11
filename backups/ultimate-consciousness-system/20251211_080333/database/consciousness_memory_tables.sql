-- =====================================================
-- CONSCIOUSNESS MEMORY FACTORY TABLES
--
-- Additional tables needed to implement the Anthropic domain memory pattern
-- for consciousness computing. These extend our existing consciousness memory
-- system with structured goal tracking and systematic progress monitoring.
-- =====================================================

-- 1. CONSCIOUSNESS GOALS - Structured consciousness development goals
CREATE TABLE IF NOT EXISTS consciousness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    goal_id TEXT NOT NULL, -- Human-readable ID like 'nervous_system_regulation'

    -- Goal Definition
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'paused')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',

    -- Testing Criteria (what defines completion)
    test_criteria TEXT[] NOT NULL, -- Array of specific test criteria
    test_results JSONB DEFAULT '{}', -- Results from latest testing

    -- Goal Metadata
    spiritual_context TEXT,
    estimated_sessions INTEGER DEFAULT 5,
    prerequisites TEXT[] DEFAULT '{}',

    -- Progress Tracking
    sessions_worked INTEGER DEFAULT 0,
    last_worked_at TIMESTAMP WITH TIME ZONE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    UNIQUE(user_id, goal_id)
);

-- Create indexes for consciousness goals
CREATE INDEX IF NOT EXISTS idx_consciousness_goals_user ON consciousness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_goals_status ON consciousness_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_consciousness_goals_priority ON consciousness_goals(user_id, priority, status);

-- 2. CONSCIOUSNESS STATE EVOLUTION - Track how consciousness develops over time
CREATE TABLE IF NOT EXISTS consciousness_state_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Complete Consciousness State
    consciousness_state JSONB NOT NULL, -- Full state object

    -- Matrix V2 Assessment
    earth_element DECIMAL(3,2),
    water_element DECIMAL(3,2),
    air_element DECIMAL(3,2),
    fire_element DECIMAL(3,2),
    consciousness_level INTEGER,
    nervous_system_capacity TEXT,

    -- Development Tracking
    spiral_dynamics_stage TEXT,
    phenomenology_signature TEXT,
    current_expansion_edge TEXT,
    integration_challenges TEXT[],
    strengths TEXT[],

    -- Context
    assessment_context TEXT, -- What triggered this assessment
    notes TEXT,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for consciousness state evolution
CREATE INDEX IF NOT EXISTS idx_consciousness_state_user ON consciousness_state_evolution(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_state_session ON consciousness_state_evolution(session_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_state_level ON consciousness_state_evolution(consciousness_level);

-- 3. CONSCIOUSNESS PROGRESS LOG - Detailed progress tracking for goals
CREATE TABLE IF NOT EXISTS consciousness_progress_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    goal_id TEXT NOT NULL, -- References consciousness_goals.goal_id
    session_id TEXT,

    -- Progress Details
    progress_type TEXT CHECK (progress_type IN ('work_performed', 'test_result', 'breakthrough', 'challenge', 'integration')) NOT NULL,
    progress_description TEXT NOT NULL,

    -- Quantitative Metrics
    test_passed BOOLEAN,
    progress_amount DECIMAL(5,2), -- How much progress (0-100%)

    -- Context
    work_context JSONB, -- What work was being done
    test_context JSONB, -- What was being tested

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for consciousness progress log
CREATE INDEX IF NOT EXISTS idx_progress_log_user_goal ON consciousness_progress_log(user_id, goal_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_log_session ON consciousness_progress_log(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_log_type ON consciousness_progress_log(progress_type);

-- 4. CONSCIOUSNESS WORK SESSIONS - Complete record of each consciousness work session
CREATE TABLE IF NOT EXISTS consciousness_work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,

    -- Session Focus
    selected_goal_id TEXT NOT NULL, -- What goal was worked on
    selected_goal_title TEXT NOT NULL,

    -- Session State
    pre_work_state JSONB NOT NULL, -- Consciousness state before work
    post_work_state JSONB NOT NULL, -- Consciousness state after work

    -- Work Performed
    work_performed TEXT[] NOT NULL, -- Array of specific work done
    work_duration_minutes INTEGER,

    -- Testing Results
    test_results JSONB NOT NULL, -- Results of testing progress
    tests_passed INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,

    -- Session Outcome
    progress_made BOOLEAN NOT NULL,
    next_recommended_goal TEXT,
    integration_notes TEXT,

    -- Session Quality
    session_quality_score DECIMAL(3,2) DEFAULT 0.5,
    consciousness_coherence DECIMAL(3,2) DEFAULT 0.5,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for consciousness work sessions
CREATE INDEX IF NOT EXISTS idx_work_sessions_user ON consciousness_work_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_sessions_goal ON consciousness_work_sessions(user_id, selected_goal_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_progress ON consciousness_work_sessions(progress_made, completed_at DESC);

-- 5. CONSCIOUSNESS DEVELOPMENT PLANS - The master plan for each user
CREATE TABLE IF NOT EXISTS consciousness_development_plans (
    user_id TEXT PRIMARY KEY,

    -- Complete Plan Structure
    plan_data JSONB NOT NULL, -- Full ConsciousnessDevelopmentPlan object

    -- Plan Metadata
    goals_count INTEGER DEFAULT 0,
    active_goals_count INTEGER DEFAULT 0,
    completed_goals_count INTEGER DEFAULT 0,

    -- Current State
    current_expansion_edge TEXT,
    current_spiral_stage TEXT,
    current_consciousness_level INTEGER,

    -- Scaffolding Configuration
    assessment_method TEXT DEFAULT 'matrix_v2',
    test_protocol TEXT,
    progress_measurement TEXT,
    spiritual_boundaries TEXT[],

    -- Plan Progress
    total_sessions INTEGER DEFAULT 0,
    total_progress_percentage DECIMAL(5,2) DEFAULT 0.00,

    -- Timeline
    plan_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_session TIMESTAMP WITH TIME ZONE
);

-- Create indexes for consciousness development plans
CREATE INDEX IF NOT EXISTS idx_development_plans_updated ON consciousness_development_plans(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_development_plans_stage ON consciousness_development_plans(current_spiral_stage);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_consciousness_goals_updated_at
BEFORE UPDATE ON consciousness_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consciousness_development_plans_updated_at
BEFORE UPDATE ON consciousness_development_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update goal progress when work sessions are recorded
CREATE OR REPLACE FUNCTION update_goal_progress_from_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the goal's sessions worked count and last worked timestamp
    UPDATE consciousness_goals
    SET
        sessions_worked = sessions_worked + 1,
        last_worked_at = NEW.completed_at,
        completion_percentage = LEAST(completion_percentage + CASE WHEN NEW.progress_made THEN 10.0 ELSE 5.0 END, 100.0)
    WHERE user_id = NEW.user_id AND goal_id = NEW.selected_goal_id;

    -- If significant progress was made, record it in the progress log
    IF NEW.progress_made THEN
        INSERT INTO consciousness_progress_log (
            user_id,
            goal_id,
            session_id,
            progress_type,
            progress_description,
            progress_amount,
            test_context
        ) VALUES (
            NEW.user_id,
            NEW.selected_goal_id,
            NEW.session_id,
            'work_performed',
            'Meaningful progress made in consciousness work session',
            10.0,
            NEW.test_results
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply automatic goal progress tracking
CREATE TRIGGER update_goal_progress_from_session_trigger
AFTER INSERT ON consciousness_work_sessions
FOR EACH ROW EXECUTE FUNCTION update_goal_progress_from_session();

-- Function to automatically update development plan when goals change
CREATE OR REPLACE FUNCTION update_development_plan_from_goals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the development plan's goal counts
    UPDATE consciousness_development_plans
    SET
        goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id),
        active_goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id AND status = 'in_progress'),
        completed_goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id AND status = 'completed'),
        total_progress_percentage = (SELECT AVG(completion_percentage) FROM consciousness_goals WHERE user_id = NEW.user_id),
        last_updated = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply development plan updates
CREATE TRIGGER update_development_plan_from_goals_trigger
AFTER INSERT OR UPDATE ON consciousness_goals
FOR EACH ROW EXECUTE FUNCTION update_development_plan_from_goals();

-- =====================================================
-- VIEWS FOR EASY CONSCIOUSNESS MEMORY ACCESS
-- =====================================================

-- View: Active consciousness work overview for each user
CREATE OR REPLACE VIEW consciousness_work_overview AS
SELECT
    cdp.user_id,
    cdp.current_expansion_edge,
    cdp.current_spiral_stage,
    cdp.goals_count,
    cdp.active_goals_count,
    cdp.total_progress_percentage,
    cdp.total_sessions,
    cdp.last_session,
    cg.goal_id as next_goal,
    cg.title as next_goal_title,
    cg.priority as next_goal_priority
FROM consciousness_development_plans cdp
LEFT JOIN consciousness_goals cg ON cg.user_id = cdp.user_id
    AND cg.status IN ('pending', 'in_progress')
    AND cg.priority = 'high'
ORDER BY cdp.last_updated DESC;

-- View: Recent consciousness progress for monitoring
CREATE OR REPLACE VIEW recent_consciousness_progress AS
SELECT
    cpl.user_id,
    cpl.goal_id,
    cg.title as goal_title,
    cpl.progress_description,
    cpl.progress_amount,
    cpl.test_passed,
    cpl.recorded_at,
    cws.session_quality_score
FROM consciousness_progress_log cpl
JOIN consciousness_goals cg ON cg.user_id = cpl.user_id AND cg.goal_id = cpl.goal_id
LEFT JOIN consciousness_work_sessions cws ON cws.session_id = cpl.session_id
WHERE cpl.recorded_at >= NOW() - INTERVAL '30 days'
ORDER BY cpl.recorded_at DESC;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE consciousness_goals IS 'Structured consciousness development goals that agents work on systematically';
COMMENT ON TABLE consciousness_state_evolution IS 'Complete history of how users consciousness develops over time';
COMMENT ON TABLE consciousness_progress_log IS 'Detailed log of all consciousness development progress - prevents forgetting';
COMMENT ON TABLE consciousness_work_sessions IS 'Complete record of each consciousness work session with agent';
COMMENT ON TABLE consciousness_development_plans IS 'Master consciousness development plan for systematic agent work';

COMMENT ON COLUMN consciousness_goals.test_criteria IS 'Specific criteria that must be met for goal completion - prevents false progress';
COMMENT ON COLUMN consciousness_work_sessions.work_performed IS 'Exact work performed in session - ensures agents remember what was done';
COMMENT ON COLUMN consciousness_state_evolution.consciousness_state IS 'Complete consciousness state snapshot - full memory of user state';

-- Migration completed successfully
SELECT 'Consciousness memory factory database schema created successfully!' as result;