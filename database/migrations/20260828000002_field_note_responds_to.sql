-- Consequential return — the relation between two member acts (NW-V1-CLIENT-01).
--
-- The Now What? V1 return loop is: the member chose something, lived it, came
-- back, said what happened, and KEPT that. The one thing the substrate could
-- not already express is that the kept lived update REMAINS RELATED to the
-- prior act it answers. Everything else in this loop already existed.
--
-- This is a relation between two member acts, not a progress model. It is
-- deliberately NOT:
--   - an outcome, result, score, or success/failure classification
--   - a state machine, journey stage, or completion signal
--   - a system inference of any kind
-- It says one thing only: "the member wrote this in answer to that."
--
-- Written ONLY when the member returned through the lived doorway carrying a
-- prior act of their own AND then made an explicit keep/revise gesture. A
-- discard writes no row at all, so a discard can never acquire a relation. The
-- referenced thread is verified member-scoped at write time; a thread id that
-- is not the member's own is refused, never stored.
--
-- ON DELETE SET NULL: releasing or deleting the earlier act must never delete
-- the member's account of what happened. The account survives; only the link
-- goes quiet.
--
-- Additive and reversible. To reverse:
--   ALTER TABLE member_field_note_threads DROP COLUMN IF EXISTS responds_to_thread_id;

ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS responds_to_thread_id UUID NULL
  REFERENCES member_field_note_threads(id) ON DELETE SET NULL;

COMMENT ON COLUMN member_field_note_threads.responds_to_thread_id IS
  'The member''s prior act this thread was written in answer to (lived return). NULL = stands alone, the normal state. Member-scoped at write time. Never inferred, never a progress or outcome signal.';

CREATE INDEX IF NOT EXISTS idx_field_note_threads_responds_to
  ON member_field_note_threads (member_id, responds_to_thread_id)
  WHERE responds_to_thread_id IS NOT NULL;
