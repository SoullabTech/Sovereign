-- PRACTITIONER-OFFER-01 · A3-R2 — relationship-binding census
--
-- Read-only by construction. Run with psql against the synthetic/test database:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f scripts/research/a3-r2-relationship-binding-census.sql
--
-- A zero result means "no mismatch observed in this dataset". It does not prove
-- that the relationship is structurally enforced.

BEGIN TRANSACTION READ ONLY;

SELECT current_setting('transaction_read_only') AS transaction_read_only;

WITH row_counts AS (
  SELECT 'practitioners' AS metric, COUNT(*)::bigint AS value FROM practitioners
  UNION ALL SELECT 'practitioner_clients', COUNT(*) FROM practitioner_clients
  UNION ALL SELECT 'services', COUNT(*) FROM services
  UNION ALL SELECT 'sessions', COUNT(*) FROM sessions
  UNION ALL SELECT 'practitioner_sessions', COUNT(*) FROM practitioner_sessions
  UNION ALL SELECT 'scribe_sessions', COUNT(*) FROM scribe_sessions
  UNION ALL SELECT 'voice_notes', COUNT(*) FROM voice_notes
  UNION ALL SELECT 'session_voice_notes', COUNT(*) FROM session_voice_notes
  UNION ALL SELECT 'session_artifacts', COUNT(*) FROM session_artifacts
  UNION ALL SELECT 'session_join_tokens', COUNT(*) FROM session_join_tokens
  UNION ALL SELECT 'client_invites', COUNT(*) FROM client_invites
  UNION ALL SELECT 'booking_requests', COUNT(*) FROM booking_requests
  UNION ALL SELECT 'encounters', COUNT(*) FROM encounters
  UNION ALL SELECT 'encounter_participants', COUNT(*) FROM encounter_participants
  UNION ALL SELECT 'encounter_consent_events', COUNT(*) FROM encounter_consent_events
  UNION ALL SELECT 'encounter_media_streams', COUNT(*) FROM encounter_media_streams
)
SELECT 'rows.' || metric AS metric, value
FROM row_counts
ORDER BY metric;

WITH mismatches AS (
  -- A member may currently resolve to more than one active practice. Application
  -- resolvers use LIMIT 1, so this is nondeterministic rather than multi-practice aware.
  SELECT 'practitioners.duplicate_active_member' AS metric, COUNT(*)::bigint AS value
  FROM (
    SELECT member_id
    FROM practitioners
    WHERE member_id IS NOT NULL AND status = 'active'
    GROUP BY member_id
    HAVING COUNT(*) > 1
  ) duplicate_members

  UNION ALL
  SELECT 'sessions.client_wrong_practice', COUNT(*)
  FROM sessions s
  JOIN practitioner_clients pc ON pc.id = s.client_id
  WHERE pc.practitioner_id IS DISTINCT FROM s.practitioner_id

  UNION ALL
  SELECT 'sessions.service_wrong_practice', COUNT(*)
  FROM sessions s
  JOIN services svc ON svc.id = s.service_id
  WHERE svc.practitioner_id IS DISTINCT FROM s.practitioner_id

  UNION ALL
  SELECT 'sessions.rescheduled_from_wrong_practice', COUNT(*)
  FROM sessions s
  JOIN sessions prior ON prior.id = s.rescheduled_from_id
  WHERE prior.practitioner_id IS DISTINCT FROM s.practitioner_id

  UNION ALL
  SELECT 'sessions.rescheduled_to_wrong_practice', COUNT(*)
  FROM sessions s
  JOIN sessions next_session ON next_session.id = s.rescheduled_to_id
  WHERE next_session.practitioner_id IS DISTINCT FROM s.practitioner_id

  UNION ALL
  SELECT 'sessions.scribe_wrong_member_or_client', COUNT(*)
  FROM sessions s
  JOIN practitioners p ON p.id = s.practitioner_id
  JOIN scribe_sessions ss ON ss.id = s.scribe_session_id
  WHERE ss.member_id IS DISTINCT FROM p.member_id
     OR ss.client_id IS DISTINCT FROM s.client_id

  UNION ALL
  SELECT 'sessions.scribe_reverse_link_disagrees', COUNT(*)
  FROM sessions s
  JOIN scribe_sessions ss ON ss.id = s.scribe_session_id
  WHERE ss.booking_id IS NOT NULL
    AND ss.booking_id IS DISTINCT FROM s.id

  UNION ALL
  SELECT 'practitioner_sessions.member_client_practice_mismatch', COUNT(*)
  FROM practitioner_sessions ps
  JOIN practitioner_clients pc ON pc.id = ps.client_id
  LEFT JOIN practitioners p
    ON p.id = pc.practitioner_id
   AND p.member_id = ps.practitioner_id
  WHERE p.id IS NULL

  UNION ALL
  SELECT 'practitioner_sessions.studio_session_mismatch', COUNT(*)
  FROM practitioner_sessions ps
  JOIN practitioner_clients pc ON pc.id = ps.client_id
  LEFT JOIN sessions s
    ON s.id = ps.studio_session_id
   AND s.practitioner_id = pc.practitioner_id
   AND s.client_id = ps.client_id
  WHERE ps.studio_session_id IS NOT NULL
    AND s.id IS NULL

  UNION ALL
  SELECT 'scribe_sessions.client_wrong_member_practice', COUNT(*)
  FROM scribe_sessions ss
  JOIN practitioner_clients pc ON pc.id = ss.client_id
  LEFT JOIN practitioners p
    ON p.id = pc.practitioner_id
   AND p.member_id = ss.member_id
  WHERE ss.container = 'practitioner'
    AND p.id IS NULL

  UNION ALL
  SELECT 'scribe_sessions.booking_wrong_member_or_client', COUNT(*)
  FROM scribe_sessions ss
  JOIN sessions s ON s.id = ss.booking_id
  JOIN practitioners p ON p.id = s.practitioner_id
  WHERE p.member_id IS DISTINCT FROM ss.member_id
     OR s.client_id IS DISTINCT FROM ss.client_id

  UNION ALL
  SELECT 'voice_notes.session_or_owner_mismatch', COUNT(*)
  FROM voice_notes vn
  LEFT JOIN sessions s ON s.id = vn.session_id
  WHERE s.id IS NULL
     OR s.practitioner_id IS DISTINCT FROM vn.practitioner_id
     OR s.client_id IS DISTINCT FROM vn.client_id

  UNION ALL
  SELECT 'session_voice_notes.session_or_owner_mismatch', COUNT(*)
  FROM session_voice_notes svn
  LEFT JOIN sessions s ON s.id = svn.session_id
  WHERE s.id IS NULL
     OR s.practitioner_id IS DISTINCT FROM svn.practitioner_id
     OR s.client_id IS DISTINCT FROM svn.client_id

  UNION ALL
  SELECT 'session_join_tokens.client_mismatch', COUNT(*)
  FROM session_join_tokens sjt
  JOIN scribe_sessions ss ON ss.id = sjt.session_id
  WHERE ss.client_id IS DISTINCT FROM sjt.client_id

  UNION ALL
  SELECT 'session_artifacts.session_client_or_member_mismatch', COUNT(*)
  FROM session_artifacts sa
  LEFT JOIN scribe_sessions ss ON ss.id = sa.session_id
  WHERE ss.id IS NULL
     OR ss.member_id IS DISTINCT FROM sa.practitioner_id
     OR (sa.client_id IS NOT NULL AND ss.client_id IS DISTINCT FROM sa.client_id)

  UNION ALL
  SELECT 'client_invites.member_client_practice_mismatch', COUNT(*)
  FROM client_invites ci
  JOIN practitioner_clients pc ON pc.id = ci.client_id
  LEFT JOIN practitioners p
    ON p.id = pc.practitioner_id
   AND p.member_id = ci.practitioner_id
  WHERE p.id IS NULL

  UNION ALL
  SELECT 'booking_requests.service_wrong_practice', COUNT(*)
  FROM booking_requests br
  JOIN services svc ON svc.id = br.service_id
  WHERE svc.practitioner_id IS DISTINCT FROM br.practitioner_id

  UNION ALL
  SELECT 'booking_requests.session_wrong_practice', COUNT(*)
  FROM booking_requests br
  JOIN sessions s ON s.id = br.session_id
  WHERE s.practitioner_id IS DISTINCT FROM br.practitioner_id

  UNION ALL
  SELECT 'encounters.meeting_wrong_practice', COUNT(*)
  FROM encounters e
  JOIN studio_meetings sm ON sm.id = e.session_id
  WHERE sm.practitioner_id IS DISTINCT FROM e.practitioner_id

  UNION ALL
  SELECT 'encounter_participants.person_wrong_team', COUNT(*)
  FROM encounter_participants ep
  JOIN encounters e ON e.id = ep.encounter_id
  JOIN studio_people sp ON sp.id = ep.person_id
  WHERE sp.team_id IS DISTINCT FROM e.team_id

  UNION ALL
  SELECT 'encounter_consent_events.participant_wrong_encounter', COUNT(*)
  FROM encounter_consent_events ece
  JOIN encounter_participants ep ON ep.id = ece.participant_id
  WHERE ep.encounter_id IS DISTINCT FROM ece.encounter_id

  UNION ALL
  SELECT 'encounter_media_streams.relationship_mismatch', COUNT(*)
  FROM encounter_media_streams ems
  JOIN encounter_participants ep ON ep.id = ems.participant_id
  JOIN encounter_consent_events ece ON ece.id = ems.consent_event_id
  WHERE ep.encounter_id IS DISTINCT FROM ems.encounter_id
     OR ece.encounter_id IS DISTINCT FROM ems.encounter_id
     OR ece.participant_id IS DISTINCT FROM ems.participant_id
     OR ece.kind IS DISTINCT FROM 'record'
)
SELECT 'mismatch.' || metric AS metric, value
FROM mismatches
ORDER BY metric;

ROLLBACK;
