-- WS2-05B-8B-02c-2 · ANCHORED ASK MAIA — the editorial thread, as rows.
--
-- WHY PERSISTED AND NOT TRANSIENT. The 02c-1 contract rules the thread a
-- persisted, append-only editorial record, and a transient chat that later grows
-- storage is not the same object: it teaches the writer not to invest in the
-- conversation, and it regenerates a different answer every time the question is
-- re-asked, with no record of what was said before. The storage seam is small
-- enough to build correctly now, so it is built correctly now.
--
-- IDENTITY IS `id`, NOT (manuscript_id, anchor). That pair is a GROUPING key and
-- carries no uniqueness constraint anywhere below, which is what makes "many
-- threads per anchor" true rather than a contradiction. A unique index on the
-- pair would silently make the second conversation about a question impossible.
--
-- THE THREAD HANGS OFF THE WORK, NOT THE PROPOSAL. `reading_identity` is a
-- FROZEN REFERENCE copied at open, never a foreign key: a superseded reading
-- must leave the thread standing and must never re-point it. There is
-- deliberately no FK to manuscript_structure_proposals, because an FK is exactly
-- the mechanism that would make a thread follow, cascade with, or block its
-- proposal.
--
-- `canonical_at_open` IS ON THE THREAD, NOT INSIDE `reading_identity`, because a
-- thread may be opened on a Work that has never been read (an author-originated
-- concern), and that thread needs the BEFORE of the before/after assertion too.
-- A baseline living inside a nullable reading is absent exactly where it is
-- needed most.
--
-- WHAT THESE TABLES MUST NEVER BECOME. Not a memory substrate. Nothing here is a
-- member atom, episodic memory, pattern source, or eligible for cross-session
-- recall. It is one Work's editorial record, readable by its author.
--
-- SANCTUARY, NAMED HONESTLY. The contract requires that a Sanctuary thread is
-- not persisted at all. The Writer's Studio has NO Sanctuary mode today — there
-- is no member- or session-level sanctuary flag reachable from this surface — so
-- there is nothing here to gate on and no gate is faked. When Studio Sanctuary
-- exists it must refuse thread creation before it reaches this table. That is a
-- named, outstanding obligation, not a satisfied one.
--
-- Additive. Creates two new tables; reads, moves and rewrites nothing.
--
-- Authority: docs/design/writer-studio/WS2-05B-8B-02c-1_CONVERSATION_CONTRACT.md

BEGIN;

CREATE TABLE IF NOT EXISTS ask_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership. The Work, and the member the Work belongs to, denormalised so
  -- authorisation on a thread never needs the proposal to still exist.
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- Grouping key. NOT unique: many threads may share one anchor.
  anchor jsonb NOT NULL,

  -- Frozen reference, or NULL for a thread on a Work with no reading.
  -- NOT a foreign key. See the header.
  reading_identity jsonb,

  -- BEFORE, for the before/after canonical assertion.
  canonical_at_open text NOT NULL CHECK (length(canonical_at_open) > 0),

  initiated_by text NOT NULL CHECK (initiated_by IN ('maia', 'author')),
  opened_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ask_threads_manuscript
  ON ask_threads(manuscript_id, opened_at DESC);

-- The grouping lookup the surface actually makes: "threads on this anchor".
CREATE INDEX IF NOT EXISTS idx_ask_threads_anchor
  ON ask_threads USING gin (anchor jsonb_path_ops);

CREATE TABLE IF NOT EXISTS ask_turns (
  thread_id uuid NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,

  -- Monotonic, never reused. A correction is a NEW turn, never an edit.
  turn_index integer NOT NULL CHECK (turn_index >= 0),

  speaker text NOT NULL CHECK (speaker IN ('author', 'maia')),
  body text NOT NULL CHECK (length(body) > 0),

  -- Stamped AT THE TURN, not computed at render: what was known to be current
  -- when this was said is part of what was said.
  staleness jsonb NOT NULL,

  -- Attribution of a MAIA turn, same shape discipline as reader_provenance:
  -- the resolved model actually used, never the default's name. NULL on an
  -- author turn, which is a different fact from an empty object.
  answer_provenance jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (thread_id, turn_index)
);

-- APPEND-ONLY, ENFORCED BY THE DATABASE.
--
-- Append-only governs MAIA and the system, not the author's sovereignty over
-- their own record: DELETE is permitted, so a member may remove a thread whole
-- and its turns cascade. What is refused is REWRITING — a turn whose text can
-- change is not a record of what was said, and a thread that can be edited after
-- the fact cannot witness that MAIA conceded, or refused, or was wrong.
CREATE OR REPLACE FUNCTION ask_turns_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'ask turn %/% is append-only: a correction is a new turn, never a revision of one already spoken',
    OLD.thread_id, OLD.turn_index;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_turns_no_update ON ask_turns;
CREATE TRIGGER ask_turns_no_update
  BEFORE UPDATE ON ask_turns
  FOR EACH ROW EXECUTE FUNCTION ask_turns_append_only();

-- The thread's frozen fields are frozen for the same reason the interpretation
-- is: a thread whose anchor or reading reference can be rewritten could be made
-- to look like a conversation about a different reading than the one it had.
CREATE OR REPLACE FUNCTION ask_threads_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
     OR NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.anchor IS DISTINCT FROM OLD.anchor
     OR NEW.reading_identity IS DISTINCT FROM OLD.reading_identity
     OR NEW.canonical_at_open IS DISTINCT FROM OLD.canonical_at_open
     OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by THEN
    RAISE EXCEPTION
      'ask thread % is immutable in ownership, anchor, reading reference and canonical baseline: a thread cannot be re-pointed at a reading it was not about',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_threads_no_repoint ON ask_threads;
CREATE TRIGGER ask_threads_no_repoint
  BEFORE UPDATE ON ask_threads
  FOR EACH ROW EXECUTE FUNCTION ask_threads_freeze();

COMMENT ON TABLE ask_threads IS
  'WS2-05B-8B-02c. One anchored editorial conversation about a Work. Identity is id; (manuscript_id, anchor) is grouping only and deliberately not unique. reading_identity is a frozen reference, never an FK. Not a memory substrate.';
COMMENT ON TABLE ask_turns IS
  'WS2-05B-8B-02c. Append-only turns. UPDATE is refused by trigger; DELETE cascades from the thread so an author may remove their own record whole.';

COMMIT;

-- ROLLBACK (manual):
--   Both tables are new and nothing describes the Work through them. Dropping
--   them discards editorial conversations and touches no manuscript, no
--   proposal, and no canonical structure.
--
--   DROP TABLE IF EXISTS ask_turns;
--   DROP TABLE IF EXISTS ask_threads;
--   DROP FUNCTION IF EXISTS ask_turns_append_only();
--   DROP FUNCTION IF EXISTS ask_threads_freeze();
