-- ============================================
-- BETWEEN-SESSION CONTAINER
-- Bounded async messaging between practitioners and clients
-- NOT live chat - intentional latency, digest over drip, boundaries first-class
-- Part of the Practitioner Guild Layer
-- ============================================

-- ============================================
-- MESSAGE POLICIES
-- Practitioner boundaries for between-session communication
-- ============================================

CREATE TABLE IF NOT EXISTS message_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Optional client-specific override (null = default policy for practitioner)
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- When practitioner checks messages
  check_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  check_window_start TIME DEFAULT '09:00',
  check_window_end TIME DEFAULT '17:00',
  timezone TEXT DEFAULT 'America/New_York',

  -- Response expectations
  max_response_hours INT DEFAULT 48,

  -- Crisis messaging (displayed to client)
  crisis_copy TEXT DEFAULT 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',

  -- Permissions
  allow_client_messages BOOLEAN DEFAULT TRUE,
  allow_practitioner_reply BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
  -- Uniqueness enforced via partial indexes below for PG14 compatibility
);

-- PostgreSQL 14 compatible: use two partial indexes instead of UNIQUE NULLS NOT DISTINCT
-- One index for client-specific policies, one for default (null) policies
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_policies_unique_client
  ON message_policies(practitioner_id, client_id) WHERE client_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_policies_unique_default
  ON message_policies(practitioner_id) WHERE client_id IS NULL;

-- Additional indexes for query performance
CREATE INDEX IF NOT EXISTS idx_message_policies_practitioner
  ON message_policies(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_message_policies_client
  ON message_policies(client_id) WHERE client_id IS NOT NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_message_policies_timestamp ON message_policies;
CREATE TRIGGER update_message_policies_timestamp
  BEFORE UPDATE ON message_policies
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

-- Comments
COMMENT ON TABLE message_policies IS 'Practitioner boundaries for between-session messaging';
COMMENT ON COLUMN message_policies.client_id IS 'NULL for default policy, specific client_id for override';
COMMENT ON COLUMN message_policies.check_days IS 'Days of week practitioner checks messages: [monday, tuesday, ...]';
COMMENT ON COLUMN message_policies.max_response_hours IS 'Expected max hours to respond, shown to client';
COMMENT ON COLUMN message_policies.crisis_copy IS 'Text displayed to client about crisis/emergency resources';


-- ============================================
-- CLIENT MESSAGES
-- Between-session notes from clients to practitioners
-- ============================================

CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Direction
  direction TEXT NOT NULL CHECK (direction IN ('client_to_practitioner', 'practitioner_to_client')),

  -- Message type (client-facing categories)
  message_type TEXT CHECK (message_type IN ('reflection', 'question', 'win', 'struggle', 'logistics', 'reply')),

  -- Urgency (client self-selects)
  urgency TEXT DEFAULT 'not_urgent' CHECK (urgency IN ('not_urgent', 'time_sensitive', 'safety_concern')),

  -- Content
  body TEXT NOT NULL,

  -- Quick response helpers (for practitioner replies)
  is_quick_response BOOLEAN DEFAULT FALSE,
  quick_response_type TEXT, -- 'noted', 'discuss_next_session', 'acknowledged'

  -- Threading
  reply_to_id UUID REFERENCES client_messages(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'archived')),
  read_at TIMESTAMPTZ,

  -- Safety concern tracking
  safety_reviewed BOOLEAN DEFAULT FALSE,
  safety_reviewed_at TIMESTAMPTZ,
  safety_reviewed_by UUID REFERENCES members(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_client_messages_practitioner
  ON client_messages(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_client
  ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread
  ON client_messages(practitioner_id, created_at)
  WHERE status = 'sent' AND direction = 'client_to_practitioner';
CREATE INDEX IF NOT EXISTS idx_client_messages_safety
  ON client_messages(practitioner_id, urgency)
  WHERE urgency = 'safety_concern' AND safety_reviewed = FALSE;
CREATE INDEX IF NOT EXISTS idx_client_messages_thread
  ON client_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_messages_since_session
  ON client_messages(client_id, created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_client_messages_timestamp ON client_messages;
CREATE TRIGGER update_client_messages_timestamp
  BEFORE UPDATE ON client_messages
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

-- Comments
COMMENT ON TABLE client_messages IS 'Between-session notes exchanged between clients and practitioners';
COMMENT ON COLUMN client_messages.direction IS 'Who sent: client_to_practitioner or practitioner_to_client';
COMMENT ON COLUMN client_messages.message_type IS 'Client category: reflection, question, win, struggle, logistics';
COMMENT ON COLUMN client_messages.urgency IS 'Client self-selected: not_urgent, time_sensitive, safety_concern';
COMMENT ON COLUMN client_messages.is_quick_response IS 'TRUE if practitioner used a quick-response template';
COMMENT ON COLUMN client_messages.safety_reviewed IS 'TRUE when practitioner has acknowledged safety concern';


-- ============================================
-- CLIENT MESSAGE TOKENS
-- Email-based authentication for client portal messaging
-- ============================================

CREATE TABLE IF NOT EXISTS client_message_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- Token for URL
  token VARCHAR(255) UNIQUE NOT NULL,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Usage tracking
  used_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,

  -- Security
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_client_message_tokens_token
  ON client_message_tokens(token) WHERE is_revoked = FALSE;
CREATE INDEX IF NOT EXISTS idx_client_message_tokens_client
  ON client_message_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_client_message_tokens_active
  ON client_message_tokens(client_id, expires_at)
  WHERE is_revoked = FALSE;

-- Comments
COMMENT ON TABLE client_message_tokens IS 'Email link tokens for client access to messaging';
COMMENT ON COLUMN client_message_tokens.token IS 'Secure random token for URL authentication';
COMMENT ON COLUMN client_message_tokens.expires_at IS 'Token expires after this time (default 7 days)';
COMMENT ON COLUMN client_message_tokens.access_count IS 'Number of times token has been used';


-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Unread message counts by client
CREATE OR REPLACE VIEW v_client_unread_counts AS
SELECT
  practitioner_id,
  client_id,
  COUNT(*) as unread_count,
  COUNT(*) FILTER (WHERE urgency = 'safety_concern' AND safety_reviewed = FALSE) as safety_count,
  MAX(created_at) as latest_message_at
FROM client_messages
WHERE status = 'sent'
  AND direction = 'client_to_practitioner'
GROUP BY practitioner_id, client_id;

COMMENT ON VIEW v_client_unread_counts IS 'Quick lookup of unread message counts per client';


-- Messages since last session per client
CREATE OR REPLACE VIEW v_messages_since_last_session AS
SELECT
  cm.client_id,
  cm.practitioner_id,
  cm.id as message_id,
  cm.direction,
  cm.message_type,
  cm.urgency,
  cm.body,
  cm.status,
  cm.created_at
FROM client_messages cm
JOIN practitioner_clients pc ON cm.client_id = pc.id
WHERE cm.created_at > COALESCE(pc.last_session_at, pc.created_at)
ORDER BY cm.created_at DESC;

COMMENT ON VIEW v_messages_since_last_session IS 'Messages received since client last session - for session prep digest';


-- ============================================
-- END OF MIGRATION
-- ============================================
