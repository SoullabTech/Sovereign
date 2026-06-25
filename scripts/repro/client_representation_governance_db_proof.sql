-- Client Representation Governance — NON-PERSISTING proof of migration 20260625000002.
-- BEGIN/ROLLBACK: applies the DDL + backfill, asserts schema + classifier + the
-- remediation invariant (all client memories held), then rolls back. Nothing persists.
--   psql -U soullab -d maia_consciousness -v ON_ERROR_STOP=1 -f scripts/repro/client_representation_governance_db_proof.sql
-- NOTE: pending_review_candidates is absent from some DBs (local dev parity gap); its
-- half is existence-guarded so this proof runs anywhere and fully on prod/CI.
\set ON_ERROR_STOP on
BEGIN;

-- (1) case_memories DDL (table present locally + prod)
ALTER TABLE case_memories
  ADD COLUMN IF NOT EXISTS authorship TEXT NOT NULL DEFAULT 'maia_inferred'
    CHECK (authorship IN ('practitioner_authored','maia_inferred','maia_suggested')),
  ADD COLUMN IF NOT EXISTS disposition TEXT NOT NULL DEFAULT 'accepted'
    CHECK (disposition IN ('provisional','accepted','rejected')),
  ADD COLUMN IF NOT EXISTS crossing_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_basis TEXT,
  ADD COLUMN IF NOT EXISTS consent_at_write TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_route TEXT;

-- (2) columns + conservative default present
DO $$
DECLARE d text;
BEGIN
  SELECT column_default INTO d FROM information_schema.columns
   WHERE table_name='case_memories' AND column_name='crossing_allowed';
  IF d IS NULL OR d NOT LIKE 'false%' THEN RAISE EXCEPTION 'FAIL: crossing_allowed default not false (got %)', d; END IF;
  RAISE NOTICE 'OK (1): governance columns present; crossing_allowed default=false';
END $$;

-- (3) authorship classifier correct on synthetic inputs (no FK needed)
DO $$
DECLARE r record; got text;
BEGIN
  FOR r IN SELECT * FROM (VALUES
      (gen_random_uuid(), NULL::uuid, NULL::uuid, 'maia_inferred'),
      (NULL::uuid, gen_random_uuid(), NULL::uuid, 'maia_inferred'),
      (NULL::uuid, NULL::uuid, gen_random_uuid(), 'practitioner_authored'),
      (NULL::uuid, NULL::uuid, NULL::uuid, 'maia_inferred')
    ) AS t(src_candidate, review_lens, src_note, want)
  LOOP
    got := CASE WHEN r.src_note IS NOT NULL AND r.src_candidate IS NULL AND r.review_lens IS NULL
                THEN 'practitioner_authored' ELSE 'maia_inferred' END;
    IF got <> r.want THEN RAISE EXCEPTION 'FAIL classifier: want % got %', r.want, got; END IF;
  END LOOP;
  RAISE NOTICE 'OK (2): authorship classifier — maia_inferred unless source_note-only';
END $$;

-- (4) real backfill (idempotent guard: only un-stamped rows)
UPDATE case_memories cm SET
  authorship = CASE WHEN cm.source_note_id IS NOT NULL AND cm.source_candidate_id IS NULL AND cm.review_lens_id IS NULL
                    THEN 'practitioner_authored' ELSE 'maia_inferred' END,
  disposition = 'accepted', crossing_allowed = FALSE,
  source_route = COALESCE(cm.source_route, 'studio/review/save'),
  consent_basis = pc.privacy_mode, consent_at_write = pc.consent_captured_at
FROM practitioner_cases pc
WHERE cm.case_id = pc.id AND cm.consent_basis IS NULL;

-- (5) remediation invariant: after backfill NOTHING is surfaceable
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM case_memories WHERE crossing_allowed = TRUE;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: % case_memories still surfaceable after backfill', n; END IF;
  RAISE NOTICE 'OK (3): all case_memories held (crossing_allowed=FALSE) after backfill';
END $$;

-- (6) pending_review_candidates rejection capture — existence-guarded
DO $$
BEGIN
  IF to_regclass('public.pending_review_candidates') IS NULL THEN
    RAISE NOTICE 'SKIP (4): pending_review_candidates absent here (local dev parity gap) — rejection-capture proven at deploy/CI';
  ELSE
    EXECUTE 'ALTER TABLE pending_review_candidates ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS rejection_reason TEXT';
    EXECUTE $q$UPDATE pending_review_candidates SET rejected_at = expires_at, rejection_reason = 'expired_unreviewed' WHERE expires_at < now() AND promoted_at IS NULL AND rejected_at IS NULL$q$;
    RAISE NOTICE 'OK (4): rejection-capture columns + retroactive rejection applied';
  END IF;
END $$;

-- (7) validate the review/save INSERT shape against the migrated schema (no execution, no FK)
PREPARE _save_insert_shape AS
  INSERT INTO case_memories
    (case_id, practitioner_id, memory_type, content, significance,
     facet_code, element_tags, source_session_id, review_lens_id,
     evidence_refs, source_candidate_id,
     authorship, disposition, crossing_allowed, consent_basis, consent_at_write, source_route)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,'accepted',FALSE,$13,$14,'studio/review/save');
DO $$ BEGIN RAISE NOTICE 'OK (5): review/save INSERT shape valid against migrated schema'; END $$;
DEALLOCATE _save_insert_shape;

ROLLBACK;
