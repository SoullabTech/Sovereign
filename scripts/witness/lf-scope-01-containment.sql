-- ═══════════════════════════════════════════════════════════════════════════
-- LF-SCOPE-01 — behavioural containment witness
--
-- The jest suite (lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts)
-- proves the predicate reaches the wire on all three read paths. It cannot
-- prove what the predicate DOES to real rows, because its db mock returns
-- canned rows unfiltered by design. This script is the complementary proof:
-- real rows, real PostgreSQL evaluation, including the POSITIVE case that a
-- personal member Keep still appears.
--
-- CONSEQUENCE CONTRACT: everything happens inside one transaction that ends in
-- ROLLBACK. No row survives. Nothing is altered. Safe against a dev database or
-- a disposable shadow.
--
--   Run:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/witness/lf-scope-01-containment.sql
--
--   PASS: the final row reads  verdict = 'LF-SCOPE-01 PASS'
--   Any other verdict, or any raised exception, is a FAIL — do not interpret a
--   partial result as containment.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Fixtures ───────────────────────────────────────────────────────────────
CREATE TEMP TABLE lf_ids (label TEXT PRIMARY KEY, id UUID NOT NULL) ON COMMIT DROP;

WITH m AS (
  INSERT INTO members (passkey, username, password_hash, name)
  VALUES ('LF-SCOPE-01-WITNESS', 'lf_scope_01_witness', 'x', 'LF Witness')
  RETURNING id
)
INSERT INTO lf_ids SELECT 'member', id FROM m;

-- (1) POSITIVE CONTROL — an ordinary personal Keep the member made.
--     This one MUST survive, or the repair has broken the surface it protects.
WITH a AS (
  INSERT INTO member_memory_atoms
    (member_id, source_type, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, posture_at_creation, generated_by)
  SELECT id, 'spontaneous', 'a thing I kept', 'body', 'relational',
         ARRAY['relational']::text[], ARRAY[]::text[], 'active', 'personal',
         'normal', 'member-gesture'
  FROM lf_ids WHERE label = 'member'
  RETURNING id
)
INSERT INTO lf_ids SELECT 'personal_keep', id FROM a;

-- (2) NON-PERSONAL SCOPE — client-scoped material. Must never reach a personal read.
--     The schema's own integrity constraints (atom_*_scope_requires_*) force a
--     client-scoped atom to name its Co-Lab and client, so the fixture supplies
--     both. That is the real shape such a row has in production.
WITH t AS (INSERT INTO studio_teams DEFAULT VALUES RETURNING id),
     c AS (INSERT INTO studio_people DEFAULT VALUES RETURNING id),
     a AS (
  INSERT INTO member_memory_atoms
    (member_id, source_type, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, posture_at_creation, generated_by,
     team_id, client_id)
  SELECT (SELECT id FROM lf_ids WHERE label = 'member'), 'spontaneous',
         'client-scoped material', 'body', 'relational',
         ARRAY['relational']::text[], ARRAY[]::text[], 'active', 'client',
         'normal', 'member-gesture', (SELECT id FROM t), (SELECT id FROM c)
  RETURNING id
)
INSERT INTO lf_ids SELECT 'client_scoped', id FROM a;

-- (3) PRACTITIONER OBSERVATION, fully attributed — written ABOUT the member BY
--     a practitioner. Must not appear as something the member kept.
WITH a AS (
  INSERT INTO member_memory_atoms
    (member_id, source_type, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, posture_at_creation, generated_by,
     facilitator_id, source_id)
  -- sourcing_discipline: a non-spontaneous atom must name its source.
  SELECT id, 'practitioner_observation', 'an observation about you', 'body',
         'witnessed', ARRAY['witnessed']::text[], ARRAY[]::text[], 'active',
         'personal', 'normal', 'practitioner-observation', id, gen_random_uuid()
  FROM lf_ids WHERE label = 'member'
  RETURNING id
)
INSERT INTO lf_ids SELECT 'practitioner_obs', id FROM a;

-- (4) MEMBER-REJECTED — the member's own verdict on material about them.
WITH a AS (
  INSERT INTO member_memory_atoms
    (member_id, source_type, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, posture_at_creation, generated_by,
     member_response_status, member_response_at)
  SELECT id, 'spontaneous', 'material the member rejected', 'body', 'relational',
         ARRAY['relational']::text[], ARRAY[]::text[], 'active', 'personal',
         -- member_response_coherent: status and timestamp travel together.
         'normal', 'member-gesture', 'rejected', NOW()
  FROM lf_ids WHERE label = 'member'
  RETURNING id
)
INSERT INTO lf_ids SELECT 'rejected', id FROM a;

-- (5) ARCHIVED — pre-existing guard, asserted here so the repair cannot regress it.
WITH a AS (
  INSERT INTO member_memory_atoms
    (member_id, source_type, title, body, primary_register, registers,
     elemental_lenses, status, memory_scope, posture_at_creation, generated_by)
  SELECT id, 'spontaneous', 'archived material', 'body', 'relational',
         ARRAY['relational']::text[], ARRAY[]::text[], 'archived', 'personal',
         'normal', 'member-gesture'
  FROM lf_ids WHERE label = 'member'
  RETURNING id
)
INSERT INTO lf_ids SELECT 'archived', id FROM a;

-- Every fixture gathers into the same dimension, so the ONLY thing that can
-- separate them in the results below is the containment predicate itself.
INSERT INTO living_field_affinities (member_id, atom_id, field_key, affinity_score, evidence_reason)
SELECT (SELECT id FROM lf_ids WHERE label = 'member'), i.id, 'relationships', 0.8, 'witness:lf-scope-01'
FROM lf_ids i WHERE i.label <> 'member';

-- ── The predicate under test — byte-identical to livingFieldAtomGuards('a') ──
CREATE TEMP VIEW lf_gathered AS
SELECT a.id, a.title
FROM living_field_affinities lfa
JOIN member_memory_atoms a ON a.id = lfa.atom_id
WHERE lfa.member_id = (SELECT id FROM lf_ids WHERE label = 'member')
  AND lfa.field_key = 'relationships'
  AND a.status NOT IN ('protected', 'archived')
  AND a.primary_register IS DISTINCT FROM 'sacred_protected'
  AND NOT ('sacred_protected' = ANY(a.registers))
  AND a.memory_scope = 'personal'
  AND a.source_type <> 'practitioner_observation'
  AND (source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)
  AND a.member_response_status IS DISTINCT FROM 'rejected'
  AND a.posture_at_creation IS DISTINCT FROM 'sanctuary';

-- ── Assertions ─────────────────────────────────────────────────────────────
\echo '--- gathered set (expect exactly: a thing I kept) ---'
SELECT title FROM lf_gathered ORDER BY title;

DO $$
DECLARE
  v_total    INT;
  v_positive INT;
  v_member   UUID := (SELECT id FROM lf_ids WHERE label = 'member');
BEGIN
  SELECT COUNT(*) INTO v_total FROM lf_gathered;
  SELECT COUNT(*) INTO v_positive FROM lf_gathered
    WHERE id = (SELECT id FROM lf_ids WHERE label = 'personal_keep');

  -- POSITIVE: the member's own Keep still appears.
  IF v_positive <> 1 THEN
    RAISE EXCEPTION 'FAIL — the personal member Keep did not survive containment';
  END IF;

  -- NEGATIVE: nothing else does. Four excluded classes, one assertion.
  IF v_total <> 1 THEN
    RAISE EXCEPTION 'FAIL — % rows gathered, expected exactly 1 (out-of-scope, practitioner, rejected or archived material leaked)', v_total;
  END IF;

  -- The count must agree with the content. A count that exceeds what the member
  -- can open is the specific defect the list route carried before this repair.
  IF (SELECT COUNT(*) FROM lf_gathered) <>
     (SELECT COUNT(*) FROM living_field_affinities lfa
        JOIN member_memory_atoms a ON a.id = lfa.atom_id
       WHERE lfa.member_id = v_member
         AND a.status NOT IN ('protected', 'archived')
         AND a.primary_register IS DISTINCT FROM 'sacred_protected'
         AND NOT ('sacred_protected' = ANY(a.registers))
         AND a.memory_scope = 'personal'
         AND a.source_type <> 'practitioner_observation'
         AND a.member_response_status IS DISTINCT FROM 'rejected'
         AND a.posture_at_creation IS DISTINCT FROM 'sanctuary') THEN
    RAISE EXCEPTION 'FAIL — count and content disagree';
  END IF;

  -- NON-MUTATION: every excluded atom is still present and unaltered. Exclusion
  -- is a read-time filter, never a deletion.
  IF (SELECT COUNT(*) FROM member_memory_atoms WHERE member_id = v_member) <> 5 THEN
    RAISE EXCEPTION 'FAIL — an excluded atom was altered or removed';
  END IF;
  IF (SELECT COUNT(*) FROM living_field_affinities WHERE member_id = v_member) <> 5 THEN
    RAISE EXCEPTION 'FAIL — an affinity row was altered or removed';
  END IF;

  RAISE NOTICE 'LF-SCOPE-01 PASS — 1 personal Keep visible; client-scope, practitioner observation, member-rejected and archived material all excluded; 5 atoms and 5 affinities intact.';
END $$;

-- ── Negative control — the witness must be able to FAIL ────────────────────
-- The pre-repair predicate, verbatim: the three sacred/protected guards and
-- nothing else. Run against the SAME fixtures it must admit the material the
-- repair excludes. If this returns 1, the fixtures are not exercising the
-- defect and every PASS above is vacuous.
CREATE TEMP VIEW lf_gathered_pre_repair AS
SELECT a.id, a.title
FROM living_field_affinities lfa
JOIN member_memory_atoms a ON a.id = lfa.atom_id
WHERE lfa.member_id = (SELECT id FROM lf_ids WHERE label = 'member')
  AND lfa.field_key = 'relationships'
  AND a.status NOT IN ('protected', 'archived')
  AND a.primary_register IS DISTINCT FROM 'sacred_protected'
  AND NOT ('sacred_protected' = ANY(a.registers));

\echo '--- pre-repair predicate against the same fixtures (the leak) ---'
SELECT title FROM lf_gathered_pre_repair ORDER BY title;

DO $$
DECLARE v_pre INT;
BEGIN
  SELECT COUNT(*) INTO v_pre FROM lf_gathered_pre_repair;
  -- 4 of the 5: archived was already excluded before this repair; the other
  -- three classes (client scope, practitioner observation, member-rejected)
  -- are exactly what LF-SCOPE-01 closes.
  IF v_pre <> 4 THEN
    RAISE EXCEPTION 'FAIL — negative control returned % rows, expected 4. The fixtures no longer reproduce the pre-repair leak, so the PASS above is not discriminating.', v_pre;
  END IF;
  RAISE NOTICE 'NEGATIVE CONTROL OK — the pre-repair predicate admits 4 rows where the repaired predicate admits 1. The witness is discriminating.';
END $$;

SELECT 'LF-SCOPE-01 PASS' AS verdict;

ROLLBACK;
