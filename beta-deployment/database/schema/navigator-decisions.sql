-- Navigator Decision Logging Schema
-- PostgreSQL schema for tracking MAIA Navigator reasoning and effectiveness

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core table for Navigator decision logging
CREATE TABLE IF NOT EXISTS navigator_decisions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Soul state snapshot (input to Navigator)
  soul_state JSONB NOT NULL,

  -- Navigator decision output
  navigator_decision JSONB NOT NULL,

  -- Processing metadata
  processing_time_ms INTEGER NOT NULL,
  rules_applied JSONB NOT NULL, -- Array of rule IDs that fired
  safety_guardian_modifications JSONB, -- Any safety modifications made

  -- Effectiveness tracking
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  user_feedback_text TEXT,
  session_completion_status VARCHAR(50) CHECK (session_completion_status IN ('completed', 'abandoned', 'interrupted')),
  follow_through_detected BOOLEAN,

  -- Experience context
  interface_type VARCHAR(100) NOT NULL, -- 'consciousness-lab', 'spiral-aware', etc.
  client_context JSONB,

  -- Performance indicators
  protocol_adherence_score DECIMAL(3,2) CHECK (protocol_adherence_score >= 0.0 AND protocol_adherence_score <= 1.0),
  nervous_system_load_change DECIMAL(3,2), -- Change from pre to post session
  facet_depth_achieved INTEGER CHECK (facet_depth_achieved >= 1 AND facet_depth_achieved <= 7),

  -- Administrative
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_session_id ON navigator_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_user_id ON navigator_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_timestamp ON navigator_decisions(timestamp);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_interface_type ON navigator_decisions(interface_type);

-- JSONB indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_soul_state_gin ON navigator_decisions USING GIN (soul_state);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_navigator_decision_gin ON navigator_decisions USING GIN (navigator_decision);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_rules_applied_gin ON navigator_decisions USING GIN (rules_applied);

-- Composite indexes for analytics
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_user_timestamp ON navigator_decisions(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_effectiveness ON navigator_decisions(user_feedback_rating, session_completion_status);

-- Protocol effectiveness analysis table
CREATE TABLE IF NOT EXISTS navigator_protocol_effectiveness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id VARCHAR(255) NOT NULL,
  soul_state_pattern JSONB NOT NULL, -- Generalized pattern this applies to

  -- Effectiveness metrics
  usage_count INTEGER DEFAULT 1,
  avg_user_rating DECIMAL(3,2),
  completion_rate DECIMAL(3,2),
  avg_nervous_system_improvement DECIMAL(3,2),

  -- Learning indicators
  pattern_confidence DECIMAL(3,2) DEFAULT 0.5,
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(protocol_id, soul_state_pattern)
);

-- Rule effectiveness tracking
CREATE TABLE IF NOT EXISTS navigator_rule_effectiveness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id VARCHAR(255) NOT NULL,

  -- Performance metrics
  fire_count INTEGER DEFAULT 1,
  avg_user_satisfaction DECIMAL(3,2),
  safety_override_rate DECIMAL(3,2), -- How often Safety Guardian modifies this rule's output

  -- Pattern analysis
  common_soul_state_patterns JSONB, -- Array of soul state patterns this rule commonly fires for
  success_indicators JSONB, -- What makes this rule successful

  -- Temporal tracking
  last_fired TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(rule_id)
);

-- Safety Guardian intervention log
CREATE TABLE IF NOT EXISTS safety_guardian_interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  navigator_decision_id UUID NOT NULL REFERENCES navigator_decisions(id) ON DELETE CASCADE,

  -- Intervention details
  intervention_type VARCHAR(100) NOT NULL, -- 'intensity_reduction', 'facilitator_requirement', 'contraindication_block'
  original_recommendation JSONB NOT NULL,
  modified_recommendation JSONB NOT NULL,
  reasoning TEXT NOT NULL,

  -- Risk assessment
  detected_risk_level VARCHAR(50) NOT NULL CHECK (detected_risk_level IN ('low', 'moderate', 'high', 'critical')),
  risk_factors JSONB, -- Array of specific risk factors detected

  -- Validation tracking
  intervention_effectiveness VARCHAR(50), -- 'prevented_harm', 'appropriate_caution', 'overly_restrictive'
  user_feedback_on_safety TEXT,

  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Collective field analysis (for Community Commons integration)
CREATE TABLE IF NOT EXISTS collective_consciousness_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pattern identification
  pattern_name VARCHAR(255) NOT NULL,
  pattern_description TEXT,
  soul_state_signature JSONB NOT NULL, -- What soul states trigger this pattern

  -- Community metrics
  community_size INTEGER DEFAULT 1,
  pattern_strength DECIMAL(3,2) DEFAULT 0.1, -- How strong this pattern is in the field
  emergence_date TIMESTAMPTZ DEFAULT NOW(),

  -- Effectiveness in collective context
  collective_protocol_recommendations JSONB, -- What works well for this pattern
  field_harmonization_score DECIMAL(3,2), -- How well this integrates with other patterns

  -- Evolution tracking
  pattern_evolution JSONB, -- How this pattern has changed over time
  last_observed TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(pattern_name)
);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger
CREATE TRIGGER update_navigator_decisions_updated_at
  BEFORE UPDATE ON navigator_decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Useful views for Navigator analytics

-- Navigator effectiveness summary view
CREATE VIEW navigator_effectiveness_summary AS
SELECT
  DATE_TRUNC('day', timestamp) as date,
  interface_type,
  COUNT(*) as total_decisions,
  AVG(user_feedback_rating) as avg_rating,
  COUNT(*) FILTER (WHERE session_completion_status = 'completed') as completed_sessions,
  COUNT(*) FILTER (WHERE follow_through_detected = true) as follow_through_count,
  AVG(processing_time_ms) as avg_processing_time,
  AVG(nervous_system_load_change) as avg_ns_improvement
FROM navigator_decisions
WHERE user_feedback_rating IS NOT NULL
GROUP BY DATE_TRUNC('day', timestamp), interface_type
ORDER BY date DESC, interface_type;

-- Rule performance analysis view
CREATE VIEW rule_performance_analysis AS
SELECT
  rule_id,
  COUNT(*) as usage_count,
  AVG(nd.user_feedback_rating) as avg_user_rating,
  COUNT(*) FILTER (WHERE nd.session_completion_status = 'completed') as completion_count,
  COUNT(sgi.id) as safety_interventions,
  ROUND(COUNT(sgi.id)::decimal / COUNT(*)::decimal * 100, 2) as intervention_rate_pct
FROM navigator_rule_effectiveness nre
JOIN navigator_decisions nd ON nd.rules_applied ? nre.rule_id
LEFT JOIN safety_guardian_interventions sgi ON sgi.navigator_decision_id = nd.id
GROUP BY rule_id
ORDER BY avg_user_rating DESC NULLS LAST, usage_count DESC;

-- Recent Navigator decisions with context
CREATE VIEW recent_navigator_context AS
SELECT
  nd.id,
  nd.timestamp,
  nd.user_id,
  nd.interface_type,
  nd.soul_state->>'nervousSystemLoad' as nervous_system_load,
  nd.navigator_decision->>'protocolRecommendation'->>'id' as recommended_protocol,
  nd.navigator_decision->>'reasoning' as navigator_reasoning,
  nd.user_feedback_rating,
  nd.session_completion_status,
  CASE WHEN sgi.id IS NOT NULL THEN 'Safety Modified' ELSE 'Original' END as safety_status
FROM navigator_decisions nd
LEFT JOIN safety_guardian_interventions sgi ON sgi.navigator_decision_id = nd.id
ORDER BY nd.timestamp DESC
LIMIT 100;

-- Community pattern emergence tracking
CREATE VIEW emerging_community_patterns AS
SELECT
  ccp.pattern_name,
  ccp.community_size,
  ccp.pattern_strength,
  ccp.emergence_date,
  COUNT(nd.id) as recent_navigator_decisions
FROM collective_consciousness_patterns ccp
LEFT JOIN navigator_decisions nd ON (
  nd.timestamp >= NOW() - INTERVAL '7 days'
  AND nd.soul_state @> ccp.soul_state_signature
)
WHERE ccp.last_observed >= NOW() - INTERVAL '30 days'
GROUP BY ccp.id, ccp.pattern_name, ccp.community_size, ccp.pattern_strength, ccp.emergence_date
ORDER BY ccp.pattern_strength DESC, recent_navigator_decisions DESC;

-- Grant appropriate permissions (adjust role names as needed)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO consciousness_computing_app;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO consciousness_computing_readonly;