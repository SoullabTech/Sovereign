-- Add Version Pointers to routing_decisions for CEE Causality Tracking
-- Date: 2025-12-21
-- Purpose: Enable version tracking for router weights, relational profiles, and rules

-- Add version pointer columns
ALTER TABLE routing_decisions
ADD COLUMN IF NOT EXISTS relational_profile_version_used INTEGER,
ADD COLUMN IF NOT EXISTS router_weights_version_used INTEGER,
ADD COLUMN IF NOT EXISTS rule_version_used INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_routing_decisions_relational_profile_version
  ON routing_decisions(relational_profile_version_used)
  WHERE relational_profile_version_used IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_routing_decisions_router_weights_version
  ON routing_decisions(router_weights_version_used)
  WHERE router_weights_version_used IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_routing_decisions_rule_version
  ON routing_decisions(rule_version_used)
  WHERE rule_version_used IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN routing_decisions.relational_profile_version_used IS
  'Version of relational profile used for this routing decision. Enables causality tracking for profile changes.';

COMMENT ON COLUMN routing_decisions.router_weights_version_used IS
  'Version of router weights used for this routing decision. Enables causality tracking for weight tuning.';

COMMENT ON COLUMN routing_decisions.rule_version_used IS
  'Version of routing rule used for this routing decision. Enables causality tracking for rule evolution.';
