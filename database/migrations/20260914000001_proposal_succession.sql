-- STEP 1 · AUTHORED PROPOSAL SUCCESSION — persistence for an already-ratified
-- ontology.
--
-- ⛔ THE TABLE IS DERIVED FROM THE CONTRACT, NEVER THE REVERSE.
-- `lib/manuscript/proposalChain/contract.ts` is the ontology. Nothing here
-- extends it, and nothing here may be read as authorizing anything it does not
-- already say. Enforcement decisions: STEP1_SCHEMA_ENFORCEMENT_MATRIX_2026-09-14.
--
-- ⛔ WHAT THIS LANE IS NOT. It does not connect succession to generation,
-- conversation, authorization or execution. Nothing here makes a proposal
-- capable of changing manuscript state: there is no write path, no accept
-- column, no execution authority, and no reference from any manuscript table
-- into these.
--
-- ⛔ AND IT IS NOT AN EXTENSION OF `manuscript_structure_proposals`. That object
-- is a mutable `reviewed` blob plus a `review_revision` counter with no history
-- table. Reusing it would preserve the APPEARANCE of history while destroying
-- the intermediate authorship that is the entire point.
--
-- ROLLBACK:
--   DROP TRIGGER IF EXISTS proposal_versions_immutable ON proposal_versions;
--   DROP TRIGGER IF EXISTS proposal_chains_locus_immutable ON proposal_chains;
--   DROP FUNCTION IF EXISTS refuse_proposal_version_mutation();
--   DROP FUNCTION IF EXISTS refuse_proposal_chain_locus_mutation();
--   DROP TABLE IF EXISTS proposal_versions;
--   DROP TABLE IF EXISTS proposal_chains;

-- ══════════════════════════════════════════════════════════════════════════
-- THE CHAIN · one locus, fixed at open.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proposal_chains (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- RESTRICT, following ask_threads and the standing chain: a member is not
  -- deleted out from under their own authored record.
  member_id    uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- ── THE LOCUS ──────────────────────────────────────────────────────────
  -- ⭐ Facts about the WORK, immutable for the life of the chain (trigger
  -- below). A chain whose locus would need to change is not that chain any
  -- more: it is a new proposal against a new state of the Work.
  --
  -- ⚠️ NO FOREIGN KEYS HERE, and that follows `manuscript_revision_proposals`
  -- exactly, which carries work_id / draft_id / target_section_id as bare
  -- uuids. Draft sections are created and destroyed by structure operations,
  -- so an FK would make authored history hostage to a topology change and
  -- would delete a writer's formulations when a section is split.
  work_id            uuid NOT NULL,
  draft_id           uuid NOT NULL,
  base_version       integer NOT NULL CHECK (base_version >= 0),
  target_section_id  uuid NOT NULL,

  -- ⭐ THE LAW ACCEPTANCE USES — the exact characters this chain may replace.
  -- Immutable. ⛔ It lives HERE and never on a version, so changing what should
  -- replace the text cannot change what text may be replaced.
  expected_text      text NOT NULL CHECK (length(expected_text) > 0),

  -- ⭐ A REFERENCE TO A GOVERNING RULING, and nothing more.
  --
  -- ⛔ DELIBERATELY NOT A FOREIGN KEY, and this is the #10 acceptance fact.
  -- One ruling may govern several chains; it is not executable authority and
  -- it is not wording. An FK would create a lifecycle path between a ruling and
  -- authored formulations — exactly the coupling that would let altering or
  -- deleting a ruling reach into wording history. There is no path from here
  -- into `proposal_versions` at all.
  decision_chain_id  uuid,

  opened_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_chains_member_idx
  ON proposal_chains (member_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS proposal_chains_target_idx
  ON proposal_chains (draft_id, target_section_id);

-- ══════════════════════════════════════════════════════════════════════════
-- THE VERSIONS · one authored formulation each.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proposal_versions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id    uuid NOT NULL REFERENCES proposal_chains(id) ON DELETE CASCADE,

  -- ⭐ WHO WROTE THIS FORMULATION — explicit, never inferred from position.
  -- ⛔ No 'system', no 'unknown'. A version nobody authored is not a version,
  -- and a fixture staged mechanically must say so somewhere real rather than
  -- borrowing MAIA's name.
  author      text NOT NULL CHECK (author IN ('maia', 'member')),

  -- What this author proposes should stand in place of the chain's
  -- expected_text. ⛔ May be empty: a deletion is a formulation.
  formulation text NOT NULL,

  -- ⭐ Why, in THIS author's own words. NULL when there is none.
  -- ⛔ NEVER a home for the writer's DIRECTION between versions — that would
  -- attribute the member's instruction to MAIA's reasoning. DIRECTION-HOME
  -- remains OPEN; see the contract.
  rationale   text,

  -- ⭐⭐ SUCCESSION IS CARRIED BY THE SUCCESSOR. NULL only for the root.
  -- ⛔ There is no `superseded_by` column and there must never be one: it is
  -- derived. ⛔ And no `is_head` / `current` flag: the head is FOUND — the
  -- version nobody supersedes — so there is no second fact to fall out of step
  -- with the first.
  supersedes  uuid,

  created_at  timestamptz NOT NULL DEFAULT now(),

  -- #3 · A PREDECESSOR FROM ANOTHER CHAIN IS UNREPRESENTABLE, not merely
  -- refused: the composite FK below requires the predecessor to share this
  -- row's chain_id.
  --
  -- ⭐⭐ #6 · AND THIS IS WHY NO CYCLE TRIGGER IS NEEDED. The FK is NOT
  -- DEFERRABLE, so a row may not name a predecessor that does not yet exist.
  -- For v3→v4 and v4→v3, inserting either requires the other to exist first;
  -- neither can go first, for a cycle of any length.
  -- ⚠️ A `DEFERRABLE INITIALLY DEFERRED` FK would silently reopen this. Do not
  -- "improve" it.
  CONSTRAINT proposal_versions_chain_id_id_key UNIQUE (chain_id, id),
  CONSTRAINT proposal_versions_predecessor_same_chain
    FOREIGN KEY (chain_id, supersedes)
    REFERENCES proposal_versions (chain_id, id)
    ON DELETE RESTRICT,

  -- #4 · no self-predecessor.
  CONSTRAINT proposal_versions_no_self_predecessor
    CHECK (supersedes IS NULL OR supersedes <> id)
);

-- #5 · NO BRANCH. One successor per predecessor, so "the version the writer
-- chose" can never be ambiguous.
CREATE UNIQUE INDEX IF NOT EXISTS proposal_versions_one_successor
  ON proposal_versions (chain_id, supersedes)
  WHERE supersedes IS NOT NULL;

-- #5b · EXACTLY ONE ROOT per chain. A partial unique index rather than
-- `UNIQUE NULLS NOT DISTINCT`, which is PG15+; this form works everywhere.
CREATE UNIQUE INDEX IF NOT EXISTS proposal_versions_one_root
  ON proposal_versions (chain_id)
  WHERE supersedes IS NULL;

CREATE INDEX IF NOT EXISTS proposal_versions_chain_idx
  ON proposal_versions (chain_id, created_at);

-- ══════════════════════════════════════════════════════════════════════════
-- #7 · AN AUTHORED VERSION IS FINISHED.
--
-- ⭐ The whole substrate exists so that "a later MAIA revision does not make
-- the earlier MAIA formulation disappear, nor make Kelly appear to have
-- authored it". An UPDATE is how that would happen quietly.
-- ⛔ DELETE is refused too: removing a predecessor is how history acquires a
-- hole that later reads as never having existed.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION refuse_proposal_version_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'proposal_versions is append-only: an authored formulation is finished (attempted %)',
    TG_OP
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposal_versions_immutable ON proposal_versions;
CREATE TRIGGER proposal_versions_immutable
  BEFORE UPDATE OR DELETE ON proposal_versions
  FOR EACH ROW EXECUTE FUNCTION refuse_proposal_version_mutation();

-- ══════════════════════════════════════════════════════════════════════════
-- #9 · A CHAIN CANNOT SILENTLY ACQUIRE A SECOND LOCUS.
--
-- ⛔ Only the locus is frozen. `decision_chain_id` may still be set or cleared
-- — a ruling can come to govern a chain that began without one — because that
-- is a RELATIONSHIP, not the identity of the place.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION refuse_proposal_chain_locus_mutation()
RETURNS trigger AS $$
BEGIN
  IF (NEW.work_id, NEW.draft_id, NEW.base_version, NEW.target_section_id, NEW.expected_text)
     IS DISTINCT FROM
     (OLD.work_id, OLD.draft_id, OLD.base_version, OLD.target_section_id, OLD.expected_text)
  THEN
    RAISE EXCEPTION
      'proposal_chains.locus is immutable: a chain whose locus changed is a new proposal against a new state of the Work'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposal_chains_locus_immutable ON proposal_chains;
CREATE TRIGGER proposal_chains_locus_immutable
  BEFORE UPDATE ON proposal_chains
  FOR EACH ROW EXECUTE FUNCTION refuse_proposal_chain_locus_mutation();
