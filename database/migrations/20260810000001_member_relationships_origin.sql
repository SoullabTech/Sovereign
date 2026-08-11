-- Relationship provenance — infrastructure is not relationship.
--
-- WHY. `member_relationships` mixes two different kinds of row:
--   1. relationships a MEMBER created — people, inner figures, the larger field
--   2. a container the SYSTEM created to hold what it could not resolve
-- Both render identically in the member's list of people. That is a category
-- error, not a display bug: the system's own uncertainty appears among the
-- member's human relationships.
--
-- The remedy is a durable provenance distinction, not runtime name matching.
-- Name matching (`name = 'Unresolved Relational Field'`) is fragile, renameable
-- by the member, unlocalizable, and already an established wrong pattern in
-- lib/relationships/relationshipContextService.ts. A column survives renames.
--
-- WHAT THIS DOES NOT DO. It does not attribute any historical entry to any
-- person. UNKNOWN REMAINS UNKNOWN. The backfill below labels a CONTAINER as
-- system-created; it moves no entry, resolves no relationship identity, and
-- makes no claim about who any past observation was about. Members keep full
-- access to everything in the container — it is relocated in the interface,
-- never deleted.
--
-- The one-time name predicate in the backfill is legitimate precisely because
-- it is not runtime classification: it recovers the provenance of rows this
-- system itself wrote with a fixed literal, once, so that runtime never has to
-- ask that question again.

ALTER TABLE member_relationships
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'member';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_relationships_origin_check'
  ) THEN
    ALTER TABLE member_relationships
      ADD CONSTRAINT member_relationships_origin_check
      CHECK (origin IN ('member', 'system'));
  END IF;
END $$;

-- Backfill: the observer's catch-all container, recovered by the exact literal
-- the observer itself wrote. One-time provenance repair, never a runtime rule.
UPDATE member_relationships
   SET origin = 'system'
 WHERE name = 'Unresolved Relational Field'
   AND origin = 'member';

CREATE INDEX IF NOT EXISTS idx_member_relationships_origin
  ON member_relationships(member_id, origin)
  WHERE archived_at IS NULL;

COMMENT ON COLUMN member_relationships.origin IS
  'Provenance of the row itself. member = created by a member act. '
  'system = a container the system created to hold what it could not resolve; '
  'must never render among the member''s people. Says nothing about the '
  'authorship, provenance or truth of the entries inside it.';
