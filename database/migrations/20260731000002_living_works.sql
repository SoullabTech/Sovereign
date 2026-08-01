-- Living Works — the governing object of the Author's Studio.
--
-- Founder ruling, 2026-07-31:
--   "The governing object of the Studio is a Living Work. A Living Work is a
--    member-authored body of material, inquiry, decisions, relationships, and
--    expressions that may precede any particular form and may give rise to
--    multiple forms over time. A manuscript, workbook, manual, course, program,
--    retreat, framework, publication, or other artifact is an EXPRESSION of a
--    Living Work, not the governing ontology."
--
-- Stage 2, step 1 of 7: the Studio RECOGNIZES the work. Steps 2-7 (expressions
-- owning artifacts, current focus, gatherings, shape, release) are not in this
-- migration and are not authorized by it.
--
-- WHAT THIS TABLE DELIBERATELY DOES NOT HAVE, and why:
--
--   * No `kind` / `type` / `category`. A Living Work precedes form. Typing it at
--     birth would re-create the exact defect the ruling corrects — the artifact
--     defining the work. Expressions carry form; the work does not.
--   * No `summary`, `themes`, `tags`, `status`, or `stage`. Every one of those is
--     interpretation, and interpretation is the creator's (D-03: relationships
--     are authored, never computed). Nothing here may be system-derived.
--   * No `archived` / `completed`. A body of work spanning years does not have a
--     done state, and offering one invites the productivity framing D-06 refuses.
--
-- IDENTITY AND RECOGNITION ARE DIFFERENT MOMENTS.
--
-- The work exists when the creator declares it. The creator names it when they
-- know what it is. Those are not the same event, and an earlier draft of this
-- table collapsed them by making `title` NOT NULL.
--
-- Sometimes a person knows exactly what they are working on. Sometimes they only
-- know "there is something I have been circling." If the ontology is genuinely a
-- Living Work — a body of work that PRECEDES any particular form — then an
-- unnamed work is still a Living Work, and requiring the name at birth would
-- force recognition before the creator has arrived at it.
--
-- So: the system never invents the name, AND it never demands it early.
--   * Existence  — an explicit member declaration ("I'm beginning a new work").
--                  Never implicit; a work is never created as a side effect of
--                  importing, writing, or saving something.
--   * Recognition — the title, added whenever the creator is ready.
--
-- A title, once given, must be real (no whitespace-only names). A title is NOT
-- required to exist, hold expressions, or be written in. Requiring one before
-- PUBLICATION or SHARING is the sensible boundary — an untitled thing cannot
-- leave the Studio addressed to anyone — but publication does not exist yet and
-- that rule is NOT ruled. It belongs at the publication boundary when built, not
-- as a NOT NULL here. Recorded, not ruled (2026-07-31).

CREATE TABLE IF NOT EXISTS living_works (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  -- Member-authored, and OPTIONAL until the creator recognizes the work.
  -- Never system-generated, never defaulted, never inferred. NULL means
  -- "not yet named", which is a legitimate state — not an incomplete record.
  title       TEXT CHECK (title IS NULL OR length(trim(title)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A member may steward multiple Living Works (explicit in the ruling). Initial
-- implementations may surface one at a time; the schema must not narrow the
-- ontology to enforce that, so there is no unique constraint on member_id.
CREATE INDEX IF NOT EXISTS idx_living_works_member
  ON living_works (member_id, updated_at DESC);

COMMENT ON TABLE living_works IS
  'The governing object of the Author Studio (founder ruling 2026-07-31). A member-authored body of work that precedes any particular form. Artifacts are expressions of it, never its identity.';
COMMENT ON COLUMN living_works.title IS
  'Member-authored and optional. Never inferred from a manuscript, filename, or any other source — naming is interpretation, and interpretation belongs to the creator. NULL means the work exists but has not yet been named: identity and recognition are different moments.';

-- Step 4 of the order: manuscripts become ONE EXPRESSION of a work.
--
-- Nullable on purpose, and it stays nullable. An existing manuscript that has
-- not yet been claimed by a work is not broken and must not be auto-attached:
-- inferring that a member's three imported manuscripts belong to one work is
-- exactly the computed relationship D-03 forbids. Attachment is a member act.
--
-- ON DELETE SET NULL: removing a Living Work must never destroy a manuscript.
-- The work is an identity, not a container that owns its contents' existence.
ALTER TABLE member_manuscripts
  ADD COLUMN IF NOT EXISTS living_work_id UUID
  REFERENCES living_works(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_member_manuscripts_living_work
  ON member_manuscripts (living_work_id)
  WHERE living_work_id IS NOT NULL;

COMMENT ON COLUMN member_manuscripts.living_work_id IS
  'The Living Work this manuscript is an expression of. NULL means unclaimed, not orphaned — attachment is a member act, never inferred. Deleting the work never deletes the manuscript.';
