-- Wisdom Memory Schema for Navigator ↔ AIN Synchronization
-- Migration: 20251208_wisdom_memory_schema.sql

-- Elemental Evolution Tracking Table
-- Tracks how a user's elemental patterns change over time
CREATE TABLE IF NOT EXISTS elemental_evolution (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    fire_level DECIMAL(3,2) DEFAULT 0.5,
    water_level DECIMAL(3,2) DEFAULT 0.5,
    earth_level DECIMAL(3,2) DEFAULT 0.5,
    air_level DECIMAL(3,2) DEFAULT 0.5,
    aether_level DECIMAL(3,2) DEFAULT 0.5,
    spiral_phase TEXT,
    primary_archetype TEXT,
    emotional_tone TEXT,
    faith_context TEXT DEFAULT 'universal',
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_fire_level CHECK (fire_level >= 0 AND fire_level <= 1),
    CONSTRAINT valid_water_level CHECK (water_level >= 0 AND water_level <= 1),
    CONSTRAINT valid_earth_level CHECK (earth_level >= 0 AND earth_level <= 1),
    CONSTRAINT valid_air_level CHECK (air_level >= 0 AND air_level <= 1),
    CONSTRAINT valid_aether_level CHECK (aether_level >= 0 AND aether_level <= 1)
);

-- Wisdom Moments Tracking Table
-- Records effectiveness of Navigator decisions for pattern recognition
CREATE TABLE IF NOT EXISTS wisdom_moments (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    navigator_protocol TEXT,
    guidance_tone TEXT,
    depth_level TEXT,
    user_response_sentiment TEXT,
    outcome_quality INTEGER, -- 1-10 effectiveness rating
    ritual_performed TEXT,
    transformation_notes TEXT,
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_outcome_quality CHECK (outcome_quality >= 1 AND outcome_quality <= 10)
);

-- AIN Consciousness Memory Table
-- Stores complete wisdom snapshots for MAIA evolution
CREATE TABLE IF NOT EXISTS ain_consciousness_memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    wisdom_snapshot JSONB NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Elemental Personality Cache Table
-- Pre-computed elemental personality profiles for fast MAIA adaptation
CREATE TABLE IF NOT EXISTS elemental_personalities (
    user_id TEXT PRIMARY KEY,
    fire_affinity DECIMAL(3,2),
    water_affinity DECIMAL(3,2),
    earth_affinity DECIMAL(3,2),
    air_affinity DECIMAL(3,2),
    aether_affinity DECIMAL(3,2),
    core_archetype TEXT,
    preferred_phase TEXT,
    spiritual_context TEXT,
    total_sessions INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- MAIA Adaptation Instructions Cache
-- Pre-computed guidance for MAIA tone and approach
CREATE TABLE IF NOT EXISTS maia_adaptations (
    user_id TEXT PRIMARY KEY,
    adaptation_instructions JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elemental_evolution_user_time ON elemental_evolution(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_elemental_evolution_phase ON elemental_evolution(spiral_phase);
CREATE INDEX IF NOT EXISTS idx_wisdom_moments_user_time ON wisdom_moments(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_wisdom_moments_effectiveness ON wisdom_moments(outcome_quality DESC);
CREATE INDEX IF NOT EXISTS idx_ain_memory_user_time ON ain_consciousness_memory(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ain_memory_session ON ain_consciousness_memory(session_id);

-- JSONB indexes for wisdom snapshot queries
CREATE INDEX IF NOT EXISTS idx_wisdom_snapshot_navigator ON ain_consciousness_memory USING GIN ((wisdom_snapshot->'navigator_insight'));
CREATE INDEX IF NOT EXISTS idx_wisdom_snapshot_consciousness ON ain_consciousness_memory USING GIN ((wisdom_snapshot->'consciousness_context'));

-- Comments for documentation
COMMENT ON TABLE elemental_evolution IS 'Tracks user elemental balance evolution over time for Navigator → MAIA synchronization';
COMMENT ON TABLE wisdom_moments IS 'Records effectiveness of Navigator decisions to identify successful patterns for MAIA adaptation';
COMMENT ON TABLE ain_consciousness_memory IS 'Complete wisdom snapshots connecting Navigator insights with AIN consciousness ecosystem';
COMMENT ON TABLE elemental_personalities IS 'Pre-computed elemental personality profiles for fast MAIA response adaptation';
COMMENT ON TABLE maia_adaptations IS 'Cached MAIA adaptation instructions based on accumulated wisdom patterns';

COMMENT ON COLUMN elemental_evolution.fire_level IS 'Fire element affinity (0.0-1.0): passion, creativity, transformation';
COMMENT ON COLUMN elemental_evolution.water_level IS 'Water element affinity (0.0-1.0): emotion, healing, intuition';
COMMENT ON COLUMN elemental_evolution.earth_level IS 'Earth element affinity (0.0-1.0): grounding, structure, embodiment';
COMMENT ON COLUMN elemental_evolution.air_level IS 'Air element affinity (0.0-1.0): clarity, intellect, communication';
COMMENT ON COLUMN elemental_evolution.aether_level IS 'Aether element affinity (0.0-1.0): unity, transcendence, sacred connection';

-- View for quick user wisdom summary
CREATE OR REPLACE VIEW user_wisdom_summary AS
SELECT
    ep.user_id,
    ep.fire_affinity,
    ep.water_affinity,
    ep.earth_affinity,
    ep.air_affinity,
    ep.aether_affinity,
    ep.core_archetype,
    ep.preferred_phase,
    ep.spiritual_context,
    ep.total_sessions,
    COALESCE(wm.avg_effectiveness, 0) as average_wisdom_effectiveness,
    COALESCE(wm.wisdom_sessions, 0) as rated_sessions,
    GREATEST(ep.fire_affinity, ep.water_affinity, ep.earth_affinity, ep.air_affinity, ep.aether_affinity) as dominant_element_strength,
    CASE
        WHEN ep.fire_affinity = GREATEST(ep.fire_affinity, ep.water_affinity, ep.earth_affinity, ep.air_affinity, ep.aether_affinity) THEN 'fire'
        WHEN ep.water_affinity = GREATEST(ep.fire_affinity, ep.water_affinity, ep.earth_affinity, ep.air_affinity, ep.aether_affinity) THEN 'water'
        WHEN ep.earth_affinity = GREATEST(ep.fire_affinity, ep.water_affinity, ep.earth_affinity, ep.air_affinity, ep.aether_affinity) THEN 'earth'
        WHEN ep.air_affinity = GREATEST(ep.fire_affinity, ep.water_affinity, ep.earth_affinity, ep.air_affinity, ep.aether_affinity) THEN 'air'
        ELSE 'aether'
    END as dominant_element,
    ep.last_updated as personality_last_updated
FROM elemental_personalities ep
LEFT JOIN (
    SELECT
        user_id,
        AVG(outcome_quality) as avg_effectiveness,
        COUNT(*) as wisdom_sessions
    FROM wisdom_moments
    WHERE outcome_quality IS NOT NULL
    GROUP BY user_id
) wm ON ep.user_id = wm.user_id;