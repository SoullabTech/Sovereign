-- ============================================================================
-- Co-lab → Studio Decisions → Tasks provenance (the decide → find → assign loop)
-- ============================================================================
-- Directive (Kelly, 2026-06-06): "unify, but lightly. Do not build two decision
-- systems." Channel message_kind='decision' is the conversational origin;
-- studio_decisions is the single operational decision record.
--
--   team_message(kind='decision')
--     → Capture as Studio Decision   (source_message_id retained)
--     → visible in Decisions view    (team lens, channel-access scoped)
--     → convertible to task          (studio_tasks.source_decision_id)
--
-- "A decision can be spoken in Co-lab. A decision becomes operational when it
--  is captured into Studio Decisions."
--
-- One store (studio_decisions), two lenses:
--   - Practitioner Council  (private)        : WHERE practitioner_id = $me        — UNCHANGED
--   - Team operational      (channel-scoped) : WHERE source_channel_id IS NOT NULL — NEW
-- Channel-origin decisions stay at channel visibility (origin-preserving; the
-- content was already visible in the channel), so this is not a privacy change
-- to the existing private Council.
-- ============================================================================

-- 1. studio_decisions: carry channel provenance + allow team (non-practitioner) capture
ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS source_message_id     UUID REFERENCES team_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_channel_id     UUID REFERENCES team_channels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS captured_by_member_id UUID REFERENCES members(id)       ON DELETE SET NULL;

-- A decision captured from a channel may be authored by a non-practitioner team
-- member (e.g. the engineer). practitioner_id stays set for practitioner-authored
-- Council decisions and for captures made by a practitioner.
ALTER TABLE studio_decisions ALTER COLUMN practitioner_id DROP NOT NULL;

-- Idempotent capture: at most one decision per source message.
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_decisions_source_message
  ON studio_decisions (source_message_id)
  WHERE source_message_id IS NOT NULL;

-- Team-lens read: decisions captured from a channel, newest first.
CREATE INDEX IF NOT EXISTS idx_studio_decisions_source_channel
  ON studio_decisions (source_channel_id, created_at DESC)
  WHERE source_channel_id IS NOT NULL;

-- 2. studio_tasks: carry decision/message provenance (discussion → decision → task)
ALTER TABLE studio_tasks
  ADD COLUMN IF NOT EXISTS source_decision_id UUID REFERENCES studio_decisions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_message_id  UUID REFERENCES team_messages(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_channel_id  UUID REFERENCES team_channels(id)    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_studio_tasks_source_decision
  ON studio_tasks (source_decision_id)
  WHERE source_decision_id IS NOT NULL;
