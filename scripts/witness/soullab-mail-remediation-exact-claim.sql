WITH claimed AS (
      SELECT s.id
      FROM scheduled_sends s
      WHERE s.status = 'pending'
        AND s.consent_confirmed = true
        AND s.scheduled_for <= now()
      ORDER BY s.scheduled_for ASC, s.id ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    ), updated AS (
      UPDATE scheduled_sends s
      SET status = 'sending', claim_token = gen_random_uuid(),
          claimed_at = now(), attempts = s.attempts + 1, updated_at = now()
      WHERE s.id IN (SELECT id FROM claimed) AND s.status = 'pending'
      RETURNING s.id, s.claim_token, s.practitioner_id, s.recipient_email,
                s.recipient_name, s.subject, s.body
    )
    SELECT s.*, p.name AS practitioner_name, p.email AS practitioner_email
    FROM updated s JOIN practitioners p ON p.id = s.practitioner_id
    ORDER BY s.id;
