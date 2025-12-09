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
    session_id TEXT,

    -- Indexes for efficient queries
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_created_at (created_at),
    INDEX idx_feedback_accuracy (accuracy_rating),
    INDEX idx_feedback_session_type (session_type)
);

-- Analytics table for aggregated metrics and events
CREATE TABLE IF NOT EXISTS consciousness_computing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event TEXT NOT NULL,
    user_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    INDEX idx_analytics_event (event),
    INDEX idx_analytics_user_id (user_id),
    INDEX idx_analytics_created_at (created_at)
);

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
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    INDEX idx_session_quality_session_id (session_id),
    INDEX idx_session_quality_user_id (user_id),
    INDEX idx_session_quality_accuracy (user_reported_accuracy)
);

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

-- RLS Policies for security
ALTER TABLE consciousness_computing_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_computing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_session_quality ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON consciousness_computing_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'pioneer_%' OR user_id LIKE 'anonymous%');

-- Allow service role to read all feedback for analytics
CREATE POLICY "Service role can read all feedback" ON consciousness_computing_feedback
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can read their own feedback
CREATE POLICY "Users can read their own feedback" ON consciousness_computing_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

-- Similar policies for analytics
CREATE POLICY "Service role can manage analytics" ON consciousness_computing_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow anonymous analytics inserts" ON consciousness_computing_analytics
    FOR INSERT WITH CHECK (true);

-- Session quality policies
CREATE POLICY "Service role can manage session quality" ON consciousness_session_quality
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create view for consciousness computing insights (aggregated analytics)
CREATE OR REPLACE VIEW consciousness_computing_insights AS
WITH feedback_stats AS (
    SELECT
        COUNT(*) as total_sessions,
        AVG(accuracy_rating) as avg_accuracy,
        MODE() WITHIN GROUP (ORDER BY session_word) as most_common_word,
        COUNT(CASE WHEN accuracy_rating >= 4 THEN 1 END) as high_accuracy_sessions,
        COUNT(CASE WHEN LENGTH(emergent_insight) > 50 THEN 1 END) as detailed_insights
    FROM consciousness_computing_feedback
    WHERE created_at >= NOW() - INTERVAL '30 days'
),
word_cloud AS (
    SELECT
        session_word,
        COUNT(*) as frequency,
        AVG(accuracy_rating) as avg_accuracy_for_word
    FROM consciousness_computing_feedback
    WHERE created_at >= NOW() - INTERVAL '30 days'
        AND session_word IS NOT NULL
    GROUP BY session_word
    ORDER BY frequency DESC
    LIMIT 20
)
SELECT
    fs.*,
    (fs.high_accuracy_sessions::float / fs.total_sessions) as accuracy_rate,
    (fs.detailed_insights::float / fs.total_sessions) as insight_quality_rate,
    json_agg(wc.*) as top_session_words
FROM feedback_stats fs
CROSS JOIN word_cloud wc
GROUP BY fs.total_sessions, fs.avg_accuracy, fs.most_common_word,
         fs.high_accuracy_sessions, fs.detailed_insights;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON consciousness_computing_feedback TO service_role;
GRANT ALL ON consciousness_computing_analytics TO service_role;
GRANT ALL ON consciousness_session_quality TO service_role;
GRANT SELECT ON consciousness_computing_insights TO service_role;

-- Allow anonymous inserts for pioneer feedback
GRANT INSERT ON consciousness_computing_feedback TO anon;
GRANT INSERT ON consciousness_computing_analytics TO anon;