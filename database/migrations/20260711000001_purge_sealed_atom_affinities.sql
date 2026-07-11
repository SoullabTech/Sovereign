-- Purge living_field_affinities rows derived from sealed atoms.
--
-- Trace finding F2 (2026-07-11): indexAtomAffinities materialized affinity
-- rows without checking the atom's return_preference consent axis, so atoms
-- the member sealed (member_pulled) still fed gathering/encounter views.
-- The indexer is now consent-gated (lib/maia/living-field/indexAtom.ts);
-- this backfill removes the rows the ungated indexer already wrote.
--
-- Idempotent: re-running deletes nothing new.

DELETE FROM living_field_affinities lfa
USING member_memory_atoms a
WHERE lfa.atom_id = a.id
  AND (a.return_preference IS NULL
       OR a.return_preference NOT IN ('contextual_doorway', 'ritual_review_opt_in'));

-- Also remove orphaned affinity rows whose atom no longer exists.
DELETE FROM living_field_affinities lfa
WHERE NOT EXISTS (
  SELECT 1 FROM member_memory_atoms a WHERE a.id = lfa.atom_id
);
