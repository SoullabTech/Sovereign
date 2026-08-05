-- Living Work materials — the belonging record (Work Continuity Layer, first slice).
--
-- Ruled 2026-08-05 (founder): the smallest complete Work relationship loop.
-- Design: docs/design/author-studio/WORK_MATERIALS_GATHERING_DESIGN_2026-08-05.md
-- Paper walk: WORK_MATERIALS_PERSONA_PAPER_WALK_2026-08-05.md (M1–M7).
--
-- A material is a BELONGING, not a thing:
--   * a row here is a member's declaration that a thing FEEDS a Living Work;
--   * the thing itself keeps its home — nothing is copied, moved, or altered;
--   * removing a row removes the relationship, never the thing;
--   * the member's relationship sentence is the content, and it is OPTIONAL —
--     an unwritten sentence is a correct state (elder walk, M2), never a gap;
--   * belonging is many-to-many and re-declarable (M3): one thing may feed
--     several works, each by its own declaration, declared late or never.
--
-- Sibling of living_work_expressions — same declaration grammar, different
-- relationship: an expression IS A FORM OF the work; a material FEEDS it.
-- Deliberately two tables: collapsing feeds into is-a-form-of was refused in
-- the design ("one grammar for the relationship, not one table for everything").
--
-- material_type is open TEXT like expression_type — narrowing it to today's
-- types would re-narrow the ontology (see lib/livingWork/domain.ts).
-- The sentence is member-authored ONLY (NEVER_AUTHORED_BY_THE_SYSTEM applies:
-- no generated summaries, no inferred relationships — the crossing is the
-- consent event and the sentence is the member's voice at the crossing).

CREATE TABLE IF NOT EXISTS living_work_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  material_id TEXT NOT NULL,
  relationship_sentence TEXT,
  declared_by UUID NOT NULL,
  declared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (living_work_id, material_type, material_id)
);

CREATE INDEX IF NOT EXISTS living_work_materials_work_idx
  ON living_work_materials (living_work_id, declared_at DESC);
