-- ═══════════════════════════════════════════════════════════════════════════
-- THE FOCUS CROSSING ACT — provenance of one deliberate writer gesture.
--
-- ⭐⭐ WHAT THIS RECORD ANSWERS, and nothing else does:
--
--     What exactly did the writer ask MAIA to attend to when this conversation
--     happened?
--
-- Without it the system can perform the right crossing and be unable to say,
-- afterwards, what the crossing was OF. That becomes decisive the moment
-- revisions exist: a RevisionProposal must point backward to this writer act,
-- this Focus Set snapshot, this active target and this MAIA turn — so that what
-- is preserved is not only what changed, but why this Work changed.
--
--     one writer gesture → one durable actId → N declared Focus members
--       → 0..N lawful disclosure receipts → 0 or 1 active target
--       → one canonical MAIA turn
--
-- ⛔ IT IS NOT THE FOCUS PERSISTENCE STORE. U2 is still its own question. This
-- is an immutable-ish snapshot of ONE crossing — "the state of declared
-- attention at the moment the writer asked" — never "the canonical mutable
-- Focus Set forever". The two diverge the instant the writer changes focus
-- after the conversation, and a record that had become both would be wrong
-- about the past in order to stay right about the present.
--
-- ⛔ IT HOLDS NO MANUSCRIPT PROSE. No body, no quotation, no passage, no
-- summary, no semantic description, no digest, no "what this member is about".
-- Every one of those is a way of storing the writer's words in a second place
-- with its own retention and deletion answers. `body_available` is a BOOLEAN —
-- whether a body crossed, never any part of one. There is deliberately no JSON
-- column anywhere below: a free-form blob is where prose arrives later, one
-- convenient field at a time.
--
-- Member identity and section identity are also absent by design. The member's
-- place is addressed by its DISCLOSURE RECEIPT, which is the row constituted to
-- carry that scope and already governs it. Repeating the section here would
-- create a second authority over the same fact.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS focus_crossing_acts (
  -- ⭐ The WRITER'S GESTURE, not an HTTP request. Retries repeat transport;
  -- they do not create a second human act, so this is the primary key and a
  -- second insert under it is a conflict rather than a new row.
  act_id            text PRIMARY KEY,
  member_id         uuid NOT NULL,
  work_id           uuid NOT NULL,
  -- ⛔ NULL is lawful and meaningful: attention may be declared before an edit
  -- target is chosen (U4). It confers no additional disclosure authority — it
  -- answers only which of the declared places is in hand.
  active_member_id  text,
  -- Set once, when the one canonical turn is handed off. A second, different
  -- turn on the same act is refused: one gesture, one MAIA turn.
  canonical_turn_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,

  -- An act that names a turn is complete, and one that does not is not. The two
  -- cannot disagree, so a torn write cannot present as a finished crossing.
  CONSTRAINT focus_act_completion_is_one_fact
    CHECK ((canonical_turn_id IS NULL) = (completed_at IS NULL))
);

CREATE INDEX IF NOT EXISTS focus_crossing_acts_member_idx
  ON focus_crossing_acts (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS focus_crossing_acts_work_idx
  ON focus_crossing_acts (work_id, created_at DESC);

-- ── the declared attention, one row per place ──────────────────────────────
--
-- ⭐ A CHILD TABLE, NOT A BLOB. The set is queryable provenance: an auditor can
-- ask how many places were declared, how many crossed, and which receipt
-- carried each — without parsing anything or consulting a transcript.
CREATE TABLE IF NOT EXISTS focus_crossing_act_members (
  act_id                text NOT NULL
    REFERENCES focus_crossing_acts (act_id) ON DELETE CASCADE,
  -- Identity WITHIN the set. Not a section id and not a database id.
  focus_member_id       text NOT NULL,
  -- The writer's own order. Fixed at the act; a retry that reorders is a
  -- contradiction, not a retry.
  ordinal               integer NOT NULL,
  -- Why a member could or could not be read, distinguishably:
  --   current      the coordinates named current text, provably
  --   unverified   they fit, but nothing establishes they name the same words
  --   unavailable  authorized, and the read did not succeed
  currency_state        text NOT NULL
    CHECK (currency_state IN ('current', 'unverified', 'unavailable')),
  -- ⛔ WHETHER a body crossed. Never any part of one.
  body_available        boolean NOT NULL,
  -- The receipt that authorized THIS member's crossing, or NULL.
  disclosure_receipt_id text,

  PRIMARY KEY (act_id, focus_member_id),
  CONSTRAINT focus_act_member_ordinal_unique UNIQUE (act_id, ordinal),

  -- ⭐⭐ A7 · AN UNREADABLE MEMBER MAY NOT CARRY A RECEIPT, and a member whose
  -- body crossed must be `current`. Declared attention and disclosed content are
  -- two authorities; this is the point at which the record would otherwise be
  -- able to claim one on the strength of the other.
  CONSTRAINT focus_act_member_body_matches_currency
    CHECK (body_available = (currency_state = 'current')),
  CONSTRAINT focus_act_member_receipt_requires_body
    CHECK (disclosure_receipt_id IS NULL OR body_available)
);

CREATE INDEX IF NOT EXISTS focus_crossing_act_members_act_idx
  ON focus_crossing_act_members (act_id, ordinal);
