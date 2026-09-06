-- WS2-08A — Heading depth preserved at ingest (Source custody, additive)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--
--   - THIS RECORDS WHAT ARRIVED, NOT WHAT IT MEANS. A Markdown manuscript says
--     `#` or `##`; a DOCX says Heading 1 or Heading 2 (extracted as `#`/`##`);
--     a typescript says "Chapter Four". Those are the document's own
--     characters and wording. Until this migration the segmenter consumed the
--     `#` marks and threw their COUNT away, so the one structural fact an
--     author states outright was discarded before the section was saved.
--     Recording it is the WS-01 omission discipline applied to structure:
--     arriving information is kept, not smoothed away.
--
--   - DEPTH IS NEVER GUESSED. An ALL-CAPS line is a valid mechanical cut and
--     an unreliable hierarchy signal — it is exactly what produced 185
--     sections from one print manuscript. It is recorded as a boundary whose
--     depth is NULL (unclassified). Nothing here promotes a boundary to a
--     chapter. The member assigns depth, or leaves it unassigned.
--
--   - SOURCE STAYS THE CUSTODY RECORD. These two columns are nullable and
--     additive on `manuscript_sections`; no existing row is read or rewritten,
--     and every pre-existing section reads as unclassified, which is true.
--     They describe the arrival. WRITE changes the working draft's structure
--     (WS2-05A units over draft sections), never these rows.
--
--   - NOT A `level` ON THE STRUCTURE TREE. WS2-05A ruled that
--     `manuscript_structure_units` carries no depth integer: depth there is
--     the tree, and `kind` is the member's own word. This column is on the
--     SOURCE section, describes the arriving heading, and is the mechanical
--     evidence from which an `origin = 'imported'` unit tree may later be
--     built — by a member act that shows them the whole of it first. It does
--     not impose Part/Chapter/Section on any Work.
--
-- Authority: docs/programme/WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md

BEGIN;

ALTER TABLE manuscript_sections
  ADD COLUMN IF NOT EXISTS heading_depth smallint
    CHECK (heading_depth IS NULL OR heading_depth BETWEEN 1 AND 3);

ALTER TABLE manuscript_sections
  ADD COLUMN IF NOT EXISTS heading_signal text
    CHECK (heading_signal IS NULL OR heading_signal IN ('markdown', 'chapter', 'caps', 'member'));

-- A section without a heading has nothing to classify. Enforced so the
-- columns cannot drift into describing a heading that is not there.
ALTER TABLE manuscript_sections
  DROP CONSTRAINT IF EXISTS manuscript_sections_depth_requires_heading;
ALTER TABLE manuscript_sections
  ADD CONSTRAINT manuscript_sections_depth_requires_heading
    CHECK (heading IS NOT NULL OR (heading_depth IS NULL AND heading_signal IS NULL));

COMMENT ON COLUMN manuscript_sections.heading_depth IS
  'WS2-08A. Depth the document itself gave this heading: 1..3 from `#` marks / Word Heading 1-3 / "Chapter N" wording. NULL = unclassified (ALL-CAPS boundary, member cut, or pre-migration row). Never guessed.';
COMMENT ON COLUMN manuscript_sections.heading_signal IS
  'WS2-08A. The DECISIVE classifier for heading_depth, by fixed precedence markdown > chapter > caps (member = a cut the member drew at confirm). One value, not exhaustive provenance: "# CHAPTER ONE" carries all three signals and records markdown. Other signals present are re-derivable from the verbatim heading.';

COMMIT;

-- ROLLBACK (manual):
--   Both columns are additive and referenced by nothing that cannot read NULL.
--
--   ALTER TABLE manuscript_sections DROP CONSTRAINT IF EXISTS manuscript_sections_depth_requires_heading;
--   ALTER TABLE manuscript_sections DROP COLUMN IF EXISTS heading_signal;
--   ALTER TABLE manuscript_sections DROP COLUMN IF EXISTS heading_depth;
