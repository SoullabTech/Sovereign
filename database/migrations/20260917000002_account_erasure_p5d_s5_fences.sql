-- F5-CONFORMANCE-REPAIR-01 · P5-D
-- Account erasure S5 successor: live anti-resurrection fences + Circle-state restore law.
--
-- CANDIDATE ONLY until separately deployed. This migration does not broaden the
-- 313 refuse-by-default loci. It makes an already-completed governed erasure
-- harder to reverse accidentally after the member row has lawfully ended.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.account_erasure_acts') IS NULL
     OR to_regclass('public.provenance_tombstones') IS NULL
     OR to_regclass('public.deletion_manifests') IS NULL THEN
    RAISE EXCEPTION '[F5 P5-D] prerequisite erasure-ledger / S5 substrate absent';
  END IF;
END $$;

-- Planning can fail before a plan is freezeable (catalog failure, schema drift,
-- serialization abort). That failure still deserves a durable terminal act.
-- P5-A required plan_frozen before every non-plan event; P5-D narrows exactly
-- one exception: act_failed may close a pre-freeze act, with no mutation.
CREATE OR REPLACE FUNCTION account_erasure_event_validate() RETURNS trigger AS $$
DECLARE
  frozen boolean;
  terminal_exists boolean;
  plan_count integer;
  missing_outcomes integer;
  missing_verification integer;
  planned_refusals integer;
  open_custody integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM account_erasure_execution_events
     WHERE act_id = NEW.act_id AND event_type = 'plan_frozen'
  ) INTO frozen;

  SELECT EXISTS (
    SELECT 1 FROM account_erasure_execution_events
     WHERE act_id = NEW.act_id
       AND event_type IN ('act_refused', 'act_failed', 'act_completed')
  ) INTO terminal_exists;

  IF terminal_exists AND NEW.event_type <> 'correction' THEN
    RAISE EXCEPTION '[F5] erasure act already terminal — only additive correction is lawful (act %)', NEW.act_id;
  END IF;

  IF NEW.event_type = 'correction' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE id = NEW.supersedes_event_id AND act_id = NEW.act_id
    ) THEN
      RAISE EXCEPTION '[F5] correction must supersede an event from the same erasure act (act %)', NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'plan_frozen' THEN
    SELECT count(*) INTO plan_count FROM account_erasure_dispositions WHERE act_id = NEW.act_id;
    IF plan_count = 0 THEN
      RAISE EXCEPTION '[F5] empty erasure plan cannot be frozen (act %)', NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'act_failed' AND NOT frozen THEN
    RETURN NEW;
  END IF;

  IF NOT frozen THEN
    RAISE EXCEPTION '[F5] erasure execution cannot begin before plan_frozen (act %)', NEW.act_id;
  END IF;

  IF NEW.event_type = 'custody_cleared' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE act_id = NEW.act_id AND disposition_id = NEW.disposition_id
         AND event_type = 'custody_owed' AND event_ref = NEW.event_ref
    ) THEN
      RAISE EXCEPTION '[F5] custody cannot clear without a matching owed record (act %, ref %)', NEW.act_id, NEW.event_ref;
    END IF;
  END IF;

  IF NEW.event_type IN ('verification_succeeded', 'verification_failed') THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE act_id = NEW.act_id AND disposition_id = NEW.disposition_id
         AND event_type = 'disposition_succeeded'
    ) THEN
      RAISE EXCEPTION '[F5] verification cannot be recorded before disposition execution succeeds (act %)', NEW.act_id;
    END IF;
  END IF;

  IF NEW.event_type = 'act_refused' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_dispositions d
       WHERE d.act_id = NEW.act_id AND d.planned_disposition = 'refuse'
    ) THEN
      RAISE EXCEPTION '[F5] act_refused requires an explicit refused disposition in the frozen plan (act %)', NEW.act_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM account_erasure_execution_events e
      JOIN account_erasure_dispositions d ON d.id = e.disposition_id
       WHERE e.act_id = NEW.act_id AND e.event_type = 'disposition_succeeded'
         AND d.planned_disposition IN ('erase', 'revoke', 'tombstone')
    ) THEN
      RAISE EXCEPTION '[F5] act_refused means no destructive disposition occurred; use failed semantics instead (act %)', NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'act_completed' THEN
    SELECT count(*) INTO planned_refusals FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id AND d.planned_disposition = 'refuse';
    IF planned_refusals > 0 THEN
      RAISE EXCEPTION '[F5] act_completed refused — frozen plan contains % refused disposition(s) (act %)', planned_refusals, NEW.act_id;
    END IF;

    SELECT count(*) INTO missing_outcomes FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id
       AND NOT EXISTS (
         SELECT 1 FROM account_erasure_execution_events e
          WHERE e.act_id = NEW.act_id AND e.disposition_id = d.id
            AND e.event_type = 'disposition_succeeded'
       );
    IF missing_outcomes > 0 THEN
      RAISE EXCEPTION '[F5] act_completed refused — % disposition(s) lack successful outcome (act %)', missing_outcomes, NEW.act_id;
    END IF;

    SELECT count(*) INTO missing_verification FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id AND d.verification_rule <> 'none'
       AND COALESCE((
         SELECT e.event_type = 'verification_succeeded'
           FROM account_erasure_execution_events e
          WHERE e.act_id = NEW.act_id AND e.disposition_id = d.id
            AND e.event_type IN ('verification_succeeded', 'verification_failed')
          ORDER BY e.event_seq DESC LIMIT 1
       ), false) IS NOT TRUE;
    IF missing_verification > 0 THEN
      RAISE EXCEPTION '[F5] act_completed refused — % disposition(s) lack current successful verification (act %)', missing_verification, NEW.act_id;
    END IF;

    SELECT count(*) INTO open_custody FROM account_erasure_execution_events owed
     WHERE owed.act_id = NEW.act_id AND owed.event_type = 'custody_owed'
       AND NOT EXISTS (
         SELECT 1 FROM account_erasure_execution_events cleared
          WHERE cleared.act_id = owed.act_id AND cleared.disposition_id = owed.disposition_id
            AND cleared.event_type = 'custody_cleared' AND cleared.event_ref = owed.event_ref
       );
    IF open_custody > 0 THEN
      RAISE EXCEPTION '[F5] act_completed refused — % custody obligation(s) still owed (act %)', open_custody, NEW.act_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Shared helper: an erased member UUID is represented by the S5 member tombstone.
CREATE OR REPLACE FUNCTION account_erasure_member_is_tombstoned(member_ref text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM provenance_tombstones
     WHERE object_kind = 'members' AND object_id = member_ref
  );
$$ LANGUAGE sql STABLE;

-- Durable member-bound rows with direct identity columns may not reappear after
-- the member tombstone exists. Governed restore suppresses them; ordinary writes
-- refuse loudly. Circle state uses a different trigger below because its law is
-- tombstone/left, not physical row deletion.
CREATE OR REPLACE FUNCTION account_erasure_refuse_erased_member_reference()
RETURNS trigger AS $$
DECLARE
  col text;
  member_ref text;
BEGIN
  FOREACH col IN ARRAY TG_ARGV LOOP
    member_ref := to_jsonb(NEW) ->> col;
    IF member_ref IS NOT NULL AND account_erasure_member_is_tombstoned(member_ref) THEN
      IF current_setting('s5.restore_lane', TRUE) = 'governed' THEN
        RETURN NULL;
      END IF;
      RAISE EXCEPTION '[F5 P5-D] write refused — row references an erased member (%). table=%', LEFT(member_ref, 12), TG_TABLE_NAME;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  r record;
  args text;
  unsupported text;
BEGIN
  -- P5-D-R1 · S5 FENCE TARGET AUTHORITY
  --
  -- `information_schema.columns` includes views, which caused the first P5-E
  -- disposable migration witness to attempt a row trigger on `active_patterns`.
  -- The generic member fence is authorized only on durable base/partitioned
  -- tables. Views/materialized views are projections and are not row-trigger
  -- targets. Indexes, partitioned indexes, sequences, composite types and TOAST
  -- relations are catalog metadata/storage internals rather than member row
  -- custody surfaces. Any remaining identity-bearing relation kind is unknown authority and
  -- therefore fails the migration loudly rather than being silently skipped.
  SELECT string_agg(format('%I(relkind=%s)', q.relname, q.relkind), ', ' ORDER BY q.relname)
    INTO unsupported
    FROM (
      SELECT DISTINCT c.relname, c.relkind
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
       WHERE n.nspname = 'public'
         AND a.attnum > 0
         AND NOT a.attisdropped
         AND a.attname = ANY(ARRAY[
           'user_id','member_id','owner_id','author_id','created_by','subject_member_id',
           'participant_id','actor_id','from_member_id','to_member_id',
           'client_member_id','practitioner_member_id'
         ])
         AND c.relname NOT IN (
           'account_erasure_acts',
           'circle_memberships',
           'circle_inquiry_responses',
           'deletion_manifest_scopes'
         )
         AND c.relkind NOT IN ('r', 'p', 'v', 'm', 'i', 'I', 'S', 'c', 't')
    ) q;

  IF unsupported IS NOT NULL THEN
    RAISE EXCEPTION
      '[F5 P5-D-R1] unsupported identity-bearing relation kind(s) in generic member fence population: %',
      unsupported;
  END IF;

  FOR r IN
    SELECT c.relname AS table_name, array_agg(a.attname ORDER BY a.attname) AS cols
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
     WHERE n.nspname = 'public'
       AND c.relkind IN ('r', 'p')
       AND a.attnum > 0
       AND NOT a.attisdropped
       AND a.attname = ANY(ARRAY[
         'user_id','member_id','owner_id','author_id','created_by','subject_member_id',
         'participant_id','actor_id','from_member_id','to_member_id',
         'client_member_id','practitioner_member_id'
       ])
       AND c.relname NOT IN (
         'account_erasure_acts',
         'circle_memberships',
         'circle_inquiry_responses',
         'deletion_manifest_scopes'
       )
     GROUP BY c.oid, c.relname
  LOOP
    SELECT string_agg(quote_literal(c), ', ') INTO args FROM unnest(r.cols) c;
    EXECUTE format('DROP TRIGGER IF EXISTS account_erasure_member_fence ON %I', r.table_name);
    EXECUTE format(
      'CREATE TRIGGER account_erasure_member_fence BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION account_erasure_refuse_erased_member_reference(%s)',
      r.table_name, args
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION account_erasure_refuse_erased_member_row()
RETURNS trigger AS $$
BEGIN
  IF account_erasure_member_is_tombstoned(NEW.id::text) THEN
    IF current_setting('s5.restore_lane', TRUE) = 'governed' THEN RETURN NULL; END IF;
    RAISE EXCEPTION '[F5 P5-D] member resurrection refused (%)', LEFT(NEW.id::text, 12);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_erasure_member_row_fence ON members;
CREATE TRIGGER account_erasure_member_row_fence
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION account_erasure_refuse_erased_member_row();

-- Circle history has different semantics: representation authority ends, but the
-- historical membership/response fact remains. Governed restore transforms old
-- rows back into their tombstone state instead of deleting those facts.
CREATE OR REPLACE FUNCTION account_erasure_circle_state_fence()
RETURNS trigger AS $$
DECLARE
  member_ref text;
  fence_at timestamptz;
BEGIN
  member_ref := CASE TG_TABLE_NAME
    WHEN 'shared_artifacts' THEN NEW.shared_by::text
    ELSE NEW.member_id::text
  END;
  SELECT tombstoned_at INTO fence_at FROM provenance_tombstones
   WHERE object_kind = 'members' AND object_id = member_ref;
  IF fence_at IS NULL THEN RETURN NEW; END IF;

  IF current_setting('s5.restore_lane', TRUE) = 'governed' THEN
    IF TG_TABLE_NAME = 'shared_artifacts' THEN
      NEW.revoked_at := COALESCE(NEW.revoked_at, fence_at);
    ELSIF TG_TABLE_NAME = 'circle_inquiry_responses' THEN
      NEW.withdrawn_at := COALESCE(NEW.withdrawn_at, fence_at);
      NEW.response_text := NULL;
      NEW.response_type := NULL;
    ELSIF TG_TABLE_NAME = 'circle_memberships' THEN
      NEW.status := 'left';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'shared_artifacts' AND NEW.revoked_at IS NULL THEN
    RAISE EXCEPTION '[F5 P5-D] active Circle share for erased member refused';
  ELSIF TG_TABLE_NAME = 'circle_inquiry_responses'
        AND (NEW.withdrawn_at IS NULL OR NEW.response_text IS NOT NULL OR NEW.response_type IS NOT NULL) THEN
    RAISE EXCEPTION '[F5 P5-D] live Circle response for erased member refused';
  ELSIF TG_TABLE_NAME = 'circle_memberships' AND NEW.status = 'active' THEN
    RAISE EXCEPTION '[F5 P5-D] active Circle membership for erased member refused';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_erasure_circle_state_fence ON shared_artifacts;
CREATE TRIGGER account_erasure_circle_state_fence
  BEFORE INSERT OR UPDATE ON shared_artifacts
  FOR EACH ROW EXECUTE FUNCTION account_erasure_circle_state_fence();
DROP TRIGGER IF EXISTS account_erasure_circle_state_fence ON circle_inquiry_responses;
CREATE TRIGGER account_erasure_circle_state_fence
  BEFORE INSERT OR UPDATE ON circle_inquiry_responses
  FOR EACH ROW EXECUTE FUNCTION account_erasure_circle_state_fence();
DROP TRIGGER IF EXISTS account_erasure_circle_state_fence ON circle_memberships;
CREATE TRIGGER account_erasure_circle_state_fence
  BEFORE INSERT OR UPDATE ON circle_memberships
  FOR EACH ROW EXECUTE FUNCTION account_erasure_circle_state_fence();

COMMIT;

DO $$ BEGIN
  RAISE NOTICE 'Migration 20260917000002: P5-D account-erasure S5 fences installed';
END $$;
