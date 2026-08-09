-- ============================================================================
-- SEED FIXTURE — Practitioner Inference Containment runtime walk
-- PR #993 · app SHA 95e7f5fdf · disposable DB maia_containment_walk_95e7f5fdf
--
-- The point of this fixture: pattern_ledger and studio_field_signals are seeded
-- NON-EMPTY, so that an empty API response proves CONTAINMENT and not absence
-- of data. A walk against an empty table would prove nothing.
--
-- Fixed UUIDs so the walk is reproducible from this file alone.
-- ============================================================================

BEGIN;

-- ── Identities ──────────────────────────────────────────────────────────────
-- Practitioner A (the walker), Practitioner B (negative control), Client C.
INSERT INTO members (id, passkey, username, password_hash, name, onboarded) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'WALK-PRACTITIONER-A', 'walk_prac_a', 'x', 'Practitioner A', true),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'WALK-PRACTITIONER-B', 'walk_prac_b', 'x', 'Practitioner B', true),
  ('cccccccc-0000-4000-8000-000000000003', 'WALK-CLIENT-C',       'walk_client_c','x', 'Client C',       true);

INSERT INTO practitioners (id, member_id, name, email, slug, status) VALUES
  ('a0000000-0000-4000-8000-00000000000a', 'aaaaaaaa-0000-4000-8000-000000000001', 'Practitioner A', 'a@walk.test', 'walk-practitioner-a', 'active'),
  ('b0000000-0000-4000-8000-00000000000b', 'bbbbbbbb-0000-4000-8000-000000000002', 'Practitioner B', 'b@walk.test', 'walk-practitioner-b', 'active');

-- Real session credentials — the routes reject bare x-member-id claims.
INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'walk-session-token-practitioner-a', NOW() + INTERVAL '1 day', FALSE),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'walk-session-token-practitioner-b', NOW() + INTERVAL '1 day', FALSE);

-- ── The material that MUST NOT cross ────────────────────────────────────────
-- System-inferred patterns about Client C, including a status='emerging' row
-- the member has never been offered. Scores populated deliberately.
INSERT INTO pattern_ledger
  (id, member_id, pattern_key, statement, pattern_type, recurrence_count,
   first_seen_at, last_evidence_at, latest_significance, average_significance,
   max_significance, trigger_contexts, evidence_refs, status, scope)
VALUES
  ('11110000-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000003',
   'belonging', 'Belonging surfaces when authority is challenged', 'growth_edge', 7,
   NOW() - INTERVAL '90 days', NOW() - INTERVAL '2 days', 0.88, 0.81, 0.94,
   '["board meetings","performance reviews"]'::jsonb, '[{"ref":"e1"},{"ref":"e2"}]'::jsonb, 'emerging', 'theme'),
  ('11110000-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000003',
   'delegation', 'Withholds delegation under time pressure', 'pattern', 4,
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days', 0.72, 0.68, 0.79,
   '["deadlines"]'::jsonb, '[{"ref":"e3"}]'::jsonb, 'offered', 'theme'),
  ('11110000-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   'succession', 'Succession anxiety precedes strategic avoidance', 'pattern', 3,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '9 days', 0.65, 0.61, 0.70,
   '["planning"]'::jsonb, '[]'::jsonb, 'confirmed', 'theme');

-- ── Practitioner↔client link ────────────────────────────────────────────────
-- NOTE: studio_changes.client_id / studio_decisions.client_id FK to
-- practitioner_clients.id — a DIFFERENT id space from members.id, which is what
-- pattern_ledger.member_id uses. Both ids are recorded here so the walk can
-- address each surface in its own id space.
INSERT INTO practitioner_clients (id, practitioner_id, member_id, linked_at, name, email, status) VALUES
  ('dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'cccccccc-0000-4000-8000-000000000003', NOW(), 'Client C', 'c@walk.test', 'active');

-- ── Consultation objects owned by Practitioner A ────────────────────────────
INSERT INTO studio_changes (id, practitioner_id, client_id, title, description) VALUES
  ('22220000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a',
   'dddddddd-0000-4000-8000-000000000004', 'Walk change', 'Change under consultation for the containment walk.');

INSERT INTO studio_decisions (id, practitioner_id, client_id, title, context) VALUES
  ('33330000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a',
   'dddddddd-0000-4000-8000-000000000004', 'Walk decision', 'Decision under consultation for the containment walk.');

-- ── Field signals: all three sources, on BOTH the change and the decision ───
-- Distinctive content strings so the walk can grep the composed bundle for leakage
-- under renamed or nested fields.
INSERT INTO studio_field_signals
  (id, change_id, decision_id, client_id, practitioner_id, source, signal_type, title, content, intensity)
VALUES
  ('44440000-0000-4000-8000-000000000001', '22220000-0000-4000-8000-000000000001', NULL,
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'client', 'emotional', 'CANARYSIGNALCLIENTCHANGE', 'CANARYSIGNALCLIENTCHANGE body', 0.90),
  ('44440000-0000-4000-8000-000000000002', '22220000-0000-4000-8000-000000000001', NULL,
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'maia', 'cognitive', 'CANARYSIGNALMAIACHANGE', 'CANARYSIGNALMAIACHANGE body', 0.75),
  ('44440000-0000-4000-8000-000000000003', '22220000-0000-4000-8000-000000000001', NULL,
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'practitioner', 'relational', 'CANARYSIGNALPRACCHANGE', 'CANARYSIGNALPRACCHANGE body', 0.50),
  ('44440000-0000-4000-8000-000000000004', NULL, '33330000-0000-4000-8000-000000000001',
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'client', 'emotional', 'CANARYSIGNALCLIENTDECISION', 'CANARYSIGNALCLIENTDECISION body', 0.90),
  ('44440000-0000-4000-8000-000000000005', NULL, '33330000-0000-4000-8000-000000000001',
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'maia', 'symbolic', 'CANARYSIGNALMAIADECISION', 'CANARYSIGNALMAIADECISION body', 0.80),
  ('44440000-0000-4000-8000-000000000006', NULL, '33330000-0000-4000-8000-000000000001',
   'dddddddd-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000a',
   'practitioner', 'behavioral', 'CANARYSIGNALPRACDECISION', 'CANARYSIGNALPRACDECISION body', 0.55);

-- ── POSITIVE CONTROL: practitioner-authored observations MUST still appear ──
INSERT INTO studio_practitioner_observations
  (id, change_id, decision_id, practitioner_id, client_id, observation_type, content)
VALUES
  ('55550000-0000-4000-8000-000000000001', '22220000-0000-4000-8000-000000000001', NULL,
   'a0000000-0000-4000-8000-00000000000a', 'dddddddd-0000-4000-8000-000000000004',
   'in_session', 'CANARYOBSERVATIONCHANGE — authored by the practitioner, must survive'),
  ('55550000-0000-4000-8000-000000000002', NULL, '33330000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-00000000000a', 'dddddddd-0000-4000-8000-000000000004',
   'relational_field', 'CANARYOBSERVATIONDECISION — authored by the practitioner, must survive');

COMMIT;

SELECT 'pattern_ledger'                    AS table, count(*) FROM pattern_ledger
UNION ALL SELECT 'studio_field_signals',            count(*) FROM studio_field_signals
UNION ALL SELECT 'studio_practitioner_observations', count(*) FROM studio_practitioner_observations
UNION ALL SELECT 'auth_sessions',                   count(*) FROM auth_sessions;
