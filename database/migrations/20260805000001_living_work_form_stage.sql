-- Living Works: member-declared form and stage (Work Home, Slice 6e).
--
-- Both columns follow the title/purpose precedent exactly: they are on the
-- NEVER_AUTHORED_BY_THE_SYSTEM list (lib/livingWork/domain.ts), which governs
-- AUTHORSHIP, not existence — the only writer is a member act through the
-- PATCH route. NULL means "not stated", which is a legitimate permanent state,
-- not a gap to fill.
--
--   form   the member's own word for what this is becoming ("Book",
--          "Blog series", "Course"). Free text; never a system taxonomy.
--   stage  where the member says they are in the creative process. One of
--          five canonical stage words (Kelly, 2026-08-05):
--          capturing → developing → writing → refining → sharing.
--          Orientation, never progress: no ordering is enforced, no
--          completion is implied, and the system never advances it.

ALTER TABLE living_works
  ADD COLUMN IF NOT EXISTS form text
    CONSTRAINT living_works_form_not_blank
    CHECK (form IS NULL OR length(trim(form)) > 0),
  ADD COLUMN IF NOT EXISTS stage text
    CONSTRAINT living_works_stage_known
    CHECK (stage IS NULL OR stage IN ('capturing', 'developing', 'writing', 'refining', 'sharing'));
