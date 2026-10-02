#!/usr/bin/env bash
# JARVIS-KP-01 / I4 — structural telemetry database witness.
# Minimal disposable substrate only; no member or production data.
set -euo pipefail

DB="${I4_WITNESS_DB:-maia_i4_shadow_witness_$$}"
MIGRATION="database/migrations/20260921000002_epistemic_join_integration_shadow.sql"

cleanup() { dropdb --if-exists "$DB" >/dev/null 2>&1 || true; }
trap cleanup EXIT

dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"
export DATABASE_URL="postgresql:///$DB"

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
CREATE TABLE public.maia_relational_field_shadow_runs (
  id bigserial PRIMARY KEY,
  turn_id bigint NOT NULL,
  model_name text NOT NULL,
  architecture_version text NOT NULL,
  UNIQUE (turn_id, model_name, architecture_version)
);
INSERT INTO public.maia_relational_field_shadow_runs
  (turn_id, model_name, architecture_version)
VALUES
  (77, 'qwen-shadow', 'rf-shadow-test'),
  (78, 'qwen-shadow', 'rf-shadow-test'),
  (79, 'qwen-shadow', 'rf-shadow-test'),
  (80, 'qwen-shadow', 'rf-shadow-test'),
  (81, 'qwen-shadow', 'rf-shadow-test');
SQL

psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION" >/dev/null

echo "I4-W1 counts-only structural telemetry is admitted"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
INSERT INTO maia_epistemic_join_integration_shadow_runs (
  turn_id, model_name, architecture_version, status,
  proposal_count, evaluated_count, admitted_standing_counts,
  refusal_code_counts, representation_closed, error_count
) VALUES (
  77, 'qwen-shadow', 'rf-shadow-test', 'evaluated',
  1, 1, '{"CANDIDATE_UNESTABLISHED":1}'::jsonb,
  '{}'::jsonb, TRUE, 0
);
SQL
echo "I4-W2 representation-open telemetry is refused"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO maia_epistemic_join_integration_shadow_runs (
      turn_id, model_name, architecture_version, status,
      proposal_count, evaluated_count, admitted_standing_counts,
      refusal_code_counts, representation_closed, error_count
    ) VALUES (
      78, 'qwen-shadow', 'rf-shadow-test', 'evaluated',
      1, 1, '{"CANDIDATE_UNESTABLISHED":1}'::jsonb,
      '{}'::jsonb, FALSE, 0
    );
    RAISE EXCEPTION 'representation-open telemetry unexpectedly inserted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SQL

echo "I4-W3 schema exposes no semantic payload columns"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
DECLARE forbidden integer;
BEGIN
  SELECT count(*) INTO forbidden
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'maia_epistemic_join_integration_shadow_runs'
    AND column_name IN (
      'member_id', 'evidence_id', 'join_id', 'relation_proposition',
      'evidence_text', 'response_text', 'primary_response_text'
    );
  IF forbidden <> 0 THEN
    RAISE EXCEPTION 'semantic payload column count %', forbidden;
  END IF;
END $$;
SQL
echo "I4-W4 telemetry cannot exist without its ordinary shadow parent"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO maia_epistemic_join_integration_shadow_runs (
      turn_id, model_name, architecture_version, status,
      proposal_count, evaluated_count, admitted_standing_counts,
      refusal_code_counts, representation_closed, error_count
    ) VALUES (
      999, 'absent-model', 'absent-architecture', 'evaluated',
      0, 0, '{}'::jsonb, '{}'::jsonb, TRUE, 0
    );
    RAISE EXCEPTION 'orphan telemetry unexpectedly inserted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;
SQL

echo "I4-W5 unknown standing-map keys are refused"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO maia_epistemic_join_integration_shadow_runs (
      turn_id, model_name, architecture_version, status,
      proposal_count, evaluated_count, admitted_standing_counts,
      refusal_code_counts, representation_closed, error_count
    ) VALUES (
      79, 'qwen-shadow', 'rf-shadow-test', 'evaluated',
      1, 1, '{"CANDIDATE_UNESTABLISHED":1,"member-1":1}'::jsonb,
      '{}'::jsonb, TRUE, 0
    );
    RAISE EXCEPTION 'unknown standing-map key unexpectedly inserted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SQL

echo "I4-W6 unknown refusal-map keys are refused"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO maia_epistemic_join_integration_shadow_runs (
      turn_id, model_name, architecture_version, status,
      proposal_count, evaluated_count, admitted_standing_counts,
      refusal_code_counts, representation_closed, error_count
    ) VALUES (
      80, 'qwen-shadow', 'rf-shadow-test', 'evaluated',
      1, 1, '{"CANDIDATE_UNESTABLISHED":1}'::jsonb,
      '{"relation text":1}'::jsonb, TRUE, 0
    );
    RAISE EXCEPTION 'unknown refusal-map key unexpectedly inserted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SQL

echo "I4-W7 count-map values must be non-negative integers"
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  BEGIN
    INSERT INTO maia_epistemic_join_integration_shadow_runs (
      turn_id, model_name, architecture_version, status,
      proposal_count, evaluated_count, admitted_standing_counts,
      refusal_code_counts, representation_closed, error_count
    ) VALUES (
      81, 'qwen-shadow', 'rf-shadow-test', 'evaluated',
      1, 1, '{"CANDIDATE_UNESTABLISHED":"1"}'::jsonb,
      '{}'::jsonb, TRUE, 0
    );
    RAISE EXCEPTION 'string count unexpectedly inserted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SQL

echo "I4 SHADOW DB WITNESS: PASS"
echo "  counts-only telemetry: PASS"
echo "  representation-open refusal: PASS"
echo "  no semantic payload columns: PASS"
echo "  parent-shadow custody required: PASS"
echo "  exact standing keys: PASS"
echo "  exact refusal keys: PASS"
echo "  numeric non-negative counts: PASS"
