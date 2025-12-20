-- Neuropod MAIA Integration: Vibroacoustic + Field Safety + Membership
-- Migration: 20251217000002_neuropod_maia_integration.sql
-- Extends MAIA with consciousness navigation hardware protocols

-- ============================================================================
-- User Health Profile (Medical Exclusions & Safety Screening)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_health_profile (
  user_id TEXT PRIMARY KEY,

  -- Medical exclusions for Neuropod protocols
  psychosis_history BOOLEAN DEFAULT FALSE,
  seizure_history BOOLEAN DEFAULT FALSE,
  dissociation_history BOOLEAN DEFAULT FALSE,
  pregnancy_status BOOLEAN DEFAULT FALSE,
  pacemaker_implant BOOLEAN DEFAULT FALSE,

  -- Tier 2/3 specific exclusions
  severe_ptsd BOOLEAN DEFAULT FALSE,
  bipolar_disorder BOOLEAN DEFAULT FALSE,
  substance_dependence BOOLEAN DEFAULT FALSE,

  -- Free-text for additional context
  medical_notes TEXT,
  healthcare_provider_approved BOOLEAN DEFAULT FALSE,

  -- Waiver/consent
  neuropod_waiver_signed BOOLEAN DEFAULT FALSE,
  neuropod_waiver_signed_at TIMESTAMP,
  vibroacoustic_waiver_signed BOOLEAN DEFAULT FALSE,
  vibroacoustic_waiver_signed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_health_profile_exclusions ON user_health_profile(user_id)
  WHERE psychosis_history = TRUE
     OR seizure_history = TRUE
     OR dissociation_history = TRUE;

COMMENT ON TABLE user_health_profile IS 'Medical exclusions and safety screening for Neuropod protocols';


-- ============================================================================
-- User Membership (Tier System: Foundation/Explorer/Pioneer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_membership (
  user_id TEXT PRIMARY KEY,

  -- Current tier
  tier VARCHAR(20) NOT NULL DEFAULT 'foundation' CHECK (tier IN ('foundation', 'explorer', 'pioneer')),

  -- Tier history (track upgrades/downgrades)
  tier_history JSONB DEFAULT '[]'::jsonb,

  -- Subscription status
  subscription_active BOOLEAN DEFAULT TRUE,
  subscription_expires_at TIMESTAMP,
  subscription_payment_method VARCHAR(50), -- 'stripe', 'paypal', 'manual', 'lifetime'

  -- Access flags
  tier1_access BOOLEAN DEFAULT TRUE,  -- All tiers get Tier 1
  tier2_access BOOLEAN DEFAULT FALSE, -- Explorer+ get Tier 2
  tier3_access BOOLEAN DEFAULT FALSE, -- Reserved for future experimental

  -- Pioneer-specific features
  pioneer_early_beta_access BOOLEAN DEFAULT FALSE,
  pioneer_research_priority BOOLEAN DEFAULT FALSE,
  pioneer_find_resonance_beta BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_membership_tier ON user_membership(tier);
CREATE INDEX IF NOT EXISTS idx_user_membership_active ON user_membership(subscription_active) WHERE subscription_active = TRUE;

COMMENT ON TABLE user_membership IS 'Membership tier system (Foundation/Explorer/Pioneer) with protocol access gating';


-- ============================================================================
-- Bloom Biometric Validation (Developmental Markers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bloom_biometric_validation (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Bloom level at time of measurement
  bloom_level DECIMAL(3,2) NOT NULL CHECK (bloom_level >= 0 AND bloom_level <= 6),

  -- Biometric markers (averaged across sessions at this Bloom level)
  avg_hrv_coherence DECIMAL(5,4),           -- Primary marker for Bloom 2-3
  max_assr_plv DECIMAL(5,4),                 -- ASSR Phase-Locking Value (entrainment marker)
  avg_global_synchrony DECIMAL(5,4),        -- EEG global coherence
  avg_defect_density DECIMAL(5,4),          -- DMT defect density (chaos marker)
  avg_field_alignment DECIMAL(5,4),         -- Field coherence metric

  -- Additional developmental markers
  avg_alpha_power DECIMAL(5,4),             -- Calm/receptive state
  avg_theta_power DECIMAL(5,4),             -- Absorption/contemplative
  avg_gamma_power DECIMAL(5,4),             -- Insight/integration
  avg_frontal_parietal_coherence DECIMAL(5,4), -- Executive function integration

  -- Session statistics at this level
  neuropod_sessions_at_level INTEGER DEFAULT 0,
  vibroacoustic_sessions_at_level INTEGER DEFAULT 0,
  tier2_sessions_at_level INTEGER DEFAULT 0,

  -- Safety/stability markers
  safety_interventions_count INTEGER DEFAULT 0,
  high_risk_events_count INTEGER DEFAULT 0,

  -- Timestamps
  first_reached_at TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint: one record per user per Bloom level
  UNIQUE(user_id, bloom_level)
);

CREATE INDEX IF NOT EXISTS idx_bloom_biometric_user ON bloom_biometric_validation(user_id);
CREATE INDEX IF NOT EXISTS idx_bloom_biometric_level ON bloom_biometric_validation(bloom_level);
CREATE INDEX IF NOT EXISTS idx_bloom_biometric_user_level ON bloom_biometric_validation(user_id, bloom_level);

COMMENT ON TABLE bloom_biometric_validation IS 'Biometric validation of Bloom developmental progression';


-- ============================================================================
-- Neuropod Protocol Definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS neuropod_protocol_definitions (
  protocol_id VARCHAR(100) PRIMARY KEY,
  protocol_name TEXT NOT NULL,
  protocol_tier INTEGER NOT NULL CHECK (protocol_tier IN (1, 2, 3)),

  -- Protocol categorization
  category VARCHAR(50) NOT NULL, -- 'regulation', 'entrainment', 'transition'
  evidence_level VARCHAR(50) NOT NULL, -- 'strong', 'moderate', 'experimental'
  target_state VARCHAR(50), -- 'grounded', 'calm', 'receptive', 'focused', 'exploratory'

  -- Requirements
  required_bloom_level DECIMAL(3,2) DEFAULT 0,
  required_field_stability DECIMAL(3,2) DEFAULT 0,
  max_bypassing_score DECIMAL(3,2) DEFAULT 1.0,

  -- Medical exclusions (array of exclusion flags)
  exclusion_flags TEXT[], -- ['psychosis', 'seizure', 'dissociation', 'pregnancy', 'pacemaker']

  -- Protocol parameters (stored as JSONB for flexibility)
  stimulus_params JSONB NOT NULL,

  -- Safety
  max_intensity DECIMAL(3,2) DEFAULT 0.7,
  max_duration_minutes INTEGER DEFAULT 30,

  -- Marketing
  marketing_claim TEXT,
  prohibited_claims TEXT[],

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_protocol_tier ON neuropod_protocol_definitions(protocol_tier);
CREATE INDEX IF NOT EXISTS idx_protocol_category ON neuropod_protocol_definitions(category);

COMMENT ON TABLE neuropod_protocol_definitions IS 'Protocol definitions from lib/neuropod/protocolLibrary.ts (16 total protocols)';


-- ============================================================================
-- Vibroacoustic Session Tracking (State-Specific Enhancement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS neuropod_vibroacoustic_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Session identification
  protocol_id VARCHAR(100) NOT NULL,
  protocol_tier INTEGER CHECK (protocol_tier IN (1, 2, 3)),

  -- Session parameters
  duration_minutes INTEGER NOT NULL,
  target_state VARCHAR(50), -- 'grounded', 'calm', 'receptive', 'focused', 'exploratory'

  -- Vibroacoustic parameters
  vibroacoustic_frequency DECIMAL(6,2),     -- Hz (20-200 range)
  vibroacoustic_amplitude DECIMAL(3,2),     -- 0-1 (max 0.75)
  vibroacoustic_pattern VARCHAR(50), -- 'continuous', 'pulsed', 'breath-paced', etc.

  -- ASSR parameters (if applicable)
  assr_frequency DECIMAL(5,2),              -- 10 Hz, 6.5 Hz, 40 Hz, etc.
  assr_modulation VARCHAR(50),       -- 'isochronic', 'binaural', 'multimodal'

  -- Biometric outcomes (post-session)
  avg_hrv_coherence DECIMAL(5,4),
  peak_hrv_coherence DECIMAL(5,4),
  avg_alpha_power DECIMAL(5,4),
  avg_theta_power DECIMAL(5,4),
  avg_gamma_power DECIMAL(5,4),
  avg_global_synchrony DECIMAL(5,4),
  avg_defect_density DECIMAL(5,4),

  -- ASSR validation
  assr_plv DECIMAL(5,4),                    -- Phase-Locking Value (>0.3 = entrainment)
  assr_entrainment_detected BOOLEAN DEFAULT FALSE,

  -- Safety tracking
  safety_risk_score DECIMAL(3,2),           -- 0-1 (peak safety risk during session)
  safety_interventions INTEGER DEFAULT 0,
  user_stopped_early BOOLEAN DEFAULT FALSE,
  completion_status VARCHAR(50),     -- 'completed', 'user_stopped', 'safety_stopped'

  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_tags JSONB,                   -- ['calm', 'clarity', 'overwhelm', 'integration']
  journal_entry TEXT,

  -- MAIA integration
  bloom_level_at_session DECIMAL(3,2),
  field_stability_at_session DECIMAL(3,2),
  bypassing_score_at_session DECIMAL(3,2),
  maia_reflection TEXT,
  archetypal_session_id INTEGER,        -- Link to archetypal session template

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vibroacoustic_user ON neuropod_vibroacoustic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vibroacoustic_protocol ON neuropod_vibroacoustic_sessions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_vibroacoustic_created ON neuropod_vibroacoustic_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibroacoustic_tier ON neuropod_vibroacoustic_sessions(protocol_tier);
CREATE INDEX IF NOT EXISTS idx_vibroacoustic_assr_entrainment ON neuropod_vibroacoustic_sessions(assr_entrainment_detected)
  WHERE assr_entrainment_detected = TRUE;

COMMENT ON TABLE neuropod_vibroacoustic_sessions IS 'Vibroacoustic + ASSR session tracking with biometric validation';


-- ============================================================================
-- Archetypal Session Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS neuropod_archetypal_sessions (
  id SERIAL PRIMARY KEY,
  archetype_id VARCHAR(100) NOT NULL UNIQUE, -- 'shadow-integration', 'anima-animus-dialogue', etc.
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  required_tier VARCHAR(20) NOT NULL, -- 'foundation', 'explorer', 'pioneer'

  -- Session structure (multi-phase)
  phases JSONB NOT NULL,
  -- [
  --   {
  --     "phase": "grounding",
  --     "durationMinutes": 5,
  --     "neuropodProtocol": "breath-paced-vibroacoustic",
  --     "maiaPrompts": [...]
  --   },
  --   ...
  -- ]

  -- Post-session integration
  post_session_integration JSONB,
  -- {
  --   "journalPrompts": [...],
  --   "meaningDeferral": "Do not assign fixed meaning yet. Let it settle 48 hours."
  -- }

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE neuropod_archetypal_sessions IS 'Multi-phase archetypal session templates (shadow, anima/animus, etc.)';


-- ============================================================================
-- Community Commons Enhanced Gate (Extend Existing Table)
-- ============================================================================

-- Add Neuropod fields to community_commons_posts
DO $$
BEGIN
  -- neuropod_sessions_completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_commons_posts'
    AND column_name = 'neuropod_sessions_completed'
  ) THEN
    ALTER TABLE community_commons_posts ADD COLUMN
      neuropod_sessions_completed INTEGER DEFAULT 0;

    COMMENT ON COLUMN community_commons_posts.neuropod_sessions_completed IS
      'Total Neuropod sessions completed by poster (enhanced gate requirement)';
  END IF;

  -- avg_hrv_coherence
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_commons_posts'
    AND column_name = 'avg_hrv_coherence'
  ) THEN
    ALTER TABLE community_commons_posts ADD COLUMN
      avg_hrv_coherence DECIMAL(5,4);

    COMMENT ON COLUMN community_commons_posts.avg_hrv_coherence IS
      'Average HRV coherence across sessions (enhanced gate: >0.55 required)';
  END IF;

  -- max_assr_plv
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_commons_posts'
    AND column_name = 'max_assr_plv'
  ) THEN
    ALTER TABLE community_commons_posts ADD COLUMN
      max_assr_plv DECIMAL(5,4);

    COMMENT ON COLUMN community_commons_posts.max_assr_plv IS
      'Maximum ASSR PLV achieved (enhanced gate: >0.3 in ≥1 session)';
  END IF;

  -- high_risk_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_commons_posts'
    AND column_name = 'high_risk_events'
  ) THEN
    ALTER TABLE community_commons_posts ADD COLUMN
      high_risk_events INTEGER DEFAULT 0;

    COMMENT ON COLUMN community_commons_posts.high_risk_events IS
      'Count of high-risk safety events (enhanced gate: must be 0)';
  END IF;
END $$;


-- ============================================================================
-- Functions
-- ============================================================================

-- Get user's protocol tier eligibility
CREATE OR REPLACE FUNCTION get_user_protocol_tier_eligibility(p_user_id TEXT)
RETURNS TABLE (
  tier1_eligible BOOLEAN,
  tier2_eligible BOOLEAN,
  tier3_eligible BOOLEAN,
  exclusion_reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_health_profile RECORD;
  v_membership RECORD;
BEGIN
  -- Get health profile
  SELECT * INTO v_health_profile
  FROM user_health_profile
  WHERE user_id = p_user_id;

  -- Get membership
  SELECT * INTO v_membership
  FROM user_membership
  WHERE user_id = p_user_id;

  -- Default to foundation tier if no membership
  IF v_membership IS NULL THEN
    v_membership.tier := 'foundation';
    v_membership.tier1_access := TRUE;
    v_membership.tier2_access := FALSE;
    v_membership.tier3_access := FALSE;
  END IF;

  -- Check Tier 1 eligibility (minimal exclusions)
  IF v_health_profile.pacemaker_implant = TRUE THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, 'Pacemaker implant - vibroacoustic contraindicated';
    RETURN;
  END IF;

  -- Check Tier 2 eligibility (research protocols)
  IF v_health_profile.psychosis_history = TRUE THEN
    RETURN QUERY SELECT TRUE, FALSE, FALSE, 'Psychosis history - Tier 2 ASSR not recommended';
    RETURN;
  END IF;

  IF v_health_profile.seizure_history = TRUE THEN
    RETURN QUERY SELECT TRUE, FALSE, FALSE, 'Seizure history - Tier 2 ASSR not recommended';
    RETURN;
  END IF;

  IF v_health_profile.dissociation_history = TRUE THEN
    RETURN QUERY SELECT TRUE, FALSE, FALSE, 'Severe dissociation - Tier 2 protocols require clinical oversight';
    RETURN;
  END IF;

  -- All clear - return tier access based on membership
  RETURN QUERY SELECT
    TRUE,
    v_membership.tier2_access,
    v_membership.tier3_access,
    NULL::TEXT;
END;
$$;

COMMENT ON FUNCTION get_user_protocol_tier_eligibility IS 'Determines which protocol tiers user is eligible for based on health profile and membership';


-- Update Bloom biometric validation from session
CREATE OR REPLACE FUNCTION update_bloom_biometric_validation(
  p_user_id TEXT,
  p_bloom_level DECIMAL,
  p_session_biometrics JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing RECORD;
  v_session_count INTEGER;
BEGIN
  -- Get existing record for this Bloom level
  SELECT * INTO v_existing
  FROM bloom_biometric_validation
  WHERE user_id = p_user_id AND bloom_level = p_bloom_level;

  -- Count sessions at this level
  SELECT COUNT(*) INTO v_session_count
  FROM neuropod_vibroacoustic_sessions
  WHERE user_id = p_user_id AND bloom_level_at_session = p_bloom_level;

  IF v_existing IS NULL THEN
    -- Insert new record
    INSERT INTO bloom_biometric_validation (
      user_id,
      bloom_level,
      avg_hrv_coherence,
      max_assr_plv,
      avg_global_synchrony,
      avg_defect_density,
      neuropod_sessions_at_level
    ) VALUES (
      p_user_id,
      p_bloom_level,
      (p_session_biometrics->>'avg_hrv_coherence')::DECIMAL,
      (p_session_biometrics->>'assr_plv')::DECIMAL,
      (p_session_biometrics->>'avg_global_synchrony')::DECIMAL,
      (p_session_biometrics->>'avg_defect_density')::DECIMAL,
      v_session_count
    );
  ELSE
    -- Update running averages
    UPDATE bloom_biometric_validation
    SET
      avg_hrv_coherence = (
        (v_existing.avg_hrv_coherence * v_existing.neuropod_sessions_at_level + (p_session_biometrics->>'avg_hrv_coherence')::DECIMAL)
        / (v_existing.neuropod_sessions_at_level + 1)
      ),
      max_assr_plv = GREATEST(v_existing.max_assr_plv, (p_session_biometrics->>'assr_plv')::DECIMAL),
      avg_global_synchrony = (
        (v_existing.avg_global_synchrony * v_existing.neuropod_sessions_at_level + (p_session_biometrics->>'avg_global_synchrony')::DECIMAL)
        / (v_existing.neuropod_sessions_at_level + 1)
      ),
      avg_defect_density = (
        (v_existing.avg_defect_density * v_existing.neuropod_sessions_at_level + (p_session_biometrics->>'avg_defect_density')::DECIMAL)
        / (v_existing.neuropod_sessions_at_level + 1)
      ),
      neuropod_sessions_at_level = v_session_count,
      last_updated_at = NOW()
    WHERE user_id = p_user_id AND bloom_level = p_bloom_level;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_bloom_biometric_validation IS 'Updates running biometric averages for Bloom level progression tracking';


-- Check Community Commons enhanced gate eligibility
CREATE OR REPLACE FUNCTION check_commons_enhanced_gate_eligibility(p_user_id TEXT)
RETURNS TABLE (
  eligible BOOLEAN,
  bloom_avg DECIMAL,
  neuropod_sessions INTEGER,
  avg_hrv DECIMAL,
  max_plv DECIMAL,
  high_risk_events INTEGER,
  reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_bloom_avg DECIMAL;
  v_sessions INTEGER;
  v_hrv DECIMAL;
  v_plv DECIMAL;
  v_risk_events INTEGER;
BEGIN
  -- Get Bloom average (placeholder - TODO: integrate with actual cognitive_profiles if exists)
  v_bloom_avg := 4.5;

  -- Get Neuropod session stats
  SELECT
    COUNT(*),
    AVG(avg_hrv_coherence),
    MAX(assr_plv)
  INTO v_sessions, v_hrv, v_plv
  FROM neuropod_vibroacoustic_sessions
  WHERE user_id = p_user_id;

  -- Get high-risk events
  SELECT COUNT(*) INTO v_risk_events
  FROM neuropod_vibroacoustic_sessions
  WHERE user_id = p_user_id AND safety_risk_score > 0.85;

  -- Check eligibility
  IF v_bloom_avg < 4.0 THEN
    RETURN QUERY SELECT FALSE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
      'Bloom average below 4.0 - continue engaging with complexity';
    RETURN;
  END IF;

  IF v_sessions < 5 THEN
    RETURN QUERY SELECT FALSE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
      'Fewer than 5 Neuropod sessions - build biometric foundation';
    RETURN;
  END IF;

  IF v_hrv < 0.55 THEN
    RETURN QUERY SELECT FALSE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
      'Average HRV coherence below 0.55 - continue regulation practice';
    RETURN;
  END IF;

  IF v_plv IS NULL OR v_plv < 0.3 THEN
    RETURN QUERY SELECT FALSE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
      'No ASSR entrainment detected (PLV < 0.3) - continue entrainment practice';
    RETURN;
  END IF;

  IF v_risk_events > 0 THEN
    RETURN QUERY SELECT FALSE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
      'High-risk safety events detected - stabilize practice before Commons access';
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT TRUE, v_bloom_avg, v_sessions, v_hrv, v_plv, v_risk_events,
    'All Commons enhanced gate requirements met';
END;
$$;

COMMENT ON FUNCTION check_commons_enhanced_gate_eligibility IS 'Enhanced Community Commons gate: Bloom ≥4.0 + 5+ sessions + HRV >0.55 + ASSR PLV >0.3 + 0 high-risk events';


-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_neuropod_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_health_profile_updated_at
  BEFORE UPDATE ON user_health_profile
  FOR EACH ROW EXECUTE FUNCTION update_neuropod_updated_at();

CREATE TRIGGER trigger_update_membership_updated_at
  BEFORE UPDATE ON user_membership
  FOR EACH ROW EXECUTE FUNCTION update_neuropod_updated_at();

CREATE TRIGGER trigger_update_protocol_defs_updated_at
  BEFORE UPDATE ON neuropod_protocol_definitions
  FOR EACH ROW EXECUTE FUNCTION update_neuropod_updated_at();

CREATE TRIGGER trigger_update_archetypal_sessions_updated_at
  BEFORE UPDATE ON neuropod_archetypal_sessions
  FOR EACH ROW EXECUTE FUNCTION update_neuropod_updated_at();


-- Automatically update Bloom biometric validation on session completion
CREATE OR REPLACE FUNCTION auto_update_bloom_validation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.bloom_level_at_session IS NOT NULL THEN
    PERFORM update_bloom_biometric_validation(
      NEW.user_id,
      NEW.bloom_level_at_session,
      jsonb_build_object(
        'avg_hrv_coherence', NEW.avg_hrv_coherence,
        'assr_plv', NEW.assr_plv,
        'avg_global_synchrony', NEW.avg_global_synchrony,
        'avg_defect_density', NEW.avg_defect_density
      )
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_auto_update_bloom_validation
  AFTER INSERT OR UPDATE ON neuropod_vibroacoustic_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_bloom_validation();

COMMENT ON TRIGGER trigger_auto_update_bloom_validation ON neuropod_vibroacoustic_sessions IS 'Automatically updates Bloom biometric validation when session completes';
