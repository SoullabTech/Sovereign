-- Circle inquiry responses — member withdrawal (CA-03, ratified 2026-09-07)
--
-- FR ruling: "A member may withdraw their own structured-inquiry response.
-- Withdrawal is the member exercising continuing consent over a Personal→Circle
-- crossing."
--
-- This was the ONLY irreversible Personal→Circle crossing in the substrate, and
-- it stood against the Membrane Invariant's "reversible at all times".
--
-- SHAPE: soft-revoke, following the established `shared_artifacts.revoked_at`
-- precedent exactly — set a timestamp, retain the row, exclude it from every
-- read. Same mechanism, same reasoning: the Circle-side representation is
-- withdrawn; nothing private is touched.
--
-- WHY THE ROW IS RETAINED, not deleted:
--   The UNIQUE(inquiry_id, member_id) constraint is load-bearing for FR-04.
--   Deleting the row would let a member respond → see everyone else's responses
--   → withdraw → respond again with the benefit of having seen. Retaining it
--   keeps one-response-per-member intact. Withdrawal returns consent; it does
--   not return the member to a pre-exposure state, because nothing can.
--
-- ⚠️ OPEN QUESTION FOR THE FOUNDER — not decided here.
--   This retains `response_text` in the row while excluding it from all reads.
--   That satisfies the ruling as written ("must not preserve the withdrawn
--   response as MEMBER-VISIBLE Circle content") and matches how share
--   revocation already behaves. But a stricter reading of continuing consent
--   would blank the text on withdrawal. Jarvis has NOT chosen that: it is a
--   consent question, not an implementation detail. See
--   docs/programme/JARVIS-CIRCLES-01_POST_R5_CLEANUP_2026-09-07.md.

ALTER TABLE circle_inquiry_responses
  ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

COMMENT ON COLUMN circle_inquiry_responses.withdrawn_at IS
  'Set when the response AUTHOR withdraws their contribution (CA-03). Excluded from every read. Only the author may set it; no facilitator or other member may withdraw on their behalf. The row is retained so UNIQUE(inquiry_id, member_id) keeps one-response-per-member intact.';

-- Reads filter on this constantly; the inquiry-scoped partial index matches them.
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_live
  ON circle_inquiry_responses(inquiry_id)
  WHERE withdrawn_at IS NULL;

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260907000001_circle_inquiry_response_withdrawal.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
