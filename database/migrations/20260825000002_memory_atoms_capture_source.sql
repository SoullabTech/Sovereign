-- Capture promotion: memory atoms as a source REGISTRY, never a content copy
--
-- Ruling (founder, 2026-08-25):
--   "Capture promotion uses member_memory_atoms only as a source registry.
--    Add source_type='capture', reference the canonical encrypted capture by
--    source_id, keep body NULL, and never decrypt/copy capture content into
--    the atom."
--
--   Promotion means "MAIA is permitted to remember/reference this source" —
--   NOT "copy this source into another memory table."
--
--     encrypted capture
--         │
--         ├── raw content stays encrypted in session_captures  ← source of truth
--         │
--         └── member_memory_atoms
--               source_type = 'capture'
--               source_id   = session_captures.id
--               body        = NULL
--
-- This migration does exactly one thing: widen the source_type CHECK by one
-- value. It rewrites no historical row, drops no data, and changes no default.
--
-- Why the atom can stay bodyless: `sourcing_discipline` already requires only
-- that a non-spontaneous atom carry a source_id. `body` is nullable, and
-- lib/maia/memoryAtomsLoader.ts already forces body → NULL for every
-- source_type other than 'spontaneous'/'practitioner_observation', so a
-- promoted capture surfaces to MAIA as title + provenance only. Content
-- resolution happens later through the authorized decrypt path.
--
-- ROLLBACK
--   Re-narrow the CHECK to the original nine values. Safe only while no atom
--   uses the new value; delete or re-source those rows first:
--
--     SELECT count(*) FROM member_memory_atoms WHERE source_type = 'capture';
--     -- if 0:
--     ALTER TABLE member_memory_atoms
--       DROP CONSTRAINT member_memory_atoms_source_type_check;
--     ALTER TABLE member_memory_atoms
--       ADD CONSTRAINT member_memory_atoms_source_type_check
--       CHECK (source_type IN ('idea','idea_block','journal','dream','reflection',
--                              'decision','change','session_excerpt','spontaneous',
--                              'practitioner_observation'));
--
--   Rolling back does NOT destroy capture content — that lives in
--   session_captures and is unaffected.

DO $$
DECLARE
  target_con  TEXT;
  current_def TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'member_memory_atoms'
  ) THEN
    RAISE EXCEPTION 'member_memory_atoms must exist before widening source_type';
  END IF;

  -- Locate the source_type enum CHECK by its content, not a hardcoded name.
  -- 'idea_block' appears only in that constraint, which disambiguates it from
  -- `sourcing_discipline` (which also references source_type).
  SELECT conname, pg_get_constraintdef(oid)
    INTO target_con, current_def
    FROM pg_constraint
   WHERE conrelid = 'member_memory_atoms'::regclass
     AND contype = 'c'
     AND pg_get_constraintdef(oid) LIKE '%idea_block%'
   LIMIT 1;

  IF target_con IS NULL THEN
    RAISE EXCEPTION 'could not locate the source_type CHECK on member_memory_atoms';
  END IF;

  -- Idempotent: already widened, nothing to do.
  IF current_def LIKE '%''capture''%' THEN
    RAISE NOTICE 'source_type already permits capture; skipping';
    RETURN;
  END IF;

  -- Preserve every existing source type; add exactly one.
  EXECUTE format('ALTER TABLE member_memory_atoms DROP CONSTRAINT %I', target_con);

  ALTER TABLE member_memory_atoms
    ADD CONSTRAINT member_memory_atoms_source_type_check
    CHECK (source_type IN (
      'idea',
      'idea_block',
      'journal',
      'dream',
      'reflection',
      'decision',
      'change',
      'session_excerpt',
      'spontaneous',
      'practitioner_observation',
      'capture'                    -- registry pointer to session_captures.id
    ));
END $$;

-- Post-change shape check: the widened constraint must still admit every
-- pre-existing type. A rollback that silently dropped one would fail here.
DO $$
DECLARE
  def TEXT;
  t   TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO def
    FROM pg_constraint
   WHERE conrelid = 'member_memory_atoms'::regclass
     AND contype = 'c'
     AND pg_get_constraintdef(oid) LIKE '%idea_block%'
   LIMIT 1;

  FOREACH t IN ARRAY ARRAY[
    'idea','idea_block','journal','dream','reflection','decision','change',
    'session_excerpt','spontaneous','practitioner_observation','capture'
  ] LOOP
    IF def NOT LIKE '%''' || t || '''%' THEN
      RAISE EXCEPTION 'source_type CHECK lost value: %', t;
    END IF;
  END LOOP;
END $$;

COMMENT ON COLUMN member_memory_atoms.source_id IS
  'Polymorphic source reference. For source_type=''capture'' this is '
  'session_captures.id; content stays encrypted at the source and is never '
  'copied into body.';
