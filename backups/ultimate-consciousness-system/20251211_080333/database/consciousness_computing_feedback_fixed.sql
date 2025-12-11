-- Consciousness Computing Feedback System
-- Tables for collecting and analyzing pioneer session feedback

-- Main feedback table for consciousness computing sessions
CREATE TABLE IF NOT EXISTS consciousness_computing_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'consciousness_computing_pioneer',

    -- Core feedback metrics
    accuracy_rating INTEGER NOT NULL CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    emergent_insight TEXT NOT NULL,
    session_word TEXT NOT NULL,
    consciousness_level INTEGER CHECK (consciousness_level >= 1 AND consciousness_level <= 10),
    unexpected_elements TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Metadata for analysis
    metadata JSONB DEFAULT '{}',

    -- Analytics helper fields
    session_duration_minutes INTEGER,
    message_count INTEGER,
    session_id TEXT
);

-- Create indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON consciousness_computing_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON consciousness_computing_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_accuracy ON consciousness_computing_feedback(accuracy_rating);
CREATE INDEX IF NOT EXISTS idx_feedback_session_type ON consciousness_computing_feedback(session_type);

-- Analytics table for aggregated metrics and events
CREATE TABLE IF NOT EXISTS consciousness_computing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event TEXT NOT NULL,
    user_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_analytics_event ON consciousness_computing_analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON consciousness_computing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON consciousness_computing_analytics(created_at);

-- Session quality metrics for tracking consciousness detection accuracy
CREATE TABLE IF NOT EXISTS consciousness_session_quality (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,

    -- MAIA's consciousness assessment
    detected_consciousness_level INTEGER CHECK (detected_consciousness_level >= 1 AND detected_consciousness_level <= 10),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    assessment_factors JSONB DEFAULT '{}',

    -- User's actual experience (from feedback)
    user_reported_accuracy INTEGER CHECK (user_reported_accuracy >= 1 AND user_reported_accuracy <= 5),
    emergent_insights_quality TEXT,
    session_effectiveness JSONB DEFAULT '{}',

    -- Session metadata
    session_duration_minutes INTEGER,
    message_count INTEGER,
    interaction_patterns JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for session quality table
CREATE INDEX IF NOT EXISTS idx_session_quality_session_id ON consciousness_session_quality(session_id);
CREATE INDEX IF NOT EXISTS idx_session_quality_user_id ON consciousness_session_quality(user_id);
CREATE INDEX IF NOT EXISTS idx_session_quality_accuracy ON consciousness_session_quality(user_reported_accuracy);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON consciousness_computing_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_quality_updated_at BEFORE UPDATE ON consciousness_session_quality
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Consciousness computing feedback database schema created successfully!' as result;