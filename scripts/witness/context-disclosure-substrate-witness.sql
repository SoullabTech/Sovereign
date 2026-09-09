-- SUBSTRATE-A(D) — EXECUTION witness for context_disclosure_receipts.
-- Run against a DISPOSABLE shadow only. Every fixture is rolled back.
--   psql -d <shadow> -v ON_ERROR_STOP=0 -f scripts/witness/context-disclosure-substrate-witness.sql
-- A witness is not evidence until the runner actually executes it: each check
-- prints PASS or FAIL and the refusals are provoked, never assumed.
\set QUIET on
\pset tuples_only on
\pset format unaligned
BEGIN;

INSERT INTO runtime_consent_state (request_id, member_id, posture) VALUES ('req-1','m-1','normal');
INSERT INTO deletion_manifests (id, reason_class, authorized_by, note)
  VALUES ('11111111-1111-1111-1111-111111111111','member_deletion','witness','content-free');

CREATE OR REPLACE FUNCTION w(label text, ok boolean) RETURNS void AS $$
BEGIN RAISE NOTICE '%  %', CASE WHEN ok THEN 'PASS' ELSE 'FAIL' END, label; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refuses(label text, stmt text, expect text) RETURNS void AS $$
BEGIN
  BEGIN
    EXECUTE stmt;
    PERFORM w(label || ' (statement was ACCEPTED)', false);
  EXCEPTION WHEN others THEN
    PERFORM w(label, SQLERRM LIKE '%' || expect || '%');
  END;
END; $$ LANGUAGE plpgsql;

DO $$
DECLARE s text; n int;
BEGIN
  -- B · the consent reference must resolve
  PERFORM refuses('B1 request_ref pointing at no consent record is refused',
    $q$INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,authorized_by,gesture,policy_version,state)
       VALUES ('d-x','m-1','req-nonexistent','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','member','ask_maia','context-disclosure-v1','attempted')$q$,
    'foreign key');

  INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,authorized_by,gesture,policy_version,state)
    VALUES ('d-1','m-1','req-1','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','member','ask_maia','context-disclosure-v1','attempted');
  SELECT state INTO s FROM context_disclosure_receipts WHERE disclosure_id='d-1';
  PERFORM w('B2 a resolving receipt mints in the attempted state', s = 'attempted');

  -- shape refusals
  PERFORM refuses('S1 a passage-scoped section_ref is refused (locator)',
    $q$INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,section_ref,authorized_by,gesture,policy_version,state)
       VALUES ('d-2','m-1','req-1','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','s1','member','ask_maia','context-disclosure-v1','attempted')$q$,
    'section_scope_only');
  PERFORM refuses('S2 authorized_by other than member is refused (assembly is not authorization)',
    $q$INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,authorized_by,gesture,policy_version,state)
       VALUES ('d-3','m-1','req-1','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','system','ask_maia','context-disclosure-v1','attempted')$q$,
    'authorized_by');
  PERFORM refuses('S3 a withheld state does not exist',
    $q$UPDATE context_disclosure_receipts SET state='withheld' WHERE disclosure_id='d-1'$q$, 'state');

  -- monotonic immutability
  PERFORM refuses('M1 an identifying field cannot be rewritten',
    $q$UPDATE context_disclosure_receipts SET source_ref='w2' WHERE disclosure_id='d-1'$q$,
    'immutable at mint');
  UPDATE context_disclosure_receipts SET state='crossed', crossed_at=NOW() WHERE disclosure_id='d-1';
  SELECT state INTO s FROM context_disclosure_receipts WHERE disclosure_id='d-1';
  PERFORM w('M2 attempted -> crossed is lawful', s = 'crossed');
  PERFORM refuses('M3 crossed -> attempted is refused (no walking a crossing back)',
    $q$UPDATE context_disclosure_receipts SET state='attempted', crossed_at=NULL WHERE disclosure_id='d-1'$q$,
    'unlawful state transition');

  -- re-confirming preserves the original timestamp: a retry is not new evidence
  DECLARE t1 timestamptz; t2 timestamptz;
  BEGIN
    SELECT crossed_at INTO t1 FROM context_disclosure_receipts WHERE disclosure_id='d-1';
    PERFORM pg_sleep(0.05);
    UPDATE context_disclosure_receipts SET state='crossed', crossed_at=NOW() WHERE disclosure_id='d-1';
    SELECT crossed_at INTO t2 FROM context_disclosure_receipts WHERE disclosure_id='d-1';
    PERFORM w('M4 re-confirming preserves the original crossed_at', t1 = t2);
  END;

  -- idempotency at the DB level
  INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,authorized_by,gesture,policy_version,state)
    VALUES ('d-1','m-1','req-1','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','member','ask_maia','context-disclosure-v1','attempted')
    ON CONFLICT (disclosure_id) DO NOTHING;
  SELECT count(*) INTO n FROM context_disclosure_receipts WHERE disclosure_id='d-1';
  PERFORM w('I1 a reused disclosure_id creates no second receipt', n = 1);

  -- C · custody
  PERFORM refuses('C1 an unnamed DELETE is refused (ordinary pruning cannot reach a receipt)',
    $q$DELETE FROM context_disclosure_receipts WHERE disclosure_id='d-1'$q$,
    'governed custody act');
  PERFORM refuses('C2 a DELETE naming a nonexistent manifest is refused',
    $q$SET LOCAL app.disclosure_deletion_manifest = '22222222-2222-2222-2222-222222222222'$q$ || '; ' ||
    $q$DELETE FROM context_disclosure_receipts WHERE disclosure_id='d-1'$q$,
    'does not exist');
END $$;

-- C3/C4 need statement-level SET LOCAL, so they run outside the DO block.
SET LOCAL app.disclosure_deletion_manifest = '11111111-1111-1111-1111-111111111111';
DELETE FROM context_disclosure_receipts WHERE disclosure_id='d-1';
SELECT w('C3 a governed DELETE naming a real manifest succeeds',
         (SELECT count(*) FROM context_disclosure_receipts WHERE disclosure_id='d-1') = 0);

INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
  VALUES ('11111111-1111-1111-1111-111111111111','context_disclosure_receipts','d-1');
SELECT refuses('C4 a tombstoned receipt cannot be restored',
  $q$INSERT INTO context_disclosure_receipts (disclosure_id,member_id,request_ref,boundary,source_class,participation_basis,source_ref,scope_kind,authorized_by,gesture,policy_version,state)
     VALUES ('d-1','m-1','req-1','writers_studio.focus->maia_cognition','work','member_invoked','w1','passage','member','ask_maia','context-disclosure-v1','attempted')$q$,
  'reason=tombstone');

ROLLBACK;
