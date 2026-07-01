-- Field Note — Release (the exit side of authorship).
--
-- What can be authored can also be released. Release does NOT delete history:
-- the thread is marked released (released_at), a 'released' event is appended to
-- the ledger, and the thread no longer appears as an active carried thread or
-- as the member's current self-understanding. The past is honored, not erased
-- ("deletion must not become erasure of authorship").
--
-- Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md

-- Mark a thread released without losing it. NULL = active.
ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Active threads (the default read) — released ones excluded.
CREATE INDEX IF NOT EXISTS idx_mfnt_active
  ON member_field_note_threads(member_id, created_at DESC)
  WHERE released_at IS NULL;

-- Extend the ledger's event vocabulary to include 'released' (and 'revised'
-- already exists; both are member-side acts of authorship).
ALTER TABLE member_field_note_events
  DROP CONSTRAINT IF EXISTS member_field_note_events_event_type_check;
ALTER TABLE member_field_note_events
  ADD CONSTRAINT member_field_note_events_event_type_check
  CHECK (event_type IN (
    'proposed','kept','revised','split','discarded','created','consent_changed','released'
  ));

COMMENT ON COLUMN member_field_note_threads.released_at IS
  'When the member released this thread (NULL = active). Released threads are honored history, never used as current self-understanding.';
