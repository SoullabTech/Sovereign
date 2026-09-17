-- PRACTITIONER-OFFER-01 · A3-R2-R1
-- Validation is intentionally separate from preparation so NOT VALID constraints can
-- protect new writes while historical synthetic mismatches remain visible for explicit
-- row-by-row reconciliation.

BEGIN;

DO $$
DECLARE
  open_count bigint;
BEGIN
  SELECT count(*) INTO open_count
    FROM relationship_binding_adjudications
   WHERE status = 'open';
  IF open_count > 0 THEN
    RAISE EXCEPTION
      'A3-R2 relationship binding validation refused: % adjudication row(s) remain open',
      open_count;
  END IF;
END $$;

ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_client_same_practice;
ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_service_same_practice;
ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_rescheduled_from_same_practice;
ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_rescheduled_to_same_practice;
ALTER TABLE booking_requests VALIDATE CONSTRAINT a3r2_booking_requests_service_same_practice;
ALTER TABLE booking_requests VALIDATE CONSTRAINT a3r2_booking_requests_session_same_practice;

ALTER TABLE practitioner_sessions VALIDATE CONSTRAINT a3r2_practitioner_sessions_practice_member;
ALTER TABLE practitioner_sessions VALIDATE CONSTRAINT a3r2_practitioner_sessions_requires_practice;
ALTER TABLE practitioner_sessions VALIDATE CONSTRAINT a3r2_practitioner_sessions_client_practice;
ALTER TABLE practitioner_sessions VALIDATE CONSTRAINT a3r2_practitioner_sessions_studio_practice;
ALTER TABLE practitioner_sessions VALIDATE CONSTRAINT a3r2_practitioner_sessions_studio_client;

ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_practice_member;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_client_practice;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_practitioner_requires_practice;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_client_requires_practice;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_booking_requires_relationship;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_booking_practice;
ALTER TABLE scribe_sessions VALIDATE CONSTRAINT a3r2_scribe_booking_client;
ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_scribe_practice;
ALTER TABLE sessions VALIDATE CONSTRAINT a3r2_sessions_scribe_client;

ALTER TABLE voice_notes VALIDATE CONSTRAINT a3r2_voice_notes_session_practice;
ALTER TABLE voice_notes VALIDATE CONSTRAINT a3r2_voice_notes_session_client;
ALTER TABLE session_join_tokens VALIDATE CONSTRAINT a3r2_join_tokens_session_client;
ALTER TABLE session_artifacts VALIDATE CONSTRAINT a3r2_artifacts_practice_member;
ALTER TABLE session_artifacts VALIDATE CONSTRAINT a3r2_artifacts_requires_practice;
ALTER TABLE session_artifacts VALIDATE CONSTRAINT a3r2_artifacts_session_practice;
ALTER TABLE session_artifacts VALIDATE CONSTRAINT a3r2_artifacts_session_client;

ALTER TABLE client_invites VALIDATE CONSTRAINT a3r2_invites_practice_member;
ALTER TABLE client_invites VALIDATE CONSTRAINT a3r2_invites_requires_practice;
ALTER TABLE client_invites VALIDATE CONSTRAINT a3r2_invites_client_practice;

ALTER TABLE encounters VALIDATE CONSTRAINT a3r2_encounters_meeting_practice;
ALTER TABLE encounter_participants VALIDATE CONSTRAINT a3r2_participants_encounter_team;
ALTER TABLE encounter_participants VALIDATE CONSTRAINT a3r2_participants_require_team;
ALTER TABLE encounter_participants VALIDATE CONSTRAINT a3r2_participants_person_team;
ALTER TABLE encounter_consent_events VALIDATE CONSTRAINT a3r2_consent_participant_encounter;

COMMIT;
