-- SMS delivery status tracking for the practitioner notification SMS path
-- (app/api/notifications/sms). Records Twilio StatusCallback updates so the
-- system eventually knows whether an "accepted" message was delivered or failed,
-- instead of trusting synchronous acceptance.
--
-- Sovereignty boundary: NO recipient phone number and NO message body are stored.
-- Only the Twilio message SID + provider status + error code/message + timestamps.
-- Correlation is by SID/time, never by phone number.

CREATE TABLE IF NOT EXISTS sms_delivery_status (
    message_sid   TEXT PRIMARY KEY,
    status        TEXT NOT NULL,        -- Twilio status: accepted, queued, sending, sent, delivered, undelivered, failed
    error_code    TEXT,                 -- Twilio ErrorCode (e.g. 30007), when failed/undelivered
    error_message TEXT,                 -- Twilio ErrorMessage, when provided
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Diagnostics: surface recent failures/undelivered without scanning the table.
CREATE INDEX IF NOT EXISTS idx_sms_delivery_status_status_updated
    ON sms_delivery_status (status, updated_at DESC);
