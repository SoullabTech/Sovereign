-- F5-CONFORMANCE-REPAIR-01 · P5-A
-- Dedicated account-erasure act / plan / execution ledger.
--
-- Authority:
--   docs/programme/F5-CONFORMANCE-REPAIR-01_P5A_FOUNDER_AUTHORIZATION_2026-09-17.md
--   docs/programme/F5-CONFORMANCE-REPAIR-01_P4_ADJUDICATION_2026-09-17.md
--
-- ⛔ CANDIDATE SCHEMA ONLY. This migration is NOT authorized for deployment by
-- P5-A. The live account-deletion route remains fail-closed and does not read or
-- write these tables in this cut.
--
-- Constitutional shape:
--   * act survives the member row — no FK back to members;
--   * plan rows are immutable and become closed to INSERT after plan_frozen;
--   * execution is append-only evidence, never mutable state;
--   * completion is illegal while required verification is absent or custody is owed;
--   * historical rows cannot be UPDATEd, DELETEd, or TRUNCATEd by ordinary SQL.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · MEMBER ACT — durable accountability record, deliberately not FK-bound to
--     members. Deleting the member may never erase the historical fact of the
--     destructive act that governed that deletion.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_erasure_acts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The member who exercised the self-erasure authority. Deliberately NO FK to
  -- members: the act must survive the row whose erasure it governs.
  subject_member_id uuid NOT NULL,

  authority_basis text NOT NULL DEFAULT 'verified_member_session'
    CHECK (authority_basis = 'verified_member_session'),
  reason_class text NOT NULL DEFAULT 'member_requested_account_erasure'
    CHECK (reason_class = 'member_requested_account_erasure'),
  confirmation_basis text NOT NULL DEFAULT 'username_match'
    CHECK (confirmation_basis = 'username_match'),

  -- Frozen constitutional coordinates for later interpretation of the plan.
  policy_version text NOT NULL CHECK (length(btrim(policy_version)) > 0),
  registry_version text NOT NULL CHECK (length(btrim(registry_version)) > 0),

  -- Correlation only. Never credential material and never authority.
  request_ref text,

  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE account_erasure_acts IS
'F5 P5-A: durable content-free identity of one verified member account-erasure act. subject_member_id deliberately has NO FK to members so the historical act survives the member row. The row is immutable; policy/registry versions freeze the law used to build its plan. This table is not an execution authority by itself.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · PER-LOCUS PLAN — one frozen disposition per registry locus participating
--     in this act. These rows state the PLAN, not what later happened.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_erasure_dispositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  act_id uuid NOT NULL REFERENCES account_erasure_acts(id) ON DELETE RESTRICT,

  domain_key text NOT NULL CHECK (length(btrim(domain_key)) > 0),
  locus_key text NOT NULL CHECK (length(btrim(locus_key)) > 0),
  member_label text NOT NULL CHECK (length(btrim(member_label)) > 0),
  binding_rule text NOT NULL CHECK (length(btrim(binding_rule)) > 0),

  planned_disposition text NOT NULL CHECK (planned_disposition IN (
    'erase', 'revoke', 'tombstone', 'retain', 'refuse', 'no_op'
  )),

  authority_reason text NOT NULL CHECK (length(btrim(authority_reason)) > 0),
  verification_rule text NOT NULL CHECK (length(btrim(verification_rule)) > 0),
  adapter_key text NOT NULL CHECK (length(btrim(adapter_key)) > 0),
  requires_s5 boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (act_id, locus_key),
  -- Supports a composite FK from execution evidence so a disposition event
  -- cannot be attached to an act other than the one that owns the plan row.
  UNIQUE (id, act_id)
);

COMMENT ON TABLE account_erasure_dispositions IS
'F5 P5-A: immutable plan rows. Each row freezes one locus disposition, member-facing label, binding rule, authority reason, verification rule and adapter identity. A plan_frozen event closes this table to further INSERTs for that act. Execution evidence accumulates elsewhere and never rewrites this plan.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · EXECUTION / VERIFICATION EVENTS — append-only facts.
--
-- State is derived from positive events. No mutable status column exists.
-- Corrections are additive and point to the historical event they correct.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_erasure_execution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Monotonic ordering for successive evidence. UUIDs and transaction-stable now()
  -- are not an ordering instrument. Gaps from rolled-back inserts are harmless.
  event_seq bigint GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
  act_id uuid NOT NULL REFERENCES account_erasure_acts(id) ON DELETE RESTRICT,
  disposition_id uuid,

  event_type text NOT NULL CHECK (event_type IN (
    'plan_frozen',
    'execution_started',
    'disposition_succeeded',
    'disposition_refused',
    'verification_succeeded',
    'verification_failed',
    'custody_owed',
    'custody_cleared',
    'act_refused',
    'act_failed',
    'act_completed',
    'correction'
  )),

  -- Stable machine-readable result/evidence code. No member content belongs here.
  result_code text NOT NULL CHECK (length(btrim(result_code)) > 0),

  -- Required for custody_owed/custody_cleared so the obligation can be paired.
  event_ref text,

  -- Corrections never mutate history: they point to the event whose reading is
  -- being corrected. The original event remains present and immutable.
  supersedes_event_id uuid REFERENCES account_erasure_execution_events(id) ON DELETE RESTRICT,

  evidence_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT account_erasure_event_disposition_binding
    FOREIGN KEY (disposition_id, act_id)
    REFERENCES account_erasure_dispositions(id, act_id)
    ON DELETE RESTRICT,

  CONSTRAINT account_erasure_event_scope_shape CHECK (
    (
      event_type IN (
        'disposition_succeeded', 'disposition_refused',
        'verification_succeeded', 'verification_failed',
        'custody_owed', 'custody_cleared'
      )
      AND disposition_id IS NOT NULL
    )
    OR
    (
      event_type NOT IN (
        'disposition_succeeded', 'disposition_refused',
        'verification_succeeded', 'verification_failed',
        'custody_owed', 'custody_cleared'
      )
    )
  ),

  CONSTRAINT account_erasure_custody_ref_shape CHECK (
    (event_type IN ('custody_owed', 'custody_cleared')) = (event_ref IS NOT NULL)
  ),

  CONSTRAINT account_erasure_correction_shape CHECK (
    (event_type = 'correction') = (supersedes_event_id IS NOT NULL)
  )
);

COMMENT ON TABLE account_erasure_execution_events IS
'F5 P5-A: append-only evidence around an immutable erasure plan. State is derived, not stored. plan_frozen closes plan insertion; terminal act events are unique; completion is refused while verification is missing/failed or custody remains owed. correction is additive and must name the prior event it corrects.';

-- One frozen plan and one terminal result per act.
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_erasure_plan_frozen
  ON account_erasure_execution_events(act_id)
  WHERE event_type = 'plan_frozen';

CREATE UNIQUE INDEX IF NOT EXISTS uq_account_erasure_terminal
  ON account_erasure_execution_events(act_id)
  WHERE event_type IN ('act_refused', 'act_failed', 'act_completed');

-- One terminal disposition outcome per plan row.
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_erasure_disposition_outcome
  ON account_erasure_execution_events(act_id, disposition_id)
  WHERE event_type IN ('disposition_succeeded', 'disposition_refused');

-- Verification evidence is successive, not rewritten. A failed verification may
-- be followed by a later governed retry; completion consults the latest event_seq.
CREATE INDEX IF NOT EXISTS idx_account_erasure_verification_events
  ON account_erasure_execution_events(act_id, disposition_id, event_seq DESC)
  WHERE event_type IN ('verification_succeeded', 'verification_failed');

CREATE UNIQUE INDEX IF NOT EXISTS uq_account_erasure_custody_owed
  ON account_erasure_execution_events(act_id, disposition_id, event_ref)
  WHERE event_type = 'custody_owed';

CREATE UNIQUE INDEX IF NOT EXISTS uq_account_erasure_custody_cleared
  ON account_erasure_execution_events(act_id, disposition_id, event_ref)
  WHERE event_type = 'custody_cleared';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4 · HISTORY GUARDS — ordinary UPDATE / DELETE / TRUNCATE are forbidden.
--     Future retention of the accountability ledger is a separate governance act.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION account_erasure_refuse_update_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    '[F5] account-erasure history is append-only — % refused on %',
    TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION account_erasure_refuse_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    '[F5] account-erasure history TRUNCATE refused on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_erasure_acts_no_update_delete ON account_erasure_acts;
CREATE TRIGGER account_erasure_acts_no_update_delete
  BEFORE UPDATE OR DELETE ON account_erasure_acts
  FOR EACH ROW EXECUTE FUNCTION account_erasure_refuse_update_delete();

DROP TRIGGER IF EXISTS account_erasure_dispositions_no_update_delete ON account_erasure_dispositions;
CREATE TRIGGER account_erasure_dispositions_no_update_delete
  BEFORE UPDATE OR DELETE ON account_erasure_dispositions
  FOR EACH ROW EXECUTE FUNCTION account_erasure_refuse_update_delete();

DROP TRIGGER IF EXISTS account_erasure_events_no_update_delete ON account_erasure_execution_events;
CREATE TRIGGER account_erasure_events_no_update_delete
  BEFORE UPDATE OR DELETE ON account_erasure_execution_events
  FOR EACH ROW EXECUTE FUNCTION account_erasure_refuse_update_delete();

DROP TRIGGER IF EXISTS account_erasure_acts_no_truncate ON account_erasure_acts;
CREATE TRIGGER account_erasure_acts_no_truncate
  BEFORE TRUNCATE ON account_erasure_acts
  FOR EACH STATEMENT EXECUTE FUNCTION account_erasure_refuse_truncate();

DROP TRIGGER IF EXISTS account_erasure_dispositions_no_truncate ON account_erasure_dispositions;
CREATE TRIGGER account_erasure_dispositions_no_truncate
  BEFORE TRUNCATE ON account_erasure_dispositions
  FOR EACH STATEMENT EXECUTE FUNCTION account_erasure_refuse_truncate();

DROP TRIGGER IF EXISTS account_erasure_events_no_truncate ON account_erasure_execution_events;
CREATE TRIGGER account_erasure_events_no_truncate
  BEFORE TRUNCATE ON account_erasure_execution_events
  FOR EACH STATEMENT EXECUTE FUNCTION account_erasure_refuse_truncate();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5 · PLAN FREEZE — after plan_frozen, the plan is closed to new rows.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION account_erasure_disposition_insert_guard() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM account_erasure_execution_events
     WHERE act_id = NEW.act_id
       AND event_type = 'plan_frozen'
  ) THEN
    RAISE EXCEPTION
      '[F5] erasure plan already frozen — disposition INSERT refused (act %)',
      NEW.act_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_erasure_dispositions_freeze_guard ON account_erasure_dispositions;
CREATE TRIGGER account_erasure_dispositions_freeze_guard
  BEFORE INSERT ON account_erasure_dispositions
  FOR EACH ROW EXECUTE FUNCTION account_erasure_disposition_insert_guard();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6 · EVENT VALIDATION — the constitutional state machine.
-- ─────────────────────────────────────────────────────────────────────────────
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
    RAISE EXCEPTION
      '[F5] erasure act already terminal — only additive correction is lawful (act %)',
      NEW.act_id;
  END IF;

  IF NEW.event_type = 'correction' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE id = NEW.supersedes_event_id
         AND act_id = NEW.act_id
    ) THEN
      RAISE EXCEPTION
        '[F5] correction must supersede an event from the same erasure act (act %)',
        NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'plan_frozen' THEN
    SELECT count(*) INTO plan_count
      FROM account_erasure_dispositions
     WHERE act_id = NEW.act_id;
    IF plan_count = 0 THEN
      RAISE EXCEPTION '[F5] empty erasure plan cannot be frozen (act %)', NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT frozen THEN
    RAISE EXCEPTION
      '[F5] erasure execution cannot begin before plan_frozen (act %)', NEW.act_id;
  END IF;

  IF NEW.event_type = 'custody_cleared' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE act_id = NEW.act_id
         AND disposition_id = NEW.disposition_id
         AND event_type = 'custody_owed'
         AND event_ref = NEW.event_ref
    ) THEN
      RAISE EXCEPTION
        '[F5] custody cannot clear without a matching owed record (act %, ref %)',
        NEW.act_id, NEW.event_ref;
    END IF;
  END IF;

  IF NEW.event_type IN ('verification_succeeded', 'verification_failed') THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_execution_events
       WHERE act_id = NEW.act_id
         AND disposition_id = NEW.disposition_id
         AND event_type = 'disposition_succeeded'
    ) THEN
      RAISE EXCEPTION
        '[F5] verification cannot be recorded before disposition execution succeeds (act %)',
        NEW.act_id;
    END IF;
  END IF;

  IF NEW.event_type = 'act_refused' THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_erasure_dispositions d
       WHERE d.act_id = NEW.act_id
         AND d.planned_disposition = 'refuse'
    ) THEN
      RAISE EXCEPTION
        '[F5] act_refused requires an explicit refused disposition in the frozen plan (act %)',
        NEW.act_id;
    END IF;

    IF EXISTS (
      SELECT 1 FROM account_erasure_execution_events e
      JOIN account_erasure_dispositions d ON d.id = e.disposition_id
       WHERE e.act_id = NEW.act_id
         AND e.event_type = 'disposition_succeeded'
         AND d.planned_disposition IN ('erase', 'revoke', 'tombstone')
    ) THEN
      RAISE EXCEPTION
        '[F5] act_refused means no destructive disposition occurred; use failed/pending semantics instead (act %)',
        NEW.act_id;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'act_completed' THEN
    SELECT count(*) INTO planned_refusals
      FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id
       AND d.planned_disposition = 'refuse';

    IF planned_refusals > 0 THEN
      RAISE EXCEPTION
        '[F5] act_completed refused — frozen plan contains % refused disposition(s) (act %)',
        planned_refusals, NEW.act_id;
    END IF;

    -- Every plan row must have exactly one successful disposition outcome.
    SELECT count(*) INTO missing_outcomes
      FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id
       AND NOT EXISTS (
         SELECT 1 FROM account_erasure_execution_events e
          WHERE e.act_id = NEW.act_id
            AND e.disposition_id = d.id
            AND e.event_type = 'disposition_succeeded'
       );

    IF missing_outcomes > 0 THEN
      RAISE EXCEPTION
        '[F5] act_completed refused — % disposition(s) lack successful outcome (act %)',
        missing_outcomes, NEW.act_id;
    END IF;

    -- A verification rule of 'none' is the only explicit exemption. For every
    -- other disposition, the LATEST verification evidence must be success. A
    -- historical failure remains in the ledger and may be followed by a retry;
    -- it is never rewritten away.
    SELECT count(*) INTO missing_verification
      FROM account_erasure_dispositions d
     WHERE d.act_id = NEW.act_id
       AND d.verification_rule <> 'none'
       AND COALESCE((
         SELECT e.event_type = 'verification_succeeded'
           FROM account_erasure_execution_events e
          WHERE e.act_id = NEW.act_id
            AND e.disposition_id = d.id
            AND e.event_type IN ('verification_succeeded', 'verification_failed')
          ORDER BY e.event_seq DESC
          LIMIT 1
       ), false) IS NOT TRUE;

    IF missing_verification > 0 THEN
      RAISE EXCEPTION
        '[F5] act_completed refused — % disposition(s) lack current successful verification (act %)',
        missing_verification, NEW.act_id;
    END IF;

    -- An owed obligation remains open until a matching custody_cleared event
    -- with the same disposition + event_ref exists.
    SELECT count(*) INTO open_custody
      FROM account_erasure_execution_events owed
     WHERE owed.act_id = NEW.act_id
       AND owed.event_type = 'custody_owed'
       AND NOT EXISTS (
         SELECT 1 FROM account_erasure_execution_events cleared
          WHERE cleared.act_id = owed.act_id
            AND cleared.disposition_id = owed.disposition_id
            AND cleared.event_type = 'custody_cleared'
            AND cleared.event_ref = owed.event_ref
       );

    IF open_custody > 0 THEN
      RAISE EXCEPTION
        '[F5] act_completed refused — % custody obligation(s) still owed (act %)',
        open_custody, NEW.act_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_erasure_events_validate ON account_erasure_execution_events;
CREATE TRIGGER account_erasure_events_validate
  BEFORE INSERT ON account_erasure_execution_events
  FOR EACH ROW EXECUTE FUNCTION account_erasure_event_validate();

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260917000001: account-erasure P5-A ledger substrate applied';
END $$;

-- ROLLBACK (manual, candidate only — future deployment would require its own governed rollback):
--   DROP TABLE IF EXISTS account_erasure_execution_events;
--   DROP TABLE IF EXISTS account_erasure_dispositions;
--   DROP TABLE IF EXISTS account_erasure_acts;
--   DROP FUNCTION IF EXISTS account_erasure_event_validate();
--   DROP FUNCTION IF EXISTS account_erasure_disposition_insert_guard();
--   DROP FUNCTION IF EXISTS account_erasure_refuse_truncate();
--   DROP FUNCTION IF EXISTS account_erasure_refuse_update_delete();
