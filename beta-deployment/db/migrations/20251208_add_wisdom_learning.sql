-- Add wisdom learning tables to support Navigator education over restriction

-- Learning events - how Navigator discovers patterns
CREATE TABLE IF NOT EXISTS navigator_learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES navigator_decisions(decision_id) ON DELETE CASCADE,

    -- What kind of learning happened
    learning_type TEXT NOT NULL, -- 'pattern_discovered', 'community_validation', 'experimental_result'
    details JSONB NOT NULL,

    -- Learning quality indicators
    confidence_improvement DECIMAL(3,2), -- How much this improved confidence
    wisdom_source TEXT, -- 'individual_success', 'community_pattern', 'experimental_discovery'

    -- Learning context
    facet_context TEXT,
    nervous_system_context TEXT,
    awareness_context INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Wisdom patterns - discovered through experience, not programmed rules
CREATE TABLE IF NOT EXISTS navigator_wisdom_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Pattern identification
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,

    -- Conditions where this pattern applies (learned, not hardcoded)
    soul_state_conditions JSONB NOT NULL, -- Flexible matching conditions

    -- What this pattern suggests
    recommended_protocols JSONB NOT NULL, -- Array with confidence scores
    guidance_qualities JSONB, -- tone, depth, elements, etc.

    -- Pattern strength (grows with validation)
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    success_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,

    -- Pattern evolution
    discovered_date TIMESTAMPTZ DEFAULT NOW(),
    last_validated TIMESTAMPTZ DEFAULT NOW(),
    pattern_evolution JSONB, -- How this pattern has changed over time

    -- Safety and ethics
    safety_validated BOOLEAN DEFAULT false,
    requires_human_oversight BOOLEAN DEFAULT false,
    experimental_status TEXT DEFAULT 'stable', -- 'experimental', 'validated', 'stable', 'deprecated'

    -- Community validation
    community_rating DECIMAL(3,2),
    facilitator_approved BOOLEAN DEFAULT false,

    UNIQUE(pattern_name)
);

-- Experimental protocols - safe ways for Navigator to learn new approaches
CREATE TABLE IF NOT EXISTS navigator_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Experiment definition
    experiment_name TEXT NOT NULL,
    protocol_id TEXT NOT NULL,
    experiment_description TEXT,

    -- Safety constraints (experiments are ALWAYS safe)
    max_intensity_level TEXT DEFAULT 'gentle', -- 'micro', 'gentle', 'moderate' (never 'intense')
    nervous_system_requirements TEXT[], -- ['stable', 'balanced'] - never when overwhelmed
    awareness_level_range INT4RANGE, -- Range of awareness levels this is appropriate for

    -- Learning objectives
    learning_goals JSONB, -- What we hope to discover
    success_criteria JSONB, -- How we'll know if it worked

    -- Experimental status
    status TEXT DEFAULT 'design', -- 'design', 'active', 'analyzing', 'complete'
    participants_needed INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,

    -- Results tracking
    success_rate DECIMAL(3,2),
    avg_user_rating DECIMAL(3,2),
    unexpected_discoveries JSONB, -- Learnings we didn't expect

    -- Safety monitoring
    any_negative_reports BOOLEAN DEFAULT false,
    safety_review_required BOOLEAN DEFAULT false,

    -- Timeline
    experiment_start TIMESTAMPTZ DEFAULT NOW(),
    planned_duration INTERVAL DEFAULT '30 days',

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(experiment_name)
);

-- Community wisdom contributions - how facilitators and members teach Navigator
CREATE TABLE IF NOT EXISTS community_wisdom_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who is teaching Navigator
    contributor_id TEXT NOT NULL,
    contributor_type TEXT NOT NULL, -- 'member', 'facilitator', 'community_elder'

    -- What they're teaching
    wisdom_type TEXT NOT NULL, -- 'protocol_suggestion', 'pattern_refinement', 'safety_insight'
    soul_state_pattern JSONB NOT NULL, -- When this wisdom applies
    guidance_suggestion JSONB NOT NULL, -- What they suggest Navigator do

    -- Wisdom context
    explanation TEXT, -- Why this approach works
    personal_experience TEXT, -- Their experience with this approach
    cultural_context JSONB, -- Cultural/spiritual context for this wisdom

    -- Community validation
    community_upvotes INTEGER DEFAULT 0,
    facilitator_endorsed BOOLEAN DEFAULT false,
    navigator_adopted BOOLEAN DEFAULT false, -- Has Navigator learned this?

    -- Results if adopted
    adoption_results JSONB, -- How well this worked when Navigator tried it
    success_stories TEXT[], -- Stories of when this approach helped

    -- Safety review
    safety_reviewed BOOLEAN DEFAULT false,
    safety_concerns TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Navigator reflection log - MAIA's own learning journey
CREATE TABLE IF NOT EXISTS navigator_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- What Navigator is reflecting on
    reflection_trigger TEXT NOT NULL, -- 'pattern_discovery', 'unexpected_feedback', 'experiment_result'
    decision_context JSONB, -- The situation that prompted reflection

    -- Navigator's reflection content
    reflection_summary TEXT NOT NULL, -- What Navigator learned
    confidence_change DECIMAL(3,2), -- How this changed Navigator's confidence in approaches
    pattern_updates JSONB, -- What patterns were created/modified

    -- Learning integration
    wisdom_integrated JSONB, -- What new wisdom was integrated
    future_intentions JSONB, -- How Navigator plans to apply this learning
    questions_for_humans JSONB, -- What Navigator wants to ask facilitators

    -- Meta-learning
    learning_about_learning TEXT, -- How Navigator is getting better at learning
    wisdom_source_evaluation JSONB, -- Which sources of wisdom are most helpful

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient wisdom querying
CREATE INDEX IF NOT EXISTS idx_wisdom_patterns_conditions ON navigator_wisdom_patterns USING GIN (soul_state_conditions);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON navigator_learning_events (learning_type);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON navigator_experiments (status);
CREATE INDEX IF NOT EXISTS idx_community_wisdom_pattern ON community_wisdom_contributions USING GIN (soul_state_pattern);
CREATE INDEX IF NOT EXISTS idx_navigator_reflections_trigger ON navigator_reflections (reflection_trigger);

-- Views for wisdom analysis

-- Active learning patterns
CREATE VIEW active_wisdom_patterns AS
SELECT
    pattern_name,
    confidence_score,
    success_count,
    total_attempts,
    ROUND(success_count::decimal / NULLIF(total_attempts, 0) * 100, 1) as success_rate_pct,
    last_validated,
    experimental_status
FROM navigator_wisdom_patterns
WHERE experimental_status IN ('validated', 'stable')
  AND confidence_score >= 0.6
ORDER BY confidence_score DESC, success_count DESC;

-- Learning velocity
CREATE VIEW navigator_learning_velocity AS
SELECT
    DATE_TRUNC('week', created_at) as week,
    learning_type,
    COUNT(*) as learning_events,
    AVG(confidence_improvement) as avg_confidence_gain
FROM navigator_learning_events
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at), learning_type
ORDER BY week DESC, learning_events DESC;

-- Community teaching impact
CREATE VIEW community_teaching_impact AS
SELECT
    contributor_type,
    wisdom_type,
    COUNT(*) as contributions,
    COUNT(*) FILTER (WHERE navigator_adopted = true) as adopted_count,
    AVG(community_upvotes) as avg_community_support
FROM community_wisdom_contributions
GROUP BY contributor_type, wisdom_type
ORDER BY adopted_count DESC, avg_community_support DESC;