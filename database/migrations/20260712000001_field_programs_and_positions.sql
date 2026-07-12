-- Migration: field_programs_and_positions
--
-- Combined build (v1 + catalog, one migration) per:
--   docs/specs/NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md  (v1: cohort default + member position)
--   docs/specs/NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10.md   (catalog: many programs, one position per engagement)
--
-- Authority split (constitutional, not schema convenience):
--   curriculum  = practitioner-authored (practice_fields / field_programs)
--   position    = the member locating themselves (field_program_positions)
-- Enrollment is declared by arrival, not administered by roster: a position row
-- exists only from a member's own gesture (or an explicit practitioner seed,
-- which composes as *assumed* until the member speaks). There is no enrollment
-- table, no roster, no departed-status graveyard — departure hard-deletes.
--
-- Idempotent per migration-ledger discipline.

-- ── Cohort default on the field itself (v1; the field-level door / catalog-of-one) ──

ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS current_focal_point TEXT;

ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS focal_point_set_at TIMESTAMPTZ;

COMMENT ON COLUMN practice_fields.current_focal_point IS
  'Practitioner-authored display name of the field''s current focus (e.g. ''Savoring & attention''). NULL = the field declares no focal point and the arrival line does not render. No fabrication from absence.';
COMMENT ON COLUMN practice_fields.focal_point_set_at IS
  'When current_focal_point was last written. Epistemic-footing anchor: a member confirmation older than this composes as assumed-from-last-known, never as confirmed-current.';

-- ── Catalog: programs are children of the field, not new fields ──
-- One field, one corpus, many programs drawing on it. focal_points is display
-- and orientation structure ONLY: MAIA never walks a member up it, never
-- computes "next level", never nudges advancement (probe P8d fences this).

CREATE TABLE IF NOT EXISTS field_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug VARCHAR(64) NOT NULL,            -- joins practice_fields.field_slug
  program_slug VARCHAR(64) NOT NULL,          -- door address, e.g. 'deep-dive-retreat'
  kind TEXT NOT NULL CHECK (kind IN ('coaching','training','workshop','course','retreat')),
  title TEXT NOT NULL,                        -- practitioner's display name
  focal_points JSONB NOT NULL DEFAULT '[]',   -- ordered array of the practitioner's
                                              -- level/stage names, verbatim
  current_focal_point TEXT,                   -- cohort default; NULL = arrival line
                                              -- does not render. No fabrication.
  focal_point_set_at TIMESTAMPTZ,             -- epistemic-footing anchor (see above)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (field_slug, program_slug)
);

COMMENT ON TABLE field_programs IS
  'Practitioner-authored catalog: each offering (coaching/training/workshop/course/retreat) as a child of its field. Orientation structure only — never routing, never advancement.';

-- ── Position: one row per member per engagement ──
-- Created directly in catalog shape (program_slug from day one); the v1
-- single-program room is the degenerate case program_slug = 'general'.
-- "Any/all" is rows, not state machines.

CREATE TABLE IF NOT EXISTS field_program_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug VARCHAR(64) NOT NULL,            -- joins practice_fields.field_slug
  program_slug VARCHAR(64) NOT NULL DEFAULT 'general',
  member_id UUID NOT NULL REFERENCES members(id),
  focal_point TEXT NOT NULL,                  -- the member's stated/confirmed position
  stated_by TEXT NOT NULL CHECK (stated_by IN ('member_confirmed','member_stated','practitioner_seeded')),
  member_confirmed_at TIMESTAMPTZ,            -- NULL until the member's own gesture
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (field_slug, program_slug, member_id)
);

COMMENT ON TABLE field_program_positions IS
  'Where a member has declared they stand in an engagement. Member-authored (or practitioner-seeded = assumed until the member speaks). Departure hard-deletes the row — closed = gone, no churn ledger. NO practitioner read of these rows, ever (catalog spec §8).';
COMMENT ON COLUMN field_program_positions.stated_by IS
  'member_confirmed = tapped yes on the cohort default · member_stated = corrected in their own words (verbatim) · practitioner_seeded = placed at enrollment, assumed until the member speaks.';
COMMENT ON COLUMN field_program_positions.member_confirmed_at IS
  'Epistemic state, not just a timestamp: NULL or older than the cohort default''s focal_point_set_at composes as assumed-from-last-known (ask, don''t assume).';

CREATE INDEX IF NOT EXISTS idx_field_program_positions_member
  ON field_program_positions(member_id, field_slug);
