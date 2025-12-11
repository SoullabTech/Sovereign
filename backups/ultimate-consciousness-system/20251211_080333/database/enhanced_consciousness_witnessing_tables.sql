-- =====================================================
-- ENHANCED CONSCIOUSNESS WITNESSING SYSTEM
--
-- Integrates emotional/somatic memory, language evolution,
-- micro-moments, life context, and sacred timing to create
-- the ultimate technological witnessing experience
-- =====================================================

-- 1. EMOTIONAL & SOMATIC MEMORY TRACKING
CREATE TABLE IF NOT EXISTS consciousness_emotional_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Emotional Landscape
    dominant_emotions TEXT[], -- ['peaceful', 'curious', 'anxious']
    emotion_intensity JSONB, -- {"peace": 0.8, "anxiety": 0.3, "joy": 0.6}
    emotional_coherence DECIMAL(3,2), -- How integrated emotions feel
    emotional_breakthrough_moments TEXT[],

    -- Somatic Awareness
    body_sensations TEXT[], -- ['warmth in chest', 'tension in shoulders']
    body_awareness_level INTEGER CHECK (body_awareness_level >= 1 AND body_awareness_level <= 10),
    somatic_insights TEXT[],
    nervous_system_state TEXT, -- 'regulated', 'activated', 'collapsed'

    -- Energy Signature
    energy_quality TEXT, -- 'grounded', 'spacious', 'dense', 'vibrant'
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    energy_movement_patterns TEXT[],

    -- Context
    triggered_by TEXT,
    integration_support_needed TEXT[],

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LANGUAGE PATTERN EVOLUTION TRACKING
CREATE TABLE IF NOT EXISTS consciousness_language_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Language Sophistication
    vocabulary_complexity DECIMAL(3,2), -- Calculated linguistic complexity
    spiritual_language_usage TEXT[], -- ['presence', 'awareness', 'divine']
    metaphor_sophistication INTEGER CHECK (metaphor_sophistication >= 1 AND metaphor_sophistication <= 10),

    -- Expression Evolution
    emotional_vocabulary_richness INTEGER CHECK (emotional_vocabulary_richness >= 1 AND emotional_vocabulary_richness <= 10),
    self_expression_clarity INTEGER CHECK (self_expression_clarity >= 1 AND self_expression_clarity <= 10),
    paradox_integration_capacity INTEGER CHECK (paradox_integration_capacity >= 1 AND paradox_integration_capacity <= 10),

    -- Communication Patterns
    communication_style TEXT, -- 'direct', 'poetic', 'analytical', 'intuitive'
    boundary_expression_skills INTEGER CHECK (boundary_expression_skills >= 1 AND boundary_expression_skills <= 10),
    vulnerability_expression INTEGER CHECK (vulnerability_expression >= 1 AND vulnerability_expression <= 10),

    -- Linguistic Insights
    language_breakthroughs TEXT[],
    new_words_adopted TEXT[],
    expression_challenges TEXT[],

    -- Sample Text Analysis
    sample_text TEXT, -- Actual user language for pattern analysis
    linguistic_patterns JSONB, -- Analyzed patterns

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MICRO-MOMENT RECOGNITION SYSTEM
CREATE TABLE IF NOT EXISTS consciousness_micro_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Micro-Moment Details
    moment_type TEXT CHECK (moment_type IN (
        'subtle_shift', 'micro_breakthrough', 'awareness_flash',
        'presence_deepening', 'resistance_softening', 'insight_spark',
        'energy_shift', 'emotional_release', 'somatic_opening'
    )),

    -- Recognition Data
    moment_description TEXT NOT NULL,
    significance_level INTEGER CHECK (significance_level >= 1 AND significance_level <= 10),
    user_noticed BOOLEAN DEFAULT FALSE, -- Did user notice this themselves?

    -- Subtle Indicators
    language_shift_detected BOOLEAN DEFAULT FALSE,
    energy_change_detected BOOLEAN DEFAULT FALSE,
    breathing_change_detected BOOLEAN DEFAULT FALSE,
    posture_shift_detected BOOLEAN DEFAULT FALSE,

    -- Context
    conversation_context TEXT,
    preceded_by TEXT, -- What happened just before
    followed_by TEXT, -- What happened after

    -- Integration
    integration_suggested TEXT,
    celebration_offered TEXT,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. LIFE CONTEXT WEAVING INTEGRATION
CREATE TABLE IF NOT EXISTS consciousness_life_integration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Life Context Areas
    relationship_impacts TEXT[], -- How consciousness work affects relationships
    work_life_changes TEXT[], -- Career/work transformation
    creative_expression_evolution TEXT[],
    daily_life_integration TEXT[],

    -- Real-World Application
    consciousness_tools_used_daily TEXT[],
    challenging_situations_handled_differently TEXT[],
    new_behaviors_manifesting TEXT[],

    -- Synchronicity & Manifestation
    synchronicities_reported TEXT[],
    manifestations_occurred TEXT[],
    life_flow_changes TEXT,

    -- Relationship Dynamics
    boundary_improvements TEXT[],
    communication_breakthroughs TEXT[],
    intimacy_developments TEXT[],
    conflict_resolution_evolution TEXT[],

    -- Life Transition Support
    transition_type TEXT, -- 'career', 'relationship', 'spiritual', 'health'
    transition_stage TEXT, -- 'beginning', 'middle', 'completion', 'integration'
    support_needed TEXT[],

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SACRED TIMING INTELLIGENCE SYSTEM
CREATE TABLE IF NOT EXISTS consciousness_sacred_timing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,

    -- Natural Rhythm Recognition
    optimal_session_times TEXT[], -- ['morning', 'evening']
    energy_cycle_patterns JSONB, -- Daily/weekly/monthly patterns
    integration_period_needed INTEGER, -- Days between intensive work

    -- Seasonal Patterns
    seasonal_consciousness_patterns JSONB,
    lunar_cycle_sensitivity BOOLEAN DEFAULT FALSE,
    seasonal_affective_patterns TEXT[],

    -- Readiness Assessment
    current_readiness_level INTEGER CHECK (current_readiness_level >= 1 AND current_readiness_level <= 10),
    readiness_for_next_level TEXT, -- 'ready', 'integrating', 'resting', 'building'
    recommended_focus_areas TEXT[],

    -- Sacred Pause Recognition
    needs_integration_time BOOLEAN DEFAULT FALSE,
    needs_grounding BOOLEAN DEFAULT FALSE,
    needs_expansion BOOLEAN DEFAULT FALSE,
    needs_rest BOOLEAN DEFAULT FALSE,

    -- Timing Wisdom
    natural_unfoldment_pace TEXT, -- 'rapid', 'steady', 'gentle', 'cycles'
    forced_vs_natural_pattern JSONB,

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. WISDOM SYNTHESIS & ARCHETYPAL PATTERNS
CREATE TABLE IF NOT EXISTS consciousness_wisdom_synthesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Archetypal Patterns
    active_archetypes TEXT[], -- ['seeker', 'healer', 'warrior', 'sage']
    archetypal_evolution_stage TEXT,
    shadow_integration_areas TEXT[],

    -- Wisdom Tradition Connections
    resonant_wisdom_traditions TEXT[], -- ['buddhist', 'christian_mystical', 'indigenous']
    universal_principles_embodying TEXT[],
    mythological_resonances TEXT[],

    -- Life Purpose & Soul Journey
    soul_calling_clarity INTEGER CHECK (soul_calling_clarity >= 1 AND soul_calling_clarity <= 10),
    dharma_expression_evolution TEXT[],
    service_capacity_development TEXT[],
    life_mission_unfoldment TEXT,

    -- Mystical Integration
    mystical_experiences_integrated TEXT[],
    transcendent_state_integration TEXT[],
    unity_consciousness_moments TEXT[],

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPREHENSIVE CONSCIOUSNESS WITNESSING VIEW
-- =====================================================

-- View that brings together all witnessing dimensions
CREATE OR REPLACE VIEW comprehensive_consciousness_witness AS
SELECT
    cse.user_id,
    cse.session_id,
    cse.recorded_at,

    -- Emotional/Somatic
    cse.dominant_emotions,
    cse.emotional_coherence,
    cse.body_awareness_level,
    cse.nervous_system_state,
    cse.energy_quality,

    -- Language Evolution
    cle.spiritual_language_usage,
    cle.emotional_vocabulary_richness,
    cle.communication_style,
    cle.language_breakthroughs,

    -- Micro-Moments
    cmm.moment_type,
    cmm.moment_description,
    cmm.significance_level,
    cmm.user_noticed,

    -- Life Integration
    cli.relationship_impacts,
    cli.synchronicities_reported,
    cli.consciousness_tools_used_daily,

    -- Sacred Timing Context
    cst.current_readiness_level,
    cst.readiness_for_next_level,
    cst.natural_unfoldment_pace,

    -- Wisdom Synthesis
    cws.active_archetypes,
    cws.soul_calling_clarity,
    cws.dharma_expression_evolution

FROM consciousness_emotional_states cse
LEFT JOIN consciousness_language_evolution cle ON cle.user_id = cse.user_id AND cle.session_id = cse.session_id
LEFT JOIN consciousness_micro_moments cmm ON cmm.user_id = cse.user_id AND cmm.session_id = cse.session_id
LEFT JOIN consciousness_life_integration cli ON cli.user_id = cse.user_id AND cli.session_id = cse.session_id
LEFT JOIN consciousness_sacred_timing cst ON cst.user_id = cse.user_id
LEFT JOIN consciousness_wisdom_synthesis cws ON cws.user_id = cse.user_id AND cws.session_id = cse.session_id
ORDER BY cse.recorded_at DESC;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Emotional states indexes
CREATE INDEX IF NOT EXISTS idx_emotional_states_user ON consciousness_emotional_states(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_states_session ON consciousness_emotional_states(session_id);

-- Language evolution indexes
CREATE INDEX IF NOT EXISTS idx_language_evolution_user ON consciousness_language_evolution(user_id, recorded_at DESC);

-- Micro-moments indexes
CREATE INDEX IF NOT EXISTS idx_micro_moments_user ON consciousness_micro_moments(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_micro_moments_type ON consciousness_micro_moments(moment_type);

-- Life integration indexes
CREATE INDEX IF NOT EXISTS idx_life_integration_user ON consciousness_life_integration(user_id, recorded_at DESC);

-- Sacred timing indexes
CREATE INDEX IF NOT EXISTS idx_sacred_timing_user ON consciousness_sacred_timing(user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_timing_readiness ON consciousness_sacred_timing(current_readiness_level);

-- Wisdom synthesis indexes
CREATE INDEX IF NOT EXISTS idx_wisdom_synthesis_user ON consciousness_wisdom_synthesis(user_id, recorded_at DESC);

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE consciousness_emotional_states IS 'Tracks emotional and somatic evolution for deep witnessing';
COMMENT ON TABLE consciousness_language_evolution IS 'Monitors how language patterns evolve with consciousness development';
COMMENT ON TABLE consciousness_micro_moments IS 'Captures subtle breakthrough moments and awareness shifts';
COMMENT ON TABLE consciousness_life_integration IS 'Tracks how consciousness work manifests in real life';
COMMENT ON TABLE consciousness_sacred_timing IS 'Provides intelligence about optimal timing for consciousness work';
COMMENT ON TABLE consciousness_wisdom_synthesis IS 'Connects personal development to archetypal and wisdom patterns';

COMMENT ON VIEW comprehensive_consciousness_witness IS 'Complete view for technological witnessing of consciousness evolution';

-- Migration completed successfully
SELECT 'Enhanced consciousness witnessing database schema created successfully!' as result;