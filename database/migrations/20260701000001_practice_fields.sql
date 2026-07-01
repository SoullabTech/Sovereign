-- Migration: practice_fields
-- Constitutional function: STRUCTURAL — practitioner-authored expression layer
-- Spec: docs/specs/PRACTICE_FIELD_SPEC.md
-- Depends on: relationship_spaces (20260630000008_member_relationships.sql)
--
-- A Practice Field is not MAIA configuration. It is practitioner-authored context.
-- MAIA receives it as context, not as instructions.
--
-- Two parts:
--   Stable Field — formation-snapshotted when a Relationship Space is created
--   Active Field — never snapshotted; always current; pushes to all active spaces
--
-- Four layers (beta implements 1+2; 3 optional; 4 deferred):
--   1. Identity    — who the practitioner is (rarely changes)
--   2. Relationship — how they work with people (formation-snapshotted)
--   3. Practice    — actual craft; resources (evolves freely)
--   4. Adaptive Guidance — practice preferences for MAIA (deferred, not in beta)
--
-- PENDING → LIVE requires: welcome_message + how_we_work_together +
--   how_maia_supports + professional_practice + orientation_style set.

CREATE TABLE IF NOT EXISTS practice_fields (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_member_id    UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- Layer 1: Identity (Stable, rarely changes)
  welcome_message           TEXT,
  welcome_video_url         TEXT,
  about_practice            TEXT,       -- free text: modality, approach, philosophy

  -- Layer 2: Relationship (Stable, formation-snapshotted per FORMATION_AS_RECORD)
  how_we_work_together      TEXT,       -- practitioner ↔ client relational agreement
  how_maia_supports         TEXT,       -- client ↔ MAIA relationship within this work
  professional_practice     TEXT,       -- jurisdictional declarations (required for LIVE)

  -- Layer 2: Threshold style (how new clients first arrive)
  orientation_style         TEXT NOT NULL DEFAULT 'guided'
                              CHECK (orientation_style IN ('minimal', 'guided', 'relationship_first', 'tour')),

  -- Layer 3: Practice resources (optional for LIVE; MAIA surfaces contextually)
  resources                 JSONB NOT NULL DEFAULT '[]',
  -- Resource item shape: { id, title, type ('text'|'url'|'file'), content, url, note }

  -- Active Field (never snapshotted; present-moment practitioner emphasis)
  -- Changes weekly/seasonally; pushes to all active Relationship Spaces immediately
  active_field_content      TEXT,
  active_field_updated_at   TIMESTAMPTZ,

  -- Verification state (LIVE/WARNING/PENDING)
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'warning', 'live')),
  status_reason             TEXT,       -- human-readable reason for WARNING or PENDING

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One Practice Field per member in beta (one-to-one for now)
CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_fields_member
  ON practice_fields(practitioner_member_id);

CREATE INDEX IF NOT EXISTS idx_practice_fields_status
  ON practice_fields(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SNAPSHOTS
-- Immutable formation record: created when a Relationship Space is created.
-- The Stable Field declared conditions are copied here and never change.
-- Subsequent Practice Field edits create new snapshots only for new relationships.
-- Per FORMATION_AS_RECORD.md: existing relationships keep their formation version.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practice_field_snapshots (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_field_id       UUID NOT NULL REFERENCES practice_fields(id) ON DELETE RESTRICT,
  space_id                UUID NOT NULL REFERENCES relationship_spaces(id) ON DELETE CASCADE,

  -- Stable Field snapshot (Layer 1 + Layer 2 at time of relationship formation)
  welcome_message         TEXT,
  about_practice          TEXT,
  how_we_work_together    TEXT,
  how_maia_supports       TEXT,
  professional_practice   TEXT,
  orientation_style       TEXT,
  resources               JSONB NOT NULL DEFAULT '[]',
  field_status            TEXT NOT NULL,

  snapshotted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One snapshot per relationship space (formation record is singular)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pf_snapshots_space
  ON practice_field_snapshots(space_id);

CREATE INDEX IF NOT EXISTS idx_pf_snapshots_field
  ON practice_field_snapshots(practice_field_id);

DROP TRIGGER IF EXISTS update_practice_fields_updated_at ON practice_fields;
CREATE TRIGGER update_practice_fields_updated_at
  BEFORE UPDATE ON practice_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE practice_fields IS
  'Practitioner-authored expression layer. MAIA receives this as context, not instructions. '
  'Constitutional behavior is invariant across all Practice Fields. '
  'Spec: docs/specs/PRACTICE_FIELD_SPEC.md';

COMMENT ON TABLE practice_field_snapshots IS
  'Immutable formation record per Relationship Space. '
  'The declared conditions at the moment of relationship creation. '
  'Existing relationships keep their formation version per FORMATION_AS_RECORD. '
  'Later Practice Field edits do not retroactively alter existing spaces.';
