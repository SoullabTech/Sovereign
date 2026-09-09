-- B3 FALSIFIER — maia_turns derivative custody.
-- Run against a DISPOSABLE database only. Every fixture is rolled back.
-- Obligation numbers are the founder's, verbatim.
\set ON_ERROR_STOP on
\pset pager off
BEGIN;

CREATE TEMP TABLE r(n TEXT, ok BOOLEAN, note TEXT) ON COMMIT DROP;
CREATE OR REPLACE FUNCTION pg_temp.chk(n TEXT, ok BOOLEAN, note TEXT DEFAULT '')
RETURNS void AS $$ BEGIN INSERT INTO r VALUES (n, ok, note); END $$ LANGUAGE plpgsql;

-- Two members, and a session id each.
INSERT INTO members (id, passkey, username, password_hash, name)
VALUES ('11111111-1111-4111-8111-111111111111','K-A','ua','h','A'),
       ('22222222-2222-4222-8222-222222222222','K-B','ub','h','B');

-- ── 1 · historical NULL ownership is representable without invented attribution
--        The gate refuses new NULLs, so history is written the only way history
--        can be: as rows that already existed. ALTER … DISABLE TRIGGER is the
--        honest simulation of "these predate the gate".
ALTER TABLE maia_turns DISABLE TRIGGER maia_turns_require_member_identity_trigger;
INSERT INTO maia_turns (session_id, turn_index, user_text, maia_text, processing_profile)
VALUES ('legacy-session', 0, 'historical member words', 'historical maia words', 'CORE');
ALTER TABLE maia_turns ENABLE TRIGGER maia_turns_require_member_identity_trigger;
SELECT pg_temp.chk('1 historical NULL ownership representable',
  (SELECT count(*) = 1 FROM maia_turns WHERE member_id IS NULL),
  'no attribution invented');

-- ── 2 · a NEW row without member identity is rejected BY THE DATABASE
DO $$
BEGIN
  INSERT INTO maia_turns (session_id, turn_index, user_text, maia_text, processing_profile)
  VALUES ('s-new', 0, 'x', 'y', 'CORE');
  PERFORM pg_temp.chk('2 new row without identity rejected', false, 'INSERT SUCCEEDED');
EXCEPTION WHEN others THEN
  PERFORM pg_temp.chk('2 new row without identity rejected', true, SQLERRM);
END $$;

-- ── 3 · a NEW row with INVALID member identity is rejected
DO $$
BEGIN
  INSERT INTO maia_turns (session_id, turn_index, user_text, maia_text, processing_profile, member_id)
  VALUES ('s-bad', 0, 'x', 'y', 'CORE', '99999999-9999-4999-8999-999999999999');
  PERFORM pg_temp.chk('3 invalid member identity rejected', false, 'INSERT SUCCEEDED');
EXCEPTION WHEN others THEN
  PERFORM pg_temp.chk('3 invalid member identity rejected', true, SQLERRM);
END $$;

-- Attributable rows for A and B, plus one child of each family and an
-- expansion_events row pointing at A's turn (the obstruction found test-first).
INSERT INTO maia_turns (id, session_id, turn_index, user_text, maia_text, processing_profile, member_id)
VALUES (9001,'s-a',0,'A words','maia to A','CORE','11111111-1111-4111-8111-111111111111'),
       (9002,'s-b',0,'B words','maia to B','CORE','22222222-2222-4222-8222-222222222222');

INSERT INTO maia_turn_feedback (turn_id) VALUES (9001), (9002);
INSERT INTO maia_engine_comparisons (turn_id, engine_name, response_text)
VALUES (9001, 'e', 'r');
INSERT INTO maia_misattunements (turn_id, category) VALUES (9001, 'c');
INSERT INTO maia_voice_feedback (turn_id) VALUES (9001);
INSERT INTO maia_voice_turns (turn_id, session_id) VALUES (9001, 's-a');
INSERT INTO expansion_events (session_id, turn_id, event_type, source)
VALUES ('s-a', 9001, 'test', 'falsifier');

-- ── 4 · deleting member A leaves ZERO attributable rows for A, children included
DELETE FROM members WHERE id = '11111111-1111-4111-8111-111111111111';

SELECT pg_temp.chk('4 zero maia_turns rows remain for A',
  (SELECT count(*) = 0 FROM maia_turns WHERE member_id = '11111111-1111-4111-8111-111111111111'));
SELECT pg_temp.chk('4 every cascading child family is empty for A',
  (SELECT (SELECT count(*) FROM maia_turn_feedback      WHERE turn_id = 9001) = 0
      AND (SELECT count(*) FROM maia_engine_comparisons WHERE turn_id = 9001) = 0
      AND (SELECT count(*) FROM maia_misattunements     WHERE turn_id = 9001) = 0
      AND (SELECT count(*) FROM maia_voice_feedback     WHERE turn_id = 9001) = 0
      AND (SELECT count(*) FROM maia_voice_turns        WHERE turn_id = 9001) = 0));
-- ⭐ expansion_events is UNLINKED, not destroyed: it carries its own member_id
--    and therefore its own deletion obligation.
SELECT pg_temp.chk('4 expansion_events unlinked, not destroyed',
  (SELECT count(*) = 1 FROM expansion_events WHERE session_id = 's-a' AND turn_id IS NULL));

-- ── 5 · member B is untouched
SELECT pg_temp.chk('5 member B rows untouched',
  (SELECT count(*) = 1 FROM maia_turns WHERE member_id = '22222222-2222-4222-8222-222222222222')
   AND (SELECT count(*) = 1 FROM maia_turn_feedback WHERE turn_id = 9002));

-- ── 6 · deletion established by POST-DELETE ABSENCE, never by a DELETE running
SELECT pg_temp.chk('6 absence is the evidence',
  (SELECT count(*) = 0 FROM maia_turns
    WHERE user_text = 'A words' OR maia_text = 'maia to A'),
  'text itself is gone, not merely unreferenced');

-- ── 7 · a recorded deletion obligation cannot be resurrected by restore
WITH m AS (
  INSERT INTO deletion_manifests (reason_class, authorized_by, note)
  VALUES ('member_deletion', 'b3-falsifier', 'disposable fixture')
  RETURNING id
)
INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
SELECT id, 'maia_turns', '9003' FROM m;
DO $$
DECLARE n INT;
BEGIN
  INSERT INTO maia_turns (id, session_id, turn_index, user_text, maia_text, processing_profile, member_id)
  VALUES (9003,'s-b',1,'restored','restored','CORE','22222222-2222-4222-8222-222222222222');
  SELECT count(*) INTO n FROM maia_turns WHERE id = 9003;
  PERFORM pg_temp.chk('7 tombstoned row cannot be restored', n = 0,
    'trigger returns NULL — suppression, not error');
EXCEPTION WHEN others THEN
  PERFORM pg_temp.chk('7 tombstoned row cannot be restored', true, SQLERRM);
END $$;

SELECT n AS obligation, CASE WHEN ok THEN 'PASS' ELSE 'FAIL' END AS result, note FROM r ORDER BY n;
SELECT count(*) FILTER (WHERE ok) AS passed, count(*) FILTER (WHERE NOT ok) AS failed FROM r;

ROLLBACK;
