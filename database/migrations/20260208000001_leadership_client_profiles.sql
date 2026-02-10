-- Leadership Client Profile Extension
-- Adds leadership-specific fields to practitioner_clients
-- Follows existing JSONB pattern (tags, key_placements)
--
-- This does NOT create a separate table.
-- Leadership profile lives on the client record because
-- a leader is still a client — just with additional context.

-- Leadership profile JSONB column
-- Structure: { role, orgName, orgSize, industry, decisionDomain,
--              authorityScope, stakeholderComplexity, pressureLevel,
--              directReports, boardExposure }
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS leadership_profile JSONB DEFAULT NULL;

-- Client type tags for filtering and domain layer activation
-- Examples: ['leadership', 'executive', 'founder']
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS client_types TEXT[] DEFAULT '{}';

-- Index for finding leadership clients quickly
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_leadership
  ON practitioner_clients USING GIN (leadership_profile)
  WHERE leadership_profile IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_practitioner_clients_types
  ON practitioner_clients USING GIN (client_types);

COMMENT ON COLUMN practitioner_clients.leadership_profile IS
  'Leadership-specific profile: role, org context, authority scope, pressure signals';
COMMENT ON COLUMN practitioner_clients.client_types IS
  'Domain type tags for activating specialized UI layers: leadership, executive, founder';
