-- ============================================
-- CLIENT EMERGENCY INFO
-- Safety information for practitioner clients
-- Part of the Practitioner Guild Layer
-- ============================================

-- Emergency/safety information for each client
CREATE TABLE IF NOT EXISTS client_emergency_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- Emergency contacts
  -- [{name, relationship, phone, is_primary}]
  emergency_contacts JSONB DEFAULT '[]',

  -- Safety documentation
  safety_plan TEXT,           -- If client has a safety plan
  medications TEXT,           -- Current medications
  medical_conditions TEXT,    -- Relevant medical conditions
  risk_notes TEXT,            -- Practitioner notes on risk factors

  -- Crisis resources
  -- [{name, phone, type}] - hotlines, hospitals, etc.
  crisis_resources JSONB DEFAULT '[]',

  -- Flags for quick access
  has_safety_plan BOOLEAN DEFAULT FALSE,
  has_risk_factors BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One emergency info record per client
  UNIQUE(client_id)
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_client_emergency_info_client
  ON client_emergency_info(client_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_client_emergency_info_timestamp ON client_emergency_info;
CREATE TRIGGER update_client_emergency_info_timestamp
  BEFORE UPDATE ON client_emergency_info
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

-- Comments
COMMENT ON TABLE client_emergency_info IS 'Emergency and safety information for practitioner clients';
COMMENT ON COLUMN client_emergency_info.emergency_contacts IS 'Array of emergency contacts: [{name, relationship, phone, is_primary}]';
COMMENT ON COLUMN client_emergency_info.safety_plan IS 'Client safety plan if one exists';
COMMENT ON COLUMN client_emergency_info.medications IS 'Current medications and dosages';
COMMENT ON COLUMN client_emergency_info.medical_conditions IS 'Relevant medical conditions';
COMMENT ON COLUMN client_emergency_info.risk_notes IS 'Practitioner notes on risk factors and concerns';
COMMENT ON COLUMN client_emergency_info.crisis_resources IS 'Array of crisis resources: [{name, phone, type}]';
