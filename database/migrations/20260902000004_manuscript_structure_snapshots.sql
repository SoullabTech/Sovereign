-- WS2-07 · BUILD-07A · SEAM B — the immutable historical authored structure.
--
-- WHAT THIS ANSWERS. INV-7b requires that a superseded structure-dependent
-- observation can show the author the structure it ACTUALLY reasoned from.
-- Canonical structure is live mutable state: a rename or a move updates the
-- existing unit rows in place, and canonicalFingerprint() digests the CURRENT
-- units and memberships. It detects that structure moved; it cannot recover what
-- used to be there. There was no existing object to point at, so this adds one.
--
-- ⛔ WHY IT BELONGS TO THE MANUSCRIPT AND NOT TO A READING. The distinction is
-- the whole reason this is admissible under the custody ruling:
--
--     BAD   developmental_readings.structure_json
--           MAIA's subsystem has copied the author's declarations into its own
--           custody domain, with its own retention and deletion questions
--
--     GOOD  manuscript_structure_snapshots
--           the Work's own structure subsystem preserves its own exact
--           historical state; a reading stores a snapshot_id and nothing else
--
-- Same ownership root, same deletion cascade, no second developmental custody
-- domain. This is the structural counterpart of using working_draft_revisions
-- for prose rather than inventing a developmental prose-snapshot table.
--
-- ⛔ IT HOLDS NO MANUSCRIPT PROSE. Units and memberships only — a unit contains
-- sections BY REFERENCE, exactly as the live table does. A column here that ever
-- held the member's sentences would be the prose store that was rejected.
--
-- ⛔ AND NO DATABASE TRIVIA. What is frozen is the exact structural semantics a
-- developmental reader may reason from — id, parent, sibling position, kind,
-- title, and direct memberships — not every column the units table happens to
-- carry. Freezing implementation detail would make the snapshot's meaning drift
-- with the schema instead of with the Work.
--
-- ⛔ ONLY CANONICAL AUTHORED UNITS ENTER. A proposal id is a uuid like any other
-- and is NOT a unit; a unit the member authored FROM a proposal IS canonical,
-- because provenance records descent and does not demote authorship. That
-- distinction is proven against real rows by the falsifier-4 witness, and it is
-- enforced at capture rather than assumed here.
--
-- Authority: founder ruling 2026-09-02 — "manuscript-owned immutable structure
--            snapshot · RATIFY · exact, recoverable, scoped to the Work, no prose"

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_structure_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  -- Who caused this capture. RESTRICT, like every other authorship record: a
  -- member row must not vanish while what they authored still exists.
  captured_by uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  captured_at timestamptz NOT NULL DEFAULT now(),

  -- canonicalFingerprint() of the structure at capture. Kept for CURRENTNESS:
  -- it is what a later comparison uses to say the structure has moved. It is
  -- not, and cannot be, the recoverability mechanism — that is `snapshot`.
  fingerprint text NOT NULL CHECK (length(fingerprint) > 0),

  -- The exact authored structure, frozen:
  --   { "units":   [{ "id", "parentId", "position", "kind", "title" }, ...],
  --     "members": [{ "unitId", "draftSectionId" }, ...] }
  -- Ordered deterministically at capture so two identical structures freeze
  -- identically whatever order the planner returned rows in.
  snapshot jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_manuscript_structure_snapshots_manuscript
  ON manuscript_structure_snapshots(manuscript_id, captured_at DESC);

COMMENT ON TABLE manuscript_structure_snapshots IS
  'WS2-07 BUILD-07A. The Work''s own authored structure, frozen exactly as it stood, so a superseded structure-dependent observation can show the author what it reasoned from. Units and memberships by reference only — NEVER manuscript prose. Owned by the manuscript, deleted with it.';
COMMENT ON COLUMN manuscript_structure_snapshots.fingerprint IS
  'canonicalFingerprint() at capture. For currentness comparison; recoverability is the snapshot itself.';
COMMENT ON COLUMN manuscript_structure_snapshots.snapshot IS
  'Exact authored structure: units (id, parentId, position, kind, title) and direct memberships (unitId, draftSectionId). No prose, no schema trivia.';

-- ── IMMUTABLE, like every other frozen record in this substrate ────────────
--
-- A snapshot that could be rewritten would let the structure an observation
-- rested on change after the fact — which is the failure the whole object
-- exists to prevent, arriving from inside.
CREATE OR REPLACE FUNCTION manuscript_structure_snapshots_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'manuscript_structure_snapshots is append-only: snapshot % cannot be modified', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_structure_snapshots_no_update ON manuscript_structure_snapshots;
CREATE TRIGGER manuscript_structure_snapshots_no_update
  BEFORE UPDATE ON manuscript_structure_snapshots
  FOR EACH ROW EXECUTE FUNCTION manuscript_structure_snapshots_immutable();

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS manuscript_structure_snapshots_no_update ON manuscript_structure_snapshots;
--   DROP FUNCTION IF EXISTS manuscript_structure_snapshots_immutable();
--   DROP TABLE IF EXISTS manuscript_structure_snapshots;
