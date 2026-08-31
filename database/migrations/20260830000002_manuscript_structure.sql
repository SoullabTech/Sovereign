-- WS2-05A — Authorial Structure (tables only)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--
--   - STRUCTURE IS AN AUTHORED LAYER OVER THE DRAFT, NOT A REPARTITION OF IT.
--     Nothing here holds a character of the member's text. A structural unit
--     knows its place in a tree, what the member calls it, and who authored
--     it. Everything it "contains" it contains by reference.
--
--   - STRUCTURE BELONGS TO THE MANUSCRIPT, NOT THE DRAFT. "This book has three
--     movements" is a durable authorial statement. Hanging it off
--     manuscript_working_drafts would make it contingent on a particular
--     technical representation of the text, which is the wrong direction of
--     authority. So: units -> member_manuscripts. Membership -> the current
--     draft's sections, which is where that meaning presently lands.
--
--       structure unit  = durable authorial meaning
--       membership      = where that meaning currently lands in this draft
--       draft section   = current persistence boundary
--
--   - DRAFT REPLACEMENT IS RULED BUT NOT BUILT. A new working draft may never
--     silently inherit old membership. Because membership FKs the draft's
--     sections with ON DELETE CASCADE, replacing a draft drops the memberships
--     and leaves the unit tree standing with its sections unplaced — which is
--     the visible-unresolved outcome the ruling requires, reached structurally
--     rather than by a remapping routine no one has written. Any future remap
--     must be mechanical and proved. No fuzzy matching, no title matching, no
--     positional guessing, no "probably the same chapter."
--
--   - MEMBERSHIP IS DIRECT LEAF PLACEMENT. A draft section joins the LOWEST
--     authored unit containing it, and no other. Part membership is derived by
--     walking parent_id. Joining a section to both its Chapter and its Part
--     would create two competing representations of the same hierarchy, and
--     they would disagree the first time one was edited.
--
--   - NO INTERPRETIVE COLUMNS, same rule as 20260830000001. `kind` and `title`
--     exist because the MEMBER writes them. There is no summary, no topic, no
--     word target, no depth integer. Depth is the tree; a `level` column would
--     impose Part/Chapter/Section on books that have neither.
--
--   - `kind` IS FREE TEXT, DELIBERATELY NOT AN ENUM. "Chapter", "Part",
--     "Interlude", "Movement", "Station" — the vocabulary for how a Work
--     divides belongs to the Work, not to this schema (Sovereignty Invariant
--     14). An enum here would be this project telling a writer what kinds of
--     divisions a book is allowed to have.
--
--   - THE ZERO-CHARACTER PROPERTY. Every statement in this file is additive
--     and touches no existing row. No structure operation can change the
--     flattening of manuscript_draft_sections, because no structure table
--     holds text and no foreign key from here writes there. That is the whole
--     safety argument, and it is a consequence of the shape rather than a
--     promise about behaviour.
--
-- Authority: docs/design/writer-studio/WS2-05_MANUSCRIPT_STRUCTURE_AUTHORITY.md
--            (rulings of 2026-08-30; 05A authorized, 05B not)

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_structure_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  -- NULL = top level. A unit's parent must belong to the same manuscript;
  -- enforced in the service, since a composite FK would require carrying
  -- manuscript_id redundantly on every row.
  parent_id uuid REFERENCES manuscript_structure_units(id) ON DELETE CASCADE,
  -- Order among siblings. Contiguous from 0 within a parent; the service
  -- renumbers on insert, move and delete.
  position int NOT NULL CHECK (position >= 0),
  -- The member's own word for this kind of division. Free text by design.
  kind text CHECK (kind IS NULL OR length(trim(kind)) > 0),
  -- What the member calls this one.
  title text CHECK (title IS NULL OR length(trim(title)) > 0),
  -- Who authored this unit. 'proposed' rows are 05B and cannot render as the
  -- Work's structure; the CHECK admits the value now so that adopting a
  -- proposal later is an INSERT with provenance rather than a migration.
  origin text NOT NULL DEFAULT 'member'
    CHECK (origin IN ('member', 'imported', 'proposed')),
  -- Set when a member adopted a proposal. Keeps the fact that MAIA proposed it
  -- AND that the member accepted: provenance survives the act.
  adopted_from_id uuid REFERENCES manuscript_structure_units(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- A unit is never its own parent. Deeper cycles are refused by the service,
  -- which walks the ancestry before reparenting.
  CONSTRAINT manuscript_structure_units_not_self_parent CHECK (parent_id IS DISTINCT FROM id)
);

-- Deliberately NOT UNIQUE on (parent_id, position).
--
-- Two reasons, and the first is the important one. Top-level units have
-- parent_id IS NULL, and a UNIQUE constraint treats NULLs as distinct — so
-- UNIQUE (parent_id, position) would silently fail to constrain exactly the
-- rows a reader would assume it covered. An invariant that looks enforced and
-- is not is worse than none. Second: renumbering a sibling list passes through
-- transient duplicates unless the constraint is deferred, and buying a
-- deferral for an invariant that is already half-absent is not worth it.
-- Sibling order is renumbered 0..n-1 by the service on every insert, move and
-- delete, and that is where the ordering is made true.
CREATE INDEX IF NOT EXISTS idx_manuscript_structure_units_manuscript
  ON manuscript_structure_units(manuscript_id, parent_id, position);

-- Direct leaf placement. UNIQUE(draft_section_id) is what makes "one authored
-- home per writing section" true in the database rather than in a convention.
CREATE TABLE IF NOT EXISTS manuscript_structure_members (
  unit_id uuid NOT NULL REFERENCES manuscript_structure_units(id) ON DELETE CASCADE,
  draft_section_id uuid NOT NULL UNIQUE
    REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
  PRIMARY KEY (unit_id, draft_section_id)
);

CREATE INDEX IF NOT EXISTS idx_manuscript_structure_members_unit
  ON manuscript_structure_members(unit_id);

COMMENT ON TABLE manuscript_structure_units IS
  'WS2-05A. How the member says this Work is divided. Holds no text: a unit contains sections by reference only. Belongs to the manuscript, not the draft.';
COMMENT ON COLUMN manuscript_structure_units.kind IS
  'The member''s own word for this kind of division. Free text, never an enum: the vocabulary belongs to the Work.';
COMMENT ON COLUMN manuscript_structure_units.origin IS
  'member | imported (mechanically proved at ingest) | proposed (05B; never rendered as the Work''s structure).';
COMMENT ON TABLE manuscript_structure_members IS
  'WS2-05A. Direct leaf placement: a draft section joins the LOWEST authored unit containing it. Ancestor membership is derived through parent_id, never joined twice.';

COMMIT;

-- ROLLBACK (manual):
--   Both tables are additive and referenced by nothing. Dropping them removes
--   the authored structure and touches no member text.
--
--   DROP TABLE IF EXISTS manuscript_structure_members;
--   DROP TABLE IF EXISTS manuscript_structure_units;
