-- REVISION-COLLABORATION-01 · R1 — prose revision proposals.
--
-- CONSTITUTIONAL POSITION (RC-01 .. RC-07):
--
--   - A PROPOSAL IS NOT MANUSCRIPT TEXT. Nothing here is read by the draft, the
--     renderer, or anything that describes the Work. Until the writer applies
--     it, a manuscript with a proposal is BYTE-IDENTICAL to one without.
--     R1 ships no application path at all: nothing in this migration can
--     change a Work.
--
--   - THE FROZEN HALF IS IMMUTABLE, AND THE DATABASE ENFORCES IT (RC-01).
--     `proposed_text`, `reason`, `based_on`, `read_state`, `coverage`,
--     `origin`, `authority`, `producer` and `input_fingerprint` are the record
--     of what MAIA proposed and what she proposed it from. The first time a
--     writer says "that is not what MAIA suggested", the answer has to be a row
--     rather than a recollection.
--
--   - RC-06 — ONE AUTHORITATIVE TEXTUAL HOME AT A TIME. The test is not "is
--     this member prose?" but "does persisting this create a second
--     authoritative copy of writing that already has a home?"
--       proposed_text     MAIA's output. Not the Work, never was. STORED.
--       the bounded original  the member's writing, and `working_draft_revisions`
--                         is its authoritative home. REFERENCED via `based_on`
--                         + `read_state` digests, NEVER copied. A copy here
--                         could drift from the revision store, and then two
--                         answers would exist to "what did the member write"
--                         with nothing to adjudicate between them.
--
--   - DISPOSITION IS NOT FROZEN (RC-03). `declined_at` records that the writer
--     said no. Rejection is a recorded ACT, not an absence -- otherwise "she
--     never proposed that" and "I said no" are indistinguishable in the record.
--     R1 writes no disposition; the column exists so R2 adds behaviour, not
--     schema, and no early row is less answerable than a later one.
--
--   - `origin` ANTICIPATES RC-04 WITHOUT IMPLEMENTING IT. A proposal made
--     against the writer's own candidate is `candidate`; one made against the
--     Work is `work`. R1 produces only `work`.
--
--   - RC-06b — THE CANDIDATE REFERENCE IS A TRIPLE, IN COLUMNS, NOT IN JSONB.
--     `(derived_from_candidate_id, _revision, _digest)` identifies the actual
--     textual subject: a writer may edit their candidate while discussing it,
--     and "what wording was MAIA responding to?" must have a truthful answer.
--     A digest alone proves the candidate CHANGED but cannot recover what she
--     saw; the candidate's append-only revision history can.
--     ⛔ THE COMPOSITE FOREIGN KEY IS DELIBERATELY DEFERRED, NOT OMITTED. Its
--     target -- `revision_candidate_revisions (candidate_id, revision_number,
--     digest)` -- does not exist until R2 authors the candidate substrate. The
--     COLUMNS land now so R2 adds a constraint rather than schema, and no early
--     row is less answerable than a later one. The all-or-nothing and
--     origin-agreement CHECKs below hold the shape in the meantime; R1 writes
--     only NULLs into all three, so no row can be admitted that the future FK
--     would reject.
--
--   - RC-08 — THE PRODUCER TURN, NOT MERELY THE CONVERSATION. `thread_id` alone
--     answers "which conversation"; it cannot answer "which act of MAIA". In the
--     loop this lane exists to serve -- ask, "too strong", ask again -- one
--     thread holds P1, P2, P3 with no way to tell which turn produced which.
--     `(thread_id, produced_in_turn_index)` references `ask_turns` by its own
--     PRIMARY KEY, so no second identity vocabulary is invented: the
--     conversation substrate is already append-only and already numbers its
--     turns. Several proposals MAY share one producer turn; their ids
--     distinguish them.
--
--   - ⚠️ FREEZING AND `ON DELETE SET NULL` ARE IN DIRECT CONFLICT, AND THE NAIVE
--     COMBINATION WOULD MAKE IMMUTABILITY DEFEAT MEMBER ERASURE. `ON DELETE SET
--     NULL` performs an UPDATE; a trigger that refuses every change to the
--     producer reference would therefore REFUSE THE THREAD DELETION ITSELF.
--     The rule is not "never changes" but MONOTONIC SEVERANCE:
--       value -> NULL              ALLOWED   the member deleted the thread;
--                                            lineage is severed, not ghosted
--       NULL -> value              REFUSED   a proposal cannot acquire an
--                                            origin it never had
--       value -> different value   REFUSED   a proposal cannot be reassigned
--                                            to a different act of MAIA
--     `thread_id` obeys the same rule, for the same reason.
--
--   - NO AUTHORITY IS CONFERRED. A row here grants no may_cross, no
--     body-reading permission, no consent, no application authority and no
--     standing permission to MAIA. The S3 disclosure that licensed the reading
--     is RECORDED in `authority`; recording it is not re-granting it.
--
-- Additive. No existing row is read, moved or rewritten.
--
-- Authority: docs/programme/REVISION-COLLABORATION-01_FOUNDER_RULINGS_2026-09-10.md
--            docs/programme/REVISION-COLLABORATION-01_DESIGN_2026-09-10.md

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_revision_proposals (
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

  CONSTRAINT manuscript_revision_proposals_work_authority
    CHECK (origin <> 'work' OR authority IS NOT NULL),

  -- A partial candidate reference names no textual subject at all.
  CONSTRAINT manuscript_revision_proposals_candidate_ref_complete
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
  CONSTRAINT manuscript_revision_proposals_candidate_origin_agrees
    CHECK ((origin = 'candidate') = (derived_from_candidate_id IS NOT NULL)),

  -- A thread without a turn names no act; a turn without a thread names nothing.
  CONSTRAINT manuscript_revision_proposals_producer_turn_complete
    CHECK ((thread_id IS NULL) = (produced_in_turn_index IS NULL)),

  CONSTRAINT manuscript_revision_proposals_producer_turn_fk
    FOREIGN KEY (thread_id, produced_in_turn_index)
    REFERENCES ask_turns(thread_id, turn_index) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_manuscript_revision_proposals_section
  ON manuscript_revision_proposals(section_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manuscript_revision_proposals_thread
  ON manuscript_revision_proposals(thread_id, produced_in_turn_index, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manuscript_revision_proposals_draft
  ON manuscript_revision_proposals(draft_id, created_at DESC);

-- The immutable half, enforced. Not a convention and not a comment: an UPDATE
-- that changes any frozen column aborts.
CREATE OR REPLACE FUNCTION manuscript_revision_proposals_freeze()
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

DROP TRIGGER IF EXISTS manuscript_revision_proposals_freeze_check
  ON manuscript_revision_proposals;
CREATE TRIGGER manuscript_revision_proposals_freeze_check
  BEFORE UPDATE ON manuscript_revision_proposals
  FOR EACH ROW EXECUTE FUNCTION manuscript_revision_proposals_freeze();

COMMENT ON TABLE manuscript_revision_proposals IS
  'REVISION-COLLABORATION-01 R1. What MAIA proposed, held for the writer. Not manuscript text: the Work is byte-identical until the writer applies it, and R1 ships no application path.';
COMMENT ON COLUMN manuscript_revision_proposals.proposed_text IS
  'MAIA''s replacement wording. IMMUTABLE by trigger (RC-01). MAIA''s output about the Work, never a copy of the Work.';
COMMENT ON COLUMN manuscript_revision_proposals.based_on IS
  'EvidenceRef naming WHICH bounded original. The text itself is referenced, never copied - working_draft_revisions is its authoritative home (RC-06).';
COMMENT ON COLUMN manuscript_revision_proposals.read_state IS
  'Frozen DevelopmentalReadState. Makes staleness answerable via locateCurrent without a second copy of the member''s writing.';
COMMENT ON COLUMN manuscript_revision_proposals.origin IS
  'work = proposed against the Work under S3 disclosure. candidate = proposed against the writer''s own candidate (RC-04); R1 produces only work.';
COMMENT ON COLUMN manuscript_revision_proposals.derived_from_candidate_id IS
  'RC-06b. With _revision and _digest, identifies the exact candidate revision MAIA saw. NULL for origin=work. Composite FK to revision_candidate_revisions lands with R2.';
COMMENT ON COLUMN manuscript_revision_proposals.produced_in_turn_index IS
  'RC-08. With thread_id, the exact MAIA turn that produced this proposal, referencing ask_turns by its own primary key. May only be severed to NULL, never reassigned.';
COMMENT ON COLUMN manuscript_revision_proposals.declined_at IS
  'The writer said no. NOT frozen. Rejection is a recorded act, not an absence (RC-03).';

COMMIT;

-- ROLLBACK (manual):
--   The table is referenced by nothing, changes no Work, and holds no copy of
--   member prose. Dropping it discards proposals and touches no manuscript.
--
--   DROP TRIGGER IF EXISTS manuscript_revision_proposals_freeze_check ON manuscript_revision_proposals;
--   DROP FUNCTION IF EXISTS manuscript_revision_proposals_freeze();
--   DROP TABLE IF EXISTS manuscript_revision_proposals;
