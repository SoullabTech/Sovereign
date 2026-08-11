-- Remediation — three rows written by an automated walk into a member's real
-- relationship record, re-labelled so they stop rendering as his own words.
--
-- ⛔ NOTHING IS DELETED. The rows are the member's data to dispose of, not
-- ours. They are re-classified under the provenance taxonomy, which is what
-- makes them stop speaking in his voice; the text itself is left untouched and
-- fully visible, now labelled "not yours — written during testing".
--
-- WHAT HAPPENED. An agent's browser session was outranked by the member's own
-- HttpOnly `maia_session` cookie, so writes intended for a seeded fixture
-- landed in his real record for his real parent.
--
-- HOW THESE THREE WERE IDENTIFIED — two independent criteria that agree:
--   1. VERBATIM MATCH. Each string is reproduced exactly in the agent's own
--      session transcript as text it composed and typed. They are matched here
--      by id AND by content prefix, so a mismatch is a no-op rather than a
--      wrong re-label.
--   2. TEMPORAL SEPARATION. The member's last genuine entry in this record is
--      19:00:23. All three agent writes fall between 20:54 and 20:59 — a gap
--      of nearly two hours, with no member activity in between.
--
-- WHAT IS DELIBERATELY *NOT* TOUCHED, because authorship could not be
-- established with certainty:
--   • the container rows at 19:06–19:24 ("U1FIX-NORMAL-SLATE",
--     "RESTORED-SLATE", "REBASED-SLATE"). These are plainly automated smoke
--     strings, but they are NOT this agent's — it never wrote them — and
--     guessing at another lane's authorship would repeat the original error in
--     the opposite direction. They already carry `confidence`, so the
--     provenance backfill classes them `observer_derived`, and they live in a
--     system container rather than among the member's people.
--   • the member's own entries at 18:59:12, 19:00:06 and 19:00:23.
--
-- A wrong re-label is as bad as the contamination. Where authorship is
-- uncertain, the row is left exactly as the evidence found it.

UPDATE relationship_entries
   SET provenance = 'test_fixture'
 WHERE id = '50e0bff0-be3c-4308-bf3e-87f287566572'
   AND content LIKE 'She mentioned the pear tree her father planted%';

UPDATE relationship_entries
   SET provenance = 'test_fixture'
 WHERE id = 'f61a4a29-872a-49a6-ab52-d0f2c0139c1c'
   AND content LIKE 'There is a boundary with my mother I have never managed%';

UPDATE relationship_entries
   SET provenance = 'test_fixture'
 WHERE id = '44065e51-3dfc-4640-bd86-fbdf113619c5'
   AND content LIKE 'I noticed today that I am less afraid of the silences%';
