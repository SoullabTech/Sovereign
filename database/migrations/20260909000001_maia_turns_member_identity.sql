-- B3 · maia_turns member identity and deletion coverage
--
-- ⭐ A derived copy cannot outlive the member data whose deletion created the
-- obligation to remove it.
--
-- maia_turns can hold derivative copies of member conversation text. Before this
-- migration it carried NO member identity (no user_id; session_id bare TEXT with
-- no FK) and sat outside BOTH deletion mechanisms — the application's governed
-- table list and the S5 constitutional substrate.
--
-- ── TWO POPULATIONS, KEPT APART ────────────────────────────────────────────
--
-- Historical rows may exist whose ownership is unknown, and a column appearing
-- does not make it known. A table-wide NOT NULL could only be satisfied by
-- failing on those rows or by backfilling identity that was never earned.
--
-- So: the column is NULLABLE, and an INSERT-TIME GATE refuses new rows without
-- identity. Historical NULLs remain representable and unattributed, pending a
-- separate custody adjudication. Promotion to table-wide NOT NULL is only
-- possible after that adjudication, never as a side effect of this migration.
--
-- ⛔ WHAT THE DATABASE DOES AND DOES NOT PROVE. It refuses missing identity and
-- enforces referential integrity against members. It does NOT prove the supplied
-- id came from the authenticated actor — this connection carries no actor
-- context a trigger could inspect. Deriving member identity from the verified
-- session, and never trusting a body-supplied id, remains the server's
-- responsibility at the auth boundary.
--
-- ⚠️ STRICTER THAN conversation_turns, DELIBERATELY AND FOR RATIFICATION.
-- conversation_turns.user_id is TEXT with no FK, so it admits non-member
-- identities (explorer/anonymous). A UUID FK here refuses them, which means such
-- turns cannot be copied into the training derivative at all. That is a
-- narrowing of what may be derived, not only of what may be deleted, and it is
-- named here rather than smuggled in.

BEGIN;

-- 1 · Identity. Nullable for history; CASCADE makes deletion deterministic
--     rather than dependent on an application remembering this table.
ALTER TABLE public.maia_turns
  ADD COLUMN IF NOT EXISTS member_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maia_turns_member_id_fkey'
  ) THEN
    ALTER TABLE public.maia_turns
      ADD CONSTRAINT maia_turns_member_id_fkey
      FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_maia_turns_member_id
  ON public.maia_turns(member_id);

-- 2 · The insert gate. New rows carry identity or do not exist.
CREATE OR REPLACE FUNCTION public.maia_turns_require_member_identity()
RETURNS trigger AS $$
BEGIN
  IF NEW.member_id IS NULL THEN
    RAISE EXCEPTION
      'maia_turns insert refused: member_id is required for new rows (historical NULLs are not backfilled)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maia_turns_require_member_identity_trigger ON public.maia_turns;
CREATE TRIGGER maia_turns_require_member_identity_trigger
  BEFORE INSERT ON public.maia_turns
  FOR EACH ROW EXECUTE FUNCTION public.maia_turns_require_member_identity();

-- 3 · ⚠️ THE OBSTRUCTION test-first found.
--     expansion_events.turn_id referenced maia_turns with NO ACTION, so deleting
--     a referenced turn would ERROR rather than cascade — deletion was not
--     merely uncovered, it was blocked.
--     turn_id is nullable and expansion_events carries its OWN member_id, so it
--     has its own deletion obligation and must be UNLINKED, never destroyed by
--     another table's deletion. SET NULL, not CASCADE.
DO $$
DECLARE c TEXT;
BEGIN
  SELECT conname INTO c FROM pg_constraint
   WHERE conrelid = 'public.expansion_events'::regclass
     AND confrelid = 'public.maia_turns'::regclass AND contype = 'f' LIMIT 1;
  IF c IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.expansion_events DROP CONSTRAINT %I', c);
  END IF;
  ALTER TABLE public.expansion_events
    ADD CONSTRAINT expansion_events_turn_id_fkey
    FOREIGN KEY (turn_id) REFERENCES public.maia_turns(id) ON DELETE SET NULL;
END $$;

-- 4 · The S5 substrate. A recorded deletion obligation must survive a restore.
DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger ON public.maia_turns;
CREATE TRIGGER s5_refuse_tombstoned_trigger
  BEFORE INSERT ON public.maia_turns
  FOR EACH ROW EXECUTE FUNCTION public.s5_refuse_tombstoned();

COMMENT ON COLUMN public.maia_turns.member_id IS
  'Member this derivative row belongs to. NULL only for historical rows predating '
  'B3; new rows are refused without it. Deletion reaches this table through this '
  'column. Not proof of authenticated actor — that is the server auth boundary.';

COMMIT;
