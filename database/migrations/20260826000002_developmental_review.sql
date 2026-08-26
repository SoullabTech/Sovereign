-- DE-01 — Developmental Review: whole-Work reading, read-only.
--
-- MAIA reads a SNAPSHOT of the manuscript and returns findings. She does not
-- rewrite anything here: this migration adds no path by which a review can
-- alter a draft, and the routes that use it hold no write to
-- manuscript_working_drafts.
--
-- WHY A SNAPSHOT, AND WHY A HASH
--
-- A finding says "Ch. 5, paragraphs 18-32". Offsets into a live draft are a
-- lie the moment the writer types above them. So a review records the exact
-- revision it read and the hash of the exact text, and evidence offsets are
-- into THAT text. When the draft has moved on, the room says the evidence may
-- have moved rather than scrolling the writer to the wrong paragraph.
--
-- WHAT THE SIX KINDS OF TRUTH LOOK LIKE AS COLUMNS
--
--   Source          manuscript_sections (already exists, immutable)
--   Material        living_work_materials (already exists, member-declared)
--   Work            living_works (already exists, member-authored)
--   Draft           manuscript_working_drafts (already exists)
--   Observation     developmental_findings.observation — MAIA's, and marked so
--   Significance    NOT STORED YET. How much a finding matters is the
--                   writer's judgement, not a derived number; when it lands it
--                   is a member-set column, never inferred from reach.
--   Decision        developmental_findings.disposition — the WRITER's, and
--                   never set by the system: default 'new' means MAIA said
--                   something and the writer has not answered. Only a member
--                   gesture moves it.
--
-- The distinction that matters most is the last one. MAIA observing is not the
-- writer agreeing; the writer agreeing is not the writer deciding; the writer
-- deciding is not the manuscript having changed. Three different rows in three
-- different tables, and this one holds only the first two.
--
-- NO SCORES. There is deliberately no column for a cohesion percentage, a
-- completeness figure, a grade, or any other number that pronounces on what
-- the Work is. Counts of findings are facts about the review; a score is a
-- judgement about the book, and MAIA does not hold that authority.
--
-- ROLLBACK (reverse order):
--   DROP TABLE IF EXISTS developmental_finding_evidence;
--   DROP TABLE IF EXISTS developmental_findings;
--   DROP TABLE IF EXISTS developmental_reviews;

CREATE TABLE IF NOT EXISTS developmental_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  living_work_id   UUID REFERENCES living_works(id) ON DELETE CASCADE,
  manuscript_id    UUID NOT NULL,

  -- THE SNAPSHOT. Not a reference to the draft — the text itself, frozen at
  -- the moment the reading opened. Every pass reads from this column and every
  -- evidence offset is an index into it.
  --
  -- Storing only a hash was the original design and it was wrong: /advance
  -- re-read the live draft on every pass, so a writer who kept working while
  -- MAIA read could produce a review stitched from several draft states, with
  -- segment offsets planned against a text that no longer existed. A snapshot
  -- that is not stored is not a snapshot.
  --
  -- Postgres TOASTs and compresses this out of line; a 200-page book is a few
  -- hundred KB. Storage is the cheap problem here, correctness is not.
  snapshot_content TEXT NOT NULL,
  content_hash     TEXT NOT NULL,
  content_chars    INTEGER NOT NULL,
  -- The draft revision the snapshot was taken from, for the writer's orientation.
  draft_revision_id INTEGER,

  -- The writer's own word for what this is, carried into the lenses so a
  -- memoir is not read against a three-act schema. NULL is a correct state
  -- and means the lenses stay universal.
  declared_form    TEXT,

  status           TEXT NOT NULL DEFAULT 'reading'
                     CHECK (status IN ('reading', 'complete', 'failed')),
  -- MAIA's Level 1 prose. Her words, marked as hers everywhere it renders.
  overview         TEXT,
  failure_reason   TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS developmental_reviews_room_idx
  ON developmental_reviews (member_id, manuscript_id, created_at DESC);

CREATE TABLE IF NOT EXISTS developmental_findings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id     UUID NOT NULL REFERENCES developmental_reviews(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  lens          TEXT NOT NULL,
  title         TEXT NOT NULL,
  -- What MAIA noticed, and why she noticed it. Both are hers.
  observation   TEXT NOT NULL,
  why           TEXT,

  confidence    TEXT NOT NULL DEFAULT 'medium'
                  CHECK (confidence IN ('high', 'medium', 'low')),
  -- REACH — how much of the Work the evidence spans. Derived arithmetic, and
  -- named for what it actually measures.
  --
  -- This was called 'priority' and that was a lie by vocabulary: a
  -- contradiction evidenced by one passage may matter enormously, and a
  -- harmless repeated phrase may span six chapters. Reach is a fact about
  -- evidence; importance is the writer's to assign, and when that arrives it
  -- will be a separate, member-set column — never this one.
  reach         TEXT NOT NULL DEFAULT 'moderate'
                  CHECK (reach IN ('wide', 'moderate', 'narrow')),
  reach_basis   TEXT,

  -- The WRITER's answer. 'new' means MAIA spoke and the writer has not.
  disposition   TEXT NOT NULL DEFAULT 'new'
                  CHECK (disposition IN ('new', 'discussed', 'recognized',
                                         'adopted', 'rejected', 'unresolved',
                                         'resolved')),
  disposition_at TIMESTAMPTZ,

  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS developmental_findings_review_idx
  ON developmental_findings (review_id, position);

-- Evidence. A finding without at least one located passage is never inserted
-- (the route drops it), so this table is what makes "show me" possible.
CREATE TABLE IF NOT EXISTS developmental_finding_evidence (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id    UUID NOT NULL REFERENCES developmental_findings(id) ON DELETE CASCADE,

  kind          TEXT NOT NULL CHECK (kind IN ('manuscript_passage', 'material')),

  -- manuscript_passage: offsets into the review's snapshot, plus the exact
  -- quoted text so the passage can be re-located if the draft moved.
  start_offset  INTEGER,
  end_offset    INTEGER,
  quote         TEXT,
  part_label    TEXT,

  -- material: the belonging this drew on, by its own identity.
  material_type TEXT,
  material_id   TEXT,

  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT developmental_evidence_located CHECK (
    (kind = 'manuscript_passage'
       AND start_offset IS NOT NULL AND end_offset IS NOT NULL
       AND quote IS NOT NULL AND end_offset > start_offset)
    OR
    (kind = 'material' AND material_type IS NOT NULL AND material_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS developmental_evidence_finding_idx
  ON developmental_finding_evidence (finding_id, position);

-- One unit of reading: a lens over a segment. The review advances one pass at
-- a time so no single request has to read a 200-page book, the writer sees
-- progress as it happens, and an interrupted review resumes instead of
-- starting over. Coverage is therefore a FACT that can be reported honestly:
-- what MAIA has read is exactly the passes marked done.
CREATE TABLE IF NOT EXISTS developmental_review_passes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id      UUID NOT NULL REFERENCES developmental_reviews(id) ON DELETE CASCADE,
  lens           TEXT NOT NULL,
  segment_index  INTEGER NOT NULL,
  segment_label  TEXT NOT NULL,
  start_offset   INTEGER NOT NULL,
  end_offset     INTEGER NOT NULL,
  -- pending → running → done | failed.
  --
  -- 'running' exists because the claim and the reading are not the same event.
  -- Marking a pass done at claim time meant a container that died mid-read
  -- left coverage permanently asserting MAIA had read something she had not —
  -- and the whole point of pass-level coverage is that it is a fact. A pass
  -- becomes 'done' only after its findings have passed the evidence gate.
  --
  -- started_at lets a pass abandoned by a dead process be reclaimed rather
  -- than stranding the review forever.
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'running', 'done', 'failed')),
  started_at     TIMESTAMPTZ,
  -- Findings the evidence gate refused, kept as a count so a review that
  -- produced little can say so rather than looking like a quiet book.
  dropped_count  INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,
  completed_at   TIMESTAMPTZ,

  UNIQUE (review_id, lens, segment_index)
);

CREATE INDEX IF NOT EXISTS developmental_passes_next_idx
  ON developmental_review_passes (review_id, status, segment_index);
