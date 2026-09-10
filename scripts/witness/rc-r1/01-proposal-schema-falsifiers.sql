\set ON_ERROR_STOP on
CREATE OR REPLACE FUNCTION expect_refusal(sql text, label text) RETURNS void AS $$
BEGIN
  BEGIN
    EXECUTE sql;
    RAISE WARNING 'FAIL  % — was ALLOWED but must be refused', label;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'PASS  % — refused (%)', label, left(SQLERRM, 60);
  END;
END; $$ LANGUAGE plpgsql;

INSERT INTO members (id) VALUES ('11111111-1111-1111-1111-111111111111');
INSERT INTO member_manuscripts (id) VALUES ('22222222-2222-2222-2222-222222222222');
INSERT INTO manuscript_working_drafts (id) VALUES ('33333333-3333-3333-3333-333333333333');
INSERT INTO manuscript_draft_sections (id, draft_id, position)
  VALUES ('44444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333333',0);
INSERT INTO ask_threads (id) VALUES ('55555555-5555-5555-5555-555555555555');
INSERT INTO ask_turns VALUES ('55555555-5555-5555-5555-555555555555',4,'maia','...');
INSERT INTO ask_turns VALUES ('55555555-5555-5555-5555-555555555555',6,'maia','...');

INSERT INTO manuscript_revision_proposals
 (id, manuscript_id, draft_id, section_id, member_id, thread_id, produced_in_turn_index,
  proposed_text, reason, based_on, read_state, coverage, origin, authority, producer, input_fingerprint)
VALUES ('99999999-9999-9999-9999-999999999999',
  '22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555', 4,
  'proposed wording','because','{"kind":"section"}','{"revisionNumber":1}','{"sections":{}}',
  'work','{"act":"x"}','DEVELOPMENTAL-READER-04','fp1');
\echo 'PASS  T1 — proposal inserts with a producer turn'

SELECT expect_refusal($$UPDATE manuscript_revision_proposals SET proposed_text='rewritten'$$, 'T2 frozen: proposed_text');
SELECT expect_refusal($$UPDATE manuscript_revision_proposals SET produced_in_turn_index=6$$, 'T3 producer turn reassigned');
SELECT expect_refusal($$INSERT INTO manuscript_revision_proposals (id,manuscript_id,draft_id,section_id,member_id,proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint,derived_from_candidate_id) VALUES (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','t','r','{}','{}','{}','work','{}','p','f','88888888-8888-8888-8888-888888888888')$$, 'T4 partial candidate reference');
SELECT expect_refusal($$INSERT INTO manuscript_revision_proposals (id,manuscript_id,draft_id,section_id,member_id,proposed_text,reason,based_on,read_state,coverage,origin,producer,input_fingerprint) VALUES (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','t','r','{}','{}','{}','candidate','p','f')$$, 'T5 origin=candidate with no reference');
SELECT expect_refusal($$INSERT INTO manuscript_revision_proposals (id,manuscript_id,draft_id,section_id,member_id,proposed_text,reason,based_on,read_state,coverage,origin,producer,input_fingerprint) VALUES (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','t','r','{}','{}','{}','work','p','f')$$, 'T6 origin=work with no authority');
SELECT expect_refusal($$INSERT INTO manuscript_revision_proposals (id,manuscript_id,draft_id,section_id,member_id,thread_id,proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint) VALUES (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','55555555-5555-5555-5555-555555555555','t','r','{}','{}','{}','work','{}','p','f')$$, 'T7 thread without turn index');
SELECT expect_refusal($$INSERT INTO manuscript_revision_proposals (id,manuscript_id,draft_id,section_id,member_id,thread_id,produced_in_turn_index,proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint) VALUES (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','55555555-5555-5555-5555-555555555555',99,'t','r','{}','{}','{}','work','{}','p','f')$$, 'T8 nonexistent producer turn');

UPDATE manuscript_revision_proposals SET declined_at = now();
\echo 'PASS  T9 — declined_at is writable (rejection is a recorded act)'

-- ⭐ THE CRITICAL ONE: member deletes the thread. ON DELETE SET NULL must survive the freeze trigger.
DELETE FROM ask_threads WHERE id='55555555-5555-5555-5555-555555555555';
\echo 'PASS  T10 — thread deletion SUCCEEDS through the freeze trigger'
SELECT CASE WHEN count(*)=1 THEN 'PASS  T11 — proposal survives the deletion' ELSE 'FAIL  T11' END
  FROM manuscript_revision_proposals WHERE id='99999999-9999-9999-9999-999999999999';
SELECT CASE WHEN thread_id IS NULL AND produced_in_turn_index IS NULL
  THEN 'PASS  T12 — lineage severed to NULL, not ghosted' ELSE 'FAIL  T12' END
  FROM manuscript_revision_proposals WHERE id='99999999-9999-9999-9999-999999999999';
SELECT CASE WHEN proposed_text='proposed wording' THEN 'PASS  T13 — what MAIA proposed is intact after severance' ELSE 'FAIL  T13' END
  FROM manuscript_revision_proposals WHERE id='99999999-9999-9999-9999-999999999999';

INSERT INTO ask_threads (id) VALUES ('66666666-6666-6666-6666-666666666666');
INSERT INTO ask_turns VALUES ('66666666-6666-6666-6666-666666666666',1,'maia','...');
SELECT expect_refusal($$UPDATE manuscript_revision_proposals SET thread_id='66666666-6666-6666-6666-666666666666', produced_in_turn_index=1 WHERE id='99999999-9999-9999-9999-999999999999'$$, 'T14 severed proposal re-acquiring an origin');
