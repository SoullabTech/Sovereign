-- TTS Sovereignty Monitor Tables
-- Tracks open-source TTS model quality for sovereignty migration decisions

-- Store sovereignty check reports
CREATE TABLE IF NOT EXISTS tts_sovereignty_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_data JSONB NOT NULL,
    sovereignty_status VARCHAR(50) NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying latest reports
CREATE INDEX IF NOT EXISTS idx_tts_sovereignty_reports_created
ON tts_sovereignty_reports(created_at DESC);

-- Store quality benchmarks for individual models
CREATE TABLE IF NOT EXISTS tts_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(100) NOT NULL,
    quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    quality_vs_openai INTEGER NOT NULL CHECK (quality_vs_openai >= 0 AND quality_vs_openai <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying benchmarks by model
CREATE INDEX IF NOT EXISTS idx_tts_benchmarks_model
ON tts_benchmarks(model_id, created_at DESC);

-- System notifications table (if not exists)
-- Used for in-app notifications about sovereignty status
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    variant VARCHAR(50) DEFAULT 'info',
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_system_notifications_unread
ON system_notifications(read, created_at DESC) WHERE read = FALSE;

-- Insert initial benchmark estimates based on current research
INSERT INTO tts_benchmarks (model_id, quality_score, quality_vs_openai, notes) VALUES
    ('sesame-csm', 65, 65, 'Open-source release quality significantly lower than demo. Slurring issues reported.'),
    ('f5-tts', 78, 78, 'Good quality with voice cloning. Current best open-source option.'),
    ('orpheus-tts', 75, 75, 'New 3B model focused on emotional depth. Promising but needs more testing.'),
    ('piper', 60, 60, 'Fast and stable but noticeably synthetic compared to neural TTS.'),
    ('kokoro', 72, 72, 'Impressive quality for 82M parameters. Good quality-to-size ratio.'),
    ('parler-tts', 70, 70, 'Meta-backed with style control. Decent but not top tier.')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE tts_sovereignty_reports IS 'Weekly sovereignty check reports tracking open-source TTS model viability';
COMMENT ON TABLE tts_benchmarks IS 'Quality benchmarks comparing TTS models to OpenAI baseline';
COMMENT ON TABLE system_notifications IS 'In-app notifications including sovereignty alerts';
