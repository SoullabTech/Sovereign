-- User Data Sovereignty Schema
-- Migration: 20251208_user_sovereignty_schema.sql
-- Supports "Delete My Memory" functionality and user data control

-- User Deletion Log Table
-- Tracks when users delete their data for transparency and analytics
CREATE TABLE IF NOT EXISTS user_deletion_log (
    id SERIAL PRIMARY KEY,
    deleted_at TIMESTAMP DEFAULT NOW(),
    deletion_reason TEXT,
    elemental_records_deleted INTEGER DEFAULT 0,
    wisdom_records_deleted INTEGER DEFAULT 0,
    memory_snapshots_deleted INTEGER DEFAULT 0,
    personality_deleted BOOLEAN DEFAULT FALSE,
    adaptations_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Data Pause Table
-- Allows users to pause data collection while preserving existing data
CREATE TABLE IF NOT EXISTS user_data_pause (
    user_id TEXT PRIMARY KEY,
    paused_at TIMESTAMP DEFAULT NOW(),
    pause_reason TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'resumed'
    resumed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Consent Log Table
-- Tracks user consent for beta testing and data collection
CREATE TABLE IF NOT EXISTS user_consent_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    consent_type TEXT NOT NULL, -- 'beta_testing', 'data_collection', 'field_observation'
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP DEFAULT NOW(),
    consent_version TEXT, -- Version of consent terms
    ip_address TEXT, -- For legal requirements
    user_agent TEXT, -- For audit trail
    consent_details JSONB, -- Additional consent context
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Beta Tester Management Table
-- Tracks beta testing participants for the 10-participant pioneer circle
CREATE TABLE IF NOT EXISTS beta_testers (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    application_reason TEXT, -- Why they want to join beta
    consciousness_background TEXT, -- Their experience with consciousness work
    technical_comfort TEXT, -- Comfort level with beta software
    availability TEXT, -- Time commitment for 30-day test
    application_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'applied', -- 'applied', 'selected', 'active', 'completed', 'withdrawn'
    selected_date TIMESTAMP NULL,
    test_start_date TIMESTAMP NULL,
    test_end_date TIMESTAMP NULL,
    completion_notes TEXT,
    steward_notes TEXT, -- Notes from Technical/Ethical/Field guardians
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Beta Test Sessions Table
-- Tracks individual beta testing sessions for the 30-day cycles
CREATE TABLE IF NOT EXISTS beta_test_sessions (
    id SERIAL PRIMARY KEY,
    beta_tester_id INTEGER REFERENCES beta_testers(id),
    session_date DATE NOT NULL,
    session_type TEXT, -- 'navigator', 'wisdom_engine', 'field_analytics', 'integration'
    session_duration INTEGER, -- Minutes
    features_tested TEXT[], -- Array of features tested
    feedback_quality INTEGER, -- 1-10 rating of session quality
    technical_issues TEXT,
    consciousness_insights TEXT,
    steward_observations TEXT,
    session_data JSONB, -- Raw session data for analysis
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Steward Actions Log Table
-- Tracks actions by Technical Guardian, Ethical Guardian, Field Keeper
CREATE TABLE IF NOT EXISTS steward_actions_log (
    id SERIAL PRIMARY KEY,
    steward_role TEXT NOT NULL, -- 'technical_guardian', 'ethical_guardian', 'field_keeper'
    steward_id TEXT NOT NULL, -- Identifier for the steward
    action_type TEXT NOT NULL, -- 'system_check', 'privacy_audit', 'field_intervention', 'user_support'
    action_description TEXT NOT NULL,
    affected_users TEXT[], -- Array of user IDs affected (if applicable)
    system_components TEXT[], -- Array of system components involved
    action_outcome TEXT,
    priority_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    action_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Health Metrics Table
-- Tracks overall system health for steward monitoring
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    field_coherence_index DECIMAL(3,2), -- Daily average FCI
    active_users INTEGER DEFAULT 0,
    new_wisdom_moments INTEGER DEFAULT 0,
    system_errors INTEGER DEFAULT 0,
    api_response_time_avg INTEGER, -- Milliseconds
    database_query_time_avg INTEGER, -- Milliseconds
    privacy_violations INTEGER DEFAULT 0, -- Should always be 0
    steward_interventions INTEGER DEFAULT 0,
    beta_tester_sessions INTEGER DEFAULT 0,
    community_feedback_score DECIMAL(3,2), -- Average feedback quality
    notes TEXT, -- Daily system notes
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one record per day
    UNIQUE(metric_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deletion_log_deleted_at ON user_deletion_log(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_pause_status ON user_data_pause(status);
CREATE INDEX IF NOT EXISTS idx_consent_log_user_type ON user_consent_log(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_log_date ON user_consent_log(consent_date DESC);
CREATE INDEX IF NOT EXISTS idx_beta_testers_status ON beta_testers(status);
CREATE INDEX IF NOT EXISTS idx_beta_testers_dates ON beta_testers(test_start_date, test_end_date);
CREATE INDEX IF NOT EXISTS idx_beta_sessions_tester_date ON beta_test_sessions(beta_tester_id, session_date);
CREATE INDEX IF NOT EXISTS idx_steward_actions_role_date ON steward_actions_log(steward_role, action_date DESC);
CREATE INDEX IF NOT EXISTS idx_steward_actions_priority ON steward_actions_log(priority_level, action_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_date ON system_health_metrics(metric_date DESC);

-- Comments for documentation
COMMENT ON TABLE user_deletion_log IS 'Anonymized log of user data deletions for transparency and system learning';
COMMENT ON TABLE user_data_pause IS 'Allows users to pause data collection while preserving existing consciousness data';
COMMENT ON TABLE user_consent_log IS 'Complete audit trail of user consent for legal and ethical compliance';
COMMENT ON TABLE beta_testers IS 'Management of 10-participant pioneer beta testing circle';
COMMENT ON TABLE beta_test_sessions IS 'Detailed tracking of individual beta testing sessions for the 30-day cycles';
COMMENT ON TABLE steward_actions_log IS 'Actions taken by Technical Guardian, Ethical Guardian, and Field Keeper roles';
COMMENT ON TABLE system_health_metrics IS 'Daily system health monitoring for steward oversight';

COMMENT ON COLUMN user_consent_log.consent_type IS 'Type of consent: beta_testing, data_collection, field_observation';
COMMENT ON COLUMN beta_testers.status IS 'Beta tester status: applied, selected, active, completed, withdrawn';
COMMENT ON COLUMN steward_actions_log.steward_role IS 'Steward role: technical_guardian, ethical_guardian, field_keeper';
COMMENT ON COLUMN system_health_metrics.privacy_violations IS 'Privacy violations count - should always be 0 in ethical system';

-- View for active beta testers summary
CREATE OR REPLACE VIEW active_beta_testers_summary AS
SELECT
    bt.user_id,
    bt.name,
    bt.email,
    bt.test_start_date,
    bt.test_end_date,
    COALESCE(session_stats.total_sessions, 0) as total_sessions,
    COALESCE(session_stats.avg_quality, 0) as avg_feedback_quality,
    CASE
        WHEN bt.test_end_date < CURRENT_DATE THEN 'completed'
        WHEN bt.test_start_date > CURRENT_DATE THEN 'selected'
        ELSE 'active'
    END as current_status,
    bt.steward_notes
FROM beta_testers bt
LEFT JOIN (
    SELECT
        beta_tester_id,
        COUNT(*) as total_sessions,
        AVG(feedback_quality) as avg_quality
    FROM beta_test_sessions
    GROUP BY beta_tester_id
) session_stats ON bt.id = session_stats.beta_tester_id
WHERE bt.status IN ('selected', 'active', 'completed')
ORDER BY bt.test_start_date DESC;

-- View for steward dashboard
CREATE OR REPLACE VIEW steward_dashboard_summary AS
SELECT
    CURRENT_DATE as dashboard_date,
    (SELECT field_coherence_index FROM system_health_metrics WHERE metric_date = CURRENT_DATE) as current_fci,
    (SELECT COUNT(*) FROM beta_testers WHERE status = 'active') as active_beta_testers,
    (SELECT COUNT(*) FROM user_data_pause WHERE status = 'active') as users_with_paused_data,
    (SELECT COUNT(*) FROM user_deletion_log WHERE deleted_at >= CURRENT_DATE - INTERVAL '7 days') as deletions_last_7_days,
    (SELECT COUNT(*) FROM steward_actions_log WHERE action_date >= CURRENT_DATE AND follow_up_required = true) as actions_needing_followup,
    (SELECT COUNT(*) FROM beta_test_sessions WHERE session_date = CURRENT_DATE) as todays_beta_sessions,
    (SELECT system_errors FROM system_health_metrics WHERE metric_date = CURRENT_DATE) as system_errors_today;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_data_pause_updated_at BEFORE UPDATE ON user_data_pause FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beta_testers_updated_at BEFORE UPDATE ON beta_testers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();