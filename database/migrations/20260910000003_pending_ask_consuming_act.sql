-- S3 · P1 — record WHICH act consumed a pending Ask.
--
--   ⭐⭐ "pending Ask X was consumed by act Y" is a lawful durable fact.
--   ⛔⛔ "act Y has standing permission to read section S" is not, and this
--       column must never become that.
--
-- WHY THIS EXISTS. FOCUS-WITNESS-01's first run took HTTP 400 because the Focus
-- route requires a client-supplied `actId` under ratified F1k: only the surface
-- that watched the writer press the button knows whether a request is that press
-- again or a new one. The developmental Ask's ACT 3 had no act identity at all.
--
-- The consequence was safe but untruthful. A lost HTTP response meant the
-- member's single press came back as ALREADY_CONSUMED — the anti-replay control
-- holding, while telling the member they had tried to reuse a spent
-- authorization. Storing the consuming act lets the two be told apart:
--
--   incoming actId = the stored one   → THIS SAME ACT was already processed
--   incoming actId ≠ the stored one   → consumed by a DIFFERENT act
--
-- ⛔ NEITHER REACHES a boundary, a load, cognition, or a new receipt. The stored
-- identity CLASSIFIES a replay; it can never authorize another crossing.
--
-- ⛔ AND IT IS NOT A RESULT CACHE. No answer, no content, no evidence is stored
-- to make the distinction — only which act spent the claim.
--
-- Additive to a table that exists in no production database. Safe by construction
-- rather than by argument: `20260910000001_pending_ask_claims.sql` has never been
-- applied to production.
--
-- Authority: docs/programme/S3-PHASE4-01_BODY_AUTHORIZATION_HELPER_REVIEW_2026-09-10.md

BEGIN;

ALTER TABLE pending_ask_claims
  ADD COLUMN IF NOT EXISTS consumed_by_act text;

DO $$
BEGIN
  -- ⭐ Bounded exactly like the Focus route's `isUsableActId`: 8..200 characters.
  -- An id shorter than that is not an identity anyone could have minted per act.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_act_shape') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_act_shape
      CHECK (consumed_by_act IS NULL
             OR length(btrim(consumed_by_act)) BETWEEN 8 AND 200);
  END IF;
  -- ⭐⭐ CONSUMPTION AND ITS ACT ARE ONE FACT. A claim consumed by nobody, or an
  -- act recorded against an unconsumed claim, would each be a state the protocol
  -- cannot describe.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_act_with_consumption') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_act_with_consumption
      CHECK ((consumed_at IS NULL) = (consumed_by_act IS NULL));
  END IF;
END $$;

-- The forward-only trigger gains one clause: the consuming act is written once,
-- with the consumption, and never rewritten. A claim whose act could change would
-- let one press be re-attributed to another.
CREATE OR REPLACE FUNCTION pending_ask_claims_forward_only()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.consumed_at IS NOT NULL AND NEW.consumed_at IS DISTINCT FROM OLD.consumed_at THEN
    RAISE EXCEPTION
      'pending ask % is already consumed: a spent authorization act is never returned to pending — a new member act is required',
      OLD.ref;
  END IF;
  IF OLD.consumed_by_act IS NOT NULL AND NEW.consumed_by_act IS DISTINCT FROM OLD.consumed_by_act THEN
    RAISE EXCEPTION
      'pending ask % was consumed by a recorded act: the consuming act is never re-attributed',
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

COMMENT ON COLUMN pending_ask_claims.consumed_by_act IS
  'Which physical authorization act consumed this resume. Classifies a replay: the same actId means the same human press arriving twice, a different actId means a different act. It NEVER authorizes a crossing, and this table stores no answer, content or evidence to make the distinction.';

COMMIT;

-- ROLLBACK (manual):
--   ALTER TABLE pending_ask_claims DROP CONSTRAINT IF EXISTS pending_ask_claims_act_with_consumption;
--   ALTER TABLE pending_ask_claims DROP CONSTRAINT IF EXISTS pending_ask_claims_act_shape;
--   ALTER TABLE pending_ask_claims DROP COLUMN IF EXISTS consumed_by_act;
--   -- and restore the previous pending_ask_claims_forward_only() body.
