-- Migration: practitioner_sources
-- Constitutional function: PROVENANCE — the source record from which
-- composition authority is later derived. Creation is a DISCOVERY act, not an
-- authorization act (spec §1.1).
-- Spec: docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md Part 1
--
-- Governing principle: "Attachment A is not a description of permissions. It
-- is the signed source record from which permissions are derived." This
-- table is the PractitionerSource half of that record. The
-- AttachmentAPermission half (Part 1.2) and the retrieval boundary (Part 3)
-- are NOT authorized by this migration and are not built here.
--
-- Two axes that must never merge (spec §1.1 "Author identity ⊥ source
-- relationship"):
--   origin_*                  — WHO made the artifact
--   source_relationship_*     — WHAT relationship it claims to its sources,
--                                and WHETHER that claim has been confirmed
--
-- `source_relationship_state` defaults to 'unknown' — an absence, never a
-- category, and never inferred. Only a human act (a practitioner or the
-- named source practitioner) may move it to 'asserted' or 'validated'.
-- 'unknown' and 'asserted' both block composition; only 'validated' is
-- eligible, and `validated_by` must be the SOURCE practitioner, never the
-- composer of the derived work (enforced at the compiler layer, not here —
-- SQL cannot verify identity-of-role).
--
-- Larry is not the exception here — he is the first proof case. This table
-- carries any practitioner's provenance, not a Larry-specific shape.

CREATE TABLE IF NOT EXISTS practitioner_sources (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_field_id           UUID NOT NULL REFERENCES practice_fields(id) ON DELETE RESTRICT,
  title                           TEXT NOT NULL,

  source_type                     TEXT NOT NULL
                                     CHECK (source_type IN (
                                       'authored_framework',
                                       'teaching',
                                       'exercise',
                                       'recording',
                                       'transcript',
                                       'selected_lineage',       -- the practitioner's SELECTION, not the text
                                       'third_party_reference',
                                       'derived_summary'         -- Soullab- or system-produced from a source
                                     )),

  -- ── origin — WHO made the artifact. NOT assumed to be the practitioner. ──
  origin_creator                  TEXT,
  origin_contributor              TEXT,
  origin_received_from            TEXT,
  origin_date                     TIMESTAMPTZ,

  -- ── source_relationship — WHAT this artifact claims to its sources, and ──
  -- ── whether that claim has been confirmed. Independent of origin_*.     ──
  source_relationship_state       TEXT NOT NULL DEFAULT 'unknown'
                                     CHECK (source_relationship_state IN ('unknown', 'asserted', 'validated')),

  source_relationship_kind        TEXT
                                     CHECK (source_relationship_kind IS NULL OR source_relationship_kind IN (
                                       'primary',                -- the practitioner's own authoring act
                                       'derived_from_primary',   -- composed from named primary sources
                                       'interpretation',         -- a reading OF the work, not a derivation FROM it
                                       'selection'                -- the practitioner chose it; text is someone else's
                                     )),

  -- REQUIRED and non-empty when kind is 'derived_from_primary'; each id must
  -- resolve to a row with kind='primary' — enforced at the compiler layer
  -- (lib/practiceField/sourceAuthority.ts), not here, since SQL cannot walk
  -- the resolution chain against `status`/other rows inside a CHECK.
  derived_from                    UUID[] NOT NULL DEFAULT '{}',

  -- Required when state = 'validated'. Must be the SOURCE practitioner, not
  -- the composer of the derived work — identity-of-role is a compiler-layer
  -- concern; this column only records who signed.
  validated_by                    UUID REFERENCES members(id) ON DELETE RESTRICT,
  validated_at                    TIMESTAMPTZ,

  -- Rendered FROM the structured fields above, never authored free-hand
  -- alongside them (spec §1.1) — otherwise the prose and the record can
  -- disagree, which is exactly how the 2026-08-03 incident happened.
  claim_text                      TEXT,

  -- ── custody ──────────────────────────────────────────────────────────────
  custody_owner                   TEXT,
  custody_rights_status           TEXT,
  custody_agreement_reference     TEXT,        -- which signed instrument covers this

  -- ── lifecycle ────────────────────────────────────────────────────────────
  status                          TEXT NOT NULL DEFAULT 'discovered'
                                     CHECK (status IN ('discovered', 'reviewed', 'ratified', 'rejected')),

  content_ref                     TEXT,        -- pointer; may be null for lineage-only rows
  version                         INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ── Type integrity rule (spec §1.1) ────────────────────────────────────
  -- `selected_lineage` and `third_party_reference` may not carry retrievable
  -- content. A Harvard slide deck and a practitioner's own worksheet can
  -- both be rows here; they can never be the same KIND of row. Any migration
  -- path that would let a `third_party_reference` acquire retrievable
  -- content is prohibited — enforced here, not just documented.
  CONSTRAINT practitioner_sources_no_retrievable_content_for_reference_kinds
    CHECK (
      source_type NOT IN ('selected_lineage', 'third_party_reference')
      OR content_ref IS NULL
    ),

  -- `validated` requires the confirming act to be recorded — validated_by
  -- and validated_at must both be present.
  CONSTRAINT practitioner_sources_validated_requires_validator
    CHECK (
      source_relationship_state <> 'validated'
      OR (validated_by IS NOT NULL AND validated_at IS NOT NULL)
    ),

  -- `kind` is required once a relationship claim exists at all (state != 'unknown').
  CONSTRAINT practitioner_sources_kind_required_unless_unknown
    CHECK (
      source_relationship_state = 'unknown'
      OR source_relationship_kind IS NOT NULL
    ),

  -- `derived_from` must be non-empty when kind = 'derived_from_primary'.
  CONSTRAINT practitioner_sources_derived_from_required
    CHECK (
      source_relationship_kind IS DISTINCT FROM 'derived_from_primary'
      OR array_length(derived_from, 1) > 0
    )
);

CREATE INDEX IF NOT EXISTS idx_practitioner_sources_field
  ON practitioner_sources(practitioner_field_id);

CREATE INDEX IF NOT EXISTS idx_practitioner_sources_status
  ON practitioner_sources(status);

CREATE INDEX IF NOT EXISTS idx_practitioner_sources_relationship_state
  ON practitioner_sources(source_relationship_state);

-- GIN index to support "does X appear in some row's derived_from" resolution
-- lookups the compiler layer will need.
CREATE INDEX IF NOT EXISTS idx_practitioner_sources_derived_from
  ON practitioner_sources USING GIN (derived_from);

DROP TRIGGER IF EXISTS update_practitioner_sources_updated_at ON practitioner_sources;
CREATE TRIGGER update_practitioner_sources_updated_at
  BEFORE UPDATE ON practitioner_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE practitioner_sources IS
  'PractitionerSource — the provenance record for an item entering a practitioner field. '
  'Creation is a discovery act, not an authorization act. Composability is derived by '
  'lib/practiceField/sourceAuthority.ts, never read directly off this table by callers. '
  'Spec: docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md Part 1.';

COMMENT ON COLUMN practitioner_sources.source_relationship_state IS
  'unknown = absence of a claim (default, never chosen); asserted = a relationship was '
  'recorded but the source practitioner has not confirmed it; validated = the SOURCE '
  'practitioner confirmed it. unknown and asserted both block composition.';

COMMENT ON COLUMN practitioner_sources.derived_from IS
  'Source ids this row claims composition from. Required + non-empty when '
  'source_relationship_kind = derived_from_primary. Each must resolve to a '
  'kind=primary row for the row to compose — resolution is a compiler-layer check.';

COMMENT ON COLUMN practitioner_sources.status IS
  'Lifecycle: discovered -> reviewed -> ratified | rejected. Only ratified rows are '
  'eligible for the compiler''s composability check, and only jointly with '
  'source_relationship_state = validated.';
