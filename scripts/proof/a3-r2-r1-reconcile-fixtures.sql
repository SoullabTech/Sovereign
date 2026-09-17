-- PRACTITIONER-OFFER-01 · A3-R2-R1
-- Explicit reconciliation of only the labelled synthetic fixture IDs.
-- There is intentionally no inferred, broad, or production-data update here.

\set ON_ERROR_STOP on
BEGIN;
SET CONSTRAINTS ALL DEFERRED;

UPDATE scribe_sessions
   SET practitioner_record_id = 'a3100000-0000-4000-8000-000000000001',
       client_id = 'a3300000-0000-4000-8000-000000000001'
 WHERE id = 'a3600000-0000-4000-8000-000000000001';

UPDATE sessions
   SET scribe_session_id = 'a3600000-0000-4000-8000-000000000001'
 WHERE id = 'a3500000-0000-4000-8000-000000000001';

UPDATE sessions
   SET client_id = 'a3300000-0000-4000-8000-000000000001',
       service_id = 'a3400000-0000-4000-8000-000000000001',
       rescheduled_from_id = 'a3500000-0000-4000-8000-000000000001'
 WHERE id = 'a3500000-0000-4000-8000-000000000003';

UPDATE practitioner_sessions
   SET practitioner_record_id = 'a3100000-0000-4000-8000-000000000001',
       client_id = 'a3300000-0000-4000-8000-000000000001',
       studio_session_id = 'a3500000-0000-4000-8000-000000000001'
 WHERE id = 'a3700000-0000-4000-8000-000000000001';

UPDATE voice_notes
   SET practitioner_id = 'a3100000-0000-4000-8000-000000000001',
       client_id = 'a3300000-0000-4000-8000-000000000001'
 WHERE id = 'a3800000-0000-4000-8000-000000000001';

UPDATE client_invites
   SET practitioner_id = 'a3000000-0000-4000-8000-000000000001',
       practitioner_record_id = 'a3100000-0000-4000-8000-000000000001'
 WHERE id = 'a3900000-0000-4000-8000-000000000001';

UPDATE session_join_tokens
   SET client_id = 'a3300000-0000-4000-8000-000000000001'
 WHERE id = 'a3a00000-0000-4000-8000-000000000001';

UPDATE session_artifacts
   SET practitioner_id = 'a3000000-0000-4000-8000-000000000001',
       practitioner_record_id = 'a3100000-0000-4000-8000-000000000001',
       client_id = 'a3300000-0000-4000-8000-000000000001',
       created_by = 'a3000000-0000-4000-8000-000000000001'
 WHERE id = 'a3b00000-0000-4000-8000-000000000001';

UPDATE booking_requests
   SET service_id = 'a3400000-0000-4000-8000-000000000001',
       session_id = 'a3500000-0000-4000-8000-000000000001'
 WHERE id = 'b3100000-0000-4000-8000-000000000001';

UPDATE encounters
   SET session_id = 'a3c00000-0000-4000-8000-000000000001'
 WHERE id = 'a3e00000-0000-4000-8000-000000000001';

UPDATE encounter_participants
   SET person_id = 'a3d00000-0000-4000-8000-000000000001',
       team_id = 'a3200000-0000-4000-8000-000000000001'
 WHERE id = 'a3f00000-0000-4000-8000-000000000001';

UPDATE encounter_consent_events
   SET participant_id = 'a3f00000-0000-4000-8000-000000000001'
 WHERE id = 'b3000000-0000-4000-8000-000000000001';

WITH exact_resolution(subject_table, subject_id, issue_code, resolution) AS (
  VALUES
    ('practitioner_sessions', 'a3700000-0000-4000-8000-000000000001'::uuid, 'practice_identity_unresolved', 'Synthetic fixture explicitly bound to practice A'),
    ('session_artifacts', 'a3b00000-0000-4000-8000-000000000001'::uuid, 'practice_identity_unresolved', 'Synthetic fixture explicitly bound to member and practice A'),
    ('client_invites', 'a3900000-0000-4000-8000-000000000001'::uuid, 'practice_identity_unresolved', 'Synthetic fixture explicitly rebound to member and practice A'),
    ('sessions', 'a3500000-0000-4000-8000-000000000003'::uuid, 'relationship_mismatch', 'Synthetic client and service explicitly corrected to practice A'),
    ('sessions', 'a3500000-0000-4000-8000-000000000001'::uuid, 'relationship_mismatch', 'Synthetic Session Room client explicitly corrected to booking client A'),
    ('sessions', 'a3500000-0000-4000-8000-000000000003'::uuid, 'reschedule_practice_mismatch', 'Synthetic reschedule source explicitly corrected to practice A'),
    ('practitioner_sessions', 'a3700000-0000-4000-8000-000000000001'::uuid, 'studio_session_mismatch', 'Synthetic legacy session explicitly paired to Studio session and client A'),
    ('scribe_sessions', 'a3600000-0000-4000-8000-000000000001'::uuid, 'booking_relationship_mismatch', 'Synthetic Session Room client explicitly corrected to booking client A'),
    ('voice_notes', 'a3800000-0000-4000-8000-000000000001'::uuid, 'session_relationship_mismatch', 'Synthetic voice note explicitly corrected to session relationship A'),
    ('session_join_tokens', 'a3a00000-0000-4000-8000-000000000001'::uuid, 'session_client_mismatch', 'Synthetic token explicitly confirmed against corrected Session Room client A'),
    ('session_artifacts', 'a3b00000-0000-4000-8000-000000000001'::uuid, 'session_relationship_mismatch', 'Synthetic artifact explicitly corrected to Session Room relationship A'),
    ('booking_requests', 'b3100000-0000-4000-8000-000000000001'::uuid, 'practice_relationship_mismatch', 'Synthetic request explicitly corrected to practice A service and session'),
    ('encounters', 'a3e00000-0000-4000-8000-000000000001'::uuid, 'meeting_practice_mismatch', 'Synthetic encounter explicitly corrected to practice A meeting'),
    ('encounter_participants', 'a3f00000-0000-4000-8000-000000000001'::uuid, 'person_team_mismatch', 'Synthetic participant explicitly corrected to team A person'),
    ('encounter_consent_events', 'b3000000-0000-4000-8000-000000000001'::uuid, 'participant_encounter_mismatch', 'Synthetic consent explicitly corrected to encounter A participant')
)
UPDATE relationship_binding_adjudications a
   SET status = 'resolved',
       resolution = r.resolution,
       resolved_at = NOW()
  FROM exact_resolution r
 WHERE a.subject_table = r.subject_table
   AND a.subject_id = r.subject_id
   AND a.issue_code = r.issue_code;

COMMIT;
