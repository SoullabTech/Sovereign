-- WS2-04A — Section-Addressable Working Draft (substrate only)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--
--   - ADDITIVE. No existing row is read, moved or rewritten by this migration.
--     No draft is converted here. Conversion is a service call, invoked per
--     draft, and deliberately NOT run against production yet: the current
--     writing UI still edits one continuous string, so seeding sections before
--     the section-aware WRITE path exists would create exactly the two
--     writable truths this unit exists to eliminate.
--
--   - A SECTION IS A SLICE, NOT A COPY. section.text holds every character
--     assigned to that section, verbatim. Concatenating the sections of a
--     draft in position order reproduces the draft exactly — no separator is
--     added on the way out, because any separator would be a character the
--     member did not write. Making a draft navigable is a REPRESENTATION
--     change; the writer's characters must survive it byte for byte.
--
--   - THAT IS ENFORCED HERE, NOT ONLY IN CODE. Once a draft is
--     section-addressable, content must always equal the flattening of its
--     sections. The deferred constraint trigger below checks it at COMMIT, so
--     a write to either representation that leaves them disagreeing aborts the
--     transaction. Drift between the two is not a bug to detect later; it
--     cannot be committed.
--
--     Checking at COMMIT rather than per-statement is what lets a legitimate
--     edit touch sections and content in either order within one transaction.
--
--     The comparison is on bytea, via convert_to(..., 'UTF8'), NOT on text.
--     Text '=' depends on the column's collation, and PostgreSQL permits
--     NONDETERMINISTIC collations under which different byte sequences compare
--     equal. This invariant claims byte-for-byte regardless of environment, so
--     it must not be able to become false by a collation change no one
--     connected to a member's manuscript.
--
--   - SOURCE STAYS IMMUTABLE. source_section_id is provenance — which Source
--     section this boundary came from — and nothing more. It is nullable and
--     ON DELETE SET NULL: losing the provenance link must never cascade into
--     deleting a member's words. Source establishes which boundaries exist;
--     the member's current draft supplies the characters.
--
--   - NO INTERPRETIVE COLUMNS. No title, summary, topic, or ordering hint the
--     member did not write. A section knows where it starts, what it holds,
--     and where it came from.
--
-- Authority: docs/design/writer-studio/WS2-04A_SECTION_ADDRESSABLE_DRAFT.md
--            (authority table; the round-trip invariant)

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_draft_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
  position int NOT NULL CHECK (position >= 0),
  -- Every character assigned to this section, exactly. May be empty: an empty
  -- section is a real position in the document, and dropping it would change
  -- the flattening.
  text text NOT NULL,
  -- Provenance only. Nullable by design; never a source of text.
  source_section_id uuid REFERENCES manuscript_sections(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (draft_id, position)
);

CREATE INDEX IF NOT EXISTS idx_manuscript_draft_sections_draft
  ON manuscript_draft_sections(draft_id, position);

-- When this is set, the draft's sections are authoritative for navigation and
-- content is their flattening. NULL means the draft has never been converted,
-- which is every production draft today.
ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS section_addressable_at timestamptz;

-- The draft version the conversion partitioned. Records which exact state the
-- round trip was proven against, so a later question about the conversion is
-- answered by provenance rather than by re-deriving it.
ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS section_conversion_version bigint;

COMMENT ON COLUMN manuscript_working_drafts.section_addressable_at IS
  'Set when the draft was converted to sections. While set, content must equal the flattening of manuscript_draft_sections (enforced by deferred trigger).';
COMMENT ON COLUMN manuscript_working_drafts.section_conversion_version IS
  'The manuscript_working_drafts.version that the conversion partitioned and proved the round trip against.';

-- ── The round-trip invariant, enforced by the database ────────────────────
--
-- Deliberately compares raw text. No trim, no whitespace normalisation, no
-- collation-dependent comparison: '=' on text is byte equality here, and
-- "close enough" is exactly the failure mode this exists to prevent.
CREATE OR REPLACE FUNCTION manuscript_draft_sections_round_trip()
RETURNS TRIGGER AS $$
DECLARE
  target_draft uuid;
  draft_content text;
  addressable timestamptz;
  flattened text;
BEGIN
  target_draft := COALESCE(NEW.draft_id, OLD.draft_id);

  SELECT d.content, d.section_addressable_at
    INTO draft_content, addressable
    FROM manuscript_working_drafts d
   WHERE d.id = target_draft;

  -- The draft row may be gone (manuscript deletion cascade). Nothing to check:
  -- member deletion sovereignty outranks this invariant, as it does the
  -- append-only guarantee on working_draft_revisions.
  IF NOT FOUND OR addressable IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
    INTO flattened
    FROM manuscript_draft_sections s
   WHERE s.draft_id = target_draft;

  IF convert_to(flattened, 'UTF8') IS DISTINCT FROM convert_to(draft_content, 'UTF8') THEN
    RAISE EXCEPTION
      'draft % is section-addressable but its sections do not flatten to its content (sections % chars, content % chars)',
      target_draft, length(flattened), length(draft_content);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_draft_sections_round_trip_check ON manuscript_draft_sections;
CREATE CONSTRAINT TRIGGER manuscript_draft_sections_round_trip_check
  AFTER INSERT OR UPDATE OR DELETE ON manuscript_draft_sections
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION manuscript_draft_sections_round_trip();

-- The same invariant from the other side: a content write on an addressable
-- draft must leave it equal to the flattening.
CREATE OR REPLACE FUNCTION manuscript_working_drafts_round_trip()
RETURNS TRIGGER AS $$
DECLARE
  flattened text;
BEGIN
  IF NEW.section_addressable_at IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
    INTO flattened
    FROM manuscript_draft_sections s
   WHERE s.draft_id = NEW.id;

  IF convert_to(flattened, 'UTF8') IS DISTINCT FROM convert_to(NEW.content, 'UTF8') THEN
    RAISE EXCEPTION
      'draft % is section-addressable: content must equal the flattening of its sections (sections % chars, content % chars)',
      NEW.id, length(flattened), length(NEW.content);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_working_drafts_round_trip_check ON manuscript_working_drafts;
CREATE CONSTRAINT TRIGGER manuscript_working_drafts_round_trip_check
  AFTER INSERT OR UPDATE ON manuscript_working_drafts
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION manuscript_working_drafts_round_trip();

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS manuscript_working_drafts_round_trip_check ON manuscript_working_drafts;
--   DROP FUNCTION IF EXISTS manuscript_working_drafts_round_trip();
--   DROP TRIGGER IF EXISTS manuscript_draft_sections_round_trip_check ON manuscript_draft_sections;
--   DROP FUNCTION IF EXISTS manuscript_draft_sections_round_trip();
--   ALTER TABLE manuscript_working_drafts DROP COLUMN IF EXISTS section_conversion_version;
--   ALTER TABLE manuscript_working_drafts DROP COLUMN IF EXISTS section_addressable_at;
--   DROP TABLE IF EXISTS manuscript_draft_sections;
