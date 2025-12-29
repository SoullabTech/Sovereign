-- MAIA Clinical Platform Database Schema
-- Production-ready PostgreSQL schema for multi-tier clinical platform
-- Includes HIPAA compliance, encryption, and audit logging

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search

-- ================================================
-- CORE USER MANAGEMENT TABLES
-- ================================================

-- Users table with multi-tier support
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT, -- Encrypted with bcrypt
    full_name VARCHAR(255),
    phone VARCHAR(20),

    -- Account status
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    -- Compliance
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    marketing_opt_in BOOLEAN DEFAULT FALSE
);

-- User roles for multi-tier access
CREATE TABLE user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN (
        'consumer',
        'licensed_professional',
        'ipp_practitioner',
        'emdr_therapist',
        'dbt_specialist',
        'ifs_therapist',
        'clinical_supervisor',
        'research_participant',
        'admin'
    )),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(user_id),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ================================================
-- PROFESSIONAL CREDENTIALS
-- ================================================

-- Professional credentials and licenses
CREATE TABLE professional_credentials (
    credential_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Credential details
    credential_type VARCHAR(50) NOT NULL CHECK (credential_type IN ('license', 'certification', 'insurance')),
    license_number VARCHAR(100) NOT NULL,
    licensing_board VARCHAR(255),
    state VARCHAR(50),
    profession VARCHAR(100),

    -- Verification
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verification_id VARCHAR(100),
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(user_id),

    -- Validity
    issue_date DATE,
    expiration_date DATE,

    -- Documents (encrypted)
    document_urls TEXT[], -- Array of encrypted document URLs

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SUBSCRIPTION MANAGEMENT
-- ================================================

-- Subscription tiers
CREATE TABLE subscription_tiers (
    tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_name VARCHAR(50) UNIQUE NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    trial_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    features JSONB, -- JSON array of features
    usage_limits JSONB, -- JSON object with limits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(tier_id),

    -- Subscription status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'paused', 'cancelled', 'past_due', 'expired')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually')),

    -- Pricing
    monthly_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL, -- After discounts
    discount_percent INTEGER DEFAULT 0,
    promo_code VARCHAR(50),

    -- Billing dates
    start_date DATE NOT NULL,
    trial_end_date DATE,
    next_billing_date DATE,
    cancelled_at TIMESTAMP,
    paused_at TIMESTAMP,

    -- Payment method reference
    stripe_subscription_id VARCHAR(255), -- For Stripe integration

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- CLINICAL FRAMEWORKS
-- ================================================

-- Clinical framework registry
CREATE TABLE clinical_frameworks (
    framework_id VARCHAR(100) PRIMARY KEY,
    framework_name VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description TEXT,

    -- Requirements
    certification_requirements JSONB,
    license_requirements JSONB,
    supervision_requirements JSONB,
    training_requirements JSONB,

    -- Configuration
    features JSONB,
    assessment_tools JSONB,
    intervention_library JSONB,
    protocol_phases JSONB,
    api_endpoints JSONB,

    -- Subscription config
    monthly_fee DECIMAL(10,2),
    setup_fee DECIMAL(10,2),
    trial_period INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'development')),
    published_date DATE,
    publisher VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User framework access
CREATE TABLE user_framework_access (
    access_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    framework_id VARCHAR(100) NOT NULL REFERENCES clinical_frameworks(framework_id),
    subscription_id UUID REFERENCES user_subscriptions(subscription_id),

    -- Access details
    access_level VARCHAR(20) DEFAULT 'basic' CHECK (access_level IN ('basic', 'standard', 'advanced', 'supervisor')),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trial')),

    -- Certification
    certification_required BOOLEAN DEFAULT FALSE,
    certification_verified BOOLEAN DEFAULT FALSE,
    certification_body VARCHAR(255),
    certification_number VARCHAR(100),
    certification_expiry DATE,

    -- Access control
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ================================================
-- CLINICAL DATA (HIPAA COMPLIANT)
-- ================================================

-- Client data (encrypted)
CREATE TABLE clinical_clients (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID NOT NULL REFERENCES users(user_id),

    -- Encrypted client information
    encrypted_name TEXT, -- AES-256 encrypted
    encrypted_dob TEXT,  -- AES-256 encrypted
    encrypted_contact TEXT, -- AES-256 encrypted

    -- Client metadata (non-identifying)
    age_range VARCHAR(20), -- E.g., "25-30"
    gender VARCHAR(20),
    primary_concerns TEXT,

    -- Treatment tracking
    start_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'transferred')),

    -- Consent
    consent_obtained BOOLEAN DEFAULT FALSE,
    consent_date DATE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinical assessments
CREATE TABLE clinical_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clinical_clients(client_id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(user_id),
    framework_id VARCHAR(100) NOT NULL REFERENCES clinical_frameworks(framework_id),

    -- Assessment details
    assessment_type VARCHAR(100) NOT NULL,
    responses JSONB, -- Encrypted responses
    scores JSONB, -- Assessment scores and interpretations
    interpretation TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
    completed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment plans
CREATE TABLE treatment_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clinical_clients(client_id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(user_id),
    framework_id VARCHAR(100) NOT NULL REFERENCES clinical_frameworks(framework_id),
    assessment_id UUID REFERENCES clinical_assessments(assessment_id),

    -- Plan details
    treatment_goals JSONB,
    intervention_plan JSONB,
    protocol_phases JSONB,
    estimated_duration VARCHAR(50),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'on_hold', 'completed')),
    approved_by UUID REFERENCES users(user_id), -- Supervisor approval
    approved_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session notes
CREATE TABLE session_notes (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clinical_clients(client_id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(user_id),
    treatment_plan_id UUID REFERENCES treatment_plans(plan_id),

    -- Session details
    session_date DATE NOT NULL,
    session_duration INTEGER, -- Minutes
    session_type VARCHAR(50),
    interventions_used JSONB,

    -- Notes (encrypted)
    encrypted_notes TEXT, -- AES-256 encrypted session notes
    progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 10),

    -- AI assistance used
    ai_assistance_used BOOLEAN DEFAULT FALSE,
    ai_prompts_used JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'reviewed')),
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- OUTCOME TRACKING
-- ================================================

-- Outcome measurements
CREATE TABLE outcome_measurements (
    measurement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clinical_clients(client_id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(user_id),

    -- Measurement details
    measurement_type VARCHAR(100), -- E.g., "PHQ-9", "GAD-7"
    baseline_score DECIMAL(10,2),
    current_score DECIMAL(10,2),
    improvement_percentage DECIMAL(5,2),

    -- Context
    measurement_date DATE,
    session_id UUID REFERENCES session_notes(session_id),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SUPERVISION AND COMPLIANCE
-- ================================================

-- Supervision relationships
CREATE TABLE supervision_relationships (
    supervision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisee_id UUID NOT NULL REFERENCES users(user_id),
    supervisor_id UUID NOT NULL REFERENCES users(user_id),
    framework_id VARCHAR(100) REFERENCES clinical_frameworks(framework_id),

    -- Relationship details
    supervision_type VARCHAR(50), -- E.g., "clinical", "administrative"
    frequency VARCHAR(50), -- E.g., "weekly", "monthly"
    start_date DATE,
    end_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supervision sessions
CREATE TABLE supervision_sessions (
    supervision_session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervision_id UUID NOT NULL REFERENCES supervision_relationships(supervision_id),

    -- Session details
    session_date DATE NOT NULL,
    duration INTEGER, -- Minutes
    topics_discussed JSONB,
    action_items JSONB,

    -- Notes (encrypted if needed)
    session_notes TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- AUDIT AND COMPLIANCE
-- ================================================

-- Comprehensive audit log for HIPAA compliance
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),

    -- Action details
    action_type VARCHAR(50) NOT NULL, -- E.g., "data_access", "login", "export"
    resource_type VARCHAR(50), -- E.g., "client_data", "assessment"
    resource_id UUID,

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),

    -- Results
    action_result VARCHAR(20), -- "success", "failure", "denied"
    error_message TEXT,

    -- Compliance
    phi_accessed BOOLEAN DEFAULT FALSE, -- Protected Health Information accessed
    consent_verified BOOLEAN DEFAULT TRUE,

    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data access tracking for HIPAA
CREATE TABLE data_access_logs (
    access_log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    client_id UUID REFERENCES clinical_clients(client_id),

    -- Access details
    data_type VARCHAR(100), -- E.g., "assessment", "session_notes"
    access_type VARCHAR(20), -- "read", "write", "delete"

    -- Purpose and justification
    access_purpose VARCHAR(100), -- "treatment", "research", "supervision"
    justification TEXT,

    -- Compliance
    minimum_necessary BOOLEAN DEFAULT TRUE, -- HIPAA minimum necessary standard
    authorized_by UUID REFERENCES users(user_id),

    -- Timestamp
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- RESEARCH AND ANALYTICS (ANONYMIZED)
-- ================================================

-- Anonymized research data
CREATE TABLE research_data (
    research_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Anonymized identifiers
    anonymized_client_id VARCHAR(100), -- One-way hash
    anonymized_practitioner_id VARCHAR(100), -- One-way hash

    -- Research metadata
    framework_used VARCHAR(100),
    intervention_type VARCHAR(100),
    outcome_measure VARCHAR(100),

    -- Anonymized demographics
    age_range VARCHAR(20),
    gender VARCHAR(20),
    geographic_region VARCHAR(50),

    -- Outcomes (anonymized)
    baseline_score DECIMAL(10,2),
    followup_score DECIMAL(10,2),
    improvement_score DECIMAL(10,2),
    session_count INTEGER,
    treatment_duration INTEGER, -- Days

    -- Research consent
    research_consent_obtained BOOLEAN DEFAULT FALSE,
    consent_date DATE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(account_status);

-- Role indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_type ON user_roles(role_type);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- Credential indexes
CREATE INDEX idx_credentials_user_id ON professional_credentials(user_id);
CREATE INDEX idx_credentials_status ON professional_credentials(verification_status);
CREATE INDEX idx_credentials_expiry ON professional_credentials(expiration_date);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_billing_date ON user_subscriptions(next_billing_date);

-- Framework access indexes
CREATE INDEX idx_framework_access_user_id ON user_framework_access(user_id);
CREATE INDEX idx_framework_access_framework_id ON user_framework_access(framework_id);
CREATE INDEX idx_framework_access_active ON user_framework_access(is_active);

-- Clinical data indexes
CREATE INDEX idx_clients_practitioner ON clinical_clients(practitioner_id);
CREATE INDEX idx_clients_status ON clinical_clients(status);
CREATE INDEX idx_assessments_client ON clinical_assessments(client_id);
CREATE INDEX idx_assessments_practitioner ON clinical_assessments(practitioner_id);
CREATE INDEX idx_assessments_framework ON clinical_assessments(framework_id);
CREATE INDEX idx_sessions_client ON session_notes(client_id);
CREATE INDEX idx_sessions_date ON session_notes(session_date);

-- Audit indexes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_phi ON audit_logs(phi_accessed);

-- ================================================
-- TRIGGERS AND FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON professional_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_action_type VARCHAR(50),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_action_result VARCHAR(20) DEFAULT 'success',
    p_phi_accessed BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action_type, resource_type, resource_id,
        action_result, phi_accessed
    ) VALUES (
        p_user_id, p_action_type, p_resource_type, p_resource_id,
        p_action_result, p_phi_accessed
    ) RETURNING audit_logs.audit_id INTO audit_id;

    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SECURITY AND ENCRYPTION
-- ================================================

-- Enable Row Level Security
ALTER TABLE clinical_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own clients' data
CREATE POLICY client_data_access_policy ON clinical_clients
    FOR ALL TO authenticated_users
    USING (practitioner_id = current_user_id());

-- Function to get current user ID (to be implemented based on auth system)
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    -- This would integrate with your authentication system
    -- For now, return a placeholder
    RETURN '00000000-0000-0000-0000-000000000000'::UUID;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Insert sample subscription tiers
INSERT INTO subscription_tiers (tier_name, monthly_price, setup_fee, trial_days, features) VALUES
('free', 0.00, 0.00, 0, '["basic_ai", "wellness_content"]'),
('plus', 9.99, 0.00, 7, '["unlimited_ai", "personalization", "voice_interaction"]'),
('premium', 19.99, 0.00, 14, '["unlimited_ai", "priority_support", "advanced_analytics"]'),
('professional', 49.99, 0.00, 14, '["therapeutic_language", "professional_docs", "outcome_tracking"]'),
('clinical_ipp', 149.99, 299.99, 14, '["ipp_assessment", "elemental_analysis", "treatment_planning"]'),
('clinical_emdr', 99.99, 199.99, 14, '["resource_development", "processing_support", "integration_tracking"]');

-- Insert sample clinical frameworks
INSERT INTO clinical_frameworks (
    framework_id, framework_name, version, description,
    monthly_fee, setup_fee, trial_period, status, publisher
) VALUES
('ipp-spiralogic-v2.1', 'Spiralogic Ideal Parenting Protocol', '2.1.0',
 'Comprehensive trauma-informed parenting assessment and intervention protocol',
 149.99, 299.99, 14, 'active', 'Spiralogic Institute'),
('emdr-integration-v1.0', 'EMDR Integration Module', '1.0.0',
 'EMDR preparation, processing support, and integration tools',
 99.99, 199.99, 14, 'beta', 'EMDR Integration Team');

-- ================================================
-- BACKUP AND MAINTENANCE
-- ================================================

-- Create backup role
-- CREATE ROLE backup_user WITH LOGIN ENCRYPTED PASSWORD 'secure_backup_password';
-- GRANT CONNECT ON DATABASE maia_clinical TO backup_user;
-- GRANT USAGE ON SCHEMA public TO backup_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Automated backup script would be:
-- pg_dump -h localhost -U backup_user -d maia_clinical --verbose --clean --no-owner --no-acl | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

-- ================================================
-- NOTES FOR PRODUCTION DEPLOYMENT
-- ================================================

-- 1. Encryption:
--    - All PHI fields should be encrypted at the application level before storage
--    - Use AES-256 encryption with user-specific keys
--    - Consider field-level encryption for sensitive data

-- 2. HIPAA Compliance:
--    - Enable comprehensive audit logging
--    - Implement proper access controls
--    - Regular security assessments
--    - Employee training and BAAs

-- 3. Performance:
--    - Consider partitioning large tables by date
--    - Implement read replicas for reporting
--    - Use connection pooling
--    - Regular VACUUM and ANALYZE

-- 4. Monitoring:
--    - Set up database monitoring
--    - Alert on unusual access patterns
--    - Monitor query performance
--    - Track database growth

-- 5. Backup:
--    - Daily encrypted backups
--    - Test restore procedures
--    - Geographic backup distribution
--    - Point-in-time recovery capability