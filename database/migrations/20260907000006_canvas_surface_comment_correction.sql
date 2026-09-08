-- WS-CANVAS-MATERIAL-01 · comment correction.
--
-- Migration 20260907000005 was authored while there were TWO appearance axes —
-- a selectable Studio atmosphere and a Canvas material — and its prose says so.
-- The founder WITHDREW the Studio axis on 2026-09-07 (the Studio's ground is a
-- sampled, frozen design contract; making it a member choice is a separate
-- design act that has not been performed). The schema comment therefore
-- describes a composability that no longer exists.
--
-- ── Why this is a new migration and not an edit ───────────────────────────
-- 20260907000005 has already run. Editing an applied migration changes the
-- record of what was applied while changing nothing that was applied — the
-- database keeps the old comment, the file claims a new one, and the two
-- disagree silently forever. Correcting forward keeps the history truthful:
-- the first file records what was believed when it ran, this one records the
-- correction and when it was made.
--
-- ⛔ Nothing structural changes. No column is added, dropped, or altered; no
-- row is touched. This migration rewrites one COMMENT.
--
-- The prose in 20260907000005's header is superseded by this file and is left
-- in place unaltered for the same reason.

BEGIN;

COMMENT ON COLUMN member_studio_atmosphere.canvas_surface IS
  'Canvas material the writer chose (dark | paper | parchment) — the ONE appearance choice a member makes. Repaints the manuscript plane only; the Studio around it is not selectable. NULL means never chosen, which renders as dark: the Studio''s own field. A writer preference, never a property of the Work. Supersedes the comment written by 20260907000005, which described a Studio-atmosphere axis withdrawn by founder ruling 2026-09-07.';

COMMENT ON COLUMN member_studio_atmosphere.atmosphere IS
  'The Studio room. NOT a member choice in this release — the atmosphere axis was withdrawn by founder ruling 2026-09-07 and the API refuses writes to it. Retained so restoring the axis, if it is ever ruled, needs a control and a writer rather than a schema change.';

COMMIT;
