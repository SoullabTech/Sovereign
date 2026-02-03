-- ============================================
-- COMMS SPINE: Phase 4 - Suggestion "Sent" Tracking
-- Migration: 20260121_comms_suggestion_sent_tracking.sql
--
-- Tracks:
-- 1. Which suggestion (if any) produced a practitioner message
-- 2. Mark suggestions as "sent" with anchor to the outbound message
-- ============================================

-- 1) Track which suggestion (if any) produced a practitioner message
ALTER TABLE comms_messages
  ADD COLUMN IF NOT EXISTS used_suggestion_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_comms_messages_used_suggestion_id
  ON comms_messages(used_suggestion_id);

-- Note: FK added after ensuring comms_reply_suggestions exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_comms_messages_used_suggestion'
  ) THEN
    ALTER TABLE comms_messages
      ADD CONSTRAINT fk_comms_messages_used_suggestion
      FOREIGN KEY (used_suggestion_id)
      REFERENCES comms_reply_suggestions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2) Mark suggestions as "sent" with an anchor to the outbound message
ALTER TABLE comms_reply_suggestions
  ADD COLUMN IF NOT EXISTS sent_message_id UUID NULL,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_comms_reply_suggestions_sent_message_id
  ON comms_reply_suggestions(sent_message_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_comms_reply_suggestions_sent_message'
  ) THEN
    ALTER TABLE comms_reply_suggestions
      ADD CONSTRAINT fk_comms_reply_suggestions_sent_message
      FOREIGN KEY (sent_message_id)
      REFERENCES comms_messages(id)
      ON DELETE SET NULL;
  END IF;
END $$;
