-- Circle inquiry responses — member withdrawal (CA-03, ratified 2026-09-07)
--
-- FR ruling: "A member may withdraw their own structured-inquiry response.
-- Withdrawal is the member exercising continuing consent over a Personal→Circle
-- crossing."
--
-- This was the ONLY irreversible Personal→Circle crossing in the substrate, and
-- it stood against the Membrane Invariant's "reversible at all times".
--
-- SHAPE: TOMBSTONE (founder ruling B, 2026-09-07). Not the plain soft-revoke
-- used for shared_artifacts, and the difference is deliberate:
--
--   Withdrawal preserves the historical FACT that a response occurred, but
--   does NOT preserve the withdrawn authored payload.
--
-- A shared artifact is a pointer to something that still exists elsewhere;
-- keeping its text preserves the integrity of a Circle-visible object. An
-- inquiry response IS the Circle-side authored representation. There is no
-- other object whose integrity requires keeping the actual words — so keeping
-- them would be retaining surrendered meaning because storage makes it easy.
--
--   LIVE       withdrawn_at IS NULL      payload NOT NULL
--   WITHDRAWN  withdrawn_at IS NOT NULL  payload NULL
--
-- Enforced below as a schema invariant, so the two states cannot drift.
--
-- ⛔ `response_type` is nulled too. "reflection / witness / offering" is still
-- authored semantic information about what the person contributed.
-- ⛔ No hash, digest, length or any other recoverable or fingerprintable
-- substitute for the content is retained.
--
-- WHY THE ROW IS RETAINED (as a tombstone), not deleted:
--   The UNIQUE(inquiry_id, member_id) constraint is load-bearing for FR-04.
--   Deleting the row would let a member respond → see everyone else's responses
--   → withdraw → respond again with the benefit of having seen. Retaining it
--   keeps one-response-per-member intact. Withdrawal returns consent; it does
--   not return the member to a pre-exposure state, because nothing can.
--
-- AMENDED IN PLACE rather than corrected by a later migration: this file has
-- never reached a durable database, so amending it is honest and leaves no
-- window in which payloads were retained.

ALTER TABLE circle_inquiry_responses
  ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

-- The payload must become nullable for a tombstone to be representable.
ALTER TABLE circle_inquiry_responses
  ALTER COLUMN response_text DROP NOT NULL,
  ALTER COLUMN response_type DROP NOT NULL;

-- response_type's original CHECK rejected NULL by omission. Re-state it so a
-- tombstoned row is valid and a live row is still constrained to the vocabulary.
ALTER TABLE circle_inquiry_responses
  DROP CONSTRAINT IF EXISTS circle_inquiry_responses_response_type_check;
ALTER TABLE circle_inquiry_responses
  ADD CONSTRAINT circle_inquiry_responses_response_type_check
  CHECK (response_type IS NULL OR response_type IN ('reflection', 'witness', 'offering'));

-- The invariant. A live response has its payload; a withdrawn one has none.
-- Neither half can drift from the other, because neither is representable alone.
ALTER TABLE circle_inquiry_responses
  DROP CONSTRAINT IF EXISTS circle_inquiry_responses_withdrawal_tombstone;
ALTER TABLE circle_inquiry_responses
  ADD CONSTRAINT circle_inquiry_responses_withdrawal_tombstone
  CHECK (
    (withdrawn_at IS NULL     AND response_text IS NOT NULL AND response_type IS NOT NULL)
    OR
    (withdrawn_at IS NOT NULL AND response_text IS NULL     AND response_type IS NULL)
  );

COMMENT ON COLUMN circle_inquiry_responses.withdrawn_at IS
  'Set when the contribution leaves the field — by AUTHOR WITHDRAWAL (CA-03), or by BOUNDARY CASCADE when the member leaves or is removed. The payload is nulled in the same statement (tombstone). The row is retained so UNIQUE(inquiry_id, member_id) keeps one-response-per-member intact.';

-- Reads filter on this constantly; the inquiry-scoped partial index matches them.
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_live
  ON circle_inquiry_responses(inquiry_id)
  WHERE withdrawn_at IS NULL;

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260907000001_circle_inquiry_response_withdrawal.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
