-- Migration: WhatsApp Integration
-- Date: 2026-03-25
-- Purpose: Contact identity, thread state, message transport logs, consent events,
--          thread summaries, and escalation tracking for WhatsApp channel.

-- whatsapp_contacts: one row per phone number; optionally linked to a member
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164   TEXT        NOT NULL,
  wa_user_id   TEXT,
  member_id    UUID        REFERENCES members(id) ON DELETE SET NULL,
  link_status  TEXT        NOT NULL DEFAULT 'unlinked'
                           CHECK (link_status IN ('unlinked', 'pending', 'linked')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone
  ON whatsapp_contacts (phone_e164);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_wa_user_id
  ON whatsapp_contacts (wa_user_id)
  WHERE wa_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_member_id
  ON whatsapp_contacts (member_id)
  WHERE member_id IS NOT NULL;

-- whatsapp_threads: one thread per contact (can be extended to multi-thread later)
CREATE TABLE IF NOT EXISTS whatsapp_threads (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID        NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  mode            TEXT        NOT NULL DEFAULT 'logistics'
                              CHECK (mode IN ('logistics', 'guided', 'deep_process')),
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'paused', 'closed')),
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_threads_contact_id
  ON whatsapp_threads (contact_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_threads_last_message_at
  ON whatsapp_threads (last_message_at DESC)
  WHERE status = 'active';

-- whatsapp_messages: transport-level log of every inbound and outbound message
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id             UUID        NOT NULL REFERENCES whatsapp_threads(id) ON DELETE CASCADE,
  direction             TEXT        NOT NULL
                                    CHECK (direction IN ('inbound', 'outbound')),
  transport_payload_json JSONB,
  body_text             TEXT,
  media_meta_json       JSONB,
  message_status        TEXT        NOT NULL DEFAULT 'received'
                                    CHECK (message_status IN ('received', 'delivered', 'read', 'sent', 'failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_thread_id
  ON whatsapp_messages (thread_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at
  ON whatsapp_messages (created_at DESC);

-- whatsapp_consents: explicit, staged consent events — one row per grant/revocation
CREATE TABLE IF NOT EXISTS whatsapp_consents (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        UUID        NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  consent_type      TEXT        NOT NULL
                                CHECK (consent_type IN (
                                  'transport_only',
                                  'logistics_ok',
                                  'maia_summary_ok',
                                  'deep_process_ok'
                                )),
  granted           BOOLEAN     NOT NULL,
  source_message_id UUID        REFERENCES whatsapp_messages(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_consents_contact_id
  ON whatsapp_consents (contact_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_consents_type_contact
  ON whatsapp_consents (contact_id, consent_type, created_at DESC);

-- whatsapp_summaries: generated summaries of thread content; what MAIA reads
CREATE TABLE IF NOT EXISTS whatsapp_summaries (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID        NOT NULL REFERENCES whatsapp_threads(id) ON DELETE CASCADE,
  summary_text   TEXT        NOT NULL,
  themes_json    JSONB,
  tone           TEXT,
  risk_flags_json JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_summaries_thread_id
  ON whatsapp_summaries (thread_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_summaries_created_at
  ON whatsapp_summaries (thread_id, created_at DESC);

-- whatsapp_escalations: flags requiring practitioner or operator attention
CREATE TABLE IF NOT EXISTS whatsapp_escalations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id        UUID        NOT NULL REFERENCES whatsapp_threads(id) ON DELETE CASCADE,
  escalation_type  TEXT        NOT NULL
                               CHECK (escalation_type IN (
                                 'user_request',
                                 'high_risk',
                                 'confusion',
                                 'billing',
                                 'low_confidence'
                               )),
  assigned_to      TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_escalations_thread_id
  ON whatsapp_escalations (thread_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_escalations_status
  ON whatsapp_escalations (status)
  WHERE status IN ('pending', 'acknowledged');

-- Register migration
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260325000001_whatsapp_integration.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
