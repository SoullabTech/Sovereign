-- STEP 2 · THE MEMBER AUTHORIZATION — one member act, one exact version, once.
--
-- ⭐⭐ THE SCHEMA MAY ENFORCE THE AUTHORIZATION WE DESIGNED; IT MAY NOT INVENT A
-- NEW ONE. Derived from `lib/manuscript/revisionAuthorization/contract.ts` and
-- from nothing else. Dispositions: the Step 2 enforcement matrix.
--
-- ⛔ WHAT IS ABSENT, AND MUST STAY ABSENT (matrix §4, asserted by witness):
--
--     replacement_text        the authored wording lives on proposal_versions
--     rationale               likewise
--     execution_authority     ⛔ see below
--     inspection_only         ⛔ see below
--     head / current / latest an authorization names ONE EXACT VERSION
--     producer-turn provenance that is the OFFER's, not this object's
--     decision_chain_id       ⛔ a governing ruling is NOT the proposal link,
--                             and is not needed to prove authorization identity
--
-- ── ⛔ WHY THERE IS NO `execution_authority` ──────────────────────────────
--
-- EW-F1a was necessary for the architecture that existed and caught a real
-- failure: twice on 2026-09-13 a proposal staged for inspection was accepted
-- and the manuscript moved. ⛔ Nothing here diminishes that.
--
-- ⭐ The flag existed because ONE ROW did TWO JOBS. With the objects separated
-- the invalid state has nowhere to live:
--
--     OLD   a row exists, carrying a flag that says do not execute it
--     NEW   there is no executable object yet
--
-- BEFORE THE MEMBER AUTHORIZES AN EXACT VERSION, THERE IS NO ROW HERE. The
-- existence of the row IS the permission — stronger than a default, because a
-- default can be overridden and a nonexistent row cannot.
--
-- ROLLBACK:
--   DROP TRIGGER IF EXISTS mra_identity_immutable ON manuscript_revision_authorizations;
--   DROP FUNCTION IF EXISTS refuse_mra_identity_mutation();
--   DROP TABLE IF EXISTS manuscript_revision_authorizations;

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_revision_authorizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- RESTRICT, following the chain and the standing lane: a member is not
  -- deleted out from under their own authored record.
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- ⭐⭐ EXACTLY WHICH AUTHORED FORMULATION. ⛔ Never "the head".
  proposal_chain_id    uuid NOT NULL,
  proposal_version_id  uuid NOT NULL,

  -- ── THE EXECUTION BINDING ────────────────────────────────────────────────
  -- ⭐ What the AUTHORIZING ACT read from the Work. ⛔ NOT the chain's locus.
  -- The chain's locus is historical/conversational address — "what place was
  -- this proposal about?". This is execution-effective authority — "what exact
  -- Work state may this member act change?". They may hold identical values
  -- when the Work has not moved, and that is exactly the danger: equal values
  -- are not one fact.
  work_id             uuid NOT NULL,
  draft_id            uuid NOT NULL,
  base_version        integer NOT NULL CHECK (base_version >= 0),
  target_section_id   uuid NOT NULL,

  -- ⭐⭐ THE LAW. Execution re-reads the Work and requires these characters, at
  -- this target, EXACTLY ONCE.
  -- ⛔ NOT REDUNDANT WITH base_version: every write path today advances the
  -- version, so "the text is unchanged" would rest on every present and future
  -- path remembering to. Expected text is the law; the version is defence in
  -- depth; either may refuse and neither may be the only thing that does.
  expected_text       text NOT NULL CHECK (length(expected_text) > 0),

  -- ⭐ THE VOCABULARY, CLOSED — the EW-F1a closure transposed to its new
  -- subject. ⚠️ It was `delete_exact_text` and the fixtures made that false:
  -- a proposal replacing ", fixated" with ", steady" is not a deletion.
  -- A deletion is the ordinary special case, `replacementText = ''`.
  -- ⛔ Insert, move, merge, split, reorder and rename remain UNOPENED.
  operation           text NOT NULL DEFAULT 'replace_exact_text'
                      CHECK (operation = 'replace_exact_text'),

  authorized_at       timestamptz NOT NULL DEFAULT now(),

  -- ⭐⭐ THE EXECUTION RECEIPT — whole or absent, never half.
  -- ⛔ A CHECK is NOT DEFERRED, so an implementation that set accepted_at first
  -- and resulting_version later would fail at its very first statement. The
  -- constraint is what forces the correct order. A row marked accepted whose
  -- write failed would tell the member their change was made when the Work
  -- never moved.
  accepted_at         timestamptz,
  resulting_version   integer,

  CONSTRAINT mra_receipt_whole
    CHECK ((accepted_at IS NULL) = (resulting_version IS NULL)),

  -- ⭐⭐ §5.2 · THE MEMBER OWNS THE CHAIN — proven by the DATABASE.
  -- ⛔ Without this a caller could assemble `Kelly + Robert's chain + Kelly's
  -- authorization` and rely on application code to notice.
  -- ⚠️ AND IT IS NOT IMPLIED BY THE VERSION FK BELOW: that proves a version
  -- belongs to a chain, never that THIS member owns it. Two claims, two
  -- constraints.
  CONSTRAINT mra_member_owns_chain
    FOREIGN KEY (member_id, proposal_chain_id)
    REFERENCES proposal_chains (member_id, id)
    ON DELETE RESTRICT,

  -- ⭐⭐ §5.1 · THE VERSION BELONGS TO THE CHAIN — unrepresentable otherwise,
  -- not merely refused. Uses Step 1's `UNIQUE (chain_id, id)`.
  -- ⛔ ON DELETE RESTRICT, and the action is load-bearing. An authorization is
  -- HISTORICAL EVIDENCE that the member authorized that exact formulation, so
  --     CASCADE   deleting a version would make the authorization vanish
  --     SET NULL  it would forget what was authorized
  -- are both untruthful. RESTRICT says this relationship cannot disappear
  -- through ordinary lifecycle mechanics. If constitutional erasure ever needs
  -- to remove these records, that is a separate authority with an explicit
  -- deletion order — ⛔ never a cascade masquerading as object lifecycle.
  CONSTRAINT mra_version_belongs_to_chain
    FOREIGN KEY (proposal_chain_id, proposal_version_id)
    REFERENCES proposal_versions (chain_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_mra_member_work
  ON manuscript_revision_authorizations (member_id, work_id, authorized_at DESC);
CREATE INDEX IF NOT EXISTS idx_mra_unspent
  ON manuscript_revision_authorizations (member_id, id) WHERE accepted_at IS NULL;

-- ══════════════════════════════════════════════════════════════════════════
-- ⭐⭐ ONE LEGITIMATE LIFECYCLE TRANSITION, AND ONLY ONE.
--
-- ⛔ THIS IS NOT A BLANKET APPEND-ONLY TRIGGER, and the difference matters.
-- `proposal_versions` is append-only because an authored formulation is
-- finished. An authorization has exactly one lawful transition:
--
--     UNSPENT   accepted_at NULL      resulting_version NULL
--                         │  once
--                         ▼
--     SPENT     accepted_at NOT NULL  resulting_version NOT NULL
--
-- Everything else refuses:
--   ⛔ identity        id · member_id · proposal_chain_id · proposal_version_id
--   ⛔ binding         work · draft · base_version · target · expected_text ·
--                     operation
--   ⛔ authorized_at
--   ⛔ a SECOND execution, or any edit of a spent receipt
--   ⛔ DELETE
--
-- ⭐ THIS IS EW-F1a's "cannot be promoted in place", WIDENED. The old trigger
-- froze one column because there was one column to promote. There is now
-- nothing to promote — so every identity and binding column is frozen, and the
-- receipt is the only thing that may move.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION refuse_mra_identity_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION
      'an authorization is a durable record of a member act and is not deleted'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.id                  IS DISTINCT FROM OLD.id
     OR NEW.member_id           IS DISTINCT FROM OLD.member_id
     OR NEW.proposal_chain_id   IS DISTINCT FROM OLD.proposal_chain_id
     OR NEW.proposal_version_id IS DISTINCT FROM OLD.proposal_version_id
     OR NEW.work_id             IS DISTINCT FROM OLD.work_id
     OR NEW.draft_id            IS DISTINCT FROM OLD.draft_id
     OR NEW.base_version        IS DISTINCT FROM OLD.base_version
     OR NEW.target_section_id   IS DISTINCT FROM OLD.target_section_id
     OR NEW.expected_text       IS DISTINCT FROM OLD.expected_text
     OR NEW.operation           IS DISTINCT FROM OLD.operation
     OR NEW.authorized_at       IS DISTINCT FROM OLD.authorized_at
  THEN
    RAISE EXCEPTION
      'the identity and execution binding of an authorization are immutable: what the member authorized cannot be relabelled afterwards'
      USING ERRCODE = 'check_violation';
  END IF;

  -- ⭐ The one lawful transition: unspent → spent.
  IF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- ⛔ A spent receipt is finished. A second execution, or an edit of the
  -- first, would let one permission authorize more than one change.
  RAISE EXCEPTION
    'an authorization permits one change, once: its receipt may only move from unspent to spent (attempted accepted_at % -> %)',
    OLD.accepted_at, NEW.accepted_at
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mra_identity_immutable ON manuscript_revision_authorizations;
CREATE TRIGGER mra_identity_immutable
  BEFORE UPDATE OR DELETE ON manuscript_revision_authorizations
  FOR EACH ROW EXECUTE FUNCTION refuse_mra_identity_mutation();

COMMIT;
