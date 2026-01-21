-- ============================================
-- COMMS SPINE: MAIA Feedback (Practitioner Signal)
-- Migration: 20260121_comms_maia_feedback.sql
--
-- Phase 3B: Feedback Loop
-- Practitioners can signal whether MAIA's classification was helpful.
-- This creates training data for clinical culture without MAIA acting.
-- ============================================

CREATE TABLE IF NOT EXISTS comms_maia_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  message_id UUID NOT NULL REFERENCES comms_messages(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- +1 = thumbs up (helpful), -1 = thumbs down (off)
  signal SMALLINT NOT NULL CHECK (signal IN (-1, 1)),

  -- Optional reason label (kept lightweight; can evolve later)
  -- Examples: "wrong_type", "wrong_urgency", "missed_safety", "too_alarmist", "other"
  reason TEXT,

  -- Optional free-form note
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent spam/duplicates: one feedback per practitioner per message
CREATE UNIQUE INDEX IF NOT EXISTS idx_comms_maia_feedback_unique
  ON comms_maia_feedback(message_id, practitioner_id);

CREATE INDEX IF NOT EXISTS idx_comms_maia_feedback_message
  ON comms_maia_feedback(message_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comms_maia_feedback_practitioner
  ON comms_maia_feedback(practitioner_id, created_at DESC);

COMMENT ON TABLE comms_maia_feedback IS
  'Practitioner feedback on MAIA classifications. Training signal for clinical culture.';
COMMENT ON COLUMN comms_maia_feedback.signal IS
  '+1 = MAIA got this right, -1 = MAIA got this wrong';
COMMENT ON COLUMN comms_maia_feedback.reason IS
  'Optional category: wrong_type, wrong_urgency, missed_safety, too_alarmist, other';
