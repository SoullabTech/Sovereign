-- Living Work — the Studio's governing object (Phase 2, Slice 1: schema only)
--
-- Ratified by the founder 2026-08-01. See
--   docs/architecture/LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md
--
--   "The Studio remains in relationship with a Living Work: a member-authored body
--    of material, inquiry, decisions, and expressions that may exist before any
--    single form and may give rise to many forms over time."
--
-- HOW THE FIVE GUARDS ARE STRUCTURAL HERE, not merely intended:
--
--   1. Nothing enters a Living Work without the member's declaration.
--      → living_work_expressions.declared_by is NOT NULL. A membership row cannot
--        exist without recording which member declared it. There is no trigger,
--        default, or backfill that creates one. Nothing is attached at migration
--        time: this migration inserts ZERO rows.
--
--   2. The Studio may notice what is gathering; it may not pronounce what the work
--      is becoming.
--      → There is no column for an inferred type, theme, summary, or status. A
--        Living Work carries only what a member wrote into it.
--
--   3. Observations remain distinct from interpretations.
--      → Nothing derived is stored here at all.
--
--   4. A manuscript remains a valid expression of a Living Work, not the governing
--      ontology.
--      → Membership points AT the expression. member_manuscripts is not altered and
--        gains no foreign key; a manuscript does not know it belongs to anything.
--        expression_type is open TEXT with no CHECK. This is intentional, not an
--        oversight: constraining it to today's implemented expressions would
--        reintroduce an artifact-first ontology through the back door. A workbook,
--        a course, a retreat and a framework are expressions whether or not the
--        Studio can yet hold them.
--
--   5. Existing R1 writing infrastructure is retained, not discarded.
--      → No existing table is modified. Drafts, revisions, sources and the Phase A
--        concurrency columns are untouched.
--
-- SCOPE: additive only. No data movement, no backfill, no manuscript mutation, no
-- automatic creation of Living Works. Nothing reads these tables yet.
--
-- ROLLBACK (reverse order; safe because nothing else references these):
--   DROP TABLE IF EXISTS living_work_expressions;
--   DROP TABLE IF EXISTS living_works;

CREATE TABLE IF NOT EXISTS living_works (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- The member's own words. Never generated, never inferred.
  title        TEXT NOT NULL,
  purpose      TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deliberately NOT unique per member. The ontology says a member may steward
-- multiple Living Works; an initial implementation may surface one without the
-- schema encoding that limit.
CREATE INDEX IF NOT EXISTS living_works_member_idx
  ON living_works (member_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS living_work_expressions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  living_work_id   UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  -- Open by design. See guard 4 above.
  expression_type  TEXT NOT NULL,
  expression_id    UUID NOT NULL,

  -- Guard 1, made structural: this row IS the member's declaration. It cannot be
  -- written without saying who declared it and when.
  declared_by      UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  declared_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One declaration per expression per work.
  --
  -- DELIBERATELY NOT unique on (expression_type, expression_id) alone. An
  -- expression MAY belong to more than one Living Work, because the ontology has
  -- not ruled exclusivity. This is preservation of optionality, not an omission.
  -- A relational constraint here would decide a constitutional question by
  -- accident. A future founder ruling may narrow it later with an additive
  -- UNIQUE index and no destructive migration.
  UNIQUE (living_work_id, expression_type, expression_id)
);

CREATE INDEX IF NOT EXISTS living_work_expressions_work_idx
  ON living_work_expressions (living_work_id, declared_at DESC);

CREATE INDEX IF NOT EXISTS living_work_expressions_lookup_idx
  ON living_work_expressions (expression_type, expression_id);

COMMENT ON TABLE living_works IS
  'The Studio''s governing object (ratified 2026-08-01). A member-authored body of work. Contains only what the member wrote — never an inferred type, theme, or summary.';
COMMENT ON TABLE living_work_expressions IS
  'A member''s declaration that an expression belongs to a Living Work. The row is the declaration; declared_by cannot be null. Nothing attaches automatically.';
COMMENT ON COLUMN living_work_expressions.expression_type IS
  'Open TEXT by design. Constraining it to today''s built types would re-narrow the ratified ontology.';
