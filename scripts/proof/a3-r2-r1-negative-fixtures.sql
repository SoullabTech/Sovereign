-- PRACTITIONER-OFFER-01 · A3-R2-R1
-- Deliberately contradictory, fully synthetic PRE-MIGRATION relationship fixtures.
-- Run only in the disposable database created by a3-r2-r1-relationship-lifecycle.sh.

\set ON_ERROR_STOP on
BEGIN;

INSERT INTO members (id, passkey, username, password_hash, name, email) VALUES
  ('a3000000-0000-4000-8000-000000000001', 'a3r2r1-member-a', 'a3r2r1-member-a', 'synthetic', 'Fixture Member A', 'member-a@a3r2r1.invalid'),
  ('a3000000-0000-4000-8000-000000000002', 'a3r2r1-member-b', 'a3r2r1-member-b', 'synthetic', 'Fixture Member B', 'member-b@a3r2r1.invalid');

INSERT INTO practitioners (id, member_id, name, email, slug, status) VALUES
  ('a3100000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'Fixture Practice A', 'practice-a@a3r2r1.invalid', 'a3r2r1-practice-a', 'active'),
  ('a3100000-0000-4000-8000-000000000002', 'a3000000-0000-4000-8000-000000000002', 'Fixture Practice B', 'practice-b@a3r2r1.invalid', 'a3r2r1-practice-b', 'active');

INSERT INTO studio_teams (id, name, owner_id) VALUES
  ('a3200000-0000-4000-8000-000000000001', 'Fixture Team A', 'a3000000-0000-4000-8000-000000000001'),
  ('a3200000-0000-4000-8000-000000000002', 'Fixture Team B', 'a3000000-0000-4000-8000-000000000002');

INSERT INTO practitioner_clients
  (id, practitioner_id, name, email, status, relationship_status)
VALUES
  ('a3300000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'Fixture Client A', 'client-a@a3r2r1.invalid', 'active', 'active'),
  ('a3300000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'Fixture Client B', 'client-b@a3r2r1.invalid', 'active', 'active');

INSERT INTO services (id, practitioner_id, name) VALUES
  ('a3400000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'Fixture Service A'),
  ('a3400000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'Fixture Service B');

-- Two valid bookings plus one deliberately cross-practice booking.
INSERT INTO sessions
  (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end, team_id)
VALUES
  ('a3500000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000001', 'a3400000-0000-4000-8000-000000000001', '2026-09-18T10:00:00Z', '2026-09-18T11:00:00Z', 'a3200000-0000-4000-8000-000000000001'),
  ('a3500000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'a3300000-0000-4000-8000-000000000002', 'a3400000-0000-4000-8000-000000000002', '2026-09-18T12:00:00Z', '2026-09-18T13:00:00Z', 'a3200000-0000-4000-8000-000000000002'),
  ('a3500000-0000-4000-8000-000000000003', 'a3100000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000002', 'a3400000-0000-4000-8000-000000000002', '2026-09-19T10:00:00Z', '2026-09-19T11:00:00Z', 'a3200000-0000-4000-8000-000000000001');

UPDATE sessions
   SET rescheduled_from_id = 'a3500000-0000-4000-8000-000000000002'
 WHERE id = 'a3500000-0000-4000-8000-000000000003';

-- Member A + booking A but client B. The preparation migration may infer practice A
-- only from the exact booking/member tuple; the conflicting client remains visible.
INSERT INTO scribe_sessions
  (id, member_id, container, client_id, booking_id, title)
VALUES
  ('a3600000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'practitioner', 'a3300000-0000-4000-8000-000000000002', 'a3500000-0000-4000-8000-000000000001', 'Synthetic contradictory Session Room');

UPDATE sessions
   SET scribe_session_id = 'a3600000-0000-4000-8000-000000000001'
 WHERE id = 'a3500000-0000-4000-8000-000000000001';

INSERT INTO practitioner_sessions
  (id, practitioner_id, client_id, studio_session_id, session_type)
VALUES
  ('a3700000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000002', 'a3500000-0000-4000-8000-000000000001', 'Synthetic contradictory session');

INSERT INTO voice_notes
  (id, practitioner_id, session_id, client_id, storage_path, mime_type, size_bytes)
VALUES
  ('a3800000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000002', 'a3500000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000002', 'synthetic/a3-r2-r1.webm', 'audio/webm', 1);

INSERT INTO client_invites
  (id, practitioner_id, client_id, code_hash, status)
VALUES
  ('a3900000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000002', 'a3300000-0000-4000-8000-000000000001', 'a3r2r1-synthetic-invite', 'unused');

INSERT INTO session_join_tokens
  (id, session_id, client_id, agreement_version, token_hash, expires_at)
VALUES
  ('a3a00000-0000-4000-8000-000000000001', 'a3600000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000001', 'a3-r2-r1', 'a3r2r1-synthetic-token', NOW() + INTERVAL '1 day');

INSERT INTO session_artifacts
  (id, session_id, client_id, practitioner_id, artifact_type, draft_content, created_by)
VALUES
  ('a3b00000-0000-4000-8000-000000000001', 'a3600000-0000-4000-8000-000000000001', 'a3300000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000002', 'client_summary', '{"synthetic":true}', 'a3000000-0000-4000-8000-000000000002');

INSERT INTO studio_meetings
  (id, practitioner_id, organizer_member_id, title, starts_at, ends_at)
VALUES
  ('a3c00000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'Fixture Meeting A', '2026-09-20T10:00:00Z', '2026-09-20T11:00:00Z'),
  ('a3c00000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'a3000000-0000-4000-8000-000000000002', 'Fixture Meeting B', '2026-09-20T12:00:00Z', '2026-09-20T13:00:00Z');

INSERT INTO studio_people
  (id, practitioner_id, team_id, name)
VALUES
  ('a3d00000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'a3200000-0000-4000-8000-000000000001', 'Fixture Person A'),
  ('a3d00000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'a3200000-0000-4000-8000-000000000002', 'Fixture Person B');

INSERT INTO encounters
  (id, practitioner_id, session_id, title, team_id)
VALUES
  ('a3e00000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'a3c00000-0000-4000-8000-000000000002', 'Fixture Encounter A', 'a3200000-0000-4000-8000-000000000001'),
  ('a3e00000-0000-4000-8000-000000000002', 'a3100000-0000-4000-8000-000000000002', 'a3c00000-0000-4000-8000-000000000002', 'Fixture Encounter B', 'a3200000-0000-4000-8000-000000000002');

INSERT INTO encounter_participants
  (id, encounter_id, person_id, display_name, role)
VALUES
  ('a3f00000-0000-4000-8000-000000000001', 'a3e00000-0000-4000-8000-000000000001', 'a3d00000-0000-4000-8000-000000000002', 'Fixture Participant A', 'client'),
  ('a3f00000-0000-4000-8000-000000000002', 'a3e00000-0000-4000-8000-000000000002', 'a3d00000-0000-4000-8000-000000000002', 'Fixture Participant B', 'client');

INSERT INTO encounter_consent_events
  (id, encounter_id, participant_id, kind, text_snapshot)
VALUES
  ('b3000000-0000-4000-8000-000000000001', 'a3e00000-0000-4000-8000-000000000001', 'a3f00000-0000-4000-8000-000000000002', 'record', 'Synthetic consent fixture only');

INSERT INTO booking_requests
  (id, practitioner_id, service_id, session_id, status)
VALUES
  ('b3100000-0000-4000-8000-000000000001', 'a3100000-0000-4000-8000-000000000001', 'a3400000-0000-4000-8000-000000000002', 'a3500000-0000-4000-8000-000000000002', 'received');

COMMIT;
