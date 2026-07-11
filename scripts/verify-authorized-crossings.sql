-- Verification for 20260708000001_authorized_crossings.sql
-- Self-contained: builds fixtures in a transaction and ROLLS BACK — persists nothing.
-- Requires >= 1 row in members (reuses an existing member as the practitioner).
--
-- Run (local dev DB only — never prod):
--   psql "postgresql://soullab@localhost:5432/maia_consciousness" -f scripts/verify-authorized-crossings.sql
--   (or) docker exec -i maia-postgres psql -U soullab maia_consciousness < scripts/verify-authorized-crossings.sql
--
-- PASS = "ALL AUTHORIZED_CROSSINGS TESTS PASSED"; any FAIL raises and aborts.

BEGIN;
DO $$
DECLARE
  v_practitioner UUID;
  v_other        UUID;
  v_case         UUID;
  v_memory       UUID;
  v_status       TEXT;
  v_admissible   BOOLEAN;
  v_content      TEXT;
  v_raised       BOOLEAN;
BEGIN
  SELECT id INTO v_practitioner FROM members LIMIT 1;
  IF v_practitioner IS NULL THEN
    RAISE EXCEPTION 'test requires >= 1 member row';
  END IF;
  SELECT id INTO v_other FROM members WHERE id <> v_practitioner LIMIT 1;  -- may be NULL

  INSERT INTO practitioner_cases (practitioner_id, client_identifier)
    VALUES (v_practitioner, 'TEST-' || gen_random_uuid())
    RETURNING id INTO v_case;

  -- Note: authorship (migration 20260626000002) is a Step-3 loader concern, not a ledger
  -- dependency, so it is intentionally omitted here — keeps this test valid even where
  -- 20260626000002 has not been applied (as on some dev DBs).
  INSERT INTO case_memories (case_id, practitioner_id, memory_type, content)
    VALUES (v_case, v_practitioner, 'pattern', 'origin recognition')
    RETURNING id INTO v_memory;

  -- T1: no event -> held (status 'none', not admissible)
  SELECT crossing_status, admissible INTO v_status, v_admissible
    FROM case_memory_crossing_status WHERE memory_id = v_memory;
  IF v_status <> 'none' OR v_admissible THEN
    RAISE EXCEPTION 'T1 FAIL (no event): status=%, admissible=%', v_status, v_admissible;
  END IF;

  -- T-reviewer: a non-practitioner reviewer must be rejected (skip if no second member)
  IF v_other IS NOT NULL THEN
    v_raised := FALSE;
    BEGIN
      INSERT INTO authorized_crossings (memory_id, decision, decision_reason, de_individuation_basis, reviewed_by)
        VALUES (v_memory, 'approved', 'r', 'b', v_other);
    EXCEPTION WHEN OTHERS THEN v_raised := TRUE;
    END;
    IF NOT v_raised THEN RAISE EXCEPTION 'T-reviewer FAIL: non-practitioner reviewer was allowed'; END IF;
  END IF;

  -- T5: approved without de_individuation_basis must be rejected (anti-laundering)
  v_raised := FALSE;
  BEGIN
    INSERT INTO authorized_crossings (memory_id, decision, decision_reason, de_individuation_basis, reviewed_by)
      VALUES (v_memory, 'approved', 'no basis stated', NULL, v_practitioner);
  EXCEPTION WHEN OTHERS THEN v_raised := TRUE;
  END;
  IF NOT v_raised THEN RAISE EXCEPTION 'T5 FAIL: approved without de_individuation_basis was allowed'; END IF;

  -- T2: approved event -> admitted
  INSERT INTO authorized_crossings (memory_id, decision, decision_reason, de_individuation_basis, reviewed_by)
    VALUES (v_memory, 'approved', 'became general teaching', 'no longer encodes any single client', v_practitioner);
  SELECT crossing_status, admissible INTO v_status, v_admissible
    FROM case_memory_crossing_status WHERE memory_id = v_memory;
  IF v_status <> 'approved' OR NOT v_admissible THEN
    RAISE EXCEPTION 'T2 FAIL (approved): status=%, admissible=%', v_status, v_admissible;
  END IF;

  -- T3: revoked event (later) -> held again
  INSERT INTO authorized_crossings (memory_id, decision, decision_reason, de_individuation_basis, reviewed_by)
    VALUES (v_memory, 'revoked', 'client objected', NULL, v_practitioner);
  SELECT crossing_status, admissible INTO v_status, v_admissible
    FROM case_memory_crossing_status WHERE memory_id = v_memory;
  IF v_status <> 'revoked' OR v_admissible THEN
    RAISE EXCEPTION 'T3 FAIL (revoked): status=%, admissible=%', v_status, v_admissible;
  END IF;

  -- T4a: append-only — UPDATE blocked
  v_raised := FALSE;
  BEGIN
    UPDATE authorized_crossings SET decision = 'approved' WHERE memory_id = v_memory;
  EXCEPTION WHEN OTHERS THEN v_raised := TRUE;
  END;
  IF NOT v_raised THEN RAISE EXCEPTION 'T4a FAIL: UPDATE allowed on append-only ledger'; END IF;

  -- T4b: append-only — DELETE blocked
  v_raised := FALSE;
  BEGIN
    DELETE FROM authorized_crossings WHERE memory_id = v_memory;
  EXCEPTION WHEN OTHERS THEN v_raised := TRUE;
  END;
  IF NOT v_raised THEN RAISE EXCEPTION 'T4b FAIL: DELETE allowed on append-only ledger'; END IF;

  -- T6: origin case_memories row unchanged throughout
  SELECT content INTO v_content FROM case_memories WHERE id = v_memory;
  IF v_content <> 'origin recognition' THEN
    RAISE EXCEPTION 'T6 FAIL: origin case_memory content mutated (got %)', v_content;
  END IF;

  RAISE NOTICE 'ALL AUTHORIZED_CROSSINGS TESTS PASSED';
END $$;
ROLLBACK;
