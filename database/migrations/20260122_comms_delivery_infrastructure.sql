-- ============================================
-- COMMS DELIVERY INFRASTRUCTURE
-- ============================================
-- Tables for provider credentials and delivery queue
-- Created: 2026-01-22

-- ============================================
-- 1. PRACTITIONER COMMS CREDENTIALS
-- ============================================
-- Stores encrypted API credentials for email/SMS providers

CREATE TABLE IF NOT EXISTS practitioner_comms_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

    -- Provider type: resend, twilio, etc.
    provider VARCHAR(50) NOT NULL,

    -- Credentials (encrypted at application layer before storage)
    -- For Resend: {"api_key": "encrypted..."}
    -- For Twilio: {"account_sid": "encrypted...", "auth_token": "encrypted...", "from_number": "+1..."}
    credentials_encrypted JSONB NOT NULL,

    -- Key version for credential rotation
    key_version INTEGER NOT NULL DEFAULT 1,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    last_error TEXT,
    error_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One credential per provider per practitioner
    UNIQUE(practitioner_id, provider),

    CHECK (provider IN ('resend', 'twilio', 'sendgrid', 'postmark')),
    CHECK (status IN ('active', 'error', 'disabled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_comms_creds_practitioner ON practitioner_comms_credentials(practitioner_id);

-- ============================================
-- 2. PRACTITIONER COMMS SETTINGS
-- ============================================
-- Per-practitioner communication preferences

CREATE TABLE IF NOT EXISTS practitioner_comms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL UNIQUE REFERENCES practitioners(id) ON DELETE CASCADE,

    -- Default sender identity for outbound
    default_email VARCHAR(255),
    default_phone VARCHAR(20),

    -- Sending preferences
    default_channel VARCHAR(20) NOT NULL DEFAULT 'email',

    -- Reply-to behavior
    -- 'practitioner': replies go to practitioner email
    -- 'noreply': no reply expected
    -- 'custom': use custom_reply_to
    reply_to_mode VARCHAR(20) NOT NULL DEFAULT 'practitioner',
    custom_reply_to VARCHAR(255),

    -- Email branding
    email_from_name VARCHAR(100),
    email_signature TEXT,

    -- SMS preferences
    sms_signature VARCHAR(100),

    -- Communication windows (respect client boundaries)
    -- Store as JSONB: {"monday": {"start": "09:00", "end": "17:00"}, ...}
    sending_hours JSONB,
    timezone VARCHAR(100) NOT NULL DEFAULT 'America/Chicago',

    -- Auto features
    auto_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    auto_followup_enabled BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (default_channel IN ('email', 'sms', 'in_app')),
    CHECK (reply_to_mode IN ('practitioner', 'noreply', 'custom'))
);

-- ============================================
-- 3. COMMS DELIVERY QUEUE
-- ============================================
-- Queue for asynchronous message delivery

CREATE TABLE IF NOT EXISTS comms_delivery_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link to original message
    message_id UUID NOT NULL REFERENCES comms_messages(id) ON DELETE CASCADE,

    -- Delivery details
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    channel_type VARCHAR(20) NOT NULL,
    provider VARCHAR(50) NOT NULL,

    -- Recipient
    recipient_address TEXT NOT NULL,
    recipient_name TEXT,

    -- Content (encrypted reference or inline)
    subject TEXT,
    body_html TEXT,
    body_text TEXT,

    -- Delivery state
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    -- queued: waiting for worker
    -- processing: worker picked it up
    -- sent: provider accepted
    -- delivered: confirmed delivery
    -- failed: permanent failure
    -- bounced: address bounced

    -- Provider response
    external_id TEXT,  -- Resend message ID, Twilio SID, etc.
    provider_response JSONB,

    -- Error handling
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,

    -- Processing info
    worker_id TEXT,
    locked_at TIMESTAMPTZ,

    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamps
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'failed', 'bounced', 'cancelled')),
    CHECK (channel_type IN ('email', 'sms'))
);

-- Indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_delivery_queue_status ON comms_delivery_queue(status, scheduled_for)
    WHERE status IN ('queued', 'processing');
CREATE INDEX IF NOT EXISTS idx_delivery_queue_message ON comms_delivery_queue(message_id);
CREATE INDEX IF NOT EXISTS idx_delivery_queue_practitioner ON comms_delivery_queue(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_queue_external_id ON comms_delivery_queue(external_id)
    WHERE external_id IS NOT NULL;

-- ============================================
-- 4. COMMS WEBHOOKS LOG
-- ============================================
-- Track incoming webhooks from providers for idempotency and debugging

CREATE TABLE IF NOT EXISTS comms_webhooks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider info
    provider VARCHAR(50) NOT NULL,
    event_type TEXT NOT NULL,

    -- Idempotency
    external_event_id TEXT,

    -- Related records
    delivery_queue_id UUID REFERENCES comms_delivery_queue(id) ON DELETE SET NULL,
    message_id UUID REFERENCES comms_messages(id) ON DELETE SET NULL,

    -- Raw payload
    payload JSONB NOT NULL,

    -- Processing
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    error TEXT,

    -- Timestamps
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate processing
    UNIQUE(provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhooks_log_unprocessed ON comms_webhooks_log(provider, received_at)
    WHERE processed = false;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_comms_delivery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_comms_creds_timestamp ON practitioner_comms_credentials;
CREATE TRIGGER trg_update_comms_creds_timestamp
    BEFORE UPDATE ON practitioner_comms_credentials
    FOR EACH ROW EXECUTE FUNCTION update_comms_delivery_timestamp();

DROP TRIGGER IF EXISTS trg_update_comms_settings_timestamp ON practitioner_comms_settings;
CREATE TRIGGER trg_update_comms_settings_timestamp
    BEFORE UPDATE ON practitioner_comms_settings
    FOR EACH ROW EXECUTE FUNCTION update_comms_delivery_timestamp();

DROP TRIGGER IF EXISTS trg_update_delivery_queue_timestamp ON comms_delivery_queue;
CREATE TRIGGER trg_update_delivery_queue_timestamp
    BEFORE UPDATE ON comms_delivery_queue
    FOR EACH ROW EXECUTE FUNCTION update_comms_delivery_timestamp();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE practitioner_comms_credentials IS 'Encrypted API credentials for email/SMS providers';
COMMENT ON TABLE practitioner_comms_settings IS 'Per-practitioner communication preferences';
COMMENT ON TABLE comms_delivery_queue IS 'Async queue for outbound message delivery';
COMMENT ON TABLE comms_webhooks_log IS 'Incoming webhook log for delivery status updates';
