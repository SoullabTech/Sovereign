-- Circle inquiries — retire the stored `integrating` status (B-09, CIRCLE-04 P5)
--
-- FOUNDER RULING E, 2026-09-07.
--
-- `integrating` was never a process state. `closeInquiry()` chose it purely by
-- whether a synthesis was supplied:
--
--     fieldSynthesis present  →  'integrating'
--     no fieldSynthesis       →  'closed'
--
-- and nothing downstream read the distinction: respondToInquiry refused both,
-- getInquiryWithResponses revealed all responses for both, and the field pulse
-- looked only for 'open'. It was a stored duplicate of
--
--     status = 'closed' AND field_synthesis IS NOT NULL
--
-- which is the anti-pattern FR-13 forbids — and it could already drift from the
-- fact it duplicated, since nothing prevented 'closed' with a synthesis or
-- 'integrating' without one. It also had no exit: once set, no code path left it.
--
-- The fix is not an exit ceremony. There was no durable meaning to exit FROM.
-- The synthesis stays as an optional property of a closed inquiry, and its
-- presence is derived where it is displayed.
--
-- ⛔ HARD SCOPE BOUNDARY — this migration concerns InquiryStatus ONLY.
--    `FieldPhase` ('forming' | 'active' | 'integrating' | 'quiet') is a
--    SEPARATE concept answering a different question — what appears to be
--    happening in a Circle's current activity. It is untouched, along with
--    fieldPulseService.derivePhase(), FieldPresence, and the Circles-page phase
--    labels. Retiring the inquiry status REDUCES the CA-14 collision rather
--    than widening it: one fewer `integrating` meaning something else.

-- 1. Any inquiry already carrying the retired status becomes what it always was.
--    Its field_synthesis is untouched — that is the fact the status duplicated.
UPDATE circle_inquiries SET status = 'closed' WHERE status = 'integrating';

-- 2. The vocabulary no longer admits it, so it cannot be reintroduced silently.
ALTER TABLE circle_inquiries
  DROP CONSTRAINT IF EXISTS circle_inquiries_status_check;
ALTER TABLE circle_inquiries
  ADD CONSTRAINT circle_inquiries_status_check
  CHECK (status IN ('open', 'closed'));

COMMENT ON COLUMN circle_inquiries.status IS
  'open | closed. There is no third state: a synthesis is an optional property of a closed inquiry (field_synthesis), not a status. Do not confuse with FieldPhase, which is a separate concept about Circle activity.';
COMMENT ON COLUMN circle_inquiries.field_synthesis IS
  'Optional synthesis authored by the inquiry opener at close. Its presence is derived where displayed; it is never encoded as a second status.';

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260907000002_circle_inquiry_status_retire_integrating.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
