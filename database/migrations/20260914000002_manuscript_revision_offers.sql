-- STEP 2 · THE MAIA REVISION OFFER — retirement-and-replacement, NOT a redesign.
--
-- ⭐⭐ THE THREE-OBJECT RULING, 2026-09-14:
--
--     MAIA OFFER  ──▶  COLLABORATIVE PROPOSAL  ──▶  AUTHORIZATION  ──▶  guarded
--     (this file)      proposal_chains /            manuscript_           mutation
--                      proposal_versions            revision_authorizations
--
-- ⛔ THIS IS THE RETIRED `20260910000004` ONTOLOGY UNDER ITS RATIFIED IDENTITY,
-- AND NOTHING ELSE. Every CHECK, trigger, index and comment is carried across
-- unchanged; only the table name differs. ⚠️ A retirement-and-replacement is not
-- an opportunity to redesign the offer casually — an obligation may only change
-- where the enforcement matrix explicitly disposes of it, and it disposes of
-- none of these.
--
-- ⛔ WHY IT IS NOT CALLED `manuscript_revision_proposals`: that name carried TWO
-- incompatible ontologies inside one executable migration set, which is the
-- defect this lane exists to repair. Awarding it to a winner would let a future
-- engineer recover the discarded ontology from the name.
--
-- ⛔ AND IT IS NOT CALLED A CANDIDATE: `revision_candidate` already denotes the
-- MEMBER'S unfinished candidate, from which an offer may itself be derived.
--
-- ⭐ `offer` earns the name from the lifecycle below: produced by an exact MAIA
-- turn · carries her proposed text · records what she read and why she offered
-- it · frozen after creation · THE MEMBER MAY DECLINE IT · and it confers no
-- authority whatsoever over the Work.
--
-- ⛔ WHAT THIS TABLE MUST NEVER ACQUIRE (matrix §4, asserted by witness):
--     accepted_at · resulting_version · execution_authority
--     supersedes · chain_id · any proposal-succession column
--     any manuscript-write capability
--
-- ⛔ AND O10: an offer never SILENTLY becomes a ProposalVersion. That transition
-- act is Step 3's to define; this migration deliberately adds no link column
-- that would pre-empt it.
--
-- Retirement record: docs/evidence/retired-migrations/RETIREMENT_RECORD_2026-09-14.md

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_revision_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- The exact MAIA turn that produced this proposal (RC-08). Nullable together:
  -- a proposal outlives the thread's deletion as a historical fact, but is never
  -- orphaned from its Work.
  --
  -- ⛔ `thread_id` deliberately carries NO independent FK to `ask_threads`. Two
  -- FK actions on the same column is a way for a row to satisfy one and violate
  -- the other. Integrity is transitive instead: the composite FK guarantees the
  -- TURN exists, and `ask_turns.thread_id` already guarantees the thread does.
  -- A proposal claiming conversational origin points at an actual turn, not
  -- merely at an existing thread.
  thread_id uuid,
  produced_in_turn_index integer CHECK (produced_in_turn_index >= 0),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- ── frozen at creation; see the immutability trigger ──────────────────────
  proposed_text text NOT NULL,
  reason text NOT NULL CHECK (length(reason) > 0),

  -- EvidenceRef: WHICH bounded original. Never the text of it.
  based_on jsonb NOT NULL,
  -- DevelopmentalReadState: revisionNumber, revisionDigest, per-section
  -- (range, digest). This is what makes staleness answerable without a copy.
  read_state jsonb NOT NULL,
  coverage jsonb NOT NULL,

  origin text NOT NULL CHECK (origin IN ('work', 'candidate')),
  -- The S3 disclosure that licensed the reading. NULL when origin='candidate':
  -- the writer handed that text over in the conversation, so no disclosure
  -- surface was raised and none may be implied.
  authority jsonb,
  producer text NOT NULL CHECK (length(producer) > 0),
  input_fingerprint text NOT NULL CHECK (length(input_fingerprint) > 0),

  -- RC-06b. The exact candidate revision MAIA saw. All three or none; the
  -- composite FK to revision_candidate_revisions lands with R2's substrate,
  -- so the pairing is enforced by the database and not by discipline.
  derived_from_candidate_id uuid,
  derived_from_candidate_revision int CHECK (derived_from_candidate_revision > 0),
  derived_from_candidate_digest text CHECK (length(derived_from_candidate_digest) > 0),

  -- ── the writer's disposition; NOT frozen ──────────────────────────────────
  declined_at timestamptz,

  CONSTRAINT manuscript_revision_offers_work_authority
    CHECK (origin <> 'work' OR authority IS NOT NULL),

  -- A partial candidate reference names no textual subject at all.
  CONSTRAINT manuscript_revision_offers_candidate_ref_complete
    CHECK (
      (derived_from_candidate_id IS NULL
        AND derived_from_candidate_revision IS NULL
        AND derived_from_candidate_digest IS NULL)
      OR
      (derived_from_candidate_id IS NOT NULL
        AND derived_from_candidate_revision IS NOT NULL
        AND derived_from_candidate_digest IS NOT NULL)
    ),

  -- origin is not a label that can disagree with the reference it describes.
  CONSTRAINT manuscript_revision_offers_candidate_origin_agrees
    CHECK ((origin = 'candidate') = (derived_from_candidate_id IS NOT NULL)),

  -- A thread without a turn names no act; a turn without a thread names nothing.
  CONSTRAINT manuscript_revision_offers_producer_turn_complete
    CHECK ((thread_id IS NULL) = (produced_in_turn_index IS NULL)),

  CONSTRAINT manuscript_revision_offers_producer_turn_fk
    FOREIGN KEY (thread_id, produced_in_turn_index)
    REFERENCES ask_turns(thread_id, turn_index) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_manuscript_revision_offers_section
  ON manuscript_revision_offers(section_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manuscript_revision_offers_thread
  ON manuscript_revision_offers(thread_id, produced_in_turn_index, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manuscript_revision_offers_draft
  ON manuscript_revision_offers(draft_id, created_at DESC);

-- The immutable half, enforced. Not a convention and not a comment: an UPDATE
-- that changes any frozen column aborts.
CREATE OR REPLACE FUNCTION manuscript_revision_offers_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposed_text      IS DISTINCT FROM OLD.proposed_text
     OR NEW.reason          IS DISTINCT FROM OLD.reason
     OR NEW.based_on        IS DISTINCT FROM OLD.based_on
     OR NEW.read_state      IS DISTINCT FROM OLD.read_state
     OR NEW.coverage        IS DISTINCT FROM OLD.coverage
     OR NEW.origin          IS DISTINCT FROM OLD.origin
     OR NEW.authority       IS DISTINCT FROM OLD.authority
     OR NEW.producer        IS DISTINCT FROM OLD.producer
     OR NEW.input_fingerprint IS DISTINCT FROM OLD.input_fingerprint
     OR NEW.derived_from_candidate_id       IS DISTINCT FROM OLD.derived_from_candidate_id
     OR NEW.derived_from_candidate_revision IS DISTINCT FROM OLD.derived_from_candidate_revision
     OR NEW.derived_from_candidate_digest   IS DISTINCT FROM OLD.derived_from_candidate_digest
     OR NEW.manuscript_id   IS DISTINCT FROM OLD.manuscript_id
     OR NEW.draft_id        IS DISTINCT FROM OLD.draft_id
     OR NEW.section_id      IS DISTINCT FROM OLD.section_id
     OR NEW.member_id       IS DISTINCT FROM OLD.member_id THEN
    RAISE EXCEPTION
      'revision proposal % is immutable in what was proposed and what it was proposed from: what the system proposed cannot be revised after the fact',
      OLD.id;
  END IF;

  /* RC-08 producer turn: MONOTONIC SEVERANCE, not immutability.
     Severing to NULL is how a member's thread deletion reaches this row, and a
     rule that refused it would make this table block the deletion. Acquiring or
     changing a producer turn is refused: a proposal cannot gain an origin it
     never had, nor be reassigned to a different act of MAIA. */
  IF (OLD.thread_id IS NOT NULL AND NEW.thread_id IS NOT NULL
       AND NEW.thread_id IS DISTINCT FROM OLD.thread_id)
     OR (OLD.produced_in_turn_index IS NOT NULL AND NEW.produced_in_turn_index IS NOT NULL
       AND NEW.produced_in_turn_index IS DISTINCT FROM OLD.produced_in_turn_index)
     OR (OLD.thread_id IS NULL AND NEW.thread_id IS NOT NULL)
     OR (OLD.produced_in_turn_index IS NULL AND NEW.produced_in_turn_index IS NOT NULL) THEN
    RAISE EXCEPTION
      'revision proposal % cannot be reassigned to a different producer turn; a producer turn may only be severed (RC-08)',
      OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* RC-08a. A proposal is born knowing which act of MAIA produced it. */
CREATE OR REPLACE FUNCTION manuscript_revision_offers_producer_required()
RETURNS TRIGGER AS $$
DECLARE
  turn_speaker text;
BEGIN
  IF NEW.thread_id IS NULL OR NEW.produced_in_turn_index IS NULL THEN
    RAISE EXCEPTION
      'a revision proposal may not be created without its producing MAIA turn (RC-08a); NULL means severed, never "not yet linked"';
  END IF;

  SELECT speaker INTO turn_speaker
    FROM ask_turns
   WHERE thread_id = NEW.thread_id AND turn_index = NEW.produced_in_turn_index;

  /* Absence is left to the composite foreign key, which reports it precisely.
     This trigger answers only the question the key cannot. */
  IF turn_speaker IS NOT NULL AND turn_speaker <> 'maia' THEN
    RAISE EXCEPTION
      'turn %/% was spoken by %, not maia: a proposal names the act of MAIA that produced it (RC-08)',
      NEW.thread_id, NEW.produced_in_turn_index, turn_speaker;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_revision_offers_producer_check
  ON manuscript_revision_offers;
CREATE TRIGGER manuscript_revision_offers_producer_check
  BEFORE INSERT ON manuscript_revision_offers
  FOR EACH ROW EXECUTE FUNCTION manuscript_revision_offers_producer_required();

DROP TRIGGER IF EXISTS manuscript_revision_offers_freeze_check
  ON manuscript_revision_offers;
CREATE TRIGGER manuscript_revision_offers_freeze_check
  BEFORE UPDATE ON manuscript_revision_offers
  FOR EACH ROW EXECUTE FUNCTION manuscript_revision_offers_freeze();

COMMENT ON TABLE manuscript_revision_offers IS
  'REVISION-COLLABORATION-01 R1. What MAIA proposed, held for the writer. Not manuscript text: the Work is byte-identical until the writer applies it, and R1 ships no application path.';
COMMENT ON COLUMN manuscript_revision_offers.proposed_text IS
  'MAIA''s replacement wording. IMMUTABLE by trigger (RC-01). MAIA''s output about the Work, never a copy of the Work.';
COMMENT ON COLUMN manuscript_revision_offers.based_on IS
  'EvidenceRef naming WHICH bounded original. The text itself is referenced, never copied - working_draft_revisions is its authoritative home (RC-06).';
COMMENT ON COLUMN manuscript_revision_offers.read_state IS
  'Frozen DevelopmentalReadState. Makes staleness answerable via locateCurrent without a second copy of the member''s writing.';
COMMENT ON COLUMN manuscript_revision_offers.origin IS
  'work = proposed against the Work under S3 disclosure. candidate = proposed against the writer''s own candidate (RC-04); R1 produces only work.';
COMMENT ON COLUMN manuscript_revision_offers.derived_from_candidate_id IS
  'RC-06b. With _revision and _digest, identifies the exact candidate revision MAIA saw. NULL for origin=work. Composite FK to revision_candidate_revisions lands with R2.';
COMMENT ON COLUMN manuscript_revision_offers.produced_in_turn_index IS
  'RC-08/RC-08a. With thread_id, the exact MAIA turn that produced this proposal, referencing ask_turns by its own primary key. Required at insert; may only be severed to NULL, never reassigned or re-acquired. NULL therefore means SEVERED, never "not yet linked".';
COMMENT ON COLUMN manuscript_revision_offers.declined_at IS
  'The writer said no. NOT frozen. Rejection is a recorded act, not an absence (RC-03).';

COMMIT;

-- ROLLBACK (manual):
--   The table is referenced by nothing, changes no Work, and holds no copy of
--   member prose. Dropping it discards proposals and touches no manuscript.
--
--   DROP TRIGGER IF EXISTS manuscript_revision_offers_producer_check ON manuscript_revision_offers;
--   DROP FUNCTION IF EXISTS manuscript_revision_offers_producer_required();
--   DROP TRIGGER IF EXISTS manuscript_revision_offers_freeze_check ON manuscript_revision_offers;
--   DROP FUNCTION IF EXISTS manuscript_revision_offers_freeze();
--   DROP TABLE IF EXISTS manuscript_revision_offers;
