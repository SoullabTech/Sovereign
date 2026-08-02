-- Correction 3 — Field Object Declaration from a capsule.
--
-- Governed by MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md Amendment 5 (canonical
-- 1e15f9c71): eligibility is not declaration. Nothing here declares anything;
-- this migration only makes a declared capsule *expressible* and makes a second
-- declaration of the same source *impossible*.
--
-- Two changes, both narrow:
--   1. 'capsule' joins the source_type vocabulary.
--   2. A member cannot hold two Field Objects declared from one source.
--
-- ⛔ NO BACKFILL. 12 capsules on production are already draft=false — i.e.
-- already *eligible*. Converting them would be exactly the automatic promotion
-- Amendment 5 forbids: eligibility is the condition for offering the gesture,
-- never the gesture itself. They stay undeclared until a member declares them.

BEGIN;

-- 1. source_type names the actual source object, not the family it resembles.
--
-- A reflection capsule is not "a reflection". Encoding it as one would erase
-- provenance and make the meaning of source_id depend on undocumented table
-- knowledge — a reader could not tell whether source_id pointed at a reflection
-- row or a capsule row. Ruled 2026-08-02.
--
-- Replace, never loosen: the column stays a closed vocabulary. All ten existing
-- values are preserved exactly and 'capsule' is added. Verified before writing
-- this migration: production holds only idea_block (104), idea (26) and
-- practitioner_observation (12); zero rows carry a value outside the ten.

-- Refuse rather than corrupt: if this environment holds a source_type outside
-- the vocabulary we are preserving, the ADD would fail anyway — fail here
-- instead, with a message that names the cause.
DO $$
DECLARE unexpected text;
BEGIN
  SELECT string_agg(DISTINCT source_type, ', ') INTO unexpected
  FROM member_memory_atoms
  WHERE source_type IS NOT NULL
    AND source_type NOT IN (
      'idea','idea_block','journal','dream','reflection',
      'decision','change','session_excerpt','spontaneous','practitioner_observation'
    );
  IF unexpected IS NOT NULL THEN
    RAISE EXCEPTION
      'Refusing to replace source_type CHECK: unexpected value(s) present: %. '
      'Rewriting the constraint would silently outlaw rows that already exist. '
      'Disposition of these values must be explicit before this migration runs.',
      unexpected;
  END IF;
END $$;

ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS member_memory_atoms_source_type_check;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT member_memory_atoms_source_type_check
  CHECK (source_type = ANY (ARRAY[
    'idea'::text,
    'idea_block'::text,
    'journal'::text,
    'dream'::text,
    'reflection'::text,
    'decision'::text,
    'change'::text,
    'session_excerpt'::text,
    'spontaneous'::text,
    'practitioner_observation'::text,
    'capsule'::text
  ]));

-- 2. Idempotency needs NO new index — one already exists.
--
-- `idx_memory_atoms_unique_source` is already present in production:
--
--   CREATE UNIQUE INDEX idx_memory_atoms_unique_source
--     ON member_memory_atoms (member_id, source_type, source_id)
--     WHERE source_id IS NOT NULL;
--
-- That is exactly the guarantee this correction needs, partial predicate and
-- all. An earlier draft of this migration created a second index with the same
-- definition under a different name — pure duplication, doubling write cost on
-- every atom to enforce a rule already enforced. It is not created here.
--
-- The gap was never the constraint. It was that keepSource() did a bare INSERT
-- against it, so a retry raised a unique violation instead of returning the
-- Field Object the member already declared. That is fixed in the service with
-- ON CONFLICT, which targets this existing index.
--
-- Recorded so the next reader does not re-add it: uniqueness on
-- (member_id, source_type, source_id) WHERE source_id IS NOT NULL is ALREADY
-- GUARANTEED. Verified on production 2026-08-02, alongside zero duplicate
-- groups and zero surplus rows.

COMMIT;
