-- Migration: 20260902000001_member_idea_seed_and_title.sql
-- Cut 1 — Seed / name separation
--
-- Problem this fixes:
--   The large serif heading on an idea was the truncated first sentence of the
--   opening entry (capture route: description.split('\n')[0].slice(0, 120)).
--   That is the SEED, not the title. The member reads the room as "I am still
--   inside the note I wrote forty minutes ago" rather than "this is becoming
--   something".
--
-- Design:
--   - seed / seed_block_id preserve where the inquiry BEGAN, permanently, by
--     reference to the authored block rather than by duplicating it. The excerpt
--     in `seed` is for display only; `seed_block_id` is the provenance.
--   - title becomes a working name that may evolve freely. Changing it never
--     rewrites the seed.
--   - title_source records how the current title came to be. 'auto_seed' titles
--     were never named by anyone — the UI renders them provisionally rather than
--     as the idea's identity. Nothing is deleted; an unnamed idea is demoted, not
--     erased.
--   - proposed_titles holds MAIA's suggestions. They live in their OWN column and
--     never touch `title`. Acceptance is a member act that moves the chosen string
--     into title and sets title_source = 'maia_accepted'.
--
-- Invariant carried:
--   MAIA may propose. Only the member ratifies. There is no code path by which
--   a suggestion becomes the idea's name without a member click.

-- ── Columns ───────────────────────────────────────────────────────────────────

ALTER TABLE member_ideas
  ADD COLUMN IF NOT EXISTS seed              TEXT,
  ADD COLUMN IF NOT EXISTS seed_block_id     UUID,
  ADD COLUMN IF NOT EXISTS title_source      TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS proposed_titles   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS proposed_titles_at TIMESTAMPTZ;

-- seed_block_id points at an authored block; if that block is deleted the
-- excerpt survives but the provenance link is honestly nulled rather than
-- silently dangling.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_ideas_seed_block_fk'
  ) THEN
    ALTER TABLE member_ideas
      ADD CONSTRAINT member_ideas_seed_block_fk
      FOREIGN KEY (seed_block_id) REFERENCES member_idea_blocks(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_ideas_title_source_check'
  ) THEN
    ALTER TABLE member_ideas
      ADD CONSTRAINT member_ideas_title_source_check
      CHECK (title_source IN ('member', 'auto_seed', 'maia_accepted'));
  END IF;
END $$;

-- ── Backfill: seed from the earliest authored block ───────────────────────────
-- Non-destructive. Only fills rows that have no seed yet.

WITH first_block AS (
  SELECT DISTINCT ON (b.idea_id)
         b.idea_id, b.id AS block_id, b.content
    FROM member_idea_blocks b
   WHERE b.block_type IN ('note', 'decision', 'change')
   ORDER BY b.idea_id, b.created_at ASC
)
UPDATE member_ideas i
   SET seed = LEFT(f.content, 400),
       seed_block_id = f.block_id
  FROM first_block f
 WHERE i.id = f.idea_id
   AND i.seed IS NULL;

-- ── Backfill: mark auto-derived titles as never-named ─────────────────────────
-- Detection is exact, not heuristic: the capture route wrote the title as a
-- literal prefix of the first block's content. If the current title is still
-- that prefix, no human ever named this idea.
--
-- The title text is NOT changed here. Only its status. The UI decides how to
-- render an unnamed inquiry; the member's words stay untouched in the seed and
-- in the block itself.
--
-- The LENGTH(title) >= 60 guard is deliberate and must NOT be loosened.
-- Adjudicated 2026-09-02: the two error directions are not equivalent harms.
--
--   False negative — a short auto-derived title survives as a title.
--     Harm: an awkward heading. Historical residue, correctable at any time by
--     ordinary member action.
--
--   False positive — a title a member deliberately authored is demoted to
--     'auto_seed' and re-rendered as "Unnamed inquiry".
--     Harm: the system has overwritten its own interpretation of an act of
--     member authorship.
--
-- In a sovereignty-preserving system, under-demotion is preferable to falsely
-- demoting member authorship. Do not make this migration more aggressive to
-- catch the remaining short titles; they do not justify the risk.

WITH first_block AS (
  SELECT DISTINCT ON (b.idea_id)
         b.idea_id, b.content
    FROM member_idea_blocks b
   WHERE b.block_type IN ('note', 'decision', 'change')
   ORDER BY b.idea_id, b.created_at ASC
)
UPDATE member_ideas i
   SET title_source = 'auto_seed'
  FROM first_block f
 WHERE i.id = f.idea_id
   AND i.title_source = 'member'
   AND LENGTH(i.title) >= 60
   AND f.content LIKE i.title || '%';

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON COLUMN member_ideas.seed IS
  'Display excerpt of where this inquiry began (max 400 chars). Provenance lives in seed_block_id. Never rewritten when the title evolves.';

COMMENT ON COLUMN member_ideas.seed_block_id IS
  'The authored block the seed excerpt was taken from. ON DELETE SET NULL — the link is nulled honestly rather than left dangling.';

COMMENT ON COLUMN member_ideas.title_source IS
  'member (a person named it) | auto_seed (derived from the opening entry; never named, rendered provisionally) | maia_accepted (MAIA proposed, the member accepted).';

COMMENT ON COLUMN member_ideas.proposed_titles IS
  'MAIA title suggestions awaiting a member decision. Never read as the idea name. Cleared on accept or dismiss. No code path promotes these without a member act.';

-- ── Register migration ────────────────────────────────────────────────────────

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260902000001_member_idea_seed_and_title.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
