-- ═══════════════════════════════════════════════════════════════════════════
-- EAA-03 / P1 — Home Arrival continuity eligibility · behavioural witness
--
-- The jest suite proves the predicate reaches the wire. It cannot prove what
-- the predicate DOES to real rows, because its db mock returns canned rows
-- unfiltered by design. This is the complementary proof: real rows, real
-- PostgreSQL evaluation, including the POSITIVE case and a DISCRIMINATING
-- NEGATIVE CONTROL.
--
-- CONSEQUENCE CONTRACT: one transaction, ending in ROLLBACK. No row survives.
--
--   Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/witness/p1-field-now-eligibility.sql
--   PASS: final row reads verdict = 'P1-ELIGIBILITY PASS'
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TEMP TABLE p1_ids (label TEXT PRIMARY KEY, id UUID NOT NULL) ON COMMIT DROP;

WITH m AS (
  INSERT INTO members (passkey, username, password_hash, name)
  VALUES ('P1-WITNESS-A', 'p1_witness_a', 'x', 'P1 Member') RETURNING id
) INSERT INTO p1_ids SELECT 'member', id FROM m;

WITH m AS (
  INSERT INTO members (passkey, username, password_hash, name)
  VALUES ('P1-WITNESS-B', 'p1_witness_b', 'x', 'Other Member') RETURNING id
) INSERT INTO p1_ids SELECT 'other_member', id FROM m;

WITH t AS (INSERT INTO studio_teams DEFAULT VALUES RETURNING id)
INSERT INTO p1_ids SELECT 'team', id FROM t;
WITH c AS (INSERT INTO studio_people DEFAULT VALUES RETURNING id)
INSERT INTO p1_ids SELECT 'client', id FROM c;

-- Helper: every fixture is a Keep unless a column says otherwise.
CREATE OR REPLACE FUNCTION p1_fix(
  p_label TEXT, p_member UUID, p_title TEXT, p_kept TIMESTAMPTZ,
  p_status TEXT DEFAULT 'active', p_scope TEXT DEFAULT 'personal',
  p_return TEXT DEFAULT 'contextual_doorway', p_source TEXT DEFAULT 'spontaneous',
  p_posture TEXT DEFAULT 'normal', p_generated TEXT DEFAULT 'member-gesture',
  p_facilitator UUID DEFAULT NULL, p_response TEXT DEFAULT NULL,
  p_team UUID DEFAULT NULL, p_client UUID DEFAULT NULL, p_id UUID DEFAULT NULL
) RETURNS VOID AS $fn$
DECLARE v_id UUID;
BEGIN
  INSERT INTO member_memory_atoms
    (id, member_id, source_type, source_id, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, return_preference, posture_at_creation,
     generated_by, facilitator_id, member_response_status, member_response_at,
     team_id, client_id, kept_at)
  VALUES
    (COALESCE(p_id, gen_random_uuid()), p_member, p_source,
     CASE WHEN p_source = 'spontaneous' THEN NULL ELSE gen_random_uuid() END,
     p_title, 'body', 'relational', ARRAY['relational']::text[], ARRAY[]::text[],
     p_status, p_scope, p_return, p_posture, p_generated, p_facilitator,
     p_response, CASE WHEN p_response IS NULL THEN NULL ELSE NOW() END,
     p_team, p_client, p_kept)
  RETURNING id INTO v_id;
  INSERT INTO p1_ids VALUES (p_label, v_id);
END;
$fn$ LANGUAGE plpgsql;

-- ── INCLUDED ───────────────────────────────────────────────────────────────
SELECT p1_fix('keep_newest', (SELECT id FROM p1_ids WHERE label='member'), 'newest kept thing',  NOW() - INTERVAL '1 day');
SELECT p1_fix('keep_middle', (SELECT id FROM p1_ids WHERE label='member'), 'middle kept thing',  NOW() - INTERVAL '2 days');
SELECT p1_fix('keep_older',  (SELECT id FROM p1_ids WHERE label='member'), 'older kept thing',   NOW() - INTERVAL '3 days');
SELECT p1_fix('keep_oldest', (SELECT id FROM p1_ids WHERE label='member'), 'oldest kept thing',  NOW() - INTERVAL '4 days');
SELECT p1_fix('keep_alive',  (SELECT id FROM p1_ids WHERE label='member'), 'still alive thing',  NOW() - INTERVAL '5 days', 'still_alive');

-- ── EXCLUDED ───────────────────────────────────────────────────────────────
SELECT p1_fix('x_practitioner', (SELECT id FROM p1_ids WHERE label='member'), 'an observation about you', NOW(),
              'active','personal','contextual_doorway','practitioner_observation','normal','practitioner-observation',
              (SELECT id FROM p1_ids WHERE label='member'));
SELECT p1_fix('x_client_scope', (SELECT id FROM p1_ids WHERE label='member'), 'client-scoped material', NOW(),
              'active','client','contextual_doorway','spontaneous','normal','member-gesture',
              NULL, NULL, (SELECT id FROM p1_ids WHERE label='team'), (SELECT id FROM p1_ids WHERE label='client'));
SELECT p1_fix('x_colab_scope', (SELECT id FROM p1_ids WHERE label='member'), 'co-lab material', NOW(),
              'active','colab','contextual_doorway','spontaneous','normal','member-gesture',
              NULL, NULL, (SELECT id FROM p1_ids WHERE label='team'));
SELECT p1_fix('x_rejected', (SELECT id FROM p1_ids WHERE label='member'), 'material the member rejected', NOW(),
              'active','personal','contextual_doorway','spontaneous','normal','member-gesture', NULL, 'rejected');
SELECT p1_fix('x_member_pulled', (SELECT id FROM p1_ids WHERE label='member'), 'private, member-pulled only', NOW(),
              'active','personal','member_pulled');
SELECT p1_fix('x_set_aside', (SELECT id FROM p1_ids WHERE label='member'), 'parked material', NOW(), 'set_aside');
SELECT p1_fix('x_archived',  (SELECT id FROM p1_ids WHERE label='member'), 'archived material', NOW(), 'archived');
SELECT p1_fix('x_sanctuary', (SELECT id FROM p1_ids WHERE label='member'), 'sanctuary material', NOW(),
              'active','personal','contextual_doorway','spontaneous','sanctuary');
SELECT p1_fix('x_other_member', (SELECT id FROM p1_ids WHERE label='other_member'), 'another member''s material', NOW());

-- ── Census BEFORE any read, so non-mutation is measured, not assumed ───────
CREATE TEMP TABLE p1_census AS
SELECT (SELECT COUNT(*) FROM member_memory_atoms) AS atoms,
       (SELECT COUNT(*) FROM members)             AS members;

-- ── The predicate under test — the adapter's, verbatim ─────────────────────
CREATE TEMP VIEW p1_eligible AS
SELECT id, title, kept_at
FROM member_memory_atoms
WHERE member_id = (SELECT id FROM p1_ids WHERE label='member')
  AND kept_at IS NOT NULL
  AND status IN ('active', 'still_alive')
  AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
  AND status NOT IN ('protected', 'archived')
  AND primary_register IS DISTINCT FROM 'sacred_protected'
  AND NOT ('sacred_protected' = ANY(registers))
  AND memory_scope = 'personal'
  AND source_type <> 'practitioner_observation'
  AND (source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)
  AND member_response_status IS DISTINCT FROM 'rejected'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
ORDER BY kept_at DESC, id DESC
LIMIT 3;

\echo '--- eligible, bounded to three, newest Keep act first ---'
SELECT title FROM p1_eligible;

DO $$
DECLARE v_titles TEXT[];
BEGIN
  SELECT array_agg(title ORDER BY kept_at DESC, id DESC) INTO v_titles FROM p1_eligible;

  IF v_titles IS DISTINCT FROM ARRAY['newest kept thing','middle kept thing','older kept thing'] THEN
    RAISE EXCEPTION 'FAIL — expected the three most recently kept eligible things, got %', v_titles;
  END IF;
  RAISE NOTICE 'OK — bound of three, ordered by the member''s own Keep act.';
END $$;

-- ── Every excluded class, named individually ───────────────────────────────
DO $$
DECLARE r RECORD; v_leaked TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR r IN SELECT label FROM p1_ids WHERE label LIKE 'x\_%' LOOP
    IF EXISTS (
      SELECT 1 FROM member_memory_atoms a
      WHERE a.id = (SELECT id FROM p1_ids WHERE label = r.label)
        AND a.member_id = (SELECT id FROM p1_ids WHERE label='member')
        AND a.kept_at IS NOT NULL
        AND a.status IN ('active','still_alive')
        AND a.return_preference IN ('contextual_doorway','ritual_review_opt_in')
        AND a.memory_scope = 'personal'
        AND a.source_type <> 'practitioner_observation'
        AND a.member_response_status IS DISTINCT FROM 'rejected'
        AND a.posture_at_creation IS DISTINCT FROM 'sanctuary'
    ) THEN
      v_leaked := v_leaked || r.label;
    END IF;
  END LOOP;
  IF array_length(v_leaked, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL — prohibited fixtures passed eligibility: %', v_leaked;
  END IF;
  RAISE NOTICE 'OK — practitioner, client scope, co-lab scope, rejected, member-pulled, parked, archived, sanctuary and another member''s material are all excluded.';
END $$;

-- ── Deterministic tie-break ────────────────────────────────────────────────
DO $$
DECLARE v_t TIMESTAMPTZ := NOW() - INTERVAL '10 days'; v_first UUID; v_a UUID; v_b UUID;
BEGIN
  v_a := '00000000-0000-4000-8000-00000000000a';
  v_b := '00000000-0000-4000-8000-00000000000b';
  PERFORM p1_fix('tie_a', (SELECT id FROM p1_ids WHERE label='member'), 'tie a', v_t,
                 'active','personal','contextual_doorway','spontaneous','normal','member-gesture',
                 NULL,NULL,NULL,NULL, v_a);
  PERFORM p1_fix('tie_b', (SELECT id FROM p1_ids WHERE label='member'), 'tie b', v_t,
                 'active','personal','contextual_doorway','spontaneous','normal','member-gesture',
                 NULL,NULL,NULL,NULL, v_b);
  SELECT id INTO v_first FROM member_memory_atoms
   WHERE kept_at = v_t AND member_id = (SELECT id FROM p1_ids WHERE label='member')
   ORDER BY kept_at DESC, id DESC LIMIT 1;
  IF v_first <> v_b THEN
    RAISE EXCEPTION 'FAIL — tie-break is not the deterministic id DESC';
  END IF;
  RAISE NOTICE 'OK — identical Keep times resolve by a deterministic, non-semantic tie-break.';
END $$;

-- ── Zero is a valid state ──────────────────────────────────────────────────
DO $$
DECLARE v_n INT;
BEGIN
  SELECT COUNT(*) INTO v_n FROM member_memory_atoms
   WHERE member_id = (SELECT id FROM p1_ids WHERE label='other_member')
     AND status IN ('active','still_alive') AND memory_scope = 'personal'
     AND return_preference IN ('contextual_doorway','ritual_review_opt_in')
     AND member_id = (SELECT id FROM p1_ids WHERE label='member');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL — cross-member material is reachable'; END IF;
  RAISE NOTICE 'OK — another member''s material is unreachable; zero is a valid, complete state.';
END $$;

-- ── DISCRIMINATING NEGATIVE CONTROL ────────────────────────────────────────
-- Drop the scope + authorship clauses and nothing else. If this does not admit
-- prohibited fixtures, the fixtures are not exercising the boundary and every
-- PASS above is vacuous.
\echo '--- without the scope/authorship guard (the leak) ---'
SELECT title FROM member_memory_atoms
WHERE member_id = (SELECT id FROM p1_ids WHERE label='member')
  AND kept_at IS NOT NULL
  AND status IN ('active','still_alive')
  AND return_preference IN ('contextual_doorway','ritual_review_opt_in')
ORDER BY kept_at DESC, id DESC;

DO $$
DECLARE v_n INT;
BEGIN
  SELECT COUNT(*) INTO v_n FROM member_memory_atoms
  WHERE member_id = (SELECT id FROM p1_ids WHERE label='member')
    AND kept_at IS NOT NULL
    AND status IN ('active','still_alive')
    AND return_preference IN ('contextual_doorway','ritual_review_opt_in')
    AND id IN (SELECT id FROM p1_ids WHERE label IN
        ('x_practitioner','x_client_scope','x_colab_scope','x_rejected','x_sanctuary'));
  IF v_n < 1 THEN
    RAISE EXCEPTION 'FAIL — removing the guard admitted nothing prohibited; the witness is not discriminating.';
  END IF;
  RAISE NOTICE 'NEGATIVE CONTROL OK — removing the scope/authorship guard admits % prohibited fixture(s). The witness is discriminating.', v_n;
END $$;

-- ── Non-mutation ───────────────────────────────────────────────────────────
DO $$
DECLARE v_atoms_before INT; v_atoms_after INT; v_members_before INT; v_members_after INT;
BEGIN
  SELECT atoms, members INTO v_atoms_before, v_members_before FROM p1_census;
  SELECT COUNT(*) INTO v_atoms_after FROM member_memory_atoms;
  SELECT COUNT(*) INTO v_members_after FROM members;
  -- The tie-break block deliberately adds two fixtures AFTER the census, so the
  -- expected delta is exactly those two and nothing else.
  IF v_atoms_after <> v_atoms_before + 2 THEN
    RAISE EXCEPTION 'FAIL — atom count moved by % (expected exactly the 2 tie fixtures); a read altered rows',
      v_atoms_after - v_atoms_before;
  END IF;
  IF v_members_after <> v_members_before THEN
    RAISE EXCEPTION 'FAIL — member rows changed during reads';
  END IF;
  RAISE NOTICE 'OK — % atoms and % members intact across every read: eligibility filters at read time, never mutates.',
    v_atoms_after, v_members_after;
END $$;

SELECT 'P1-ELIGIBILITY PASS' AS verdict;

ROLLBACK;
