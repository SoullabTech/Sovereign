-- RF01 R1-B: content-free member influence quarantine after exact-turn erasure.
-- This migration is a HELD LOCAL CANDIDATE. No production application.
--
-- S5 tombstones govern exact deleted objects; this separate marker prevents
-- old derived material (summaries, episodic memory, atoms) from influencing
-- MAIA before a full lineage audit establishes safe non-use. Ordinary turns
-- belonging to other sessions are NOT deleted or silently quarantined by SQL.
BEGIN;

CREATE TABLE IF NOT EXISTS rf01_member_erasure_holds (
  member_id TEXT PRIMARY KEY,
  manifest_id UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE RESTRICT,
  hold_reason TEXT NOT NULL
    CHECK (hold_reason='exact_turn_erasure_derived_influence_unverified'),
  established_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf01_member_erasure_holds_manifest
 ON rf01_member_erasure_holds(manifest_id);

COMMENT ON TABLE rf01_member_erasure_holds IS
 'R1-B: content-free member-wide MAIA influence hold after exact-turn erasure.'
 ' Hold until separate, evidenced derived-source cleanup and R1-C release.'
 ' A manifest ID alone is not authorization to clear this hold.';

-- Fail closed on derived data that would be reinserted from a backup,
-- updated from old derivative material, or created by another writer while
-- the affected member is quarantined. Metadata-only session edits remain
-- possible while the summary is NULL.
CREATE OR REPLACE FUNCTION rf01_refuse_quarantined_derived_insert()
RETURNS trigger AS $$
DECLARE actor TEXT;
DECLARE summary_value JSONB;
BEGIN
  actor := COALESCE(to_jsonb(NEW)->>'member_id',to_jsonb(NEW)->>'user_id');
  IF actor IS NULL THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME IN ('member_sessions','maia_sessions') THEN
    summary_value := to_jsonb(NEW)->'summary';
    IF summary_value IS NULL OR summary_value='null'::jsonb THEN
      RETURN NEW; -- metadata-only session records remain allowed
    END IF;
  END IF;
  IF EXISTS(SELECT 1 FROM public.rf01_member_erasure_holds h
            WHERE h.member_id=actor) THEN
    RAISE EXCEPTION 'RF01_DERIVED_INFLUENCE_HELD';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path=pg_catalog,public;

DO $$
DECLARE lane TEXT;
BEGIN
  FOREACH lane IN ARRAY ARRAY[
     'episodic_memories','member_memory_atoms','member_sessions','maia_sessions'
  ] LOOP
    IF to_regclass('public.'||lane) IS NULL THEN
      RAISE EXCEPTION 'RF01 R1-B requires derived lane %',lane;
    END IF;
    EXECUTE format(
      'DROP TRIGGER IF EXISTS rf01_derived_hold_trg ON public.%I',lane);
    EXECUTE format(
      'CREATE TRIGGER rf01_derived_hold_trg BEFORE INSERT OR UPDATE ON public.%I '
      || 'FOR EACH ROW EXECUTE FUNCTION public.rf01_refuse_quarantined_derived_insert()',lane);
  END LOOP;
END $$;

-- Do not auto-delete old derived rows: their source lineage may be shared
-- with unrelated, legitimate member material. MAIA entry points now hold
-- all inference until R1-C proof. No automatic release of these holds.
COMMIT;
