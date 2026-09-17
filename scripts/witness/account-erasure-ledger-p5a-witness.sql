\set ON_ERROR_STOP on
\pset format unaligned
BEGIN;

CREATE OR REPLACE FUNCTION p5a_w(label text, ok boolean) RETURNS void AS $$
BEGIN
  RAISE NOTICE '%  %', CASE WHEN ok THEN 'PASS' ELSE 'FAIL' END, label;
  IF NOT ok THEN RAISE EXCEPTION 'P5-A witness failed: %', label; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION p5a_refuses(label text, stmt text, fragment text) RETURNS void AS $$
BEGIN
  BEGIN
    EXECUTE stmt;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%' || fragment || '%' THEN
      RAISE NOTICE 'PASS  %', label;
      RETURN;
    END IF;
    RAISE EXCEPTION 'P5-A witness wrong refusal for %: %', label, SQLERRM;
  END;
  RAISE EXCEPTION 'P5-A witness expected refusal but statement succeeded: %', label;
END;
$$ LANGUAGE plpgsql;

-- A0: an act with no plan may not be frozen.
INSERT INTO account_erasure_acts
  (id, subject_member_id, policy_version, registry_version, request_ref)
VALUES
  ('00000000-0000-4000-8000-0000000000a0', '10000000-0000-4000-8000-0000000000a0',
   'f5-p5a-witness', 'account-erasure-registry-v1', 'witness-empty');

SELECT p5a_refuses(
  'W1 empty plan cannot freeze',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a0','plan_frozen','witness')$$,
  'empty erasure plan cannot be frozen'
);

-- A1: one real plan row with verification required.
INSERT INTO account_erasure_acts
  (id, subject_member_id, policy_version, registry_version, request_ref)
VALUES
  ('00000000-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-0000000000a1',
   'f5-p5a-witness', 'account-erasure-registry-v1', 'witness-main');

INSERT INTO account_erasure_dispositions
  (id, act_id, domain_key, locus_key, member_label, binding_rule,
   planned_disposition, authority_reason, verification_rule, adapter_key, requires_s5)
VALUES
  ('20000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1',
   'witness', 'witness.store', 'witness data', 'subject_member_id',
   'erase', 'witness', 'row_absent', 'witness_adapter', true);

INSERT INTO account_erasure_execution_events
  (id, act_id, event_type, result_code)
VALUES
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1',
   'plan_frozen', 'plan_frozen');

SELECT p5a_refuses(
  'W2 plan rows cannot be added after freeze',
  $$INSERT INTO account_erasure_dispositions
      (act_id,domain_key,locus_key,member_label,binding_rule,planned_disposition,
       authority_reason,verification_rule,adapter_key,requires_s5)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','witness','late.store','late data',
       'subject_member_id','erase','late','row_absent','late_adapter',false)$$,
  'plan already frozen'
);

SELECT p5a_refuses(
  'W3 act UPDATE is refused',
  $$UPDATE account_erasure_acts SET request_ref='rewritten'
    WHERE id='00000000-0000-4000-8000-0000000000a1'$$,
  'append-only'
);

SELECT p5a_refuses(
  'W4 disposition DELETE is refused',
  $$DELETE FROM account_erasure_dispositions
    WHERE id='20000000-0000-4000-8000-0000000000a1'$$,
  'append-only'
);

SELECT p5a_refuses(
  'W5 TRUNCATE is refused',
  $$TRUNCATE account_erasure_execution_events$$,
  'TRUNCATE refused'
);

SELECT p5a_refuses(
  'W6 completion refuses a missing disposition outcome',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','act_completed','too_early')$$,
  'lack successful outcome'
);

INSERT INTO account_erasure_execution_events
  (id, act_id, disposition_id, event_type, result_code, evidence_ref)
VALUES
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-0000000000a1',
   '20000000-0000-4000-8000-0000000000a1', 'disposition_succeeded', 'deleted', 'witness-delete');

SELECT p5a_refuses(
  'W7 completion refuses missing required verification',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','act_completed','too_early')$$,
  'lack current successful verification'
);

INSERT INTO account_erasure_execution_events
  (id, act_id, disposition_id, event_type, result_code, evidence_ref)
VALUES
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-0000000000a1',
   '20000000-0000-4000-8000-0000000000a1', 'verification_failed', 'row_still_present', 'witness-verify-failed');

SELECT p5a_refuses(
  'W8 latest failed verification still blocks completion',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','act_completed','too_early')$$,
  'lack current successful verification'
);

INSERT INTO account_erasure_execution_events
  (id, act_id, disposition_id, event_type, result_code, evidence_ref)
VALUES
  ('30000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-0000000000a1',
   '20000000-0000-4000-8000-0000000000a1', 'verification_succeeded', 'row_absent', 'witness-verify-retry');

INSERT INTO account_erasure_execution_events
  (id, act_id, disposition_id, event_type, result_code, event_ref)
VALUES
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-0000000000a1',
   '20000000-0000-4000-8000-0000000000a1', 'custody_owed', 'external_delete_owed', 'custody-1');

SELECT p5a_refuses(
  'W9 completion refuses open owed custody',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','act_completed','too_early')$$,
  'custody obligation(s) still owed'
);

SELECT p5a_refuses(
  'W10 custody cannot clear without a matching owed record',
  $$INSERT INTO account_erasure_execution_events
      (act_id,disposition_id,event_type,result_code,event_ref)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','20000000-0000-4000-8000-0000000000a1',
       'custody_cleared','cleared','never-owed')$$,
  'custody cannot clear without a matching owed record'
);

INSERT INTO account_erasure_execution_events
  (id, act_id, disposition_id, event_type, result_code, event_ref)
VALUES
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-0000000000a1',
   '20000000-0000-4000-8000-0000000000a1', 'custody_cleared', 'cleared', 'custody-1');

INSERT INTO account_erasure_execution_events
  (id, act_id, event_type, result_code)
VALUES
  ('30000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-0000000000a1',
   'act_completed', 'completed');

SELECT p5a_w(
  'W11 completion succeeds only after outcome + verification + custody clear',
  (SELECT count(*) = 1 FROM account_erasure_execution_events
    WHERE act_id='00000000-0000-4000-8000-0000000000a1' AND event_type='act_completed')
);

SELECT p5a_refuses(
  'W12 non-correction evidence cannot append after terminal state',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a1','execution_started','late')$$,
  'already terminal'
);

INSERT INTO account_erasure_execution_events
  (id, act_id, event_type, result_code, supersedes_event_id)
VALUES
  ('30000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-0000000000a1',
   'correction', 'clarification_only', '30000000-0000-4000-8000-000000000003');

SELECT p5a_w(
  'W13 correction is additive and preserves the original event',
  (SELECT count(*) = 2 FROM account_erasure_execution_events
    WHERE id IN ('30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000007'))
);

SELECT p5a_refuses(
  'W14 execution event UPDATE is refused',
  $$UPDATE account_erasure_execution_events SET result_code='rewritten'
    WHERE id='30000000-0000-4000-8000-000000000003'$$,
  'append-only'
);

-- A2: destructive work followed by "refused / no change" is prohibited.
INSERT INTO account_erasure_acts
  (id, subject_member_id, policy_version, registry_version)
VALUES
  ('00000000-0000-4000-8000-0000000000a2', '10000000-0000-4000-8000-0000000000a2',
   'f5-p5a-witness', 'account-erasure-registry-v1');

INSERT INTO account_erasure_dispositions
  (id, act_id, domain_key, locus_key, member_label, binding_rule,
   planned_disposition, authority_reason, verification_rule, adapter_key, requires_s5)
VALUES
  ('20000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-0000000000a2',
   'witness', 'witness.destructive', 'witness data', 'subject_member_id',
   'erase', 'witness', 'none', 'witness_adapter', false),
  ('20000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000a2',
   'witness', 'witness.refusal', 'blocked data', 'subject_member_id',
   'refuse', 'witness refusal', 'none', 'none', false);

INSERT INTO account_erasure_execution_events
  (act_id,event_type,result_code)
VALUES
  ('00000000-0000-4000-8000-0000000000a2','plan_frozen','plan_frozen');

INSERT INTO account_erasure_execution_events
  (act_id,disposition_id,event_type,result_code)
VALUES
  ('00000000-0000-4000-8000-0000000000a2','20000000-0000-4000-8000-0000000000a2',
   'disposition_succeeded','deleted');

SELECT p5a_refuses(
  'W15 act_refused cannot claim no change after destructive success',
  $$INSERT INTO account_erasure_execution_events
      (act_id,event_type,result_code)
    VALUES
      ('00000000-0000-4000-8000-0000000000a2','act_refused','no_change')$$,
  'act_refused means no destructive disposition occurred'
);

-- Catalogue proof: the durable act has no FK at all, especially none to members.
SELECT p5a_w(
  'W16 durable act has no FK back to members',
  NOT EXISTS (
    SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
     WHERE t.relname = 'account_erasure_acts'
       AND c.contype = 'f'
  )
);

ROLLBACK;
