-- S3 · P1 — THE PENDING-ASK CLAIM. One paused Ask, resumable at most once.
--
--   ⭐⭐ This row remembers whether an Ask may still be RESUMED.
--       It does NOT remember what may be read.
--
-- WHY A DEDICATED TABLE. The substrate census (canonical c509976b5) measured
-- every existing candidate and none can carry the contract:
--
--   ask_threads    wrong granularity — a thread carries MANY Asks
--   ask_turns      UPDATE refused by trigger; its (thread_id, turn_index)
--                  arbitration yields unique turn numbers, not a state change
--   isHeldRetry    continuity recognition; transitions nothing
--   receipts       right mechanism, wrong seam — the claim would sit INSIDE
--                  establishDisclosureBoundary, so a loser would fail DURING
--                  boundary establishment rather than BEFORE it
--
-- The shape is the one `consumeOAuthState` already uses in this repository: an
-- atomic mutation whose predicate INCLUDES "still pending". A SELECT that
-- decides followed by an UPDATE that acts leaves a window in which a replay
-- races the original and both proceed.
--
--   ⭐ The authority is the MUTATION, not a precheck.
--
-- ⛔⛔ WHAT THIS TABLE MUST NEVER GAIN. No `section_id`, no `authorized`, no
-- `scope_kind`, no `disclosure_id`, no `may_cross`, no consent, and no authored
-- prose. Those are the fields that turn a continuity record into a standing
-- permission, however they are spelled.
--
--   lawful durable state       "this Ask resume remains claimable / was consumed"
--   prohibited durable state   "this Ask is authorized to read section 7"
--
-- The requirement and the required section set are RE-DERIVED inside the resumed
-- invocation from the reading and the anchor. Persisting them here is exactly how
-- the identity record would become a permission record.
--
-- ⛔ AND IT IS NOT A RESULT CACHE. Lost-response recovery is a route/completion
-- concern. This table proves only that a retry cannot consume the same resume
-- twice; it must not grow a stored answer to solve the rest.
--
-- THE STATE MACHINE, ENFORCED BELOW:
--
--   PENDING ──atomic claim──▶ CONSUMED ──▶ COMPLETED
--                                      └──▶ (terminal, incomplete)
--
-- No transition returns CONSUMED → PENDING. An invocation that consumes the act
-- and then dies before its crossing completes requires a NEW member act — never
-- a half-authorized permission waiting to be reused.
--
-- Additive. Creates one new table; reads, moves and rewrites nothing.
--
-- Authority: docs/programme/S3-DESIGN-01_SECTION_AUTHORITY_DESIGN_2026-09-10.md
--            docs/programme/S3-IMPL-01_PENDING_ASK_REF_SUBSTRATE_CENSUS_2026-09-10.md

BEGIN;

CREATE TABLE IF NOT EXISTS pending_ask_claims (
  -- Opaque, high-entropy, meaningless alone. ⛔ Never derived from Work content.
  ref text PRIMARY KEY CHECK (length(ref) >= 32),

  -- Custody. Denormalised so validating a resume never depends on another row.
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- WHICH question is paused — never what may be read.
  thread_id uuid NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,
  reading_id uuid NOT NULL,
  observation_key text NOT NULL CHECK (length(observation_key) > 0),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- Continuity hygiene, NOT disclosure freshness. The authority this resume will
  -- eventually establish is invocation-bound and cannot be stored at all.
  expires_at timestamptz NOT NULL,

  -- ⭐ Presence means "already claimed". Kept rather than deleted on use, so a
  -- replay attempt is VISIBLE — the same discipline as the delivery ledger's
  -- idempotency key and google_oauth_state.consumed_at.
  consumed_at timestamptz,

  -- Whether the claimed invocation reached a completed crossing. Serves
  -- lost-response classification only; ⛔ it stores no result.
  completed_at timestamptz,

  CONSTRAINT pending_ask_claims_expiry_after_creation
    CHECK (expires_at > created_at),
  -- ⛔ A completion cannot exist without the claim that produced it.
  CONSTRAINT pending_ask_claims_completion_requires_consumption
    CHECK (completed_at IS NULL OR consumed_at IS NOT NULL)
);

-- The replay-visibility read: which resumes were claimed but never completed.
CREATE INDEX IF NOT EXISTS idx_pending_ask_claims_unfinished
  ON pending_ask_claims (consumed_at)
  WHERE consumed_at IS NOT NULL AND completed_at IS NULL;

-- ⭐⭐ NO CONSUMED → PENDING, AND NO RE-POINTING.
--
-- The claim is the constitutional event. A row whose `consumed_at` could be
-- cleared would let one member act be spent twice, and a row whose Ask binding
-- could be rewritten would let a resume be pointed at a question the member
-- never paused. Both are refused by the database, not by the caller.
CREATE OR REPLACE FUNCTION pending_ask_claims_forward_only()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.consumed_at IS NOT NULL AND NEW.consumed_at IS DISTINCT FROM OLD.consumed_at THEN
    RAISE EXCEPTION
      'pending ask % is already consumed: a spent authorization act is never returned to pending — a new member act is required',
      OLD.ref;
  END IF;
  IF OLD.completed_at IS NOT NULL AND NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    RAISE EXCEPTION 'pending ask % has already completed: completion is recorded once', OLD.ref;
  END IF;
  IF NEW.ref IS DISTINCT FROM OLD.ref
     OR NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
     OR NEW.thread_id IS DISTINCT FROM OLD.thread_id
     OR NEW.reading_id IS DISTINCT FROM OLD.reading_id
     OR NEW.observation_key IS DISTINCT FROM OLD.observation_key
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION
      'pending ask % is immutable in identity, custody, Ask binding and lifetime',
      OLD.ref;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pending_ask_claims_no_reversal ON pending_ask_claims;
CREATE TRIGGER pending_ask_claims_no_reversal
  BEFORE UPDATE ON pending_ask_claims
  FOR EACH ROW EXECUTE FUNCTION pending_ask_claims_forward_only();

COMMENT ON TABLE pending_ask_claims IS
  'S3/P1. One paused developmental Ask, claimable at most once. Identity and lifecycle only: it records that a resume remains claimable or was consumed, never that any section may be read. Adding section_id, authorized, scope_kind, disclosure_id or any prose column would make it a standing permission and is prohibited.';
COMMENT ON COLUMN pending_ask_claims.consumed_at IS
  'Set by the single atomic claim. Kept rather than deleted so a replay attempt stays visible. Never cleared — the trigger refuses it.';
COMMENT ON COLUMN pending_ask_claims.completed_at IS
  'Whether the claimed invocation reached a completed crossing. Classification only; this table stores no result and is not a response cache.';

COMMIT;

-- ROLLBACK (manual):
--   The table is new and nothing describes the Work through it. Dropping it
--   discards paused-Ask continuity and touches no manuscript, thread, reading,
--   receipt or canonical structure.
--
--   DROP TABLE IF EXISTS pending_ask_claims;
--   DROP FUNCTION IF EXISTS pending_ask_claims_forward_only();
