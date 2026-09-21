\set ON_ERROR_STOP on
-- Run only against a newly created synthetic database. No manuscript tables.
DO $$ BEGIN
  IF current_database() <> 'ws_disclosure_synthetic_20260921' THEN
    RAISE EXCEPTION 'synthetic database required';
  END IF;
END $$;
-- Minimal dependencies for the real receipt migrations and triggers.
CREATE TABLE provenance_tombstones (object_kind text, object_id text);
CREATE TABLE runtime_consent_state (request_id text PRIMARY KEY);
\ir ../../database/migrations/20260909000001_context_disclosure_receipts.sql
\ir ../../database/migrations/20260913000002_disclosure_boundary_developmental_ask.sql
\ir ../../database/migrations/20260913000003_disclosure_gesture_authorize_sections.sql
\ir ../../database/migrations/20260921000001_disclosure_boundary_editorial_turn.sql
\ir ../../database/migrations/20260921000002_editorial_disclosure_destination.sql
INSERT INTO runtime_consent_state VALUES ('synthetic-request');
DO $$ BEGIN
  BEGIN
    INSERT INTO context_disclosure_receipts
      (disclosure_id, member_id, request_ref, boundary, source_class,
       participation_basis, source_ref, scope_kind, authorized_by, gesture, policy_version, state)
    VALUES ('missing-destination', 'synthetic-member', 'synthetic-request',
      'writers_studio.editorial_turn->maia_cognition', 'work', 'member_invoked',
      'synthetic-work', 'passage', 'member', 'work_with_this', 'context-disclosure-v1', 'attempted');
    RAISE EXCEPTION 'FAIL: missing destination accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
INSERT INTO context_disclosure_receipts
  (disclosure_id, member_id, request_ref, boundary, source_class,
   participation_basis, source_ref, scope_kind, authorized_by, gesture, policy_version, state, destination)
VALUES ('synthetic-attempt', 'synthetic-member', 'synthetic-request',
  'writers_studio.editorial_turn->maia_cognition', 'work', 'member_invoked',
  'synthetic-work', 'passage', 'member', 'work_with_this', 'context-disclosure-v1', 'attempted', 'anthropic');
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM context_disclosure_receipts WHERE disclosure_id='synthetic-attempt' AND state='attempted') THEN
    RAISE EXCEPTION 'FAIL: attempt not durable';
  END IF;
  BEGIN
    UPDATE context_disclosure_receipts SET state='crossed', crossed_at=NOW(), destination=NULL WHERE disclosure_id='synthetic-attempt';
    RAISE EXCEPTION 'FAIL: destination changed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'disclosure destination is immutable' THEN RAISE; END IF;
  END;
END $$;
UPDATE context_disclosure_receipts SET state='crossed', crossed_at=NOW() WHERE disclosure_id='synthetic-attempt';
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM context_disclosure_receipts WHERE disclosure_id='synthetic-attempt' AND state='crossed' AND destination='anthropic') THEN
    RAISE EXCEPTION 'FAIL: confirmation not durable';
  END IF;
END $$;
SELECT 'PASS: migrations, destination requirement, immutability, attempted and crossed' AS result;
