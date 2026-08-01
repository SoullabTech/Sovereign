-- Living Work — allow a work to exist before the member is ready to name it.
--
-- Corrects one unauthorized narrowing in 20260801000001_living_works.sql.
--
-- WHY. `title TEXT NOT NULL` made an unnamed Living Work impossible. That does
-- not breach any of the five ratified guards — they are silent on naming — but
-- it narrows the ratified ontology, and it contradicts the founder ruling
-- recorded as ledger D-16 (docs/architecture/STUDIO_DECISION_LEDGER.md):
--
--   "Identity and recognition are different moments. A work exists on explicit
--    declaration; the title comes when the creator is ready. Never invented,
--    never demanded early."
--
-- A creator sometimes knows exactly what they are working on. Sometimes they
-- only know "there is something I have been circling." If the ontology is
-- genuinely a body of work that PRECEDES any particular form, then an unnamed
-- work is still a Living Work, and requiring the name at creation forces
-- recognition before the creator has arrived at it.
--
-- The system still never invents a name. This changes only when it may ask.
--
-- WHAT THIS DOES NOT DO. It does not add a status, type, phase, or incubation
-- flag; NULL is not a state to be managed, it is the absence of an act that has
-- not happened yet. No declaration UI, no withdrawal behaviour, no change to
-- `purpose`, no second schema. Rows already written keep their titles.
--
-- The CHECK is added at the same time so the column cannot slide from "not yet
-- named" into "named with nothing". A title, once given, must be real.
--
-- ROLLBACK (only safe while every row still has a title):
--   ALTER TABLE living_works ALTER COLUMN title SET NOT NULL;
--   ALTER TABLE living_works DROP CONSTRAINT living_works_title_not_blank;

ALTER TABLE living_works
  ALTER COLUMN title DROP NOT NULL;

ALTER TABLE living_works
  ADD CONSTRAINT living_works_title_not_blank
  CHECK (title IS NULL OR length(trim(title)) > 0);

COMMENT ON COLUMN living_works.title IS
  'The member''s own words, and OPTIONAL. Never generated, never inferred, never demanded early. NULL means the work exists but has not yet been named — a legitimate state, not an incomplete record. Identity and recognition are different moments (ledger D-16).';
