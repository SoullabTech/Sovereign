-- S3 · M1 — the durable transition substrate for developmental body-disclosure.
--
-- Authority:
--   docs/programme/S3-B-IV_DESIGN_2026-09-13.md        (V2 TAKEN, founder 2026-09-13)
--   docs/programme/S3-CLASS-B_FREEZE_2026-09-13.md     (frozen law @ 2255b60d)
--   docs/programme/S3-DESIGN-01_SECTION_AUTHORITY_DESIGN_2026-09-10.md §10.6 · §10.6a · §15
--
--   ⭐⭐ Where two representations satisfy the same law, prefer the one whose
--      STRUCTURE REFUSES the known forbidden state rather than merely asking
--      programmers not to create it.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file to
-- `clean-main-no-secrets` is, by the 2026-09-07 finding, latent schema-deploy
-- authorization: the next unrelated full deploy will apply it. Do not merge
-- ahead of the W-A and W-B witnesses.
--
-- TWO TABLES, AND THE REASON IS CONSTITUTIONAL. The one-table variant satisfies
-- the same law, and leaves the prohibited durable shape ONE COLUMN AWAY:
--     { act_id, section_id, authorized = true }
-- Separating identity from consumption means permission cannot casually colonize
-- the identity object — the identity row refuses every UPDATE outright.
--
-- ⛔ SCOPE. Named for what it is: the developmental Ask's body-authorization act.
-- Generalizing a substrate before its first application is a founder act (as the
-- receipts table records of itself) and has NOT been taken here.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · THE AUTHORIZATION OPPORTUNITY — write-once. Coordinates and expiry.
--     ⛔ NO permission.
--
-- ⚠️ TERMINOLOGY, CORRECTED (founder, 2026-09-13). This row is minted at ACT 2,
-- when the Ask reaches BODY_AUTHORITY_REQUIRED — which is BEFORE the member has
-- done anything. So it is the identity of ONE SINGLE-USE AUTHORIZATION
-- OPPORTUNITY, ⛔ never evidence that a member gesture has occurred. The
-- consumption row below is the first durable fact that a human acted.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ask_authorization_acts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership, denormalised so authorisation never depends on a join surviving.
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- WHICH pending Ask this act serves. COORDINATES, never authority: the server
  -- re-derives the body requirement and the required section set from these, and
  -- ⛔ never from the client's account of them.
  thread_id uuid NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,
  reading_id uuid NOT NULL,
  observation_key text NOT NULL CHECK (length(observation_key) > 0),

  -- Opportunity to make the act. ⛔ NOT a lifecycle instruction. See §4.
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()

  -- ⛔ THE COLUMNS THIS TABLE MUST NEVER HAVE, named so a future reader knows
  -- the absence is deliberate rather than an oversight:
  --   authorized · may_cross · consent · section_id · section_ref · scope_kind
  -- Possessing an act permits nothing. A guard asserts this list stays absent.
);

CREATE INDEX IF NOT EXISTS idx_ask_authorization_acts_thread
  ON ask_authorization_acts (thread_id, created_at DESC);

-- WRITE-ONCE, ENFORCED BY THE DATABASE. Not "identifying fields are immutable" —
-- the whole row is. There is no lawful edit to an act: a different act is a
-- different row.
CREATE OR REPLACE FUNCTION ask_authorization_acts_write_once() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    '[S3] an authorization act is immutable — UPDATE refused (act %)', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_authorization_acts_no_update ON ask_authorization_acts;
CREATE TRIGGER ask_authorization_acts_no_update
  BEFORE UPDATE ON ask_authorization_acts
  FOR EACH ROW EXECUTE FUNCTION ask_authorization_acts_write_once();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · CONSUMPTION — created ONLY by the atomic claim. One per opportunity.
--     ⭐ THE POSITIVE DURABLE FACT THAT THE MEMBER'S ACT-3 GESTURE CLAIMED THAT
--       OPPORTUNITY. Before this row exists, no human has acted.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ask_authorization_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ⭐ THE ATOMICITY. UNIQUE is the claim: the INSERT either wins or conflicts.
  -- No preceding SELECT, no row lock, no reliance on READ COMMITTED behaving
  -- like one.
  act_id uuid NOT NULL UNIQUE REFERENCES ask_authorization_acts(id) ON DELETE CASCADE,

  claimed_at timestamptz NOT NULL DEFAULT now(),

  -- ⭐⭐ THE DURABLE POSITIVE FACT. Once set, the act is COMPLETED forever.
  completed_at timestamptz,

  -- The identity of the completed execution. ⛔ DELIBERATELY NOT A FOREIGN KEY.
  -- An FK with ON DELETE SET NULL would let deletion of the outcome erase the
  -- completion and resurrect the act; an FK with RESTRICT would defeat the
  -- author's sovereignty over their own record. So the pointer may DANGLE, and
  -- a dangling pointer means:
  --     COMPLETED · OUTCOME NO LONGER HELD
  -- ⛔ never "not completed", and ⛔ never "pending".
  completion_ref text,

  -- Correlation only. ⛔ NEVER identity: request-keyed identity defeats
  -- concurrency, replay, recovery and prose-mutated replay at once.
  claim_request_ref text,

  CONSTRAINT ask_authorization_consumptions_completion_pairs
    CHECK ((completed_at IS NULL) = (completion_ref IS NULL))
);

-- MONOTONIC. The only lawful UPDATE is NULL → completed, once.
CREATE OR REPLACE FUNCTION ask_authorization_consumptions_monotonic() RETURNS trigger AS $$
BEGIN
  IF NEW.act_id IS DISTINCT FROM OLD.act_id
     OR NEW.claimed_at IS DISTINCT FROM OLD.claimed_at
     OR NEW.claim_request_ref IS DISTINCT FROM OLD.claim_request_ref THEN
    RAISE EXCEPTION '[S3] a consumption is immutable at claim — UPDATE refused (act %)', OLD.act_id;
  END IF;

  -- Re-recording the SAME completion is a no-op, so a retry is not an error.
  IF OLD.completed_at IS NOT NULL THEN
    IF NEW.completion_ref IS DISTINCT FROM OLD.completion_ref THEN
      RAISE EXCEPTION
        '[S3] a completion identity may not be replaced — a second completion would be a second crossing (act %)',
        OLD.act_id;
    END IF;
    NEW.completed_at := OLD.completed_at;
    RETURN NEW;
  END IF;

  IF NEW.completed_at IS NULL THEN
    RAISE EXCEPTION '[S3] the only lawful consumption update is recording a completion (act %)', OLD.act_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_authorization_consumptions_monotonic_trigger ON ask_authorization_consumptions;
CREATE TRIGGER ask_authorization_consumptions_monotonic_trigger
  BEFORE UPDATE ON ask_authorization_consumptions
  FOR EACH ROW EXECUTE FUNCTION ask_authorization_consumptions_monotonic();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2b · DELETION CUSTODY — ENFORCED BY THE DATABASE, not by repository discipline.
--
-- ⭐ The distinction PostgreSQL can actually draw: in a BEFORE DELETE trigger on
-- a child, a lawful PARENT CASCADE has already removed the parent, while a
-- direct or pruning DELETE has not. So "refuse pruning" and "preserve lawful
-- Work/thread cascade" are not in tension — they are one predicate.
--
--   DELETE consumption · parent act still present  → direct/pruning → REFUSE
--                      · parent act already gone   → act cascade    → ALLOW
--   DELETE act · Work AND thread still present     → direct         → REFUSE
--              · Work OR thread already gone       → parent cascade → ALLOW
--
-- ⛔ AND BEFORE TRUNCATE ON BOTH, or `TRUNCATE ask_authorization_consumptions`
-- would bypass every row-level guard and resurrect every live opportunity at once.
--
-- ⚠️ A row trigger cannot defeat the database owner, and does not pretend to.
-- Privileged schema mutation stays governance territory.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ask_authorization_consumptions_governed_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM ask_authorization_acts WHERE id = OLD.act_id) THEN
    RAISE EXCEPTION
      '[S3] DELETE refused — a consumption may be removed only by the cascade of its own act; deleting it directly would resurrect the authorization (act %)',
      OLD.act_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_authorization_consumptions_governed_delete_trigger ON ask_authorization_consumptions;
CREATE TRIGGER ask_authorization_consumptions_governed_delete_trigger
  BEFORE DELETE ON ask_authorization_consumptions
  FOR EACH ROW EXECUTE FUNCTION ask_authorization_consumptions_governed_delete();

CREATE OR REPLACE FUNCTION ask_authorization_acts_governed_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM member_manuscripts WHERE id = OLD.manuscript_id)
     AND EXISTS (SELECT 1 FROM ask_threads WHERE id = OLD.thread_id) THEN
    RAISE EXCEPTION
      '[S3] DELETE refused — an authorization opportunity may be removed only by the cascade of its Work or its thread (act %)',
      OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_authorization_acts_governed_delete_trigger ON ask_authorization_acts;
CREATE TRIGGER ask_authorization_acts_governed_delete_trigger
  BEFORE DELETE ON ask_authorization_acts
  FOR EACH ROW EXECUTE FUNCTION ask_authorization_acts_governed_delete();

CREATE OR REPLACE FUNCTION ask_authorization_refuse_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    '[S3] TRUNCATE refused on % — it would bypass every row-level deletion guard and resurrect every live authorization at once',
    TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_authorization_acts_no_truncate ON ask_authorization_acts;
CREATE TRIGGER ask_authorization_acts_no_truncate
  BEFORE TRUNCATE ON ask_authorization_acts
  FOR EACH STATEMENT EXECUTE FUNCTION ask_authorization_refuse_truncate();

DROP TRIGGER IF EXISTS ask_authorization_consumptions_no_truncate ON ask_authorization_consumptions;
CREATE TRIGGER ask_authorization_consumptions_no_truncate
  BEFORE TRUNCATE ON ask_authorization_consumptions
  FOR EACH STATEMENT EXECUTE FUNCTION ask_authorization_refuse_truncate();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · DERIVED STATE. ⛔ There is no status column, and there must never be one.
--
--   act, no consumption            → PENDING      may compete for the claim
--   consumption, no completed_at   → INTERRUPTED  ⛔ no replay crossing
--   consumption + completed_at     → COMPLETED    recover the SAME completion
--
-- Interruption is READ OFF positive facts. A stored `interrupted` would assert a
-- confident negative the database cannot know — the law two other lanes
-- (email_delivery_attempts, context_disclosure_receipts) already reached.
--
-- 4 · EXPIRY IS A CLAIM PREDICATE, NEVER A DELETION INSTRUCTION.
--   ⛔⛔ NO PRUNING OR SWEEP MAY DELETE THESE ROWS. The failure it would cause:
--        completed → expires → row pruned → no consumption visible → AUTHORITY
--        RESURRECTED.
--   `expires_at` bounds only whether an UNCONSUMED act can still be claimed; it
--   is unreachable once a consumption exists. Any future retention policy is a
--   separately governed custody operation that must preserve non-resurrection.
--
--   ⭐ AMENDED 2026-09-13: this is now enforced by the §2b triggers, not by
--   repository discipline. The earlier reading — that a DELETE trigger strict
--   enough to stop pruning would also break lawful Work deletion — was WRONG:
--   a child's BEFORE DELETE trigger can see whether its parent still exists, and
--   that single predicate separates pruning from cascade exactly.
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE ask_authorization_acts IS
'S3 act identity. One row per member authorization gesture on a paused developmental Ask: opaque id, member/Work/Ask coordinates, and the expiry bounding the opportunity to make the act. Write-once, UPDATE refused by trigger. Carries NO permission, NO completion state and NO section authority — possessing an act permits nothing, and every fact the resume needs is re-derived server-side. Request identity may correlate execution but never substitutes for act identity.';

COMMENT ON TABLE ask_authorization_consumptions IS
'S3 consumption. Created only by the atomic claim (INSERT ... ON CONFLICT DO NOTHING on the UNIQUE act_id), so exactly one concurrent claimant wins and only the winner may cross. completed_at is the durable positive fact that the act completed; completion_ref identifies the completed execution and is deliberately NOT a foreign key, so deleting the outcome removes the held result without erasing the completion — a dangling reference means COMPLETED, OUTCOME NO LONGER HELD, never "not completed" and never "pending". State is derived, never stored: no consumption = pending, consumption without completed_at = interrupted, consumption with completed_at = completed. Expiry is a claim predicate only; no pruning may delete these rows, because a pruned consumption resurrects authority.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260913000001: ask_authorization_acts + ask_authorization_consumptions applied';
END $$;

-- ROLLBACK (manual):
--   DROP TABLE IF EXISTS ask_authorization_consumptions;
--   DROP TABLE IF EXISTS ask_authorization_acts;
