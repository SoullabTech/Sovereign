-- ============================================
-- COMMS SPINE: Phase 3A - Suggested Replies
-- Migration: 20260121_comms_reply_suggestions.sql
--
-- MAIA suggests, practitioner chooses.
-- Every send is a practitioner action.
-- ============================================

CREATE TABLE IF NOT EXISTS comms_reply_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES comms_threads(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES comms_messages(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- MAIA suggestion payload
  kind TEXT NOT NULL DEFAULT 'reply', -- future: 'follow_up', 'boundary', 'safety', etc.
  title TEXT,
  suggested_text TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0.5,
  rationale TEXT,

  -- lifecycle
  status TEXT NOT NULL DEFAULT 'draft', -- draft|dismissed|sent|superseded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reply_suggestions_thread
  ON comms_reply_suggestions(thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reply_suggestions_message
  ON comms_reply_suggestions(message_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reply_suggestions_practitioner
  ON comms_reply_suggestions(practitioner_id, created_at DESC);

COMMENT ON TABLE comms_reply_suggestions IS
  'MAIA draft suggestions for practitioner replies. MAIA suggests, never sends.';
COMMENT ON COLUMN comms_reply_suggestions.kind IS
  'Suggestion type: reply, follow_up, boundary, safety, etc.';
COMMENT ON COLUMN comms_reply_suggestions.status IS
  'Lifecycle: draft (active), dismissed (rejected), sent (used), superseded (new message arrived)';


-- Feedback on suggestions (optional signal for tone learning)
CREATE TABLE IF NOT EXISTS comms_reply_suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES comms_reply_suggestions(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  signal INT NOT NULL CHECK (signal IN (1, -1)),
  reason TEXT,
  note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (suggestion_id, practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_reply_suggestion_feedback_suggestion
  ON comms_reply_suggestion_feedback(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_reply_suggestion_feedback_practitioner
  ON comms_reply_suggestion_feedback(practitioner_id, created_at DESC);

COMMENT ON TABLE comms_reply_suggestion_feedback IS
  'Practitioner feedback on MAIA suggestions. Trains tone + boundaries over time.';
