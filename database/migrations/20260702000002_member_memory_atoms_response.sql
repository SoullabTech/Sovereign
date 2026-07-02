-- ═══════════════════════════════════════════════════════════════════════════
-- Member response to a surfaced observation on member_memory_atoms
--
-- Constitutional Completion: the atom-surfacing capability gains its refusal.
--
-- A practitioner_observation atom is surfaced to the member with an explicit
-- invitation to "confirm, reject, or refine" (lib/maia/memoryAtomsLoader.ts).
-- Until now there was NO column that could RECORD a decline — so when a member
-- said "that's not true," the observation stayed loader-eligible and re-surfaced
-- next session as if the member had never disagreed. The system was silently
-- carrying an unconfirmed observation as if it were established context. That is
-- persistent authorship manufacture.
--
-- This migration adds the member's response axis. It is DISTINCT from `status`:
--   status                  = how the member CURATES an atom they placed
--                             (active / still_alive / set_aside / protected / archived)
--   member_response_status  = the member's VERDICT on an observation made ABOUT
--                             them by a practitioner (confirmed / rejected / modified)
-- A member declining a practitioner's claim is not a curation gesture — it is an
-- authorship refusal, so it gets its own axis rather than overloading `status`.
--
-- Canon discipline (also see member_memory_atoms.crossing_must_be_false and
-- is_breakthrough — same substrate, member-only verdict, system never sets it):
--   - The system NEVER sets member_response_status. Default is NULL.
--   - It moves only via an explicit member action against a route that requires
--     authenticated ownership of the atom
--     (POST/DELETE /api/sovereign/atoms/[id]/decline).
--   - 'rejected' RELEASES the atom: the loader's surfacing query excludes it
--     (member_response_status IS DISTINCT FROM 'rejected'), so a declined
--     observation does not resurface. Reversible — the member may withdraw a
--     decline (DELETE), restoring NULL, so it can surface again.
--   - 'confirmed' / 'modified' are reserved forward-compat verdicts: the CHECK
--     admits them, but NO runtime path writes them yet (no dead-write behaviour).
--
-- RELEASE UNIT (schema + reader ship together): the loader's surfacing query
-- references this column (member_response_status IS DISTINCT FROM 'rejected').
-- If the reader deploys ahead of this migration the loader query errors and
-- degrades to failure-empty — atom surfacing silently stops until the column
-- exists. So this migration and lib/maia/memoryAtomsLoader.ts are ONE release
-- unit: deploy via the full gated path (scripts/deploy-production.sh, which runs
-- migrations), NEVER the quick maia-only rebuild. This is "capability and its
-- refusal ship together" applied to persistence: schema and reader ship together.
--
-- Authority: docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md (the member may decline
--            what is held about them, and the system must release it),
--            docs/canon/THE_CLEARING.md (member places / responds; system does
--            not classify), docs/canon/SPIRAL_CONTINUITY_ENGINE.md.
-- Consumer:  lib/maia/memoryAtomsLoader.ts (surfacing exclusion),
--            lib/psyche/portfolio.ts (declineObservation gesture).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS member_response_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS member_response_at     TIMESTAMPTZ;

-- Legal verdicts. NULL = the member has not responded to the observation.
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS member_response_status_valid;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT member_response_status_valid CHECK (
    member_response_status IS NULL
    OR member_response_status IN ('confirmed', 'rejected', 'modified')
  );

-- Coherence: verdict and its timestamp move together, mirroring
-- breakthrough_flag_timestamp_coherent. A response without a time (or a time
-- without a response) is structurally impossible, so "when did the member
-- respond" is always recoverable and orphaned timestamps cannot exist.
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS member_response_coherent;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT member_response_coherent CHECK (
    (member_response_status IS NULL     AND member_response_at IS NULL)
    OR
    (member_response_status IS NOT NULL AND member_response_at IS NOT NULL)
  );

-- Partial index — carries only declined rows, for a future "observations you
-- declined" audit/review surface. The hot surfacing path is already covered by
-- idx_memory_atoms_member_status_touched; this does not serve the exclusion
-- (which reads non-declined rows) — it serves the member's own review of what
-- they released.
CREATE INDEX IF NOT EXISTS idx_memory_atoms_declined
  ON member_memory_atoms(member_id, member_response_at DESC)
  WHERE member_response_status = 'rejected';

COMMENT ON COLUMN member_memory_atoms.member_response_status IS
  'The member''s verdict on an observation surfaced ABOUT them (confirmed / rejected / modified). NULL = not yet responded. Distinct from status (curation). System NEVER sets this — it moves only via authenticated member action through POST/DELETE /api/sovereign/atoms/[id]/decline. ''rejected'' releases the atom from ambient recall (loader exclusion). ''confirmed''/''modified'' are reserved forward-compat verdicts with no runtime writer yet.';

COMMENT ON COLUMN member_memory_atoms.member_response_at IS
  'When the member responded to the observation. Coherence-bound to member_response_status via member_response_coherent CHECK constraint.';

COMMIT;
