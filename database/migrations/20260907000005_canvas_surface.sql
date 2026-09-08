-- WS-CANVAS-MATERIAL-01 — choose the room, and choose the page.
--
-- Founder ruling clarification 2026-09-07: there are TWO independent
-- appearance axes, and they are composable, not alternatives.
--
--   STUDIO ATMOSPHERE   the room — header, rails, panels, dock, shell
--   CANVAS MATERIAL     only the manuscript plane — Paper · Parchment · Dark
--
-- Charcoal Studio with a Paper Canvas. Espresso Studio with Parchment. Dark on
-- dark for someone who likes what they already had. Neither axis constrains
-- the other, which is why this is a second COLUMN on the writer's one
-- preference row and not a second value crammed into the first.
--
-- ── ⛔ What this column may never become ──────────────────────────────────
-- It is a writer-facing visual preference and nothing else:
--
--   NOT a second Studio theme        it reaches the writing plane only
--   NOT a manuscript property        no Work, manuscript or section owns it
--   NOT versioned                    changing Paper → Dark alters no revision
--   NOT provenance                   it records nothing about the writing
--   NOT a capability                 no feature turns on or off with it
--
-- Which is why it lives on the MEMBER's preference row. Changing where you
-- like to write is not a fact about the book.
--
-- Unvalidated in SQL, like `atmosphere` beside it and for the same reason: an
-- unknown id must degrade to the default in code rather than fail a page load,
-- and a future material must not require a migration to exist. The validating
-- authority is app/writers-studio/atmosphere/canvasSurfaces.ts.
--
-- ADDITIVE. Reversal:
--   ALTER TABLE member_studio_atmosphere DROP COLUMN IF EXISTS canvas_surface;

BEGIN;

ALTER TABLE member_studio_atmosphere
  ADD COLUMN IF NOT EXISTS canvas_surface TEXT;

COMMENT ON COLUMN member_studio_atmosphere.canvas_surface IS
  'Canvas material the writer chose (dark | paper | parchment). Independent of the atmosphere column: the two axes compose. NULL means never chosen, which renders as dark — the Studio''s own field, whatever atmosphere is set. A writer preference, never a property of the Work.';

COMMIT;
