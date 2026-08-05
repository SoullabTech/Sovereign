-- Cultivate-door placing gesture: persist the flourishing dimension the member
-- chose when they entered the room through "What you are cultivating".
--
-- Before this column, the cultivate page promised "A reflection added here is
-- placed under its dimension by you" while the dimension slug was framing copy
-- only — the member's placing gesture was silently dropped at save time
-- (NOW_WHAT_ROOM_DOORWAY_LOGIC_REVIEW_2026-08-05.md, silent-loss bug 1).
--
-- The tag types the evidence, never the person: nullable, member-gesture-only,
-- absent unless the member walked through a dimension door they chose.
-- Offered, never imposed (ontology ruling D-D).

ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS dimension TEXT DEFAULT NULL;

COMMENT ON COLUMN member_field_note_threads.dimension IS
  'Flourishing dimension the member placed this thread under by entering the room through the cultivate door (member gesture; NULL = not placed). Offered vocabulary, never imposed.';
