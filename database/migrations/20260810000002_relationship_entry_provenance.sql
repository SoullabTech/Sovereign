-- Actor integrity — who authored this, established at the write, not inferred later.
--
-- WHY. An agent driving a real browser inherited a real member's session and
-- wrote into that member's actual relationship record. Those rows then rendered
-- as "you wrote" — indistinguishable from the member's own words about their
-- own parent. Authorship had been derived from WHICH MEMBER RECORD the session
-- pointed at, never from WHO actually did the writing.
--
-- `confidence IS NULL` was doing this job implicitly and cannot carry it: it
-- distinguishes observer-derived from everything-else and says nothing about
-- actor. This column makes the distinction explicit, constrained, and
-- non-optional.
--
-- CLASSES
--   member_authored  — a human member wrote this, in their own words
--   maia_authored    — MAIA composed this text (reflection, suggested movement)
--   observer_derived — detected from conversation; MAIA's summary, not authorship
--   system_generated — produced by the system itself (seeds, backfills, migrations)
--   test_fixture     — produced by an agent, script, or automated walk. NEVER a member.
--
-- The column is NOT NULL with no default on purpose: every writer must state
-- its class, so a new write path cannot inherit "member" by omission.
-- Existing rows are backfilled below from evidence, never from assumption.

ALTER TABLE relationship_entries
  ADD COLUMN IF NOT EXISTS provenance TEXT;

-- Backfill from the only evidence the existing rows carry.
-- `confidence` is set exclusively by the relational observer.
UPDATE relationship_entries
   SET provenance = 'observer_derived'
 WHERE provenance IS NULL AND confidence IS NOT NULL;

-- Everything else predating this column came through a member-facing surface
-- (the entries composer or the check-in flow). This is the honest reading of
-- the evidence available; rows known to be otherwise are corrected explicitly
-- by the remediation migration that follows, never by guessing here.
UPDATE relationship_entries
   SET provenance = 'member_authored'
 WHERE provenance IS NULL;

ALTER TABLE relationship_entries
  ALTER COLUMN provenance SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'relationship_entries_provenance_check'
  ) THEN
    ALTER TABLE relationship_entries
      ADD CONSTRAINT relationship_entries_provenance_check
      CHECK (provenance IN (
        'member_authored', 'maia_authored', 'observer_derived',
        'system_generated', 'test_fixture'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_relationship_entries_provenance
  ON relationship_entries(relationship_id, provenance);

COMMENT ON COLUMN relationship_entries.provenance IS
  'Which ACTOR authored this row — not which member record it belongs to. '
  'Only member_authored may render as the member''s own words. Set server-side '
  'at the write from the authenticated actor; never accepted from a request body.';
