-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMS SPINE: Unified Communication Platform Layer
-- Migration: 20260122_comms_spine.sql
--
-- This establishes communication as a first-class layer in MAIA, unifying:
--   - Clinical messaging (between-session, bounded, PHI-protected)
--   - Operational messaging (appointments, billing, logistics)
--   - Community messaging (Ganesha campaigns, cohorts, announcements)
--
-- Design principles:
--   1. Domain separation: clinical | ops | community (different retention, consent, tone)
--   2. MAIA advises, never autopilots (especially safety)
--   3. Everything becomes events (for auditability and automation)
--   4. Policies are visible in UI (boundaries as feature)
--   5. Consent is granular (per identity + domain + channel)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────────
-- 1. CHANNELS: Available transport mechanisms
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Channel type
  type TEXT NOT NULL CHECK (type IN ('in_app', 'email', 'sms', 'push', 'video', 'voice')),

  -- Provider for this channel
  provider TEXT NOT NULL CHECK (provider IN ('internal', 'resend', 'twilio', 'livekit', 'jitsi')),

  -- Operational status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'degraded', 'disabled')),

  -- Provider-specific configuration (API keys stored in env, not here)
  config JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(type, provider)
);

-- Seed default channels
INSERT INTO comms_channels (type, provider, status, config) VALUES
  ('in_app', 'internal', 'active', '{"description": "Native in-app messaging"}'),
  ('email', 'resend', 'active', '{"description": "Transactional email via Resend"}')
ON CONFLICT (type, provider) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 2. IDENTITIES: Map people to channel addresses
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic owner (member = practitioner/user, client = practitioner's client, contact = Ganesha contact)
  owner_type TEXT NOT NULL CHECK (owner_type IN ('member', 'client', 'contact')),
  owner_id UUID NOT NULL,

  -- Channel-specific address
  channel_type TEXT NOT NULL CHECK (channel_type IN ('in_app', 'email', 'sms', 'push')),
  address TEXT NOT NULL,  -- email address, phone number, device token, or internal UUID

  -- Verification status
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_token TEXT,
  verification_sent_at TIMESTAMPTZ,

  -- Primary address for this channel type
  is_primary BOOLEAN DEFAULT FALSE,

  -- Delivery status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'bounced', 'unsubscribed', 'invalid')),
  bounce_count INT DEFAULT 0,
  last_bounce_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(owner_type, owner_id, channel_type, address)
);

CREATE INDEX IF NOT EXISTS idx_comms_identities_owner
  ON comms_identities(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_comms_identities_address
  ON comms_identities(channel_type, address);
CREATE INDEX IF NOT EXISTS idx_comms_identities_primary
  ON comms_identities(owner_type, owner_id, channel_type) WHERE is_primary = TRUE;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 3. THREADS: Conversation containers
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Domain separation (the three pillars)
  domain TEXT NOT NULL CHECK (domain IN ('clinical', 'ops', 'community')),

  -- Thread type within domain
  thread_type TEXT NOT NULL CHECK (thread_type IN (
    -- Clinical domain
    'between_session',     -- Async client↔practitioner messaging
    'session_prep',        -- Pre-session digest thread
    'safety_followup',     -- Safety concern follow-up
    -- Ops domain
    'appointment',         -- Scheduling, confirmations, reminders
    'billing',             -- Invoices, payments, receipts
    'logistics',           -- General operational
    -- Community domain
    'cohort',              -- Group program communication
    'campaign',            -- Marketing campaign thread
    'announcement'         -- One-way announcements
  )),

  -- Participants (flexible structure for different thread types)
  -- Clinical: {practitioner_id, client_id}
  -- Cohort: {practitioner_id, cohort_id, member_ids: [...]}
  -- Campaign: {campaign_id, recipient_ids: [...]}
  participants JSONB NOT NULL DEFAULT '{}',

  -- Direct FKs for common lookups (nullable for flexibility)
  practitioner_id UUID REFERENCES members(id) ON DELETE SET NULL,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES practitioner_cases(id) ON DELETE SET NULL,

  -- Future: cohort and campaign references
  -- cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  -- campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,

  -- Thread state
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),

  -- Optional subject line
  subject TEXT,

  -- Thread-level metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comms_threads_practitioner
  ON comms_threads(practitioner_id, domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_threads_client
  ON comms_threads(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_threads_case
  ON comms_threads(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_threads_domain_status
  ON comms_threads(domain, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_threads_active
  ON comms_threads(practitioner_id, status) WHERE status = 'active';


-- ─────────────────────────────────────────────────────────────────────────────────
-- 4. MESSAGES: Normalized message storage
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES comms_threads(id) ON DELETE CASCADE,

  -- Sender (polymorphic)
  sender_type TEXT NOT NULL CHECK (sender_type IN ('practitioner', 'client', 'system', 'maia')),
  sender_id UUID,  -- NULL for system/maia messages

  -- Channel used for this message
  channel_type TEXT NOT NULL CHECK (channel_type IN ('in_app', 'email', 'sms', 'push', 'video', 'voice')),

  -- Content (with PHI encryption support)
  body TEXT NOT NULL,
  body_enc TEXT,                    -- Encrypted ciphertext (AES-256-GCM, base64)
  body_enc_meta JSONB,              -- Encryption metadata: {iv, tag, kid, v, encrypted_at}

  -- Message classification
  message_type TEXT,  -- reflection, question, win, struggle, logistics, reply, reminder, confirmation, etc.
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'time_sensitive', 'safety_concern')),

  -- Delivery state machine
  delivery_status TEXT DEFAULT 'queued' CHECK (delivery_status IN (
    'queued',      -- In queue, not yet sent
    'sent',        -- Handed to provider
    'delivered',   -- Provider confirmed delivery
    'read',        -- Recipient opened/viewed
    'failed',      -- Delivery failed
    'bounced'      -- Hard/soft bounce
  )),
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Delivery error tracking
  delivery_error TEXT,
  delivery_attempts INT DEFAULT 0,

  -- Threading support
  reply_to_id UUID REFERENCES comms_messages(id) ON DELETE SET NULL,

  -- Quick response markers (for practitioner replies)
  is_quick_response BOOLEAN DEFAULT FALSE,
  quick_response_type TEXT CHECK (quick_response_type IN ('noted', 'discuss_next_session', 'acknowledged')),

  -- MAIA analysis (populated by async hook)
  maia_analysis JSONB,  -- {classification, suggested_urgency, safety_cues, sentiment, confidence}

  -- External references
  external_message_id TEXT,  -- Provider's message ID (for tracking)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comms_messages_thread
  ON comms_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_messages_undelivered
  ON comms_messages(thread_id, delivery_status)
  WHERE delivery_status IN ('queued', 'sent', 'delivered');
CREATE INDEX IF NOT EXISTS idx_comms_messages_safety
  ON comms_messages(urgency, created_at DESC)
  WHERE urgency = 'safety_concern';
CREATE INDEX IF NOT EXISTS idx_comms_messages_reply
  ON comms_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_messages_sender
  ON comms_messages(sender_type, sender_id) WHERE sender_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_messages_enc_meta
  ON comms_messages((body_enc_meta->>'kid')) WHERE body_enc IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 5. EVENTS: Append-only audit stream
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identification
  event_type TEXT NOT NULL,  -- message.created, message.sent, safety.flagged, etc.

  -- Related entities (nullable - not all events have all references)
  thread_id UUID REFERENCES comms_threads(id) ON DELETE SET NULL,
  message_id UUID REFERENCES comms_messages(id) ON DELETE SET NULL,
  identity_id UUID REFERENCES comms_identities(id) ON DELETE SET NULL,

  -- Actor who triggered the event
  actor_type TEXT CHECK (actor_type IN ('practitioner', 'client', 'system', 'maia')),
  actor_id UUID,

  -- Event payload (schema varies by event_type)
  data JSONB NOT NULL DEFAULT '{}',

  -- Immutable timestamp (append-only)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series optimized indexes
CREATE INDEX IF NOT EXISTS idx_comms_events_type_time
  ON comms_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_events_thread
  ON comms_events(thread_id, created_at DESC) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_events_message
  ON comms_events(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_events_actor
  ON comms_events(actor_type, actor_id, created_at DESC) WHERE actor_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 6. CONSENT: Per-person, per-channel, per-purpose
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES comms_identities(id) ON DELETE CASCADE,

  -- What they're consenting to
  domain TEXT NOT NULL CHECK (domain IN ('clinical', 'ops', 'community')),
  channel_type TEXT NOT NULL CHECK (channel_type IN ('in_app', 'email', 'sms', 'push')),

  -- Consent state
  consented BOOLEAN DEFAULT FALSE,
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,

  -- Consent metadata (for compliance)
  consent_source TEXT,  -- 'signup', 'settings', 'api', 'import', 'verbal'
  consent_ip TEXT,
  consent_user_agent TEXT,

  -- Sensitive content toggle (separate from general consent)
  allow_sensitive_content BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(identity_id, domain, channel_type)
);

CREATE INDEX IF NOT EXISTS idx_comms_consent_identity
  ON comms_consent(identity_id);
CREATE INDEX IF NOT EXISTS idx_comms_consent_lookup
  ON comms_consent(identity_id, domain, channel_type);
CREATE INDEX IF NOT EXISTS idx_comms_consent_active
  ON comms_consent(identity_id) WHERE consented = TRUE AND withdrawn_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 7. POLICIES: Communication boundaries and expectations
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Scope: null client_id = default policy for this domain
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  domain TEXT NOT NULL CHECK (domain IN ('clinical', 'ops', 'community')),

  -- Availability windows (when practitioner checks messages)
  check_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  check_window_start TIME DEFAULT '09:00',
  check_window_end TIME DEFAULT '17:00',
  timezone TEXT DEFAULT 'America/New_York',

  -- Response expectations
  max_response_hours INT DEFAULT 48,

  -- Crisis/emergency messaging (displayed to clients)
  crisis_copy TEXT DEFAULT 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',

  -- Custom boundary message (displayed in UI)
  boundary_message TEXT,

  -- Permissions
  allow_inbound BOOLEAN DEFAULT TRUE,
  allow_outbound BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Emergency contact override
  emergency_contact_id UUID REFERENCES comms_identities(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each practitioner has one default policy per domain (client_id = null)
  -- Plus optional per-client overrides
  UNIQUE NULLS NOT DISTINCT (practitioner_id, client_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_comms_policies_practitioner
  ON comms_policies(practitioner_id, domain);
CREATE INDEX IF NOT EXISTS idx_comms_policies_client
  ON comms_policies(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comms_policies_default
  ON comms_policies(practitioner_id, domain) WHERE client_id IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 8. SAFETY FLAGS: Enhanced safety concern tracking
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comms_safety_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Related message (unique = idempotency key)
  message_id UUID NOT NULL UNIQUE REFERENCES comms_messages(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES comms_threads(id) ON DELETE CASCADE,

  -- Severity level (traffic light model)
  severity TEXT NOT NULL CHECK (severity IN ('yellow', 'red', 'crisis')),

  -- Detection source
  detected_by TEXT NOT NULL CHECK (detected_by IN ('client_reported', 'maia_detected', 'practitioner_flagged')),
  detection_confidence NUMERIC(4,3),  -- 0.000 to 1.000

  -- MAIA analysis details
  detected_cues JSONB,  -- ["passive_ideation", "hopelessness", "overwhelm", ...]
  recommended_action TEXT,
  maia_rationale TEXT,

  -- Notification tracking
  notification_status TEXT DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'failed', 'skipped')),
  notification_channel TEXT,  -- 'email', 'sms', 'push'
  notified_at TIMESTAMPTZ,
  notification_error TEXT,

  -- Practitioner acknowledgment
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES members(id),
  review_note TEXT,

  -- Escalation tracking
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES members(id),
  escalation_note TEXT,

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES members(id),
  resolution_note TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comms_safety_thread
  ON comms_safety_flags(thread_id);
CREATE INDEX IF NOT EXISTS idx_comms_safety_unacknowledged
  ON comms_safety_flags(thread_id, severity)
  WHERE acknowledged_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_comms_safety_severity
  ON comms_safety_flags(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_safety_pending_notification
  ON comms_safety_flags(notification_status)
  WHERE notification_status = 'pending';


-- ─────────────────────────────────────────────────────────────────────────────────
-- 9. TRIGGERS: Auto-update timestamps
-- ─────────────────────────────────────────────────────────────────────────────────

-- Reuse existing trigger function if available, otherwise create
CREATE OR REPLACE FUNCTION update_comms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'comms_channels',
    'comms_identities',
    'comms_threads',
    'comms_messages',
    'comms_consent',
    'comms_policies'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_update_%I_timestamp ON %I;
      CREATE TRIGGER trg_update_%I_timestamp
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_comms_timestamp();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────────
-- 10. TRIGGER: Update thread.last_message_at on new message
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comms_threads
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_thread_last_message ON comms_messages;
CREATE TRIGGER trg_update_thread_last_message
  AFTER INSERT ON comms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();


-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
--
-- Tables created:
--   1. comms_channels     - Transport mechanisms
--   2. comms_identities   - People ↔ channel addresses
--   3. comms_threads      - Conversation containers
--   4. comms_messages     - Message content
--   5. comms_events       - Append-only audit log
--   6. comms_consent      - Granular consent tracking
--   7. comms_policies     - Communication boundaries
--   8. comms_safety_flags - Safety concern tracking
--
-- Next steps:
--   1. Create compatibility views (see 20260122_comms_spine_views.sql)
--   2. Implement dual-write adapter
--   3. Build API routes
-- ═══════════════════════════════════════════════════════════════════════════════
