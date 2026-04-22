-- Migration: 20260422000001_member_idea_recognition_events.sql
-- Purpose: MAIA Decision/Change recognition event log (append-only)
--
-- Design pass 2 (2026-04-22): chose append-only event log over mutable state row.
-- Every recognition moment (naming fired, invitation offered, accepted, declined,
-- ignored) is a row. Cooldown, decline tracking, oscillation detection, and
-- quiet-zone checks are all queries over this log — no mutation, no race conditions.
--
-- Philosophy: Same as member_theme_signals — structural metadata only, never
-- session content. Member words in `meta` are limited to short snippets
-- (X/Y extraction) that are themselves member-authored.
--
-- Authorship invariant: a block_id in meta means the member clicked to create.
-- No auto-create path exists. The event log records MAIA's offering and the
-- member's response; the member is always the author of any created object.

-- ── Create member_idea_recognition_events table ──────────────────────────────

CREATE TABLE IF NOT EXISTS member_idea_recognition_events (
  id          BIGSERIAL PRIMARY KEY,
  thread_id   UUID        NOT NULL,
  member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  fired_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- What happened at this moment in the recognition lifecycle
  event_type TEXT NOT NULL CHECK (event_type IN (
    'naming_fired',          -- MAIA named the moment in the response
    'invitation_offered',    -- MAIA attached a Save-as / Mark-as affordance
    'invitation_accepted',   -- member clicked the affordance; block created
    'invitation_declined',   -- member explicitly dismissed (future; not in v1)
    'invitation_ignored'     -- N turns passed with no engagement; treated as decline
  )),

  -- What kind of signal triggered this event
  signal_kind TEXT NOT NULL CHECK (signal_kind IN ('decision', 'change')),

  -- How strong the signal was when detection fired
  signal_strength TEXT NOT NULL CHECK (signal_strength IN ('medium', 'strong')),

  -- Structural metadata only. Allowed keys:
  --   turn_index   INT     — index of the user turn that triggered this event
  --   block_id     UUID    — the block created on invitation_accepted
  --   x_text       TEXT    — near-verbatim X snippet from user text (change only)
  --   y_text       TEXT    — near-verbatim Y snippet from user text (change only)
  --   source       TEXT    — e.g. 'oracle_route'
  -- Never stores the full user message, MAIA response, or session transcript.
  meta JSONB NOT NULL DEFAULT '{}'
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary query pattern: events for a thread, most recent first
CREATE INDEX IF NOT EXISTS idx_member_idea_recognition_events_thread_fired
  ON member_idea_recognition_events (thread_id, fired_at DESC);

-- Per-member audit / telemetry queries
CREATE INDEX IF NOT EXISTS idx_member_idea_recognition_events_member_fired
  ON member_idea_recognition_events (member_id, fired_at DESC);

-- Cooldown and quiet-zone checks filter by event_type
CREATE INDEX IF NOT EXISTS idx_member_idea_recognition_events_thread_type
  ON member_idea_recognition_events (thread_id, event_type, fired_at DESC);

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE member_idea_recognition_events IS
  'Append-only log of MAIA Decision/Change recognition events in Ideas threads. No mutation. Used for cooldown, decline tracking, oscillation detection, and quiet-zone enforcement via queries.';

COMMENT ON COLUMN member_idea_recognition_events.event_type IS
  'Lifecycle event: naming_fired (MAIA named a moment), invitation_offered (affordance shown), invitation_accepted (member clicked, block created), invitation_declined (member dismissed), invitation_ignored (N turns passed).';

COMMENT ON COLUMN member_idea_recognition_events.signal_kind IS
  'decision or change. Determines which recognition rules, templates, and affordance apply.';

COMMENT ON COLUMN member_idea_recognition_events.signal_strength IS
  'medium (direction-language only) or strong (decision/shift-language). Medium fires naming only; strong fires naming + invitation.';

COMMENT ON COLUMN member_idea_recognition_events.meta IS
  'Structural metadata only. Allowed keys: turn_index, block_id, x_text, y_text (near-verbatim member snippets only), source. Never stores full user messages or MAIA responses.';

-- ── Register migration ────────────────────────────────────────────────────────

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260422000001_member_idea_recognition_events.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
