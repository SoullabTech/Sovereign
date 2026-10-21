#!/usr/bin/env bash
# JARVIS-KP-01 / I3 — disposable PostgreSQL persistence witness.
# Synthetic data only. Never points at the production database.
set -euo pipefail

DB="${I3_WITNESS_DB:-maia_i3_witness_$$}"
MEMBER="00000000-0000-4000-8000-000000000301"
MEMBER_B="00000000-0000-4000-8000-000000000302"
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
VALUES
(
  '$MEMBER',
  'i3-synthetic-passkey',
  'i3-synthetic-member',
  'synthetic-not-a-real-password-hash',
  true
),
(
  '$MEMBER_B',
  'i3-synthetic-passkey-b',
  'i3-synthetic-member-b',
  'synthetic-not-a-real-password-hash',
  true
);
SQL
echo "I3-W2 adapter writes two admissions and refuses a stale writer"
AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=true \
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

echo "I3-W3A persistence round-trip, adoption provenance, and discharge history"
AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=true \
I3_MEMBER_ID="$MEMBER" \
DATABASE_URL="$DATABASE_URL" \
npx tsx scripts/witness/epistemic-join-i3-roundtrip-witness.ts \
  > /tmp/i3-roundtrip-witness.$$
grep -q '"roundTrip":true' /tmp/i3-roundtrip-witness.$$
grep -q '"dischargePreservedHistory":true' /tmp/i3-roundtrip-witness.$$
rm -f /tmp/i3-roundtrip-witness.$$

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
    DELETE FROM epistemic_join_records WHERE join_id = 'i3-synthetic-join';
    RAISE EXCEPTION 'join delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'join delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    UPDATE epistemic_warrant_records SET warrant = warrant
     WHERE join_id = 'i3-synthetic-join' AND warrant_id = 'w1';
    RAISE EXCEPTION 'warrant update unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'warrant update unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    DELETE FROM epistemic_warrant_records
     WHERE join_id = 'i3-synthetic-join' AND warrant_id = 'w1';
    RAISE EXCEPTION 'warrant delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'warrant delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    UPDATE epistemic_standing_acts SET claimed_standing = claimed_standing
     WHERE act_id = 'i3-act-root';
    RAISE EXCEPTION 'standing update unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'standing update unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    DELETE FROM epistemic_standing_acts WHERE act_id = 'i3-act-root';
    RAISE EXCEPTION 'standing delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'standing delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    UPDATE epistemic_adoption_acts SET proposition_as_put = proposition_as_put
     WHERE act_id = 'i3-rt-adopt';
    RAISE EXCEPTION 'adoption update unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'adoption update unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    DELETE FROM epistemic_adoption_acts WHERE act_id = 'i3-rt-adopt';
    RAISE EXCEPTION 'adoption delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'adoption delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
  END;

  BEGIN
    DELETE FROM epistemic_join_admissions
     WHERE admission_id = '00000000-0000-4000-8000-000000000312';
    RAISE EXCEPTION 'admission delete unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'admission delete unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'epistemic join persistence is append-only:%' THEN RAISE; END IF;
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

echo "I3-W5A predecessor, member-scope, root, and attachment falsifiers"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL >/dev/null
INSERT INTO epistemic_join_records (join_id, member_id, envelope)
VALUES
  ('i3-member-b-join', '$MEMBER_B', '{"joinId":"i3-member-b-join","memberScope":"$MEMBER_B"}'),
  ('i3-other-join', '$MEMBER', '{"joinId":"i3-other-join","memberScope":"$MEMBER"}');

INSERT INTO epistemic_standing_acts
  (act_id, join_id, member_id, component_id, claimed_standing, basis,
   warrant_ref, authorship, jurisdiction, supersedes_act_id)
VALUES (
  'i3-component-root', 'i3-synthetic-join', '$MEMBER', 'c-1',
  'CANDIDATE_UNESTABLISHED', 'initial_proposal', NULL,
  '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
  'scientific_evidence', NULL
);

DO \$\$
BEGIN
  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-act-root', 'i3-synthetic-join', '$MEMBER', NULL,
      'WARRANTED', 'new_evidence', 'w1',
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', 'i3-act-successor'
    );
    RAISE EXCEPTION 'duplicate act id unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-unknown-parent', 'i3-synthetic-join', '$MEMBER', NULL,
      'WARRANTED', 'new_evidence', 'w1',
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', 'ghost-act'
    );
    RAISE EXCEPTION 'unknown predecessor unexpectedly succeeded';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-cross-member', 'i3-member-b-join', '$MEMBER_B', NULL,
      'CANDIDATE_UNESTABLISHED', 'new_evidence', NULL,
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic-b"}',
      'scientific_evidence', 'i3-act-root'
    );
    RAISE EXCEPTION 'cross-member predecessor unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'cross-member predecessor unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE '%same member/join/subject%' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-cross-join', 'i3-other-join', '$MEMBER', NULL,
      'CANDIDATE_UNESTABLISHED', 'new_evidence', NULL,
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', 'i3-act-root'
    );
    RAISE EXCEPTION 'cross-join predecessor unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'cross-join predecessor unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE '%same member/join/subject%' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-cross-component', 'i3-synthetic-join', '$MEMBER', 'c-2',
      'CANDIDATE_UNESTABLISHED', 'new_evidence', NULL,
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', 'i3-component-root'
    );
    RAISE EXCEPTION 'cross-component predecessor unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'cross-component predecessor unexpectedly succeeded' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE '%same member/join/subject%' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-second-root', 'i3-synthetic-join', '$MEMBER', NULL,
      'WARRANTED', 'warrant_admission', 'w1',
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic"}',
      'scientific_evidence', NULL
    );
    RAISE EXCEPTION 'duplicate standing root unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO epistemic_standing_acts
      (act_id, join_id, member_id, component_id, claimed_standing, basis,
       warrant_ref, authorship, jurisdiction, supersedes_act_id)
    VALUES (
      'i3-cross-member-warrant', 'i3-member-b-join', '$MEMBER_B', NULL,
      'WARRANTED', 'warrant_admission', 'w1',
      '{"authorClass":"SOURCE_AUTHORED","roleExercised":"source","authorRef":"synthetic-b"}',
      'scientific_evidence', NULL
    );
    RAISE EXCEPTION 'cross-member warrant attachment unexpectedly succeeded';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO epistemic_join_dependencies
      (join_id, member_id, ref_id, dependence_mode, ordinal)
    VALUES ('i3-synthetic-join', '$MEMBER_B', 'foreign-ref', 'reliance', 0);
    RAISE EXCEPTION 'cross-member dependency unexpectedly succeeded';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
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

echo "I3-W6A derived current standing is not a writable authority surface"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    UPDATE epistemic_join_current_standing
       SET admitted_standing = 'PROMOTED'
     WHERE join_id = 'i3-synthetic-join';
    RAISE EXCEPTION 'current-standing view unexpectedly writable';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'current-standing view unexpectedly writable' THEN RAISE; END IF;
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

echo "I3-W7A true concurrent same-tip writers serialize and one fails stale"
AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=true \
I3_MEMBER_ID="$MEMBER" \
I3_CONCURRENCY_MODE=seed \
I3_ADMISSION_ID=00000000-0000-4000-8000-000000000401 \
DATABASE_URL="$DATABASE_URL" \
npx tsx scripts/witness/epistemic-join-i3-concurrency-writer.ts \
  > /tmp/i3-concurrency-seed.$$
grep -q '"status":"seeded"' /tmp/i3-concurrency-seed.$$
rm -f /tmp/i3-concurrency-seed.$$

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -c "BEGIN; SELECT pg_advisory_xact_lock(hashtext('i3-concurrency-join')); SELECT pg_sleep(3); COMMIT;" \
  >/tmp/i3-lock-holder.$$ 2>&1 &
HOLDER_PID=$!
sleep 0.3

AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=true \
I3_MEMBER_ID="$MEMBER" I3_CONCURRENCY_MODE=writer \
I3_EXPECTED_PREVIOUS_ADMISSION_ID=00000000-0000-4000-8000-000000000401 \
I3_ADMISSION_ID=00000000-0000-4000-8000-000000000402 \
DATABASE_URL="$DATABASE_URL" \
npx tsx scripts/witness/epistemic-join-i3-concurrency-writer.ts \
  >/tmp/i3-concurrency-a.$$ 2>&1 &
PIDA=$!

AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED=true \
I3_MEMBER_ID="$MEMBER" I3_CONCURRENCY_MODE=writer \
I3_EXPECTED_PREVIOUS_ADMISSION_ID=00000000-0000-4000-8000-000000000401 \
I3_ADMISSION_ID=00000000-0000-4000-8000-000000000403 \
DATABASE_URL="$DATABASE_URL" \
npx tsx scripts/witness/epistemic-join-i3-concurrency-writer.ts \
  >/tmp/i3-concurrency-b.$$ 2>&1 &
PIDB=$!

WAITING=0
for _ in $(seq 1 40); do
  WAITING=$(psql -X "$DATABASE_URL" -Atc \
    "SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND wait_event='advisory' AND query LIKE 'SELECT pg_advisory_xact_lock%';")
  if [ "$WAITING" -ge 2 ]; then break; fi
  sleep 0.1
done
if [ "$WAITING" -lt 2 ]; then
  echo "concurrency witness failed to observe two advisory-lock waiters" >&2
  exit 91
fi

wait "$HOLDER_PID"
set +e
wait "$PIDA"; STA=$?
wait "$PIDB"; STB=$?
set -e
if ! { [ "$STA" -eq 0 ] && [ "$STB" -eq 3 ]; } \
   && ! { [ "$STA" -eq 3 ] && [ "$STB" -eq 0 ]; }; then
  echo "expected one concurrent success and one stale refusal; got $STA/$STB" >&2
  cat /tmp/i3-concurrency-a.$$ /tmp/i3-concurrency-b.$$ >&2
  exit 92
fi
grep -q '"status":"success"' /tmp/i3-concurrency-a.$$ /tmp/i3-concurrency-b.$$
grep -q '"status":"stale"' /tmp/i3-concurrency-a.$$ /tmp/i3-concurrency-b.$$
rm -f /tmp/i3-concurrency-a.$$ /tmp/i3-concurrency-b.$$ /tmp/i3-lock-holder.$$

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
DECLARE n integer;
DECLARE tips integer;
BEGIN
  SELECT count(*) INTO n FROM epistemic_join_admissions
   WHERE join_id = 'i3-concurrency-join';
  IF n <> 2 THEN RAISE EXCEPTION 'concurrent join expected 2 admissions, got %', n; END IF;
  SELECT count(*) INTO tips FROM epistemic_join_current_standing
   WHERE join_id = 'i3-concurrency-join';
  IF tips <> 1 THEN RAISE EXCEPTION 'concurrent join expected one tip, got %', tips; END IF;
END $$;
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
echo "  persistence round-trip + adoption provenance: PASS"
echo "  lawful discharge preserves history: PASS"
echo "  append-only UPDATE/DELETE across join/warrant/standing/adoption: PASS"
echo "  predecessor/member/root/attachment falsifiers: PASS"
echo "  no standing/admission branch: PASS"
echo "  derived current standing is non-writable: PASS"
echo "  representation closure: PASS"
echo "  rollback atomicity: PASS"
echo "  true concurrent same-tip writer serialization: PASS"
echo "  rollback/reconstruction: PASS"
