-- Shadow Field — dedicated atom source type (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P4).
--
-- Founder P4 ruling 2026-09-06, resolution 2: author the carrier properly.
--
-- Why a source_type and not the provenance JSONB. The Field's constitution (v0.2 §4)
-- requires an adopted item to carry a provenance tag naming the Field as origin. The
-- P4 stop established that `provenance` cannot carry it: the runtime loader's
-- SELECT_COLUMNS does not select that column, and its canon is "audit history, never
-- runtime identity", shaped for NON-member-authored practitioner attribution. Writing
-- member authorship there would make the record assert the opposite of what is true.
-- `source_type` already means "where this material originated before it was kept", is
-- already selected by the runtime loader, and is therefore the truthful carrier.
--
-- shadow_field = member-authored material explicitly kept from the Shadow Field.
--
-- Three changes, all narrow. NO backfill (no Shadow Field atom exists yet). The
-- provenance JSONB contract is untouched and unwidened. Memory selection policy,
-- salience, and recall logic are NOT touched: a shadow_field atom defaults to
-- return_preference 'member_pulled', which the prompt loader does not ambiently
-- retrieve, so keeping something from the Field does not make it background
-- psychological context for ordinary MAIA.

BEGIN;

-- 1. 'shadow_field' joins the closed source_type vocabulary.
--
-- Replace, never loosen. All eleven existing values are preserved exactly.
-- Refuse rather than corrupt: if this environment holds a source_type outside the
-- vocabulary being preserved, fail here with a message naming the cause rather than
-- letting the ADD fail obscurely, and rather than silently outlawing existing rows.
DO $$
DECLARE unexpected text;
BEGIN
  SELECT string_agg(DISTINCT source_type, ', ') INTO unexpected
  FROM member_memory_atoms
  WHERE source_type IS NOT NULL
    AND source_type NOT IN (
      'idea','idea_block','journal','dream','reflection',
      'decision','change','session_excerpt','spontaneous',
      'practitioner_observation','capsule'
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
    'capsule'::text,
    'shadow_field'::text
  ]));

-- 2. Sourcing discipline: shadow_field behaves like spontaneous.
--
-- The member's own text lives in the atom itself; there is no source row to point at.
-- Minimal change — the spontaneous branch is widened to the pair, nothing is tightened,
-- so no existing row can be outlawed by this rewrite.
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS sourcing_discipline;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT sourcing_discipline CHECK (
    (source_type IN ('spontaneous', 'shadow_field') AND body IS NOT NULL)
    OR (source_type NOT IN ('spontaneous', 'shadow_field') AND source_id IS NOT NULL)
  );

-- 3. A Shadow Field atom is member-placed, structurally.
--
-- Enforces the P4 acceptance rule that shadow_field "never receives practitioner or
-- system authority" at the schema, not by convention: no source row, no facilitator,
-- no epistemic status, and no provenance payload. A future writer cannot dress a
-- Field atom as practitioner-attributed or system-inferred material without first
-- removing this constraint in a visible migration.
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS shadow_field_member_placed;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT shadow_field_member_placed CHECK (
    source_type <> 'shadow_field'
    OR (
      source_id IS NULL
      AND facilitator_id IS NULL
      AND epistemological_status IS NULL
      AND provenance IS NULL
    )
  );

COMMIT;
