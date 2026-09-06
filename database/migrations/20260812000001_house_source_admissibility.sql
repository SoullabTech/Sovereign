-- Migration: house_source_admissibility
-- Constitutional function: STRUCTURAL — explicit, founder-authored admission of house/platform
--   wisdom sources into member-facing compositional use.
-- Spec: docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md
-- Proofs: docs/architecture/WISDOM_CORPUS_D4_RATIFICATION_PROOF_2026-08-11.md (§3, §7)
--         docs/architecture/WISDOM_CORPUS_D3_PROVENANCE_AUDIT_2026-08-11.md
-- Depends on: library_sources (20260130000001), members (20260103000001)
--
-- WHY A SEPARATE TABLE, NOT A COLUMN ON library_sources:
--   library_sources.review_status is already doctrine-bound to PRACTITIONER
--   ratification (20260714000001: "Only ratified material may compose into MAIA
--   context. Only the practitioner's gesture ratifies"). D4 proved that gate is
--   UNSATISFIABLE for house corpus rows — they have no practitioner owner, so no
--   actor in the system can ratify them. Reusing that column would collapse two
--   different governance systems into one field. This table is the house-side
--   authority; review_status is untouched and remains practitioner-side.
--
-- ADMISSION IDENTITY (founder ruling 2026-08-11):
--   source_id + source_checksum + scope + latest append-only judgment
--   => admission is SOURCE-VERSION-SPECIFIC and PURPOSE-SPECIFIC.
--
-- CHECKSUM BINDING IS STRUCTURAL, NOT PROCEDURAL:
--   The read gate joins a.source_checksum = s.checksum. If a source's content
--   changes, its checksum changes, the join fails, and the prior admission goes
--   inert BY ITSELF — no sweep job, no operator memory. 'superseded' is a
--   recorded observation for the review queue, never the load-bearing mechanism.
--
-- Idempotent per migration-ledger discipline (database/migrations/README.md).

-- ─────────────────────────────────────────────────────────────────────────────
-- Prereq guard: this migration is meaningless without library_sources.checksum.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'library_sources' AND column_name = 'checksum'
  ) THEN
    RAISE EXCEPTION 'house_source_admissibility requires library_sources.checksum (migration 20260130000001)';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS library_source_admissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The artifact this judgment is about. RESTRICT: a source carrying an
  -- admission history may not be silently deleted out from under it.
  source_id           UUID NOT NULL REFERENCES library_sources(id) ON DELETE RESTRICT,

  -- The EXACT content version admitted. Not decorative: the read gate joins on
  -- this against library_sources.checksum.
  source_checksum     TEXT NOT NULL,

  admissibility_state TEXT NOT NULL
                        CHECK (admissibility_state IN ('unreviewed', 'admitted', 'excluded', 'superseded')),

  -- Session-derived at the writer. Never accepted from request input.
  admitted_by         UUID REFERENCES members(id),
  admitted_at         TIMESTAMPTZ,

  -- Required in EVERY state, including 'excluded'. A judgment without a stated
  -- reason is not a judgment.
  admission_basis     TEXT NOT NULL CHECK (length(btrim(admission_basis)) > 0),

  -- ADMISSION IDENTITY beats SOURCE METADATA (founder ruling 2026-08-11).
  -- What the admitting human says this artifact IS — never defaulted from
  -- library_sources.title/.author, which D3 measured as unreliable (68% of Books
  -- authors implausible; titles H1-derived, which is how a conversation
  -- transcript came to be titled like a book).
  admitted_title      TEXT,
  admitted_author     TEXT,

  -- PURPOSE-SPECIFIC. Single-value CHECK is deliberate: adding a scope requires
  -- a new migration, so widening the vocabulary is a governed act rather than a
  -- convention someone has to remember.
  scope               TEXT NOT NULL DEFAULT 'member_wisdom_retrieval'
                        CHECK (scope IN ('member_wisdom_retrieval')),

  -- ADMITTED != ANY OUTPUT USE PERMITTED. Admission says MAIA may consult the
  -- source; this says what she may do with what she finds. Default is the most
  -- restrictive value so a row created without a deliberate choice fails safe.
  -- 'unrestricted' means broad permission WITHIN the admitted scope — it does
  -- NOT mean public domain, relinquished copyright, transferred ownership, or
  -- third-party licensing.
  use_constraint      TEXT NOT NULL DEFAULT 'synthesis_only'
                        CHECK (use_constraint IN ('synthesis_only', 'synthesis_and_short_quote', 'unrestricted')),

  -- Per-source revision, 1-based. Append-only: the current judgment is the
  -- highest version for (source_id, scope). Nothing is ever UPDATEd or DELETEd,
  -- so an admission and a later reversal both stay permanently legible.
  version             INT NOT NULL CHECK (version >= 1),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- An admission cannot exist without a named human and a time.
  CONSTRAINT library_source_admissions_admitted_requires_actor
    CHECK (admissibility_state <> 'admitted' OR (admitted_by IS NOT NULL AND admitted_at IS NOT NULL)),

  UNIQUE (source_id, scope, version)
);

-- The read gate's access path.
CREATE INDEX IF NOT EXISTS idx_library_source_admissions_gate
  ON library_source_admissions (source_id, source_checksum)
  WHERE admissibility_state = 'admitted';

CREATE INDEX IF NOT EXISTS idx_library_source_admissions_source_scope
  ON library_source_admissions (source_id, scope, version DESC);

COMMENT ON TABLE library_source_admissions IS
  'House/platform source admission record. Append-only judgment history; current state = '
  'highest version per (source_id, scope). Admission identity is source_id + source_checksum '
  '+ scope + latest judgment: source-version-specific AND purpose-specific. Separate from '
  'library_sources.review_status, which is the practitioner ratification lifecycle and is '
  'unsatisfiable for house rows (see D4 proof). Only a founder gesture writes here; no '
  'automated process may advance a source into admitted state.';

COMMENT ON COLUMN library_source_admissions.source_checksum IS
  'The exact content version admitted. The read gate joins this against library_sources.checksum, '
  'so a content change makes the prior admission inert automatically — no cleanup job required.';

COMMENT ON COLUMN library_source_admissions.use_constraint IS
  'What MAIA may DO with an admitted source. synthesis_only (default, fail-safe) | '
  'synthesis_and_short_quote | unrestricted. "unrestricted" = broad permission within the '
  'admitted scope ONLY; it does NOT mean public domain, relinquished copyright, transferred '
  'ownership, or third-party licensing. Author retains copyright in full.';

COMMENT ON COLUMN library_source_admissions.admitted_title IS
  'The admitting human''s naming of the artifact. Governs over library_sources.title for all '
  'member-facing attribution. Never defaulted from importer metadata.';

-- Post-create shape check (self-protecting, per migration conventions).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'library_source_admissions' AND column_name = 'source_checksum'
  ) THEN
    RAISE EXCEPTION 'library_source_admissions.source_checksum missing after create';
  END IF;
END $$;
