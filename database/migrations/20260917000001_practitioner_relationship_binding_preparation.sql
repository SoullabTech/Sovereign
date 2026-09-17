-- PRACTITIONER-OFFER-01 · A3-R2-R1
-- Additive relationship bindings: preparation, exact backfill, and NOT VALID guards.
--
-- This migration deliberately does not guess identity. Existing rows that cannot be
-- translated through an exact member + practice + relationship tuple are recorded in
-- relationship_binding_adjudications and left untouched.
--
-- The production runner executes migration files inside a transaction, so the frozen
-- census proposal to use CREATE UNIQUE INDEX CONCURRENTLY cannot execute there. The
-- supporting keys below use ordinary UNIQUE constraints. Every key includes an existing
-- primary-key id, so no new uniqueness rule is introduced; deployment lock timing must be
-- witnessed separately before this migration is authorized for production.
--
-- The constraints land NOT VALID on purpose: they refuse new mismatches immediately while
-- preserving visible historical mismatches for deliberate, row-specific adjudication.

BEGIN;

CREATE TABLE IF NOT EXISTS relationship_binding_adjudications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_table text NOT NULL,
  subject_id uuid NOT NULL,
  issue_code text NOT NULL,
  observed_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved')),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT relationship_binding_adjudications_resolution_coherence
    CHECK (
      (status = 'open' AND resolved_at IS NULL AND resolution IS NULL)
      OR
      (status = 'resolved' AND resolved_at IS NOT NULL
       AND NULLIF(btrim(resolution), '') IS NOT NULL)
    ),
  UNIQUE (subject_table, subject_id, issue_code)
);

COMMENT ON TABLE relationship_binding_adjudications IS
  'A3-R2-R1 rows whose practice/member/relationship binding cannot be translated exactly. IDs only; no PHI. Resolution is explicit and row-specific.';

-- Additive identity columns. Existing practitioner_id columns retain their current meaning.
ALTER TABLE practitioner_sessions
  ADD COLUMN IF NOT EXISTS practitioner_record_id uuid;
ALTER TABLE scribe_sessions
  ADD COLUMN IF NOT EXISTS practitioner_record_id uuid;
ALTER TABLE session_artifacts
  ADD COLUMN IF NOT EXISTS practitioner_record_id uuid;
ALTER TABLE client_invites
  ADD COLUMN IF NOT EXISTS practitioner_record_id uuid;
ALTER TABLE encounter_participants
  ADD COLUMN IF NOT EXISTS team_id uuid;

COMMENT ON COLUMN practitioner_sessions.practitioner_record_id IS
  'practitioners.id. Existing practitioner_id remains members.id during compatibility.';
COMMENT ON COLUMN scribe_sessions.practitioner_record_id IS
  'practitioners.id for practitioner/client-bound Session Room sessions.';
COMMENT ON COLUMN session_artifacts.practitioner_record_id IS
  'practitioners.id. practitioner_id and created_by remain members.id during compatibility.';
COMMENT ON COLUMN client_invites.practitioner_record_id IS
  'practitioners.id. Existing practitioner_id remains members.id during compatibility.';
COMMENT ON COLUMN encounter_participants.team_id IS
  'Copied exactly from the parent encounter; binds any person_id to the same Co-Lab.';

-- Exact translations only.
UPDATE practitioner_sessions ps
   SET practitioner_record_id = pc.practitioner_id
  FROM practitioner_clients pc
  JOIN practitioners p ON p.id = pc.practitioner_id
 WHERE ps.practitioner_record_id IS NULL
   AND pc.id = ps.client_id
   AND p.member_id = ps.practitioner_id;

WITH candidates AS (
  SELECT ss.id, pc.practitioner_id
    FROM scribe_sessions ss
    JOIN practitioner_clients pc ON pc.id = ss.client_id
    JOIN practitioners p
      ON p.id = pc.practitioner_id
     AND p.member_id = ss.member_id
  UNION
  SELECT ss.id, booking.practitioner_id
    FROM scribe_sessions ss
    JOIN sessions booking ON booking.id = ss.booking_id
    JOIN practitioners p
      ON p.id = booking.practitioner_id
     AND p.member_id = ss.member_id
), exact AS (
  SELECT id, min(practitioner_id::text)::uuid AS practitioner_id
    FROM candidates
   GROUP BY id
  HAVING count(DISTINCT practitioner_id) = 1
)
UPDATE scribe_sessions ss
   SET practitioner_record_id = exact.practitioner_id
  FROM exact
 WHERE ss.id = exact.id
   AND ss.practitioner_record_id IS NULL;

UPDATE session_artifacts a
   SET practitioner_record_id = ss.practitioner_record_id
  FROM scribe_sessions ss
 WHERE a.session_id = ss.id
   AND a.practitioner_record_id IS NULL
   AND ss.practitioner_record_id IS NOT NULL
   AND ss.member_id = a.practitioner_id
   AND (a.client_id IS NULL OR a.client_id = ss.client_id);

UPDATE client_invites i
   SET practitioner_record_id = pc.practitioner_id
  FROM practitioner_clients pc
  JOIN practitioners p ON p.id = pc.practitioner_id
 WHERE i.practitioner_record_id IS NULL
   AND pc.id = i.client_id
   AND p.member_id = i.practitioner_id;

UPDATE encounter_participants ep
   SET team_id = e.team_id
  FROM encounters e
 WHERE ep.encounter_id = e.id
   AND ep.team_id IS NULL;

-- Supporting composite targets. Each repeats an existing PK plus its owner/context.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioners_id_member_key') THEN
    ALTER TABLE practitioners ADD CONSTRAINT a3r2_practitioners_id_member_key UNIQUE (id, member_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_clients_id_practice_key') THEN
    ALTER TABLE practitioner_clients ADD CONSTRAINT a3r2_clients_id_practice_key UNIQUE (id, practitioner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_services_id_practice_key') THEN
    ALTER TABLE services ADD CONSTRAINT a3r2_services_id_practice_key UNIQUE (id, practitioner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_id_practice_key') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_id_practice_key UNIQUE (id, practitioner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_id_client_key') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_id_client_key UNIQUE (id, client_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_id_practice_key') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_id_practice_key UNIQUE (id, practitioner_record_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_id_client_key') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_id_client_key UNIQUE (id, client_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_meetings_id_practice_key') THEN
    ALTER TABLE studio_meetings ADD CONSTRAINT a3r2_meetings_id_practice_key UNIQUE (id, practitioner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_encounters_id_team_key') THEN
    ALTER TABLE encounters ADD CONSTRAINT a3r2_encounters_id_team_key UNIQUE (id, team_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_people_id_team_key') THEN
    ALTER TABLE studio_people ADD CONSTRAINT a3r2_people_id_team_key UNIQUE (id, team_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_participants_id_encounter_key') THEN
    ALTER TABLE encounter_participants ADD CONSTRAINT a3r2_participants_id_encounter_key UNIQUE (id, encounter_id);
  END IF;
END $$;

-- Booking, service, client, and reschedule ownership.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_client_same_practice') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_client_same_practice
      FOREIGN KEY (client_id, practitioner_id)
      REFERENCES practitioner_clients (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_service_same_practice') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_service_same_practice
      FOREIGN KEY (service_id, practitioner_id)
      REFERENCES services (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_rescheduled_from_same_practice') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_rescheduled_from_same_practice
      FOREIGN KEY (rescheduled_from_id, practitioner_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_rescheduled_to_same_practice') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_rescheduled_to_same_practice
      FOREIGN KEY (rescheduled_to_id, practitioner_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_booking_requests_service_same_practice') THEN
    ALTER TABLE booking_requests ADD CONSTRAINT a3r2_booking_requests_service_same_practice
      FOREIGN KEY (service_id, practitioner_id)
      REFERENCES services (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_booking_requests_session_same_practice') THEN
    ALTER TABLE booking_requests ADD CONSTRAINT a3r2_booking_requests_session_same_practice
      FOREIGN KEY (session_id, practitioner_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
END $$;

-- Legacy practitioner_sessions gains an explicit practice record without reinterpreting
-- its existing member-scoped practitioner_id.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioner_sessions_requires_practice') THEN
    ALTER TABLE practitioner_sessions ADD CONSTRAINT a3r2_practitioner_sessions_requires_practice
      CHECK (practitioner_record_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioner_sessions_practice_member') THEN
    ALTER TABLE practitioner_sessions ADD CONSTRAINT a3r2_practitioner_sessions_practice_member
      FOREIGN KEY (practitioner_record_id, practitioner_id)
      REFERENCES practitioners (id, member_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioner_sessions_client_practice') THEN
    ALTER TABLE practitioner_sessions ADD CONSTRAINT a3r2_practitioner_sessions_client_practice
      FOREIGN KEY (client_id, practitioner_record_id)
      REFERENCES practitioner_clients (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioner_sessions_studio_practice') THEN
    ALTER TABLE practitioner_sessions ADD CONSTRAINT a3r2_practitioner_sessions_studio_practice
      FOREIGN KEY (studio_session_id, practitioner_record_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_practitioner_sessions_studio_client') THEN
    ALTER TABLE practitioner_sessions ADD CONSTRAINT a3r2_practitioner_sessions_studio_client
      FOREIGN KEY (studio_session_id, client_id)
      REFERENCES sessions (id, client_id) NOT VALID;
  END IF;
END $$;

-- Session Room identity and the two compatibility link directions.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_practice_member') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_practice_member
      FOREIGN KEY (practitioner_record_id, member_id)
      REFERENCES practitioners (id, member_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_client_practice') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_client_practice
      FOREIGN KEY (client_id, practitioner_record_id)
      REFERENCES practitioner_clients (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_practitioner_requires_practice') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_practitioner_requires_practice
      CHECK (container <> 'practitioner' OR practitioner_record_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_client_requires_practice') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_client_requires_practice
      CHECK (client_id IS NULL OR practitioner_record_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_booking_requires_relationship') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_booking_requires_relationship
      CHECK (booking_id IS NULL OR (practitioner_record_id IS NOT NULL AND client_id IS NOT NULL)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_booking_practice') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_booking_practice
      FOREIGN KEY (booking_id, practitioner_record_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_scribe_booking_client') THEN
    ALTER TABLE scribe_sessions ADD CONSTRAINT a3r2_scribe_booking_client
      FOREIGN KEY (booking_id, client_id)
      REFERENCES sessions (id, client_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_scribe_practice') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_scribe_practice
      FOREIGN KEY (scribe_session_id, practitioner_id)
      REFERENCES scribe_sessions (id, practitioner_record_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_sessions_scribe_client') THEN
    ALTER TABLE sessions ADD CONSTRAINT a3r2_sessions_scribe_client
      FOREIGN KEY (scribe_session_id, client_id)
      REFERENCES scribe_sessions (id, client_id) NOT VALID;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION a3r2_enforce_reciprocal_session_room_link()
RETURNS trigger AS $$
DECLARE
  reciprocal_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'sessions' AND NEW.scribe_session_id IS NOT NULL THEN
    SELECT booking_id INTO reciprocal_id
      FROM scribe_sessions WHERE id = NEW.scribe_session_id;
    IF reciprocal_id IS NOT NULL AND reciprocal_id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'A3-R2: booking % and Session Room % contain conflicting reciprocal links',
        NEW.id, NEW.scribe_session_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'scribe_sessions' AND NEW.booking_id IS NOT NULL THEN
    SELECT scribe_session_id INTO reciprocal_id
      FROM sessions WHERE id = NEW.booking_id;
    IF reciprocal_id IS NOT NULL AND reciprocal_id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'A3-R2: Session Room % and booking % contain conflicting reciprocal links',
        NEW.id, NEW.booking_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS a3r2_sessions_reciprocal_scribe_link ON sessions;
CREATE CONSTRAINT TRIGGER a3r2_sessions_reciprocal_scribe_link
  AFTER INSERT OR UPDATE ON sessions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION a3r2_enforce_reciprocal_session_room_link();

DROP TRIGGER IF EXISTS a3r2_scribe_reciprocal_booking_link ON scribe_sessions;
CREATE CONSTRAINT TRIGGER a3r2_scribe_reciprocal_booking_link
  AFTER INSERT OR UPDATE ON scribe_sessions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION a3r2_enforce_reciprocal_session_room_link();

-- Recordings, client join tokens, and generated artifacts.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_voice_notes_session_practice') THEN
    ALTER TABLE voice_notes ADD CONSTRAINT a3r2_voice_notes_session_practice
      FOREIGN KEY (session_id, practitioner_id)
      REFERENCES sessions (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_voice_notes_session_client') THEN
    ALTER TABLE voice_notes ADD CONSTRAINT a3r2_voice_notes_session_client
      FOREIGN KEY (session_id, client_id)
      REFERENCES sessions (id, client_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_join_tokens_session_client') THEN
    ALTER TABLE session_join_tokens ADD CONSTRAINT a3r2_join_tokens_session_client
      FOREIGN KEY (session_id, client_id)
      REFERENCES scribe_sessions (id, client_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_artifacts_practice_member') THEN
    ALTER TABLE session_artifacts ADD CONSTRAINT a3r2_artifacts_practice_member
      FOREIGN KEY (practitioner_record_id, practitioner_id)
      REFERENCES practitioners (id, member_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_artifacts_requires_practice') THEN
    ALTER TABLE session_artifacts ADD CONSTRAINT a3r2_artifacts_requires_practice
      CHECK (practitioner_record_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_artifacts_session_practice') THEN
    ALTER TABLE session_artifacts ADD CONSTRAINT a3r2_artifacts_session_practice
      FOREIGN KEY (session_id, practitioner_record_id)
      REFERENCES scribe_sessions (id, practitioner_record_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_artifacts_session_client') THEN
    ALTER TABLE session_artifacts ADD CONSTRAINT a3r2_artifacts_session_client
      FOREIGN KEY (session_id, client_id)
      REFERENCES scribe_sessions (id, client_id) NOT VALID;
  END IF;
END $$;

-- Invitation member + practice + relationship tuple.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_invites_requires_practice') THEN
    ALTER TABLE client_invites ADD CONSTRAINT a3r2_invites_requires_practice
      CHECK (practitioner_record_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_invites_practice_member') THEN
    ALTER TABLE client_invites ADD CONSTRAINT a3r2_invites_practice_member
      FOREIGN KEY (practitioner_record_id, practitioner_id)
      REFERENCES practitioners (id, member_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_invites_client_practice') THEN
    ALTER TABLE client_invites ADD CONSTRAINT a3r2_invites_client_practice
      FOREIGN KEY (client_id, practitioner_record_id)
      REFERENCES practitioner_clients (id, practitioner_id) NOT VALID;
  END IF;
END $$;

-- Encounter meeting, team, participant, person, and consent tuple.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_encounters_meeting_practice') THEN
    ALTER TABLE encounters ADD CONSTRAINT a3r2_encounters_meeting_practice
      FOREIGN KEY (session_id, practitioner_id)
      REFERENCES studio_meetings (id, practitioner_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_participants_encounter_team') THEN
    ALTER TABLE encounter_participants ADD CONSTRAINT a3r2_participants_encounter_team
      FOREIGN KEY (encounter_id, team_id)
      REFERENCES encounters (id, team_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_participants_require_team') THEN
    ALTER TABLE encounter_participants ADD CONSTRAINT a3r2_participants_require_team
      CHECK (team_id IS NOT NULL) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_participants_person_team') THEN
    ALTER TABLE encounter_participants ADD CONSTRAINT a3r2_participants_person_team
      FOREIGN KEY (person_id, team_id)
      REFERENCES studio_people (id, team_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'a3r2_consent_participant_encounter') THEN
    ALTER TABLE encounter_consent_events ADD CONSTRAINT a3r2_consent_participant_encounter
      FOREIGN KEY (participant_id, encounter_id)
      REFERENCES encounter_participants (id, encounter_id) NOT VALID;
  END IF;
END $$;

-- Freeze unresolved or contradictory rows in an IDs-only adjudication ledger.
INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'practitioner_sessions', ps.id, 'practice_identity_unresolved',
       jsonb_build_object('member_id', ps.practitioner_id, 'client_id', ps.client_id,
                          'studio_session_id', ps.studio_session_id)
  FROM practitioner_sessions ps
 WHERE ps.practitioner_record_id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'scribe_sessions', ss.id, 'practice_identity_unresolved',
       jsonb_build_object('member_id', ss.member_id, 'client_id', ss.client_id,
                          'booking_id', ss.booking_id)
  FROM scribe_sessions ss
 WHERE (ss.container = 'practitioner' OR ss.client_id IS NOT NULL OR ss.booking_id IS NOT NULL)
   AND ss.practitioner_record_id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'session_artifacts', a.id, 'practice_identity_unresolved',
       jsonb_build_object('member_id', a.practitioner_id, 'client_id', a.client_id,
                          'session_id', a.session_id)
  FROM session_artifacts a
 WHERE a.practitioner_record_id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'client_invites', i.id, 'practice_identity_unresolved',
       jsonb_build_object('member_id', i.practitioner_id, 'client_id', i.client_id)
  FROM client_invites i
 WHERE i.practitioner_record_id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'sessions', s.id, 'relationship_mismatch',
       jsonb_build_object('practice_id', s.practitioner_id, 'client_id', s.client_id,
                          'service_id', s.service_id, 'scribe_session_id', s.scribe_session_id)
  FROM sessions s
  LEFT JOIN practitioner_clients pc
    ON pc.id = s.client_id AND pc.practitioner_id = s.practitioner_id
  LEFT JOIN services svc
    ON svc.id = s.service_id AND svc.practitioner_id = s.practitioner_id
  LEFT JOIN scribe_sessions ss
    ON ss.id = s.scribe_session_id
   AND ss.practitioner_record_id = s.practitioner_id
   AND ss.client_id = s.client_id
 WHERE (s.client_id IS NOT NULL AND pc.id IS NULL)
    OR (s.service_id IS NOT NULL AND svc.id IS NULL)
    OR (s.scribe_session_id IS NOT NULL AND ss.id IS NULL)
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'sessions', s.id, 'reschedule_practice_mismatch',
       jsonb_build_object('practice_id', s.practitioner_id,
                          'rescheduled_from_id', s.rescheduled_from_id,
                          'rescheduled_to_id', s.rescheduled_to_id)
  FROM sessions s
  LEFT JOIN sessions prior
    ON prior.id = s.rescheduled_from_id
   AND prior.practitioner_id = s.practitioner_id
  LEFT JOIN sessions next_session
    ON next_session.id = s.rescheduled_to_id
   AND next_session.practitioner_id = s.practitioner_id
 WHERE (s.rescheduled_from_id IS NOT NULL AND prior.id IS NULL)
    OR (s.rescheduled_to_id IS NOT NULL AND next_session.id IS NULL)
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'practitioner_sessions', ps.id, 'studio_session_mismatch',
       jsonb_build_object('practice_id', ps.practitioner_record_id,
                          'client_id', ps.client_id,
                          'studio_session_id', ps.studio_session_id)
  FROM practitioner_sessions ps
  LEFT JOIN sessions s
    ON s.id = ps.studio_session_id
   AND s.practitioner_id = ps.practitioner_record_id
   AND s.client_id = ps.client_id
 WHERE ps.studio_session_id IS NOT NULL AND s.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'scribe_sessions', ss.id, 'booking_relationship_mismatch',
       jsonb_build_object('practice_id', ss.practitioner_record_id,
                          'client_id', ss.client_id, 'booking_id', ss.booking_id)
  FROM scribe_sessions ss
  LEFT JOIN sessions s
    ON s.id = ss.booking_id
   AND s.practitioner_id = ss.practitioner_record_id
   AND s.client_id = ss.client_id
 WHERE ss.booking_id IS NOT NULL AND s.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'scribe_sessions', ss.id, 'reciprocal_booking_link_mismatch',
       jsonb_build_object('booking_id', ss.booking_id,
                          'booking_scribe_session_id', s.scribe_session_id)
  FROM scribe_sessions ss
  JOIN sessions s ON s.id = ss.booking_id
 WHERE s.scribe_session_id IS NOT NULL AND s.scribe_session_id IS DISTINCT FROM ss.id
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'voice_notes', vn.id, 'session_relationship_mismatch',
       jsonb_build_object('practice_id', vn.practitioner_id,
                          'client_id', vn.client_id, 'session_id', vn.session_id)
  FROM voice_notes vn
  LEFT JOIN sessions s
    ON s.id = vn.session_id
   AND s.practitioner_id = vn.practitioner_id
   AND s.client_id = vn.client_id
 WHERE s.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'session_join_tokens', t.id, 'session_client_mismatch',
       jsonb_build_object('session_id', t.session_id, 'client_id', t.client_id)
  FROM session_join_tokens t
  LEFT JOIN scribe_sessions ss
    ON ss.id = t.session_id AND ss.client_id = t.client_id
 WHERE ss.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'session_artifacts', a.id, 'session_relationship_mismatch',
       jsonb_build_object('member_id', a.practitioner_id,
                          'practice_id', a.practitioner_record_id,
                          'client_id', a.client_id, 'session_id', a.session_id)
  FROM session_artifacts a
  LEFT JOIN scribe_sessions ss
    ON ss.id = a.session_id
   AND ss.member_id = a.practitioner_id
   AND ss.practitioner_record_id = a.practitioner_record_id
   AND (a.client_id IS NULL OR ss.client_id = a.client_id)
 WHERE ss.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'booking_requests', br.id, 'practice_relationship_mismatch',
       jsonb_build_object('practice_id', br.practitioner_id,
                          'service_id', br.service_id, 'session_id', br.session_id)
  FROM booking_requests br
  LEFT JOIN services svc
    ON svc.id = br.service_id AND svc.practitioner_id = br.practitioner_id
  LEFT JOIN sessions s
    ON s.id = br.session_id AND s.practitioner_id = br.practitioner_id
 WHERE (br.service_id IS NOT NULL AND svc.id IS NULL)
    OR (br.session_id IS NOT NULL AND s.id IS NULL)
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'encounters', e.id, 'meeting_practice_mismatch',
       jsonb_build_object('practice_id', e.practitioner_id, 'meeting_id', e.session_id)
  FROM encounters e
  LEFT JOIN studio_meetings sm
    ON sm.id = e.session_id AND sm.practitioner_id = e.practitioner_id
 WHERE e.session_id IS NOT NULL AND sm.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'encounter_participants', ep.id, 'person_team_mismatch',
       jsonb_build_object('encounter_id', ep.encounter_id, 'person_id', ep.person_id,
                          'team_id', ep.team_id)
  FROM encounter_participants ep
  LEFT JOIN studio_people sp ON sp.id = ep.person_id AND sp.team_id = ep.team_id
 WHERE ep.person_id IS NOT NULL AND sp.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

INSERT INTO relationship_binding_adjudications
  (subject_table, subject_id, issue_code, observed_ids)
SELECT 'encounter_consent_events', ce.id, 'participant_encounter_mismatch',
       jsonb_build_object('encounter_id', ce.encounter_id,
                          'participant_id', ce.participant_id)
  FROM encounter_consent_events ce
  LEFT JOIN encounter_participants ep
    ON ep.id = ce.participant_id AND ep.encounter_id = ce.encounter_id
 WHERE ep.id IS NULL
ON CONFLICT (subject_table, subject_id, issue_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_relationship_binding_adjudications_open
  ON relationship_binding_adjudications (subject_table, issue_code, subject_id)
  WHERE status = 'open';

COMMIT;
