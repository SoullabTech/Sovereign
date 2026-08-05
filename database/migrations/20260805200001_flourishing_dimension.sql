-- Flourishing dimension — the member's PLACING gesture (2026-08-05).
--
-- A thread carries a flourishing dimension ONLY when the member's own act
-- placed it there: entering the Reflection Room through a dimension door in
-- the Flourishing Field and keeping material from that session. Nothing is
-- auto-categorized; NULL is the normal state. This is what lets the
-- Flourishing Field GATHER per-dimension honestly instead of faking
-- filtered views (founder ruling: rooms are purposeful fields that support
-- the development and organization of the member's offerings — never
-- dead-ends into generalized chat).

ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS flourishing_dimension TEXT NULL
  CONSTRAINT member_field_note_threads_flourishing_dimension_check
  CHECK (flourishing_dimension IS NULL OR flourishing_dimension IN
    ('relationships', 'meaning', 'presence', 'health', 'contribution', 'time'));

COMMENT ON COLUMN member_field_note_threads.flourishing_dimension IS
  'Member-placed flourishing dimension (via the dimension door they entered through). NULL = not placed. Never inferred.';

CREATE INDEX IF NOT EXISTS idx_field_note_threads_dimension
  ON member_field_note_threads (member_id, flourishing_dimension)
  WHERE flourishing_dimension IS NOT NULL;
