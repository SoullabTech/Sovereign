-- Migration: Extend comms_messages with trust controls
-- Phase 2 of the unified trust middleware rollout.
--
-- Adds per-message trust metadata so communication flows are
-- governed, auditable, and AI-participation-aware.

ALTER TABLE comms_messages
  ADD COLUMN IF NOT EXISTS ai_assist_mode TEXT NOT NULL DEFAULT 'none'
    CHECK (ai_assist_mode IN ('none', 'structure_only', 'draft_allowed')),
  ADD COLUMN IF NOT EXISTS disclosure_mode TEXT NOT NULL DEFAULT 'none'
    CHECK (disclosure_mode IN ('none', 'manual', 'automatic')),
  ADD COLUMN IF NOT EXISTS disclosure_text TEXT,
  ADD COLUMN IF NOT EXISTS trust_scope TEXT NOT NULL DEFAULT 'direct_only'
    CHECK (trust_scope IN ('direct_only', 'session_context', 'relational_context')),
  ADD COLUMN IF NOT EXISTS ai_permitted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_relational_inference BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_for_send_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_for_send_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS trust_checked_at TIMESTAMPTZ DEFAULT NOW();

-- Index for auditing: find messages where AI was involved
CREATE INDEX IF NOT EXISTS idx_comms_messages_ai_assist
  ON comms_messages (ai_assist_mode)
  WHERE ai_assist_mode != 'none';

-- Index for auditing: find messages with disclosure
CREATE INDEX IF NOT EXISTS idx_comms_messages_disclosure
  ON comms_messages (disclosure_mode)
  WHERE disclosure_mode != 'none';

COMMENT ON COLUMN comms_messages.ai_assist_mode IS 'Whether AI assisted with composition: none, structure_only, or draft_allowed';
COMMENT ON COLUMN comms_messages.disclosure_mode IS 'Disclosure level: none, manual (practitioner writes), or automatic (system generates)';
COMMENT ON COLUMN comms_messages.trust_scope IS 'What context informed this message: direct_only, session_context, or relational_context';
COMMENT ON COLUMN comms_messages.trust_checked_at IS 'When the unified trust middleware last checked this message — verifies middleware coverage';
