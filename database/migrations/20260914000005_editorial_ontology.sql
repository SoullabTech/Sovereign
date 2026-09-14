-- W5-3 — THE EDITORIAL ONTOLOGY.
--
-- ⭐⭐ THE BAR (founder, 2026-09-14):
--   The database must refuse every way the editorial subject can be
--   substituted, every way an authored non-wording act can become mutable, and
--   every way conversation can acquire executable wording by convenience.
--
-- Governed by docs/programme/WS-EDITORIAL-WORKSPACE-01_W5-2_SCHEMA_DESIGN_2026-09-14.md
-- and lib/manuscript/editorialWorkspace/ontology.ts.
--
-- ⛔ ONE ATOMIC ACT. Four parts, all or nothing: the discourse relationship is
-- meaningless without its FK target, and Insight and Direction are the two
-- halves of one ontology.
--
-- ⛔ NO STORE, NO ROUTE, NO RUNTIME accompanies this. After it, the schema knows
-- HOW a discourse may belong to a chain; nothing in the product CREATES that
-- relationship. That is correct: W4 is the act that creates and uses bound
-- discourse, and modifying openThread() here would answer W4 before it has a
-- contract.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A · PROPOSAL-CHAIN SUPPORTING IDENTITY — an FK TARGET, and nothing else.
--
-- ⛔ THIS CREATES NO NEW CHAIN IDENTITY AND NO NEW ADMITTED-ROW RESTRICTION.
-- `id` is the primary key and therefore already globally unique, so
-- (member_id, work_id, id) can never collide where `id` alone does not. It
-- exists ONLY so the referencing side can name all three columns in one
-- constraint — the same reasoning 20260914000003 recorded for its sibling.
--
-- ⛔ The chain's lifecycle and locus are untouched.
-- ══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'proposal_chains_member_work_id_key'
  ) THEN
    ALTER TABLE proposal_chains
      ADD CONSTRAINT proposal_chains_member_work_id_key
      UNIQUE (member_id, work_id, id);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════
-- B · DISCOURSE — the thread owns the chain relationship.
--
-- ⭐ RULED: a nullable typed parent column, NOT a binding table. The thread
-- already owns a freeze that makes the relationship immutable; deleting the
-- thread removes it naturally; there is no separately deletable row that could
-- leave a live conversation mysteriously unbound; and `anchor` stays exactly
-- what it is. Proposal-chain membership is an EDITORIAL-PARENT relationship,
-- not an anchor.
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE ask_threads
  ADD COLUMN IF NOT EXISTS proposal_chain_id uuid;
-- ⛔ No DEFAULT and NO BACKFILL. A historical thread's absent relationship IS
-- the evidence that it predates the editorial object.

-- ⭐⭐ ONE CONSTRAINT, THREE FACTS: same member · same Work · exact chain.
--
-- ⛔ A relation proving only `thread.member_id = chain.member_id` would admit
-- one member's thread about Work X bound to their own chain about Work Y —
-- the 01A.1 wrong-Work substitution, reopened in persistence underneath the
-- mount three cutover acts cleaned. No application-side reconciliation earns
-- any part of this claim.
--
-- ⭐⭐ `MATCH SIMPLE` IS WRITTEN EXPLICITLY AND IS LOAD-BEARING. `member_id`
-- and `manuscript_id` are NOT NULL; `proposal_chain_id` is nullable. Under
-- MATCH SIMPLE a composite FK is NOT CHECKED AT ALL when any column is NULL,
-- so an unbound thread is admitted without consulting proposal_chains — which
-- is exactly what an ordinary Ask thread requires.
-- ⛔ MATCH FULL would REJECT a partially-NULL key and make every existing
-- unbound thread unrepresentable. It is spelled out rather than inherited
-- because a reader who does not know this rule will assume the FK is enforced
-- on every row.
--
-- ⛔ ON DELETE RESTRICT. Never CASCADE — deleting a chain must not delete a
-- member's conversation. ⛔ And never SET NULL, which is the QUIET one: it
-- would silently unbind a live conversation and leave it looking like a thread
-- that was never about the chain. (Note for any future reader tempted by it:
-- a bare SET NULL on this three-column FK would also try to null `member_id`
-- and `manuscript_id` and collide with their NOT NULLs; the column-targeted
-- `SET NULL (proposal_chain_id)` form is the one that would actually work —
-- and is refused on meaning, not on mechanics.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ask_threads_proposal_chain_fkey'
  ) THEN
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_proposal_chain_fkey
      FOREIGN KEY (member_id, manuscript_id, proposal_chain_id)
      REFERENCES proposal_chains (member_id, work_id, id)
      MATCH SIMPLE
      ON UPDATE RESTRICT
      ON DELETE RESTRICT;
  END IF;
END $$;

-- ⛔ NO UNIQUE INDEX on proposal_chain_id: many threads may belong to one chain.
CREATE INDEX IF NOT EXISTS idx_ask_threads_proposal_chain
  ON ask_threads(proposal_chain_id) WHERE proposal_chain_id IS NOT NULL;

-- ⭐ The relationship joins the EXISTING freeze. A thread opens bound or
-- unbound and stays that way:
--
--     NULL → C   ⛔ refused      C1 → C2   ⛔ refused      C → NULL  ⛔ refused
--
-- ⛔ There is no later "attach this old conversation to the chain": that would
-- manufacture history, giving a conversation a subject it was not about when it
-- was spoken.
-- ⛔ AND NO SECOND TIMESTAMP. `opened_at` IS the binding time, because the
-- relationship can only be established at open — a `bound_at` column could
-- only ever agree with it or lie.
CREATE OR REPLACE FUNCTION ask_threads_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
     OR NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.anchor IS DISTINCT FROM OLD.anchor
     OR NEW.reading_identity IS DISTINCT FROM OLD.reading_identity
     OR NEW.canonical_at_open IS DISTINCT FROM OLD.canonical_at_open
     OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by
     OR NEW.proposal_chain_id IS DISTINCT FROM OLD.proposal_chain_id THEN
    RAISE EXCEPTION
      'ask thread % is immutable in ownership, anchor, reading reference, canonical baseline and editorial parent: a thread cannot be re-pointed at a reading or a proposal it was not about',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════
-- C+D · AUTHORED EDITORIAL RECORDS — two physically distinct subjects.
--
-- ⛔ NO `editorial_events(kind, body, …)` AND NO ONE-TABLE POLYMORPHISM. A
-- shared table would put the distinctions this programme just earned back
-- behind CHECK constraints and optional columns — the collapse, re-encoded as
-- convenience.
-- ══════════════════════════════════════════════════════════════════════════

-- ⭐ INSIGHT — what MAIA sees, and why it matters.
CREATE TABLE IF NOT EXISTS proposal_chain_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  proposal_chain_id uuid NOT NULL,

  -- ⭐ AUTHORSHIP IS PERSISTED EXPLICITLY, WITH NO DEFAULT. ⛔ The database must
  -- not assign MAIA's name merely because an insert reached this table: a
  -- default would let a row be authored by nobody and still carry her name.
  author text NOT NULL CHECK (author = 'maia'),

  observation text NOT NULL CHECK (length(btrim(observation)) > 0),
  authored_at timestamptz NOT NULL DEFAULT now(),

  -- ⭐ Ownership proven in the same constraint, never by a second check.
  CONSTRAINT proposal_chain_insights_chain_fkey
    FOREIGN KEY (member_id, proposal_chain_id)
    REFERENCES proposal_chains (member_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
);
-- ⛔⛔ NO VERSION FOREIGN KEY, AND THE ABSENCE IS THE FEATURE. An Insight on a
-- chain with ZERO versions is lawful — which is precisely how
--
--     "I noticed this, and I would leave it."
--
-- exists without manufacturing a Suggestion. A system whose only expressive act
-- is replacement will always find something to replace.
-- ⛔ AND NO replacement_text / operation / expected_text / range /
-- authorization id / execution field: any one of them would make an Insight a
-- Suggestion wearing another name.
CREATE INDEX IF NOT EXISTS idx_proposal_chain_insights_chain
  ON proposal_chain_insights(proposal_chain_id, authored_at);

-- ⭐ DIRECTION — an instruction, and never a ruling.
CREATE TABLE IF NOT EXISTS proposal_chain_directions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  proposal_chain_id uuid NOT NULL,

  -- ⭐ Either party may steer. ⛔ Still no default.
  author text NOT NULL CHECK (author IN ('maia', 'member')),

  instruction text NOT NULL CHECK (length(btrim(instruction)) > 0),

  -- ⭐ A CONVERSATIONAL REFERENCE, AND NEVER A SUCCESSION. Referring to v1 does
  -- not make the next candidate succeed v1: a candidate carries whichever
  -- predecessor its AUTHOR ACTED AGAINST, and the store decides whether that is
  -- still lawful. ⛔ There is no `supersedes` column here and there must never
  -- be one.
  refers_to_version_id uuid,

  authored_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT proposal_chain_directions_chain_fkey
    FOREIGN KEY (member_id, proposal_chain_id)
    REFERENCES proposal_chains (member_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,

  -- ⭐⭐ THE REFERENCE CANNOT LEAVE THE SUBJECT. The database proves the
  -- referenced version belongs to THIS chain, so
  --     Direction on C → C/v1   lawful
  --     Direction on C → D/v7   ⛔ UNREPRESENTABLE
  -- ⭐ `proposal_versions` already carries UNIQUE (chain_id, id), so this target
  -- exists today and nothing was added for it.
  -- ⭐ MATCH SIMPLE again: a Direction with no reference is lawful.
  CONSTRAINT proposal_chain_directions_version_fkey
    FOREIGN KEY (proposal_chain_id, refers_to_version_id)
    REFERENCES proposal_versions (chain_id, id)
    MATCH SIMPLE
    ON UPDATE RESTRICT ON DELETE RESTRICT
);
-- ⛔ NO answered_at / spent / status / resolved_at / satisfied_by. W4 has not
-- earned an answer relationship, and a historical act must not be mutated
-- merely because something later responded to it.
CREATE INDEX IF NOT EXISTS idx_proposal_chain_directions_chain
  ON proposal_chain_directions(proposal_chain_id, authored_at);

-- ══════════════════════════════════════════════════════════════════════════
-- ⭐⭐ AUTHORED RECORDS ARE APPEND-ONLY.
--
--   Insight · Direction · ProposalVersion   authored   → append-only
--   Discourse (a conversation)              withdrawable, already ruled
--
-- ⭐ The asymmetry IS the ruling, not an oversight: a conversation is the
-- member's to withdraw; an authored formulation, observation or instruction is
-- a record of an act. Corrections are new records.
--
-- ⛔ CONSTITUTIONAL ERASURE, if it ever applies, is a SEPARATE AUTHORITY with
-- an explicit deletion order. It must never be smuggled in as ON DELETE
-- CASCADE — a cascade is ordinary lifecycle wearing the costume of a sovereign
-- act.
--
-- ⭐ ONE SHARED FUNCTION is lawful here because it does nothing but refuse:
-- sharing a lifecycle MECHANISM does not collapse two ontologies, in the way a
-- shared TABLE would.
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION authored_editorial_record_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'authored editorial record %.% is immutable: a correction is a new record, never a revision of one already authored',
    TG_TABLE_NAME, OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposal_chain_insights_no_update ON proposal_chain_insights;
CREATE TRIGGER proposal_chain_insights_no_update
  BEFORE UPDATE ON proposal_chain_insights
  FOR EACH ROW EXECUTE FUNCTION authored_editorial_record_immutable();

DROP TRIGGER IF EXISTS proposal_chain_insights_no_delete ON proposal_chain_insights;
CREATE TRIGGER proposal_chain_insights_no_delete
  BEFORE DELETE ON proposal_chain_insights
  FOR EACH ROW EXECUTE FUNCTION authored_editorial_record_immutable();

DROP TRIGGER IF EXISTS proposal_chain_directions_no_update ON proposal_chain_directions;
CREATE TRIGGER proposal_chain_directions_no_update
  BEFORE UPDATE ON proposal_chain_directions
  FOR EACH ROW EXECUTE FUNCTION authored_editorial_record_immutable();

DROP TRIGGER IF EXISTS proposal_chain_directions_no_delete ON proposal_chain_directions;
CREATE TRIGGER proposal_chain_directions_no_delete
  BEFORE DELETE ON proposal_chain_directions
  FOR EACH ROW EXECUTE FUNCTION authored_editorial_record_immutable();

COMMENT ON TABLE proposal_chain_insights IS
  'W5-3. MAIA-authored editorial observation on a proposal chain. May exist with zero ProposalVersions, which is how "I would keep this" is representable without manufacturing a Suggestion. Carries no candidate wording. Append-only.';
COMMENT ON TABLE proposal_chain_directions IS
  'W5-3. An authored instruction steering this editorial exchange. Not a ruling and not an EditorialDecision. refers_to_version_id is a conversational reference proven to be in the same chain, and is never succession. Append-only.';
COMMENT ON COLUMN ask_threads.proposal_chain_id IS
  'W5-3. Editorial-parent relationship, not an anchor. Frozen at open. The composite FK proves same member, same Work and exact chain together; MATCH SIMPLE leaves an unbound thread unchecked.';

COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- MANUAL ROLLBACK — ⛔ NOT merely "drop the new tables and column".
--
-- ⚠️ THIS MIGRATION REDEFINES AN EXISTING FUNCTION, so a rollback that forgot
-- `ask_threads_freeze()` would leave a freeze referring to a column that no
-- longer exists and break every UPDATE on ask_threads. A migration reversible
-- only on paper is not reversible.
--
-- BEGIN;
--   DROP TRIGGER IF EXISTS proposal_chain_directions_no_delete ON proposal_chain_directions;
--   DROP TRIGGER IF EXISTS proposal_chain_directions_no_update ON proposal_chain_directions;
--   DROP TRIGGER IF EXISTS proposal_chain_insights_no_delete ON proposal_chain_insights;
--   DROP TRIGGER IF EXISTS proposal_chain_insights_no_update ON proposal_chain_insights;
--   DROP TABLE IF EXISTS proposal_chain_directions;
--   DROP TABLE IF EXISTS proposal_chain_insights;
--   DROP FUNCTION IF EXISTS authored_editorial_record_immutable();
--   ALTER TABLE ask_threads DROP CONSTRAINT IF EXISTS ask_threads_proposal_chain_fkey;
--   DROP INDEX IF EXISTS idx_ask_threads_proposal_chain;
--   ALTER TABLE ask_threads DROP COLUMN IF EXISTS proposal_chain_id;
--   ALTER TABLE proposal_chains DROP CONSTRAINT IF EXISTS proposal_chains_member_work_id_key;
--   -- ⭐ AND RESTORE THE PRE-W5 FREEZE, without the editorial parent:
--   CREATE OR REPLACE FUNCTION ask_threads_freeze()
--   RETURNS TRIGGER AS $fn$
--   BEGIN
--     IF NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
--        OR NEW.member_id IS DISTINCT FROM OLD.member_id
--        OR NEW.anchor IS DISTINCT FROM OLD.anchor
--        OR NEW.reading_identity IS DISTINCT FROM OLD.reading_identity
--        OR NEW.canonical_at_open IS DISTINCT FROM OLD.canonical_at_open
--        OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by THEN
--       RAISE EXCEPTION
--         'ask thread % is immutable in ownership, anchor, reading reference and canonical baseline: a thread cannot be re-pointed at a reading it was not about',
--         OLD.id;
--     END IF;
--     RETURN NEW;
--   END;
--   $fn$ LANGUAGE plpgsql;
-- COMMIT;
