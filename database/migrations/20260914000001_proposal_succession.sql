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
--   DROP TRIGGER IF EXISTS proposal_chains_immutable ON proposal_chains;
--   DROP FUNCTION IF EXISTS refuse_proposal_version_mutation();
--   DROP FUNCTION IF EXISTS refuse_proposal_chain_mutation();
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

  -- ⭐ A REFERENCE TO A GOVERNING RULING, and nothing more. Present at chain
  -- creation when one is known. ⛔ IMMUTABLE thereafter, like every other
  -- column here.
  --
  -- ⚠️ CORRECTED AFTER REVIEW. An earlier draft claimed "no FK" WAS acceptance
  -- fact 10 and added a lifecycle rule — that a ruling may come to govern a
  -- chain later, and may be set or cleared. ⛔ That rule is in neither the
  -- contract nor the census, which say the chain does not evolve. The table had
  -- invented ontology, which is the one thing this lane was told not to do.
  --
  -- ⭐ THE ESSENTIAL FACT IS "NO CASCADE OR OWNERSHIP PATH", not "no FK". A
  -- RESTRICT / NO ACTION foreign key does not let a ruling's deletion mutate
  -- wording; it prevents the referenced row from disappearing. A bare uuid is
  -- chosen here only because the decision substrate has no single-row chain
  -- identity to reference — ⛔ not because foreign keys are dangerous.
  --
  -- If "this existing chain later came under ruling R17" is ever needed, that
  -- relationship must earn its own lifecycle semantics as an event or object.
  -- ⛔ It is not smuggled in here as a mutable nullable column.
  --
  -- ⛔⛔ THE STANDING INTERPRETATION, for whatever reads this next:
  --
  --   This column identifies the governing decision LINEAGE. It does not, by
  --   itself, prove which decision EVENT was current when the chain opened.
  --
  -- An editorial decision chain acquires successor events. So an adapter must
  -- NOT resolve this to the chain's latest event and present that as "the
  -- ruling that governed this proposal". If exact-event provenance is ever
  -- needed, that is a contract-level decision — ⛔ never something inferred
  -- from timestamps at the persistence boundary.
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

  -- ⛔ RESTRICT, not CASCADE. The chain is immutable and undeletable (trigger
  -- below), so no delete should ever reach here — but if that trigger is one
  -- day dropped, RESTRICT still refuses to take authored formulations with it.
  chain_id    uuid NOT NULL REFERENCES proposal_chains(id) ON DELETE RESTRICT,

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
  -- ⛔ TWO STATES, NOT THREE. The ontology says a rationale is ABSENT or
  -- AUTHORED; without this check persistence would also admit '', a third
  -- durable state the contract has no word for.
  rationale   text CHECK (rationale IS NULL OR length(btrim(rationale)) > 0),

  -- ⭐⭐ SUCCESSION IS CARRIED BY THE SUCCESSOR. NULL only for the root.
  -- ⛔ There is no `superseded_by` column and there must never be one: it is
  -- derived. ⛔ And no `is_head` / `current` flag: the head is FOUND — the
  -- version nobody supersedes — so there is no second fact to fall out of step
  -- with the first.
  supersedes  uuid,

  -- ⭐ THE CONTRACT'S `authoredAt`, carrying its name rather than being mapped
  -- to one. `DEFAULT now()` is correct because a version is persisted AT the
  -- authoring act: there is no draft-then-save step for a formulation, so
  -- persistence time and authorship time coincide by construction.
  -- ⛔ This is provenance, NEVER ordering authority — `supersedes` owns order,
  -- and the pure tests prove a chain whose timestamps disagree with its
  -- succession is still ordered by its succession.
  authored_at timestamptz NOT NULL DEFAULT now(),

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
  ON proposal_versions (chain_id, authored_at);

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
-- #9 · THE CHAIN IS IMMUTABLE ONCE CREATED — THE WHOLE ROW.
--
-- ⛔ FOUNDER REVIEW, 2026-09-14, MERGE BLOCKER. An earlier version of this
-- trigger froze only the five locus columns, which left two rewrites possible:
--
--   UPDATE proposal_chains SET member_id = <someone else>
--   UPDATE proposal_chains SET decision_chain_id = <another ruling, or NULL>
--
-- ⭐⭐ THE FIRST IS SEVERE. `proposal_versions.author = 'member'` does not name
-- an individual — the person is established by `proposal_chains.member_id`. So
-- Kelly could author v2 and the chain could afterwards be rewritten to belong
-- to someone else, and the durable record would read as though it always had.
-- That is the exact provenance property Step 1 exists to establish, defeated
-- one level above the versions the witness was busy proving.
--
-- ⚠️ And the witness did not catch it — it ASSERTED the second rewrite as a
-- feature. The instrument pinned the defect.
--
-- The census says it plainly: "The chain does not evolve. Only the versions
-- do." Following the append-only pattern of `editorial_decision_events`, the
-- whole row is refused.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION refuse_proposal_chain_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'proposal_chains is append-only: the chain does not evolve, only its versions do (attempted %)',
    TG_OP
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposal_chains_locus_immutable ON proposal_chains;
DROP TRIGGER IF EXISTS proposal_chains_immutable ON proposal_chains;
CREATE TRIGGER proposal_chains_immutable
  BEFORE UPDATE OR DELETE ON proposal_chains
  FOR EACH ROW EXECUTE FUNCTION refuse_proposal_chain_mutation();
