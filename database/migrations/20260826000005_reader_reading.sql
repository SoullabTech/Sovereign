-- READER-01 — what the Work has made available to a reader by a given point.
--
-- A second MODE of reading, not a second machine. It reuses DE-01's snapshot,
-- pass lifecycle, evidence gate and disposition states verbatim; only the
-- question changes.
--
--     developmental   What is happening in this Work?
--     reader          What has the Work made available to a reader by here?
--
-- A pass in reader mode is a PHENOMENON over a CHECKPOINT rather than a lens
-- over a segment, which the existing columns already express: `lens` holds the
-- phenomenon, `segment_label` holds where the reader stands, and the pass
-- range is [0, checkpoint) — because reader knowledge is cumulative. That is
-- not a shortcut; the shape is genuinely the same, and giving it a parallel
-- set of tables would have meant two lifecycles to keep honest instead of one.
--
-- ── WHY THE RANGE STARTS AT ZERO ──────────────────────────────────────────
--
-- Law 2: what page 180 establishes cannot excuse an ambiguity on page 40. So
-- at each checkpoint MAIA is given the Work up to that point and nothing
-- after, and evidence is located only within that prefix. She cannot cite page
-- 180 at page 40 because she has never been shown it. The rule is a property
-- of what the model receives, not a request it is asked to honour.
--
-- ── THE ONE NEW FACT ──────────────────────────────────────────────────────
--
-- only_in_material: the writer's declared material supplies something the
-- DRAFT has not. This is the reason material is given to a reader pass at all,
-- and it is a claim about the draft — never about what the reader knows.
-- Materials are never reader knowledge (Law 3).
--
-- ⛔ Deliberately absent, and to stay absent: any readability, confusion,
-- engagement, drop-off or readiness figure (Law 5), and any persona — no
-- first-time reader, no sceptical academic. Those produce synthetic psychology
-- that cannot be evidenced from the page.
--
-- ROLLBACK:
--   ALTER TABLE developmental_findings
--     DROP COLUMN IF EXISTS only_in_material,
--     DROP COLUMN IF EXISTS checkpoint_offset,
--     DROP COLUMN IF EXISTS checkpoint_label;
--   ALTER TABLE developmental_reviews DROP COLUMN IF EXISTS mode;

ALTER TABLE developmental_reviews
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'developmental'
    CHECK (mode IN ('developmental', 'reader'));

ALTER TABLE developmental_findings
  -- The surrounding material holds this; the draft does not yet.
  ADD COLUMN IF NOT EXISTS only_in_material BOOLEAN NOT NULL DEFAULT FALSE,
  -- Where the reader stood when this was observed. NULL in developmental mode.
  ADD COLUMN IF NOT EXISTS checkpoint_offset INTEGER,
  ADD COLUMN IF NOT EXISTS checkpoint_label TEXT;

CREATE INDEX IF NOT EXISTS developmental_reviews_mode_idx
  ON developmental_reviews (member_id, manuscript_id, mode, created_at DESC);

COMMENT ON COLUMN developmental_findings.only_in_material IS
  'The writer''s declared material supplies this and the draft does not yet. '
  'A claim about the DRAFT, never about what a reader knows — declared '
  'material is context for the writer and is never treated as reader knowledge.';

COMMENT ON COLUMN developmental_findings.checkpoint_label IS
  'Where the reader stood, in the member''s own part names or as a distance '
  'into the draft. Never a movement, act or section the writer did not declare.';
