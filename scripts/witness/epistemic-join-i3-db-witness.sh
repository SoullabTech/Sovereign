#!/usr/bin/env bash
# JARVIS-KP-01 / I3 — disposable PostgreSQL persistence witness.
# Synthetic data only. Never points at the production database.
set -euo pipefail

DB="${I3_WITNESS_DB:-maia_i3_witness_$$}"
MEMBER="00000000-0000-4000-8000-000000000301"
MIGRATION="database/migrations/20260921000001_epistemic_join_persistence.sql"

cleanup() { dropdb --if-exists "$DB" >/dev/null 2>&1 || true; }
trap cleanup EXIT

dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"
export DATABASE_URL="postgresql:///$DB"
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"

echo "I3-W1 minimal empty substrate -> I3 migration"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL >/dev/null
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  onboarded boolean DEFAULT false
);
SQL
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION" >/dev/null

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL >/dev/null
INSERT INTO members (id, passkey, username, password_hash, onboarded)
VALUES (
  '$MEMBER',
  'i3-synthetic-passkey',
  'i3-synthetic-member',
  'synthetic-not-a-real-password-hash',
  true
);
SQL
echo "I3-W2 adapter writes two admissions and refuses a stale writer"
AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=1 \
I3_MEMBER_ID="$MEMBER" \
DATABASE_URL="$DATABASE_URL" \
npx tsx scripts/witness/epistemic-join-i3-store-witness.ts \
  > /tmp/i3-store-witness.$$

grep -q '"staleRefused":true' /tmp/i3-store-witness.$$
rm -f /tmp/i3-store-witness.$$

echo "I3-W3 persisted population and derived tip"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
DECLARE n integer;
DECLARE tip uuid;
DECLARE standing text;
BEGIN
  SELECT count(*) INTO n FROM epistemic_join_records
   WHERE join_id = 'i3-synthetic-join';
  IF n <> 1 THEN RAISE EXCEPTION 'expected one immutable join, got %', n; END IF;

  SELECT count(*) INTO n FROM epistemic_warrant_records
   WHERE join_id = 'i3-synthetic-join';
  IF n <> 1 THEN RAISE EXCEPTION 'expected one warrant, got %', n; END IF;

  SELECT count(*) INTO n FROM epistemic_join_dependencies
   WHERE join_id = 'i3-synthetic-join';
  IF n <> 2 THEN RAISE EXCEPTION 'expected two reliance rows, got %', n; END IF;
  SELECT count(*) INTO n FROM epistemic_standing_acts
   WHERE join_id = 'i3-synthetic-join';
  IF n <> 2 THEN RAISE EXCEPTION 'expected two standing acts, got %', n; END IF;

  SELECT count(*) INTO n FROM epistemic_join_admissions
   WHERE join_id = 'i3-synthetic-join';
  IF n <> 2 THEN RAISE EXCEPTION 'expected two admissions, got %', n; END IF;

  SELECT admission_id, admitted_standing INTO tip, standing
    FROM epistemic_join_current_standing
   WHERE join_id = 'i3-synthetic-join';
  IF tip <> '00000000-0000-4000-8000-000000000312'::uuid
     OR standing <> 'WARRANTED' THEN
    RAISE EXCEPTION 'derived tip is wrong: % %', tip, standing;
  END IF;
END $$;
SQL

echo "I3-W4 immutable rows reject UPDATE and DELETE"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    UPDATE epistemic_join_records SET envelope = envelope
     WHERE join_id = 'i3-synthetic-join';
    RAISE EXCEPTION 'update unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'update unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN
      RAISE;
    END IF;
  END;

  BEGIN
    DELETE FROM epistemic_join_admissions
     WHERE admission_id = '00000000-0000-4000-8000-000000000312';
    RAISE EXCEPTION 'delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN
      RAISE;
    END IF;
  END;
END $$;
SQL

echo "I3-W5 standing and admission histories cannot branch"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL >/dev/null
DO \$\$
BEGIN
  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-act-illegal-branch', 'i3-synthetic-join', '$MEMBER', NULL,
      'WARRANTED', 'new_evidence', 'w1',
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', 'i3-act-root'
    );
    RAISE EXCEPTION 'standing branch unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO epistemic_join_admissions (
      admission_id, join_id, member_id, previous_admission_id, tip_act_id,
      requested_standing, admitted_standing, requested_jurisdiction,
      admitted_jurisdiction, evaluation_request, evaluation_result
    )
    SELECT
      '00000000-0000-4000-8000-000000000314', join_id, member_id,
      '00000000-0000-4000-8000-000000000311', tip_act_id,
      requested_standing, admitted_standing, requested_jurisdiction,
      admitted_jurisdiction, evaluation_request, evaluation_result
    FROM epistemic_join_admissions
    WHERE admission_id = '00000000-0000-4000-8000-000000000312';
    RAISE EXCEPTION 'admission branch unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END \$\$;
SQL
echo "I3-W6 representation authority is structurally closed"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO epistemic_join_admissions (
      admission_id, join_id, member_id, previous_admission_id, tip_act_id,
      requested_standing, admitted_standing, requested_jurisdiction,
      admitted_jurisdiction, evaluation_request, evaluation_result
    )
    SELECT
      '00000000-0000-4000-8000-000000000315', join_id, member_id,
      '00000000-0000-4000-8000-000000000312', tip_act_id,
      requested_standing, admitted_standing, requested_jurisdiction,
      admitted_jurisdiction, evaluation_request,
      jsonb_set(evaluation_result, '{downstreamRepresentationAuthorized}', 'true')
    FROM epistemic_join_admissions
    WHERE admission_id = '00000000-0000-4000-8000-000000000312';
    RAISE EXCEPTION 'representation-open admission unexpectedly succeeded';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SQL

echo "I3-W7 rollback leaves no partial custody"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL >/dev/null
BEGIN;
INSERT INTO epistemic_join_records (join_id, member_id, envelope)
VALUES (
  'i3-rolled-back',
  '$MEMBER',
  '{"joinId":"i3-rolled-back","memberScope":"$MEMBER"}'
);
ROLLBACK;
DO \$\$
BEGIN
  IF EXISTS (SELECT 1 FROM epistemic_join_records WHERE join_id='i3-rolled-back') THEN
    RAISE EXCEPTION 'rolled-back join survived';
  END IF;
END \$\$;
SQL

echo "I3-W8 manual rollback + direct reconstruction"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DROP VIEW IF EXISTS epistemic_join_current_standing;
DROP TABLE IF EXISTS epistemic_join_admissions;
DROP TABLE IF EXISTS epistemic_adoption_acts;
DROP TABLE IF EXISTS epistemic_standing_acts;
DROP TABLE IF EXISTS epistemic_join_dependencies;
DROP TABLE IF EXISTS epistemic_warrant_records;
DROP TABLE IF EXISTS epistemic_join_records;
DROP FUNCTION IF EXISTS epistemic_append_only_guard();
DROP FUNCTION IF EXISTS epistemic_validate_admission_successor();
DROP FUNCTION IF EXISTS epistemic_validate_standing_successor();
SQL

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION" >/dev/null
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  IF to_regclass('public.epistemic_join_records') IS NULL
     OR to_regclass('public.epistemic_join_admissions') IS NULL
     OR to_regclass('public.epistemic_join_current_standing') IS NULL THEN
    RAISE EXCEPTION 'I3 schema did not reconstruct after rollback';
  END IF;
END $$;
SQL

echo "I3 DB WITNESS: PASS"
echo "  minimal empty substrate + I3 migration: PASS"
echo "  adapter succession: PASS"
echo "  stale writer refusal: PASS"
echo "  append-only UPDATE/DELETE: PASS"
echo "  no standing/admission branch: PASS"
echo "  representation closure: PASS"
echo "  rollback atomicity: PASS"
echo "  rollback/reconstruction: PASS"
