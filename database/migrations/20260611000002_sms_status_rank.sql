-- Monotonic SMS delivery status.
--
-- Twilio status callbacks can arrive out of order (observed in production: a late
-- "queued" callback arriving after "delivered"). Persisted state must only advance
-- through the lifecycle, never regress — otherwise the queryable row becomes less
-- true than the event stream.
--
-- This rank function is used in the StatusCallback upsert's WHERE clause
-- (app/api/notifications/sms/status) for a race-safe, atomic comparison:
--   DO UPDATE ... WHERE sms_status_rank(EXCLUDED.status) >= sms_status_rank(existing.status)
--
-- Lifecycle: accepted/scheduled(1) < queued(2) < sending(3) < sent(4) < terminal(5).
-- Terminal statuses (delivered/undelivered/failed) share rank 5; the latest terminal
-- wins. Unknown statuses rank 0 so they can never overwrite a known status.

CREATE OR REPLACE FUNCTION sms_status_rank(s TEXT) RETURNS INT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE s
    WHEN 'accepted'    THEN 1
    WHEN 'scheduled'   THEN 1
    WHEN 'queued'      THEN 2
    WHEN 'sending'     THEN 3
    WHEN 'sent'        THEN 4
    WHEN 'delivered'   THEN 5
    WHEN 'undelivered' THEN 5
    WHEN 'failed'      THEN 5
    ELSE 0
  END
$$;
